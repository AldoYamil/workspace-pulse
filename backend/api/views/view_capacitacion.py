from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import capacitacion_serializer
from api.models.capacitacion_model import Capacitacion
from api.models.planeacion_model import Planeacion
from api.models.centro_trabajo_model import Centro_trabajo

##CREATE
class CreateCapacitacionApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Capacitacion.objects.all()
    serializer_class = capacitacion_serializer .CreateCapacitacionSerializer

##READ
#List
class ListCapacitacionApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        usuario_logeado = request.user
        empresa_id = usuario_logeado.centrotrabajo.empresa_id
        capacitaciones = Capacitacion.objects.filter(
            centrotrabajo__empresa_id=empresa_id
        )

        serializer = capacitacion_serializer .ListCapacitacionSerializer(capacitaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

#Detail
class DetailCapacitacionApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        usuario_logeado = request.user
        empresa_id = usuario_logeado.centrotrabajo.empresa_id
        capacitacion = Capacitacion.objects.filter(id=id,
            centrotrabajo__empresa_id=empresa_id
        )
        serializer = capacitacion_serializer .DetailCapacitacionSerializer(capacitacion)
        return Response(serializer.data, status=status.HTTP_200_OK)

##UPDATE
class UpdateCapacitacionApiView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Capacitacion.objects.all()
    serializer_class = capacitacion_serializer .UpdateCapacitacionSerializer

##DELETE
class DeleteCapacitacionApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Capacitacion.objects.all()
    serializer_class = capacitacion_serializer .DeleteCapacitacionSerializer