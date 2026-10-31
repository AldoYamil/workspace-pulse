from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import alerta_clima_serializer
from api.models.alerta_clima_model import AlertaClima

##CREATE
class CreateAlertaClimaApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = AlertaClima.objects.all()
    serializer_class = alerta_clima_serializer.CreateAlertaClimaSerializer

##READ

#List
class ListAlertaClimaApiView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = alerta_clima_serializer.ListAlertaClimaSerializer

    def get_queryset(self):
        empresa_id = self.request.user.centrotrabajo.empresa_id
        return AlertaClima.objects.filter(
            configuracion_umbral__centro_trabajo__empresa_id=empresa_id
        ).select_related('configuracion_umbral')

#Detail
class DetailAlertaClimaApiView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = alerta_clima_serializer.ListAlertaClimaSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        empresa_id = self.request.user.centrotrabajo.empresa_id
        return AlertaClima.objects.filter(
            configuracion_umbral__centro_trabajo__empresa_id=empresa_id
        )

#Alertas No Resueltas
class ListAlertaClimaNoResueltasApiView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = alerta_clima_serializer.ListAlertaClimaSerializer

    def get_queryset(self):
        empresa_id = self.request.user.centrotrabajo.empresa_id
        
        # Filtramos por empresa y por resuelta=False (nombre exacto de tu modelo)
        return AlertaClima.objects.filter(
            configuracion_umbral__centro_trabajo__empresa_id=empresa_id,
            resuelta=False
        ).select_related('configuracion_umbral')

##UPDATE
class UpdateAlertaClimaApiView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = alerta_clima_serializer.UpdateAlertaClimaSerializer

    def get_queryset(self):
        empresa_id = self.request.user.centrotrabajo.empresa_id
        return AlertaClima.objects.filter(
            configuracion_umbral__centro_trabajo__empresa_id=empresa_id
        )