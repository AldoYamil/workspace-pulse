from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import metrica_rendimiento_rh_serializer
from api.models.metrica_rendimiento_rh_model import MetricaRendimientoRH
from api.models.centro_trabajo_model import Centro_trabajo
from api.models.area_model import Area

##CREATE
class CreateMetricaRHApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = MetricaRendimientoRH.objects.all()
    serializer_class = metrica_rendimiento_rh_serializer.CreateMetricaRHSerializer

##READ
#List
class ListMetricaRHApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        usuario_logeado = request.user
        empresa_id = usuario_logeado.centrotrabajo.empresa_id
        metricarh = MetricaRendimientoRH.objects.filter(
            usuario__centrotrabajo__empresa_id=empresa_id
        )

        serializer = metrica_rendimiento_rh_serializer.ListMetricaRHSerializer(metricarh, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
