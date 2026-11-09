# backend/api/services/groq_service.py
#
# Único punto que habla con Groq. Recibe datos AGREGADOS de un área
# (puntuaciones, dominios, catálogo de recomendaciones) y devuelve una lista
# de recomendaciones ya validada.
#
# PRIVACIDAD: a Groq solo se le mandan números agregados y textos del
# catálogo. Nunca nombres, correos ni respuestas individuales (las encuestas
# son anónimas).
#
# Si algo falla (sin clave, modelo retirado, límite de uso, respuesta rara)
# se lanza GroqNoDisponible y quien llama usa el catálogo como respaldo.

import json
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


class GroqNoDisponible(Exception):
    """La IA no pudo generar recomendaciones (el mensaje explica por qué)."""


PRIORIDADES = {"alta": "Alta", "media": "Media", "baja": "Baja"}

SYSTEM_PROMPT = """Eres un consultor experto en la NOM-035-STPS-2018 (factores de riesgo psicosocial en el trabajo, México).
Recibirás datos agregados de un área de trabajo y debes proponer medidas preventivas y correctivas concretas.

Responde SIEMPRE en español y ÚNICAMENTE con un objeto JSON con esta forma exacta:
{
  "recomendaciones": [
    {
      "dominio": "dominio de riesgo al que responde",
      "titulo": "título corto de la medida (máximo 90 caracteres)",
      "descripcion": "qué hacer, paso a paso y de forma concreta (2 a 4 oraciones)",
      "prioridad": "Alta | Media | Baja",
      "plazo_dias": 30,
      "responsable_sugerido": "Recursos Humanos | Jefe de área | Dirección",
      "referencia_normativa": "referencia del catálogo recibido o NOM-035-STPS-2018"
    }
  ]
}

Reglas:
- Entre 3 y 5 recomendaciones, ordenadas de mayor a menor prioridad.
- Atiende primero los dominios con índice más alto (más riesgo).
- Si el nivel es Alto o Muy alto, incluye al menos una medida de atención inmediata.
- Para referencia_normativa usa SOLO lo que venga en el catálogo recibido; si no hay, escribe NOM-035-STPS-2018. No inventes números de apartado.
- No incluyas datos personales ni nada fuera del JSON."""


def _leer_json(texto):
    texto = (texto or "").strip()
    if texto.startswith("```"):
        texto = texto.strip("`")
        if texto.lower().startswith("json"):
            texto = texto[4:]
    try:
        return json.loads(texto)
    except json.JSONDecodeError:
        inicio, fin = texto.find("{"), texto.rfind("}")
        if inicio != -1 and fin > inicio:
            try:
                return json.loads(texto[inicio:fin + 1])
            except json.JSONDecodeError:
                pass
    raise GroqNoDisponible("la IA no devolvió un JSON válido")


def _texto(valor, maximo, defecto=""):
    valor = " ".join(str(valor or "").split())
    return valor[:maximo] if valor else defecto


def _normalizar(datos):
    """Valida y recorta lo que devolvió el modelo (nunca se confía en él a ciegas)."""
    items = datos.get("recomendaciones") if isinstance(datos, dict) else None
    if not isinstance(items, list):
        raise GroqNoDisponible("la respuesta de la IA no trae recomendaciones")

    resultado = []
    for item in items[:5]:
        if not isinstance(item, dict):
            continue
        titulo = _texto(item.get("titulo"), 100)     # Planeacion.titulo mide 100
        descripcion = _texto(item.get("descripcion"), 1200)
        if not titulo or not descripcion:
            continue

        try:
            plazo = int(item.get("plazo_dias"))
        except (TypeError, ValueError):
            plazo = 30

        resultado.append({
            "dominio": _texto(item.get("dominio"), 100),
            "titulo": titulo,
            "descripcion": descripcion,
            "prioridad": PRIORIDADES.get(_texto(item.get("prioridad"), 10).lower(), "Media"),
            "plazo_dias": max(7, min(180, plazo)),
            "responsable_sugerido": _texto(item.get("responsable_sugerido"), 60, "Recursos Humanos"),
            "referencia_normativa": _texto(item.get("referencia_normativa"), 200, "NOM-035-STPS-2018"),
            "origen": "ia",
        })

    if not resultado:
        raise GroqNoDisponible("la IA devolvió una lista vacía")
    return resultado


def _explicar_error(exc):
    texto = str(exc)
    minusculas = texto.lower()
    if "decommission" in minusculas or "model_not_found" in minusculas or "does not exist" in minusculas:
        return "el modelo configurado ya no existe en Groq; cambia GROQ_MODEL (ver console.groq.com/docs/models)"
    if "rate" in minusculas and "limit" in minusculas or "429" in minusculas:
        return "se alcanzó el límite de uso de Groq; intenta de nuevo en un momento"
    if "401" in minusculas or "invalid api key" in minusculas:
        return "la clave de Groq no es válida"
    return texto[:200] or exc.__class__.__name__


def generar_recomendaciones(contexto):
    """
    contexto: dict con área, periodo, puntuación, nivel, factores y catálogo.
    Devuelve una lista de recomendaciones normalizadas o lanza GroqNoDisponible.
    """
    if not settings.GROQ_API_KEY:
        raise GroqNoDisponible("GROQ_API_KEY no está configurada en el .env")

    try:
        from groq import Groq  # import perezoso: la app arranca aunque no esté instalado
    except ImportError:
        raise GroqNoDisponible("falta instalar el paquete groq (pip install groq)")

    mensaje = (
        "Datos agregados del área (JSON):\n"
        + json.dumps(contexto, ensure_ascii=False)
        + "\n\nGenera las recomendaciones en el formato JSON indicado."
    )

    try:
        cliente = Groq(api_key=settings.GROQ_API_KEY, timeout=30.0)
        respuesta = cliente.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": mensaje},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        texto = respuesta.choices[0].message.content
    except Exception as exc:
        logger.warning("Groq no pudo generar recomendaciones: %s", exc)
        raise GroqNoDisponible(_explicar_error(exc))

    return _normalizar(_leer_json(texto))
