import jwt
from jwt import PyJWKClient
from django.conf import settings
from django.contrib.auth.models import Group, User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

jwks_client = PyJWKClient(settings.SUPABASE_JWKS_URL)

ROLES = ('administrador', 'gerente_rh', 'asistente_rh', 'usuario')
ROL_POR_DEFECTO = 'usuario'


class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ', 1)[1]

        try:
            signing_key = jwks_client.get_signing_key_from_jwt(token)

            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=['RS256', 'ES256'],
                audience='authenticated',
                leeway=5,
                options={'require': ['exp', 'sub']},
            )

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('El token de Supabase ha expirado.')

        except jwt.PyJWKClientError:
            raise AuthenticationFailed('No se pudo obtener la clave pública de Supabase.')

        except jwt.PyJWTError as e:
            print(f"Error validando JWT: {type(e).__name__}: {e}")
            raise AuthenticationFailed('Token de Supabase inválido.')

        supabase_uid = payload.get('sub')
        email = payload.get('email', '')

        if not supabase_uid:
            raise AuthenticationFailed('El token no contiene un usuario.')

        user, _ = User.objects.get_or_create(
            username=supabase_uid,
            defaults={'email': email},
        )

        # El rol sale de la base de datos (Groups), NO del token.
        grupo_actual = user.groups.filter(name__in=ROLES).first()
        if grupo_actual is None:
            grupo, _ = Group.objects.get_or_create(name=ROL_POR_DEFECTO)
            user.groups.add(grupo)
            rol = ROL_POR_DEFECTO
        else:
            rol = grupo_actual.name

        user.rol = rol

        return (user, token)