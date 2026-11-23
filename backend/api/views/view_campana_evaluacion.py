from django.conf import settings
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from accounts.permissions import SoloGestion, PersonalRH

from django.contrib.auth.models import User

from api.serializers import campana_evaluacion_serializer
from api.models.campana_evaluacion_model import Campana_evaluacion
from api.models.guia_referencia_model import Guia_referencia
from api.models.centro_trabajo_model import Centro_trabajo
from api.models import Usuario, Bitacora_notificacion
from api.services.email_service import enviar_correo

##CREATE
class CreateCampanaEvaluacionApiView(generics.CreateAPIView):
    permission_classes = [SoloGestion]
    queryset = Campana_evaluacion.objects.all()
    serializer_class = campana_evaluacion_serializer.CreateCampanaEvaluacionSerializer

    def perform_create(self, serializer):
        campana = serializer.save()
        notificar_nueva_campana(campana)

##READ

##List
class ListCampanaEvaluacionApiView(APIView):
    permission_classes = [PersonalRH]
    def get(self, request, guia_id, centro_id):
        campanas = Campana_evaluacion.objects.filter(
            guia_referencia_id=guia_id,
            centro_trabajo_id=centro_id,
        )
        serializer = campana_evaluacion_serializer.ListCampanaEvaluacionSerializer(campanas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

##Detail
class DetailCampanaEvaluacionApiView(APIView):
    permission_classes = [PersonalRH]
    def get(self, request, id):
        guia_id = request.query_params.get('guia_id')
        centro_id = request.query_params.get('centro_id')

        if not guia_id or not centro_id:
            return Response(
                {"error": "El parámetro 'guia_id' o 'centro_id' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        campana = Campana_evaluacion.objects.filter(guia_referencia_id=guia_id)
        data = campana_evaluacion_serializer.DetailCampanaEvaluacionSerializer(campana).data
        return Response(data, status=status.HTTP_200_OK)

##UPDATE
class UpdateCampanaEvaluacionApiView(generics.UpdateAPIView):
    permission_classes = [SoloGestion]
    queryset = Campana_evaluacion.objects.all()
    serializer_class = campana_evaluacion_serializer.UpdateCampanaEvaluacionSerializer

##DELETE
class DeleteCampanaEvaluacionApiView(generics.DestroyAPIView):
    permission_classes = [SoloGestion]
    queryset = Campana_evaluacion.objects.all()
    serializer_class = campana_evaluacion_serializer.DeleteCampanaEvaluacionSerializer


def notificar_nueva_campana(campana):
    destinatarios = list(
        Usuario.objects.filter(
            centro_trabajo_id=campana.centro_trabajo_id,
            activo=True
        ).values_list("email", flat=True)
    )
    if not destinatarios:
        return

    enlace_encuesta = f"{settings.FRONTEND_URL.rstrip('/')}/encuesta?campana={campana.id}"
    asunto = f"Nueva Evaluación Disponible: {campana.nombre}"
    html = f"""
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
          <h2>{campana.nombre}</h2>
          <p>Tienes una nueva encuesta de clima laboral / NOM-035 asignada.</p>
          <p>
            <a href="{enlace_encuesta}" style="background:#1E3A5F;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">
              Responder Encuesta
            </a>
          </p>
        </div>
    """

    ok, detalle = enviar_correo(destinatarios, asunto, html)

    Bitacora_notificacion.objects.create(
        proveedor="Resend",
        id_transaccion_externa=(detalle if ok else f"ERROR: {detalle}")[:100],
        estado_envio="Enviado" if ok else "Fallido",
        campana_id=campana.id,
    )