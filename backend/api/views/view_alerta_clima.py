from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import alerta_clima_serializer
from api.models.alerta_clima_model import AlertaClima
from api.models.usuario_model import Usuario
from api.services.alertas_service import evaluar_umbrales

def obtener_empresa_id(user):
    perfil = Usuario.objects.select_related('centro_trabajo').filter(email=user.email).first()
    if not perfil or not perfil.centro_trabajo:
        raise PermissionDenied("El usuario no tiene un centro de trabajo o empresa asignada.")
    return perfil.centro_trabajo.empresa_id

class EvaluarUmbralesApiView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        empresa_id = obtener_empresa_id(request.user)
        centro_id = request.data.get("centro_id")
        forzar = bool(request.data.get("forzar", False))

        resumen = evaluar_umbrales(
            empresa_id=empresa_id,
            centro_id=centro_id,
            enviar_correos=True,
            forzar=forzar,
        )
        return Response(resumen, status=status.HTTP_200_OK)

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
        return AlertaClima.objects.filter(
            configuracion_umbral__centro_trabajo__empresa_id=empresa_id,
            resuelta=False
        ).select_related('configuracion_umbral')

##UPDATE
class UpdateAlertaClimaApiView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = alerta_clima_serializer.UpdateAlertaClimaSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        empresa_id = obtener_empresa_id(self.request.user)
        return AlertaClima.objects.filter(
            configuracion_umbral__centro_trabajo__empresa_id=empresa_id
        )

## DELETE
class DeleteAlertaClimaApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        empresa_id = obtener_empresa_id(self.request.user)
        return AlertaClima.objects.filter(
            configuracion_umbral__centro_trabajo__empresa_id=empresa_id
        )