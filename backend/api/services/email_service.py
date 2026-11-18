# backend/api/services/email_service.py

import logging
import resend
from django.conf import settings

logger = logging.getLogger(__name__)

CORREO_ADMIN_PRUEBAS = "aldoyamil30@gmail.com"

def enviar_correo(destinatarios, asunto, html, texto=None):
    if not settings.RESEND_API_KEY:
        return False, "RESEND_API_KEY no está configurada en el .env"

    resend.api_key = settings.RESEND_API_KEY

    # FORZAR EN MODO SANDBOX: Solo te enviará correos a ti mismo desde onboarding@resend.dev
    destinatarios_prueba = [CORREO_ADMIN_PRUEBAS]

    params = {
        "from": "Workspace Pulse <onboarding@resend.dev>",
        "to": destinatarios_prueba,
        "subject": f"[PRUEBA] {asunto}",
        "html": f"""
            <div style="background-color: #f1f5f9; padding: 8px; border-radius: 4px; margin-bottom: 12px; font-size: 12px; color: #475569;">
                <strong>Aviso de pruebas:</strong> Este correo originalmente iba dirigido a: {', '.join(destinatarios) if isinstance(destinatarios, list) else destinatarios}
            </div>
            {html}
        """,
    }
    if texto:
        params["text"] = texto

    try:
        respuesta = resend.Emails.send(params)
        return True, respuesta.get("id", "")
    except Exception as exc:  
        logger.warning("Resend no pudo enviar el correo: %s", exc)
        return False, str(exc)