# backend/api/services/alertas_service.py
#
# Evalúa los umbrales configurados (ConfiguracionUmbral) contra los datos
# reales, crea la AlertaClima correspondiente y avisa por correo (Resend)
# a los administradores de la empresa.
#
# Se usa apps.get_model para no depender del nombre de cada archivo de modelo.

import logging

from django.apps import apps
from django.conf import settings
from django.utils import timezone
from django.utils.html import escape

from .email_service import enviar_correo

logger = logging.getLogger(__name__)


def _modelo(nombre):
    return apps.get_model("api", nombre)


# ----------------------------------------------------------------------
# MÉTRICAS EVALUABLES
# ----------------------------------------------------------------------
# La clave es el texto de ConfiguracionUmbral.metrica (sin importar
# mayúsculas ni espacios extra). Cada una devuelve (valor_actual, campana_id)
# o None si todavía no hay datos.
#
# El segundo elemento indica cuándo se dispara la alerta:
#   "max" -> cuando el valor SUPERA el límite  (riesgo, estrés, ausentismo)
#   "min" -> cuando el valor cae POR DEBAJO    (p. ej. satisfacción)
#
# ConfiguracionUmbral.valor_minimo_aceptable es el límite en ambos casos.
# Para evaluar otra métrica, agrega una función y una línea en METRICAS.

def _valor_estres(umbral):
    resultado = (
        _modelo("ResultadoRiesgo").objects
        .filter(area_id=umbral.area_id)
        .order_by("-fecha_calculo")
        .first()
    )
    if not resultado:
        return None
    return resultado.puntuacion_riesgo, resultado.campana_evaluacion_id


def _ultima_metrica_rh(umbral):
    return (
        _modelo("MetricaRendimientoRH").objects
        .filter(area_id=umbral.area_id, centro_trabajo_id=umbral.centro_trabajo_id)
        .order_by("-periodo_anio", "-periodo_mes")
        .first()
    )


def _valor_ausentismo(umbral):
    metrica = _ultima_metrica_rh(umbral)
    return (metrica.dias_ausentismo, None) if metrica else None


def _valor_rotacion(umbral):
    metrica = _ultima_metrica_rh(umbral)
    return (metrica.tasa_rotacion, None) if metrica else None


METRICAS = {
    "índice de estrés laboral": (_valor_estres, "max"),
    "ausentismo (días)": (_valor_ausentismo, "max"),
    "tasa de rotación (%)": (_valor_rotacion, "max"),
}


def _clave(texto):
    return " ".join((texto or "").lower().split())


# ----------------------------------------------------------------------
# DESTINATARIOS Y BITÁCORA
# ----------------------------------------------------------------------

def correos_administradores(empresa_id):
    """Correos de los administradores activos de la empresa."""
    return list(
        _modelo("Usuario").objects
        .filter(empresa_id=empresa_id, activo=True, rol__iregex=r"^(admin|administrador)$")
        .values_list("email", flat=True)
    )


def _registrar_envio(umbral, campana_id, ok, detalle):
    """
    Guarda el intento en Bitacora_notificacion. Esa tabla exige una campaña,
    así que si la métrica no trae una se usa la más reciente del centro.
    """
    if campana_id is None:
        campana = (
            _modelo("Campana_evaluacion").objects
            .filter(centro_trabajo_id=umbral.centro_trabajo_id)
            .order_by("-fecha_inicio")
            .first()
        )
        campana_id = campana.id if campana else None

    if campana_id is None:
        return False

    _modelo("Bitacora_notificacion").objects.create(
        proveedor="Resend",
        id_transaccion_externa=(detalle if ok else f"ERROR: {detalle}")[:100],
        estado_envio="Enviado" if ok else "Fallido",
        campana_id=campana_id,
    )
    return True


# ----------------------------------------------------------------------
# CORREO
# ----------------------------------------------------------------------

def _numero(valor):
    return f"{valor:g}"


def _armar_correo(umbral, valor, sentido, alerta):
    centro = umbral.centro_trabajo.nombre
    area = umbral.area.nombre
    verbo = "superó" if sentido == "max" else "cayó por debajo de"
    asunto = f"[Workspace Pulse] Alerta: {umbral.metrica} en {area} ({centro})"
    enlace = f"{settings.FRONTEND_URL.rstrip('/')}/admin/alertas"
    fecha = timezone.localtime(alerta.fecha_alerta).strftime("%d/%m/%Y %H:%M")

    html = f"""
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
  <div style="background:#1E3A5F;color:#ffffff;padding:20px 24px;border-radius:12px 12px 0 0">
    <strong style="font-size:18px">Workspace Pulse</strong><br>
    <span style="font-size:13px;opacity:.85">Alerta de umbral crítico</span>
  </div>
  <div style="border:1px solid #e2e8f0;border-top:0;padding:24px;border-radius:0 0 12px 12px">
    <p style="margin-top:0">La métrica <strong>{escape(umbral.metrica)}</strong> {verbo} el límite aceptable.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;color:#64748b">Centro de trabajo</td><td style="padding:8px 0;text-align:right"><strong>{escape(centro)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Área</td><td style="padding:8px 0;text-align:right"><strong>{escape(area)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Valor detectado</td><td style="padding:8px 0;text-align:right;color:#dc2626"><strong>{_numero(valor)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Límite configurado</td><td style="padding:8px 0;text-align:right"><strong>{_numero(umbral.valor_minimo_aceptable)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Fecha</td><td style="padding:8px 0;text-align:right">{fecha}</td></tr>
    </table>
    <p style="margin:24px 0 0">
      <a href="{escape(enlace)}" style="background:#1E3A5F;color:#ffffff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px">Ver alertas</a>
    </p>
  </div>
  <p style="font-size:12px;color:#94a3b8;text-align:center">Mensaje automático de Workspace Pulse · NOM-035-STPS-2018</p>
</div>
""".strip()

    texto = (
        f"Alerta de umbral crítico\n\n"
        f"{umbral.metrica} {verbo} el límite aceptable.\n"
        f"Centro de trabajo: {centro}\nÁrea: {area}\n"
        f"Valor detectado: {_numero(valor)}\n"
        f"Límite configurado: {_numero(umbral.valor_minimo_aceptable)}\n"
        f"Fecha: {fecha}\n\nVer alertas: {enlace}"
    )
    return asunto, html, texto


# ----------------------------------------------------------------------
# EVALUACIÓN
# ----------------------------------------------------------------------

def evaluar_umbrales(empresa_id=None, centro_id=None, enviar_correos=True, forzar=False):
    """
    Revisa cada umbral y, si se rebasa, crea una AlertaClima y avisa por correo.

    - empresa_id: limita a una empresa (None = todas).
    - centro_id:  limita a un centro de trabajo.
    - forzar:     crea la alerta aunque ya haya una abierta para ese umbral
                  (por defecto hay máximo UNA alerta abierta por umbral, para
                  no mandar el mismo correo cada vez que se evalúa).
    """
    AlertaClima = _modelo("AlertaClima")
    umbrales = _modelo("ConfiguracionUmbral").objects.select_related(
        "centro_trabajo", "area"
    )
    if empresa_id is not None:
        umbrales = umbrales.filter(centro_trabajo__empresa_id=empresa_id)
    if centro_id:
        umbrales = umbrales.filter(centro_trabajo_id=centro_id)

    resumen = {
        "umbrales_revisados": 0,
        "alertas_creadas": [],
        "omitidos": [],
        "correos_enviados": 0,
        "errores": [],
    }

    for umbral in umbrales:
        medidor = METRICAS.get(_clave(umbral.metrica))
        if medidor is None:
            resumen["omitidos"].append(
                {"umbral": umbral.id, "motivo": f"La métrica '{umbral.metrica}' no tiene cálculo definido"}
            )
            continue

        funcion, sentido = medidor
        medicion = funcion(umbral)
        if medicion is None:
            resumen["omitidos"].append({"umbral": umbral.id, "motivo": "Todavía no hay datos para evaluar"})
            continue

        valor, campana_id = medicion
        resumen["umbrales_revisados"] += 1

        limite = umbral.valor_minimo_aceptable
        rebasado = valor > limite if sentido == "max" else valor < limite
        if not rebasado:
            continue

        if not forzar and AlertaClima.objects.filter(configuracion_umbral=umbral, resuelta=False).exists():
            resumen["omitidos"].append({"umbral": umbral.id, "motivo": "Ya existe una alerta abierta para este umbral"})
            continue

        verbo = "supera" if sentido == "max" else "está por debajo de"
        alerta = AlertaClima.objects.create(
            valor_destacado=valor,
            mensaje=(
                f"{umbral.metrica} en {umbral.area.nombre} ({umbral.centro_trabajo.nombre}): "
                f"{_numero(valor)} {verbo} el límite de {_numero(limite)}."
            ),
            resuelta=False,
            configuracion_umbral=umbral,
        )
        resumen["alertas_creadas"].append(
            {"alerta": alerta.id, "umbral": umbral.id, "area": umbral.area.nombre, "valor": valor}
        )

        if not enviar_correos:
            continue

        destinatarios = correos_administradores(umbral.centro_trabajo.empresa_id)
        if not destinatarios:
            resumen["errores"].append({"umbral": umbral.id, "error": "La empresa no tiene administradores activos con correo"})
            continue

        asunto, html, texto = _armar_correo(umbral, valor, sentido, alerta)
        ok, detalle = enviar_correo(destinatarios, asunto, html, texto)
        _registrar_envio(umbral, campana_id, ok, detalle)

        if ok:
            resumen["correos_enviados"] += 1
        else:
            resumen["errores"].append({"umbral": umbral.id, "error": detalle})

    return resumen
