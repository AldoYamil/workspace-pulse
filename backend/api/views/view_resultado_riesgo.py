from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import resultado_riesgo_serializer
from api.models.resultado_riesgo_model import ResultadoRiesgo
from api.models.campana_evaluacion_model import Campana_evaluacion
from api.models.area_model import Area

##CREATE
class CreateResultadoRiesgoApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = ResultadoRiesgo.objects.all()
    serializer_class = resultado_riesgo_serializer.CreateResultadoRiesgoSerializer

##READ

##By Campaña
class ListResultadoRiesgoByCampanaApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, campana_id):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        resultados = ResultadoRiesgo.objects.filter(
            campana_id=campana_id,
            campana__centrotrabajo__empresa_id=empresa_id
        )
        serializer = resultado_riesgo_serializer.ListResultadoRiesgoByCampanaSerializer(resultados, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

##By Area en Campaña
class ListResultadoRiesgoByAreaCampanaApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, campana_id, area_id):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        resultados = ResultadoRiesgo.objects.filter(
            campana_id=campana_id,
            area_id=area_id,
            campana__centrotrabajo__empresa_id=empresa_id
        )
        serializer = resultado_riesgo_serializer.ListResultadoRiesgoByCampanaSerializer(resultados, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)