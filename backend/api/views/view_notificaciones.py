# backend/api/views/view_notificaciones.py
#
# POST /api/v1/alertas/evaluar/        -> evalúa umbrales, crea alertas y envía correos
# POST /api/v1/notificaciones/prueba/  -> manda un correo de prueba (para verificar Resend)

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models.usuario_model import Usuario
from api.services.alertas_service import evaluar_umbrales
from api.services.email_service import enviar_correo


def _empresa_del_usuario(request):
    """
    Misma lógica que en view_panel_riesgos.py:
      None -> sin restricción (superusuario) | 0 -> usuario sin empresa.
    Ajústala a como identifique tu authentication.py al usuario.
    """
    user = request.user
    if getattr(user, "is_superuser", False):
        return None

    email = getattr(user, "email", "") or ""
    perfil = Usuario.objects.filter(email__iexact=email).first() if email else None
    return perfil.empresa_id if perfil else 0


def _entero(valor):
    try:
        return int(valor)
    except (TypeError, ValueError):
        return None


class EvaluarAlertasView(APIView):
    """
    Body opcional (JSON):
      centro_trabajo   -> id del centro a evaluar
      enviar_correos   -> false para crear alertas sin mandar correo (default true)
      forzar           -> true para ignorar la regla de "una alerta abierta por umbral"
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        empresa_id = _empresa_del_usuario(request)
        if empresa_id == 0:
            return Response(
                {"detail": "Tu usuario no está asociado a ninguna empresa."},
                status=status.HTTP_403_FORBIDDEN,
            )

        resumen = evaluar_umbrales(
            empresa_id=empresa_id,
            centro_id=_entero(request.data.get("centro_trabajo")),
            enviar_correos=request.data.get("enviar_correos", True) is not False,
            forzar=request.data.get("forzar", False) is True,
        )
        return Response(resumen)


class PruebaCorreoView(APIView):
    """
    Manda un correo de prueba a TU correo (el de la sesión).
    Solo un superusuario puede indicar otro 'destinatario' en el body.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        destinatario = (getattr(request.user, "email", "") or "").strip()

        pedido = (request.data.get("destinatario") or "").strip()
        if pedido:
            if not getattr(request.user, "is_superuser", False):
                return Response(
                    {"detail": "Solo un superusuario puede elegir otro destinatario."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            destinatario = pedido

        try:
            validate_email(destinatario)
        except ValidationError:
            return Response(
                {"detail": "No hay un correo válido. Inicia sesión con un usuario que tenga correo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ok, detalle = enviar_correo(
            [destinatario],
            "Prueba de notificaciones - Workspace Pulse",
            "<p>Si estás leyendo esto, <strong>Resend está bien configurado</strong> en Workspace Pulse.</p>",
            "Si estás leyendo esto, Resend está bien configurado en Workspace Pulse.",
        )
        if ok:
            return Response({"enviado": True, "id": detalle, "destinatario": destinatario})
        return Response({"enviado": False, "error": detalle}, status=status.HTTP_502_BAD_GATEWAY)
