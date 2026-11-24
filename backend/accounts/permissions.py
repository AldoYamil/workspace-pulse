from rest_framework.permissions import BasePermission

ADMINISTRADOR = 'administrador'
GERENTE_RH = 'gerente_rh'
ASISTENTE_RH = 'asistente_rh'
USUARIO = 'usuario'


def rol_requerido(*roles):
    class PermisoPorRol(BasePermission):
        def has_permission(self, request, view):
            return bool(
                request.user
                and request.user.is_authenticated
                and getattr(request.user, 'rol', None) in roles
            )

    return PermisoPorRol


# Administrador y Gerente de RH: acceso total
SoloGestion = rol_requerido(ADMINISTRADOR, GERENTE_RH)

# Administrador, Gerente y Asistente de RH
PersonalRH = rol_requerido(ADMINISTRADOR, GERENTE_RH, ASISTENTE_RH)

# Cualquier usuario con sesión
CualquierRol = rol_requerido(ADMINISTRADOR, GERENTE_RH, ASISTENTE_RH, USUARIO)