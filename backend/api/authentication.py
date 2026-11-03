
import jwt
from jwt import PyJWKClient
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


# Cliente para obtener las claves públicas de Supabase.
jwks_client = PyJWKClient(settings.SUPABASE_JWKS_URL)


class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        # Si no hay token, dejamos que DRF gestione la autenticación.
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ', 1)[1]

        try:
            # Buscamos la clave pública correspondiente al token.
            signing_key = jwks_client.get_signing_key_from_jwt(token)

            # Validamos la firma, el algoritmo, la audiencia y las fechas.
            # Leeway permite una diferencia temporal de hasta 5 segundos.
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=['HS256', 'RS256', 'ES256'],
                audience='authenticated',
                leeway=5,
                options={'require': ['exp', 'sub']},
            )

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed(
                'El token de Supabase ha expirado.'
            )

        except jwt.PyJWKClientError:
            raise AuthenticationFailed(
                'No se pudo obtener la clave pública de Supabase.'
            )

        except jwt.PyJWTError as e:
            # Diagnóstico temporal para identificar errores de validación.
            print(f"Error validando JWT: {type(e).__name__}: {e}")
            raise AuthenticationFailed(
                'Token de Supabase inválido.'
            )

        # Obtenemos los datos del usuario autenticado.
        supabase_uid = payload.get('sub')
        email = payload.get('email', '')

        if not supabase_uid:
            raise AuthenticationFailed(
                'El token no contiene un usuario.'
            )

        # Vinculamos el usuario de Supabase con un usuario local de Django.
        user, _ = User.objects.get_or_create(
            username=supabase_uid,
            defaults={'email': email},
        )

        return (user, token)
