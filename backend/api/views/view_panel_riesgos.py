# backend/api/views/view_panel_riesgos.py
#
# Endpoint de solo lectura que arma TODO lo que necesita el Panel de riesgos
# (indicadores, tendencia, distribución, áreas, factores y catálogos de filtros)
# a partir de las tablas ResultadoRiesgo, DetalleRespuesta y MetricaRendimientoRH.
#
# GET /api/panel-riesgos/?meses=6&centro_trabajo=1&area=2
#   meses            -> 1, 3, 6 o 12 (default 6)
#   centro_trabajo   -> id del centro (opcional)
#   area             -> id del área (opcional)

from datetime import date

from django.apps import apps
from django.db.models import Avg, Count, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models.area_model import Area
from api.models.centro_trabajo_model import Centro_trabajo
from api.models.detalle_respuesta_model import DetalleRespuesta
from api.models.resultado_riesgo_model import ResultadoRiesgo
from api.models.usuario_model import Usuario

# Se obtiene por nombre para no depender del nombre del archivo del modelo.
MetricaRendimientoRH = apps.get_model("api", "MetricaRendimientoRH")

MESES_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

ORDEN_NIVELES = ["Nulo", "Bajo", "Medio", "Alto", "Muy alto"]
NIVELES_ALTOS = ("Alto", "Muy alto")


def _entero(valor, defecto=None):
    try:
        return int(valor)
    except (TypeError, ValueError):
        return defecto


def _redondear(valor, decimales=1):
    return round(float(valor), decimales) if valor is not None else None


def _inicio_periodo(meses):
    """Primer día del mes que abre el periodo (incluye el mes actual)."""
    hoy = timezone.localdate()
    indice = hoy.year * 12 + (hoy.month - 1) - (meses - 1)
    anio, mes = divmod(indice, 12)
    return date(anio, mes + 1, 1)


def _empresa_del_usuario(request):
    """
    Devuelve el id de la empresa a la que se limitan los datos.
    - None  -> sin restricción (superusuario).
    - 0     -> el usuario no está ligado a ninguna empresa: no verá datos.

    AJUSTA ESTA FUNCIÓN a como identifique tu authentication.py al usuario
    (aquí se busca el Usuario por el email de request.user).
    """
    user = request.user
    if getattr(user, "is_superuser", False):
        return None

    email = getattr(user, "email", "") or ""
    perfil = Usuario.objects.filter(email__iexact=email).first() if email else None
    return perfil.empresa_id if perfil else 0


class PanelRiesgosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        meses = _entero(request.query_params.get("meses"), 6)
        if meses not in (1, 3, 6, 12):
            meses = 6

        centro_id = _entero(request.query_params.get("centro_trabajo"))
        area_id = _entero(request.query_params.get("area"))
        empresa_id = _empresa_del_usuario(request)
        desde = _inicio_periodo(meses)

        # ---------------- Querysets base con filtros ----------------
        resultados = ResultadoRiesgo.objects.filter(fecha_calculo__date__gte=desde)
        detalles = DetalleRespuesta.objects.filter(
            respuesta_evaluacion__fecha_respuesta__date__gte=desde
        )
        metricas = MetricaRendimientoRH.objects.filter(
            Q(periodo_anio__gt=desde.year)
            | Q(periodo_anio=desde.year, periodo_mes__gte=desde.month)
        )
        centros = Centro_trabajo.objects.all()
        areas = Area.objects.all()

        if empresa_id is not None:
            resultados = resultados.filter(area__centro_trabajo__empresa_id=empresa_id)
            detalles = detalles.filter(
                respuesta_evaluacion__centro_trabajo__empresa_id=empresa_id
            )
            metricas = metricas.filter(centro_trabajo__empresa_id=empresa_id)
            centros = centros.filter(empresa_id=empresa_id)
            areas = areas.filter(centro_trabajo__empresa_id=empresa_id)

        if centro_id:
            resultados = resultados.filter(area__centro_trabajo_id=centro_id)
            detalles = detalles.filter(respuesta_evaluacion__centro_trabajo_id=centro_id)
            metricas = metricas.filter(centro_trabajo_id=centro_id)
            areas = areas.filter(centro_trabajo_id=centro_id)

        if area_id:
            resultados = resultados.filter(area_id=area_id)
            detalles = detalles.filter(respuesta_evaluacion__area_id=area_id)
            metricas = metricas.filter(area_id=area_id)

        # ---------------- Distribución por nivel ----------------
        conteos = {
            fila["nivel_riesgo"]: fila["total"]
            for fila in resultados.values("nivel_riesgo").annotate(total=Count("id"))
        }
        total_resultados = sum(conteos.values())

        niveles = [n for n in ORDEN_NIVELES if conteos.get(n)]
        niveles += [n for n in conteos if n not in ORDEN_NIVELES]

        distribucion = [
            {
                "nombre": nivel,
                "cantidad": conteos[nivel],
                "valor": _redondear(conteos[nivel] * 100 / total_resultados),
            }
            for nivel in niveles
        ]

        alto_total = sum(conteos.get(n, 0) for n in NIVELES_ALTOS)
        porcentaje_alto = (
            _redondear(alto_total * 100 / total_resultados) if total_resultados else 0
        )

        # ---------------- Tendencia mensual ----------------
        riesgo_por_mes = {
            (fila["mes"].year, fila["mes"].month): fila["riesgo"]
            for fila in resultados.annotate(mes=TruncMonth("fecha_calculo"))
            .values("mes")
            .annotate(riesgo=Avg("puntuacion_riesgo"))
        }
        rotacion_por_mes = {
            (fila["periodo_anio"], fila["periodo_mes"]): fila["rotacion"]
            for fila in metricas.values("periodo_anio", "periodo_mes").annotate(
                rotacion=Avg("tasa_rotacion")
            )
        }

        tendencia = []
        anio, mes = desde.year, desde.month
        for _ in range(meses):
            tendencia.append(
                {
                    "periodo": MESES_ES[mes - 1],
                    "anio": anio,
                    "riesgo": _redondear(riesgo_por_mes.get((anio, mes))),
                    "rotacion": _redondear(rotacion_por_mes.get((anio, mes))),
                }
            )
            mes += 1
            if mes > 12:
                mes, anio = 1, anio + 1

        # ---------------- Riesgo por área ----------------
        por_area = [
            {
                "id": fila["area_id"],
                "nombre": fila["area__nombre"],
                "centro": fila["area__centro_trabajo__nombre"],
                "riesgo": _redondear(fila["riesgo"]),
            }
            for fila in resultados.values(
                "area_id", "area__nombre", "area__centro_trabajo__nombre"
            )
            .annotate(riesgo=Avg("puntuacion_riesgo"))
            .order_by("-riesgo")
        ]

        # ---------------- Factores (dominios de las preguntas) ----------------
        # valor_ponderado va de 0 a 10, se escala x10 para graficar de 0 a 100.
        factores = [
            {"nombre": fila["pregunta__dominio"], "valor": _redondear(fila["promedio"] * 10)}
            for fila in detalles.exclude(pregunta__dominio="")
            .values("pregunta__dominio")
            .annotate(promedio=Avg("valor_ponderado"))
            .order_by("-promedio")
        ]

        promedio_riesgo = resultados.aggregate(p=Avg("puntuacion_riesgo"))["p"]

        return Response(
            {
                "filtros": {"meses": meses, "desde": desde.isoformat()},
                "indicadores": {
                    "riesgo_promedio": _redondear(promedio_riesgo) or 0,
                    "nivel_alto_porcentaje": porcentaje_alto,
                    "factores_evaluados": len(factores),
                    "areas_evaluadas": len(por_area),
                    "total_resultados": total_resultados,
                },
                "tendencia": tendencia,
                "distribucion": distribucion,
                "areas": por_area,
                "factores": factores,
                "catalogos": {
                    "centros": list(centros.order_by("nombre").values("id", "nombre")),
                    "areas": list(
                        areas.order_by("nombre").values("id", "nombre", "centro_trabajo_id")
                    ),
                },
            }
        )
