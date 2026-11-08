# backend/api/services/permisos.py
#
# Quién es el usuario de la sesión y de qué empresa es.
# AJUSTA estas funciones a como identifique tu authentication.py al usuario
# (aquí se busca el Usuario por el email de request.user).

from django.apps import apps


def perfil_usuario(request):
    """Fila de api_usuario que corresponde a la sesión, o None."""
    email = (getattr(request.user, "email", "") or "").strip()
    if not email:
        return None
    return apps.get_model("api", "Usuario").objects.filter(email__iexact=email).first()


def empresa_del_usuario(request):
    """
    Id de la empresa a la que se limitan los datos:
      None -> sin restricción (superusuario)
      0    -> el usuario no está ligado a ninguna empresa (no debe ver nada)
    """
    if getattr(request.user, "is_superuser", False):
        return None
    perfil = perfil_usuario(request)
    return perfil.empresa_id if perfil else 0
