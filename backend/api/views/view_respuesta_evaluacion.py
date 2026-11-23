import json
from django.apps import apps
from django.db import transaction
from django.db.models import Avg
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from accounts.permissions import PersonalRH, SoloGestion, CualquierRol
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import date, timedelta
from django.utils import timezone
import random
from urllib.parse import urlparse, parse_qs

from api.serializers import respuesta_evaluacion_serializer
from api.models.respuesta_evaluacion_model import Respuesta_evaluacion
from api.models.campana_evaluacion_model import Campana_evaluacion
from api.models.area_model import Area
from api.services.alertas_service import evaluar_umbrales


def _m(nombre):
    return apps.get_model("api", nombre)


## CREATE
class CreateRespuestaEvaluacionApiView(generics.CreateAPIView):
    permission_classes = [CualquierRol]
    queryset = Respuesta_evaluacion.objects.all()
    serializer_class = respuesta_evaluacion_serializer.CreateRespuestaEvaluacionSerializer


## READ
class ListRespuestaEvaluacionApiView(APIView):
    permission_classes = [PersonalRH]

    def get(self, request):
        campana_id = request.query_params.get("campana_id")
        area_id = request.query_params.get("area_id")

        if not campana_id or not area_id:
            return Response(
                {"error": "Los parámetros 'campana_id' y 'area_id' son requeridos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        respuesta = Respuesta_evaluacion.objects.filter(campana=campana_id, area=area_id)
        data = respuesta_evaluacion_serializer.ListRespuestaEvaluacionSerializer(respuesta, many=True).data
        return Response(data, status=status.HTTP_200_OK)


class DetailRespuestaEvaluacionApiView(APIView):
    permission_classes = [PersonalRH]

    def get(self, request, id):
        respuesta = get_object_or_404(Respuesta_evaluacion, pk=id)
        data = respuesta_evaluacion_serializer.DetailRespuestaEvaluacionSerializer(respuesta).data
        return Response(data, status=status.HTTP_200_OK)


def _resolver_contexto(token=None, campana_id=None, area_id=None, guia_id=None):
    """
    Devuelve (campana, area, centro_trabajo, puesto, touchpoint)
    necesarios para poblar todos los campos NOT NULL de Respuesta_evaluacion,
    respetando la guia_id seleccionada en el QR si viene en la URL.
    """
    Touchpoint = _m("Touchpoint")
    Puesto = _m("Puesto")
    GuiaReferencia = _m("Guia_referencia")

    tp = None
    area = None
    centro = None
    puesto = None

    if token:
        tp = (
            Touchpoint.objects.select_related("area", "centro_trabajo", "puesto")
            .filter(codigo_qr_token=token)
            .first()
        )
        if tp:
            area = Area.objects.filter(pk=area_id).first() if area_id else tp.area
            centro = tp.centro_trabajo or (area.centro_trabajo if area else None)
            puesto = tp.puesto or (Puesto.objects.filter(area=area).first() if area else None) or Puesto.objects.first()

    if not area and area_id:
        area = Area.objects.select_related("centro_trabajo").filter(pk=area_id).first()
        if area and not centro:
            centro = area.centro_trabajo

    if campana_id:
        campana = Campana_evaluacion.objects.select_related("centro_trabajo", "guia_referencia").filter(pk=campana_id).first()
        if campana:
            if not area:
                area = Area.objects.filter(centro_trabajo=campana.centro_trabajo).first()
            if not centro:
                centro = campana.centro_trabajo or (area.centro_trabajo if area else None)
            if not tp and area:
                tp = Touchpoint.objects.filter(area=area).first() or Touchpoint.objects.filter(centro_trabajo=centro).first()
            if not puesto:
                puesto = (tp.puesto if tp and tp.puesto else None) or (Puesto.objects.filter(area=area).first() if area else None) or Puesto.objects.first()
            return campana, area, centro, puesto, tp

    if guia_id:
        guia = GuiaReferencia.objects.filter(pk=guia_id).first()
        if guia:
            if not centro:
                centro = area.centro_trabajo if area else _m("Centro_trabajo").objects.first()
            if not area and centro:
                area = Area.objects.filter(centro_trabajo=centro).first()
            if not tp and area:
                tp = Touchpoint.objects.filter(area=area).first() or Touchpoint.objects.filter(centro_trabajo=centro).first()
            if not puesto:
                puesto = (tp.puesto if tp and tp.puesto else None) or (Puesto.objects.filter(area=area).first() if area else None) or Puesto.objects.first()

            campana = (
                Campana_evaluacion.objects.filter(
                    guia_referencia=guia, centro_trabajo=centro, estado=True
                )
                .order_by("-fecha_inicio")
                .first()
                or Campana_evaluacion.objects.filter(
                    guia_referencia=guia, centro_trabajo=centro
                )
                .order_by("-fecha_inicio")
                .first()
            )
            if not campana and centro:
                hoy = date.today()
                campana = Campana_evaluacion.objects.create(
                    nombre=getattr(guia, "nombre", f"Evaluación Guía #{guia.id}"),
                    guia_referencia=guia,
                    centro_trabajo=centro,
                    fecha_inicio=hoy,
                    fecha_fin=hoy + timedelta(days=30),
                    estado=True,
                )
            return campana, area, centro, puesto, tp

    if tp and area:
        campana = (
            Campana_evaluacion.objects.filter(centro_trabajo=centro, estado__iexact="Activa")
            .order_by("-fecha_inicio")
            .first()
            or Campana_evaluacion.objects.filter(centro_trabajo=centro)
            .order_by("-fecha_inicio")
            .first()
        )
        return campana, area, centro, puesto, tp

    return None, None, None, None, None


class EncuestaPublicaDetalleView(APIView):
    """GET /api/v1/encuesta-publica/?token=...&guia=...&campana=...&area=..."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get("token")
        guia_id = request.query_params.get("guia")
        campana_id = request.query_params.get("campana") or request.query_params.get("surveyId")
        area_id = request.query_params.get("area")

        campana, area, _, _, _ = _resolver_contexto(
            token=token, campana_id=campana_id, area_id=area_id, guia_id=guia_id
        )
        if not campana or not area:
            return Response(
                {"detail": "El enlace o código QR de la encuesta no es válido."},
                status=status.HTTP_404_NOT_FOUND,
            )

        preguntas = _m("Pregunta").objects.filter(
            guia_referencia_id=campana.guia_referencia_id
        ).order_by("id")

        return Response({
            "campana_id": campana.id,
            "guia_id": campana.guia_referencia_id,
            "area_id": area.id,
            "area_nombre": area.nombre,
            "title": getattr(campana.guia_referencia, "nombre", None) or getattr(campana, "nombre", f"Evaluación #{campana.id}"),
            "description": getattr(campana.guia_referencia, "descripcion", "Cuestionario NOM-035-STPS-2018"),
            "questions": [
                {
                    "id": p.id,
                    "text": getattr(p, "texto_pregunta", None) or getattr(p, "texto", str(p)),
                    "dominio": getattr(p, "dominio", ""),
                }
                for p in preguntas
            ],
        }, status=status.HTTP_200_OK)

class ResponderEncuestaPublicaView(APIView):
    """POST /api/v1/encuesta-publica/responder/"""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        guia_id = request.data.get("guia_id")
        campana_id = request.data.get("campana_id")
        area_id = request.data.get("area_id")
        respuestas = request.data.get("respuestas", [])

        campana, area, centro, puesto, touchpoint = _resolver_contexto(
            token=token, campana_id=campana_id, area_id=area_id, guia_id=guia_id
        )
        if not campana or not area:
            return Response({"detail": "Campaña o área inválida."}, status=status.HTTP_400_BAD_REQUEST)

        if not touchpoint or not puesto:
            return Response(
                {"detail": "Falta configurar al menos un Touchpoint QR y un Puesto en esta área."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not respuestas:
            return Response({"detail": "No se recibieron respuestas."}, status=status.HTTP_400_BAD_REQUEST)

        Pregunta = _m("Pregunta")
        DetalleRespuesta = _m("DetalleRespuesta")
        ResultadoRiesgo = _m("ResultadoRiesgo")

        columnas_detalle = {f.name: f for f in DetalleRespuesta._meta.fields}
        fk_resp_detalle = "respuesta_evaluacion" if "respuesta_evaluacion" in columnas_detalle else "respuesta"

        campos_riesgo = {f.name for f in ResultadoRiesgo._meta.get_fields()}
        fk_campana_riesgo = "campana_evaluacion" if "campana_evaluacion" in campos_riesgo else "campana"

        preguntas_map = {
            p.id: p for p in Pregunta.objects.filter(id__in=[r["pregunta_id"] for r in respuestas])
        }

        try:
            with transaction.atomic():
                evaluacion = Respuesta_evaluacion.objects.create(
                    respuesta=json.dumps(respuestas, ensure_ascii=False),
                    campana=campana,
                    centro_trabajo=centro,
                    puesto=puesto,
                    touchpoint=touchpoint,
                    area=area,
                )

                detalles = []
                for item in respuestas:
                    pregunta = preguntas_map.get(int(item["pregunta_id"]))
                    if not pregunta:
                        continue
                    valor = int(item["valor"])
                    ponderado = round((valor - 1) * 2.5, 2)

                    kwargs_detalle = {
                        fk_resp_detalle: evaluacion,
                        "pregunta": pregunta,
                    }

                    if "valor_ponderado" in columnas_detalle:
                        kwargs_detalle["valor_ponderado"] = ponderado

                    for candidato in ("valor_respuesta", "valor", "puntuacion", "respuesta_num", "opcion_seleccionada"):
                        if candidato in columnas_detalle:
                            kwargs_detalle[candidato] = valor
                            break

                    detalles.append(DetalleRespuesta(**kwargs_detalle))

                DetalleRespuesta.objects.bulk_create(detalles)

                if "valor_ponderado" in columnas_detalle:
                    filtro_avg = {
                        f"{fk_resp_detalle}__campana": campana,
                        f"{fk_resp_detalle}__area": area,
                    }
                    promedio = (
                        DetalleRespuesta.objects.filter(**filtro_avg)
                        .aggregate(p=Avg("valor_ponderado"))["p"] or 0
                    )
                    puntuacion = round(promedio * 10, 1)
                else:
                    valores = [int(i["valor"]) for i in respuestas]
                    puntuacion = round(((sum(valores) / len(valores)) - 1) * 25, 1)

                if puntuacion >= 75:
                    nivel = "Muy alto"
                elif puntuacion >= 50:
                    nivel = "Alto"
                elif puntuacion >= 25:
                    nivel = "Medio"
                else:
                    nivel = "Bajo"

                filtro_riesgo = {fk_campana_riesgo: campana, "area": area}
                if "puesto" in campos_riesgo:
                    filtro_riesgo["puesto"] = puesto

                ResultadoRiesgo.objects.update_or_create(
                    **filtro_riesgo,
                    defaults={"puntuacion_riesgo": puntuacion, "nivel_riesgo": nivel},
                )

            evaluar_umbrales(centro_id=centro.id)

            return Response(
                {"detail": "Respuestas registradas correctamente.", "evaluacion_id": evaluacion.id},
                status=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            return Response(
                {"detail": f"Error al guardar en BD: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

class SimularEncuestasMasivasView(APIView):
    permission_classes = [SoloGestion]

    def post(self, request):
        modo = str(request.data.get("modo", "simple")).lower()
        cantidad = min(int(request.data.get("cantidad", 150)), 1000)

        Area = _m("Area")
        Pregunta = _m("Pregunta")
        DetalleRespuesta = _m("DetalleRespuesta")
        ResultadoRiesgo = _m("ResultadoRiesgo")
        GuiaReferencia = Pregunta._meta.get_field("guia_referencia").related_model

        columnas_detalle = {f.name: f for f in DetalleRespuesta._meta.fields}
        fk_resp_detalle = "respuesta_evaluacion" if "respuesta_evaluacion" in columnas_detalle else "respuesta"
        campos_riesgo = {f.name for f in ResultadoRiesgo._meta.get_fields()}
        fk_campana_riesgo = "campana_evaluacion" if "campana_evaluacion" in campos_riesgo else "campana"

        if modo == "variado" or request.data.get("variado"):
            areas = list(Area.objects.all())
            guias = list(GuiaReferencia.objects.all())
            if not areas or not guias:
                return Response(
                    {"detail": "No hay áreas o guías registradas para simular."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            perfiles_por_area = [
                ("bajo", [45, 35, 12, 5, 3]),    
                ("mixto", [22, 28, 25, 15, 10]), 
                ("alto", [8, 12, 22, 33, 25]),
                ("critico", [3, 7, 15, 35, 40]),
            ]

            ahora = timezone.now()
            total_creados = 0

            campos_eval = {f.name: f for f in Respuesta_evaluacion._meta.fields}
            campo_fecha_eval = next(
                (c for c in ("fecha_respuesta", "fecha_creacion", "created_at", "fecha") if c in campos_eval),
                None,
            )

            with transaction.atomic():
                detalles_totales = []

                for idx_area, area in enumerate(areas):
                    _, pesos = perfiles_por_area[idx_area % len(perfiles_por_area)]
                    for guia in guias[:6]:
                        preguntas = list(Pregunta.objects.filter(guia_referencia_id=guia.id))
                        if not preguntas:
                            continue

                        campana, _, centro, puesto, touchpoint = _resolver_contexto(
                            area_id=area.id, guia_id=guia.id
                        )
                        if not campana or not centro or not puesto or not touchpoint:
                            continue

                        lote = max(5, cantidad // max(1, len(areas) * min(len(guias), 6)))

                        for i in range(lote):
                            # Repartir aleatoriamente en los últimos 175 días (Jun - Nov)
                            dias_atras = random.randint(0, 175)
                            fecha_sim = ahora - timedelta(days=dias_atras)

                            evaluacion = Respuesta_evaluacion.objects.create(
                                respuesta="[]",
                                campana=campana,
                                centro_trabajo=centro,
                                puesto=puesto,
                                touchpoint=touchpoint,
                                area=area,
                            )

                            if campo_fecha_eval:
                                Respuesta_evaluacion.objects.filter(id=evaluacion.id).update(
                                    **{campo_fecha_eval: fecha_sim}
                                )

                            respuestas_sim = []
                            for p in preguntas:
                                valor = random.choices([1, 2, 3, 4, 5], weights=pesos, k=1)[0]
                                ponderado = round((valor - 1) * 2.5, 2)
                                respuestas_sim.append({"pregunta_id": p.id, "valor": valor})

                                kwargs_det = {fk_resp_detalle: evaluacion, "pregunta": p}
                                if "valor_ponderado" in columnas_detalle:
                                    kwargs_det["valor_ponderado"] = ponderado
                                for candidato in ("valor_respuesta", "valor", "puntuacion", "respuesta_num"):
                                    if candidato in columnas_detalle:
                                        kwargs_det[candidato] = valor
                                        break
                                detalles_totales.append(DetalleRespuesta(**kwargs_det))

                            evaluacion.respuesta = json.dumps(respuestas_sim, ensure_ascii=False)
                            evaluacion.save(update_fields=["respuesta"])
                            total_creados += 1

                        if "valor_ponderado" in columnas_detalle:
                            promedio = (
                                DetalleRespuesta.objects.filter(
                                    **{
                                        f"{fk_resp_detalle}__campana": campana,
                                        f"{fk_resp_detalle}__area": area,
                                    }
                                ).aggregate(p=Avg("valor_ponderado"))["p"]
                                or 0
                            )
                            if promedio == 0 and detalles_totales:
                                ultimos = [d.valor_ponderado for d in detalles_totales[-len(preguntas) * lote :]]
                                promedio = sum(ultimos) / len(ultimos)
                            puntuacion = round(promedio * 10, 1)
                        else:
                            puntuacion = round(random.uniform(20, 82), 1)

                        if puntuacion >= 75:
                            nivel = "Muy alto"
                        elif puntuacion >= 50:
                            nivel = "Alto"
                        elif puntuacion >= 25:
                            nivel = "Medio"
                        else:
                            nivel = "Bajo"

                        filtro_riesgo = {fk_campana_riesgo: campana, "area": area}
                        if "puesto" in campos_riesgo:
                            filtro_riesgo["puesto"] = puesto

                        ResultadoRiesgo.objects.update_or_create(
                            **filtro_riesgo,
                            defaults={"puntuacion_riesgo": puntuacion, "nivel_riesgo": nivel},
                        )

                DetalleRespuesta.objects.bulk_create(detalles_totales, batch_size=1000)

            for c_id in set(Area.objects.values_list("centro_trabajo_id", flat=True)):
                if c_id:
                    evaluar_umbrales(centro_id=c_id)

            return Response(
                {
                    "status": "ok",
                    "modo": "variado",
                    "simulados": total_creados,
                    "areas_cubiertas": len(areas),
                    "guias_cubiertas": min(len(guias), 6),
                },
                status=status.HTTP_201_CREATED,
            )