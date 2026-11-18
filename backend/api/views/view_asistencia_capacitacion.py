from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import asistencia_capacitacion_serializer
from api.models.asistencia_capacitacion_model import AsistenciaCapacitacion
from api.models.centro_trabajo_model import Centro_trabajo

##CREATE
class CreateAsistenciaCapacitacionApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = AsistenciaCapacitacion.objects.all()
    serializer_class = asistencia_capacitacion_serializer.CreateAsistenciaCapacitacionSerializer

##READ
#List
class ListAsistenciaCapacitacionApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        usuario_logeado = request.user
        empresa_id = usuario_logeado.centrotrabajo.empresa_id
        asistencia_capacitaciones = AsistenciaCapacitacion.objects.filter(
            centrotrabajo__empresa_id=empresa_id
        )

        serializer = asistencia_capacitacion_serializer.ListAsistenciaCapacitacionSerializer(asistencia_capacitaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    