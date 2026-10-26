import jwt
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return None  

        token = auth_header.split(' ')[1]

        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('El token de Supabase ha expirado.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Token de Supabase inválido.')

        supabase_uid = payload.get('sub')
        email = payload.get('email', '')
        user, _ = User.objects.get_or_create(
            username=supabase_uid,
            defaults={'email': email}
        )

        return (user, token)