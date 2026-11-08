# backend/api/services/planes_service.py
#
# Arma el contexto de un área (puntuación, nivel, dominios con más riesgo),
# pide recomendaciones a Groq y, si la IA no está disponible, usa el catálogo
# (RecomendacionCatalogo) como respaldo para que la pantalla siempre funcione.

from datetime import date

from django.apps import apps
from django.db.models import Avg, Q
from django.utils import timezone

from . import groq_service

PRIORIDAD_POR_NIVEL = {"muy alto": "Alta", "alto": "Alta", "medio": "Media", "bajo": "Baja", "nulo": "Baja"}


class SinDatos(Exception):
    """No hay evaluaciones del área en el periodo."""


def _m(nombre):
    return apps.get_model("api", nombre)


def _inicio_periodo(meses):
    """Primer día del mes que abre el periodo (incluye el mes actual)."""
    hoy = timezone.localdate()
    indice = hoy.year * 12 + (hoy.month - 1) - (meses - 1)
    anio, mes = divmod(indice, 12)
    return date(anio, mes + 1, 1)


def armar_contexto(area, meses):
    desde = _inicio_periodo(meses)

    resultados = _m("ResultadoRiesgo").objects.filter(area_id=area.id, fecha_calculo__date__gte=desde)
    ultimo = resultados.order_by("-fecha_calculo").first()

    # valor_ponderado va de 0 a 10; se escala x10 (índice 0-100, más alto = más riesgo)
    factores = [
        {"dominio": fila["pregunta__dominio"], "indice": round(fila["promedio"] * 10, 1)}
        for fila in (
            _m("DetalleRespuesta").objects
            .filter(respuesta_evaluacion__area_id=area.id,
                    respuesta_evaluacion__fecha_respuesta__date__gte=desde)
            .exclude(pregunta__dominio="")
            .values("pregunta__dominio")
            .annotate(promedio=Avg("valor_ponderado"))
            .order_by("-promedio")[:5]
        )
    ]

    if ultimo is None and not factores:
        raise SinDatos("No hay evaluaciones de esta área en el periodo seleccionado.")

    promedio = resultados.aggregate(p=Avg("puntuacion_riesgo"))["p"]
    return {
        "area": area.nombre,
        "centro_trabajo": area.centro_trabajo.nombre,
        "periodo_meses": meses,
        "puntuacion_promedio": round(promedio, 1) if promedio is not None else None,
        "nivel_actual": ultimo.nivel_riesgo if ultimo else None,
        "factores": factores,
    }


def _catalogo_relevante(contexto):
    dominios = [f["dominio"] for f in contexto["factores"]]
    filtro = Q()
    for dominio in dominios:
        filtro |= Q(dominio__iexact=dominio)
    if not dominios:
        return []
    return [
        {
            "dominio": r.dominio,
            "nivel_riesgo": r.nivel_riesgo,
            "titulo": r.titulo_recomendacion,
            "accion": r.descripcion_accion,
            "referencia": r.referencia_normativa,
        }
        for r in _m("RecomendacionCatalogo").objects.filter(filtro)[:12]
    ]


def _desde_catalogo(contexto, catalogo):
    """Respaldo sin IA: una recomendación del catálogo por cada dominio con riesgo."""
    nivel = (contexto.get("nivel_actual") or "").lower()
    prioridad = PRIORIDAD_POR_NIVEL.get(nivel, "Media")
    usados, recomendaciones = set(), []

    for factor in contexto["factores"]:
        dominio = factor["dominio"]
        candidatas = [c for c in catalogo if c["dominio"].lower() == dominio.lower()]
        if not candidatas or dominio.lower() in usados:
            continue
        # prefiere la del mismo nivel de riesgo; si no hay, la primera
        elegida = next((c for c in candidatas if c["nivel_riesgo"].lower() == nivel), candidatas[0])
        usados.add(dominio.lower())
        recomendaciones.append({
            "dominio": dominio,
            "titulo": elegida["titulo"][:100],
            "descripcion": elegida["accion"],
            "prioridad": prioridad,
            "plazo_dias": 30,
            "responsable_sugerido": "Recursos Humanos",
            "referencia_normativa": elegida["referencia"] or "NOM-035-STPS-2018",
            "origen": "catalogo",
        })
    return recomendaciones


def recomendar(area, meses=6):
    """Devuelve el contexto del área + las recomendaciones (IA o catálogo)."""
    contexto = armar_contexto(area, meses)
    catalogo = _catalogo_relevante(contexto)

    # Último resultado de riesgo del área: es al que se liga el plan que se cree
    ultimo = _m("ResultadoRiesgo").objects.filter(area_id=area.id).order_by("-fecha_calculo").first()

    aviso = None
    try:
        recomendaciones = groq_service.generar_recomendaciones({**contexto, "catalogo": catalogo})
        origen = "ia"
    except groq_service.GroqNoDisponible as exc:
        recomendaciones = _desde_catalogo(contexto, catalogo)
        origen = "catalogo"
        aviso = f"No se pudo usar la IA ({exc})."
        if recomendaciones:
            aviso += " Se muestran las recomendaciones del catálogo."
        else:
            aviso += " Tampoco hay recomendaciones en el catálogo para estos dominios."

    return {
        "area": {"id": area.id, "nombre": area.nombre, "centro_trabajo": area.centro_trabajo.nombre},
        "periodo_meses": meses,
        "puntuacion_promedio": contexto["puntuacion_promedio"],
        "nivel_actual": contexto["nivel_actual"],
        "resultado_riesgo_id": ultimo.id if ultimo else None,
        "factores": contexto["factores"],
        "origen": origen,
        "aviso": aviso,
        "recomendaciones": recomendaciones,
    }
