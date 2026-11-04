from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import bitacora_notificacion_serializer
from api.models.bitacora_notificacion_model import Bitacora_notificacion
from api.models.campana_evaluacion_model import Usuario

##CREATE
class CreateBitacoraNotificacionApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Bitacora_notificacion.objects.all()
    serializer_class = bitacora_notificacion_serializer.CreateBitacoraNotificacionSerializer

##READ
#List
class ListBitacoraNotificacionApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        usuario_logeado = request.user
        empresa_id = usuario_logeado.centrotrabajo.empresa_id
        bitacora_notificacion = Bitacora_notificacion.objects.filter(
            usuario__centrotrabajo__empresa_id=empresa_id
        )

        serializer = bitacora_notificacion_serializer.ListBitacoraNotificacionSerializer(bitacora_notificacion, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
