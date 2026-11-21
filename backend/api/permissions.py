# backend/api/permissions.py
from rest_framework.permissions import BasePermission


class EsAdminOGerenteRH(BasePermission):
    """
    Permite el acceso a 'admin' y 'gerente_rh'.
    Deniega el acceso a 'asistente_rh' en Touchpoints, Alertas y Cuestionarios activos.
    """
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False

        rol = getattr(user, 'rol', None)
        if not rol:
            grupo = user.groups.first()
            rol = grupo.name if grupo else 'asistente_rh'

        return rol in ('administrador', 'gerente_rh')