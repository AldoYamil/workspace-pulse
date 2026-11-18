from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import bitacora_auditoria_sistema_serializer
from api.models.bitacora_auditoria_sistema_model import BitacoraAuditoriaSistema
from api.models.usuario_model import Usuario

##CREATE
class CreateBitacoraAuditoriaSistemaApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = BitacoraAuditoriaSistema.objects.all()
    serializer_class = bitacora_auditoria_sistema_serializer.CreateBitacoraAuditoriaSistemaSerializer

##READ
#List
class ListBitacoraAuditoriaSistemaApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        usuario_logeado = request.user
        empresa_id = usuario_logeado.centrotrabajo.empresa_id
        bitacora_auditoria = BitacoraAuditoriaSistema.objects.filter(
            usuario__centrotrabajo__empresa_id=empresa_id
        )

        serializer = bitacora_auditoria_sistema_serializer.ListBitacoraAuditoriaSistemaSerializer(bitacora_auditoria, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

#Detail
class DetailBitacoraAuditoriaSistemaApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        usuario_logeado = request.user
        empresa_id = usuario_logeado.centrotrabajo.empresa_id
        bitacora_auditoria = BitacoraAuditoriaSistema.objects.filter(id=id,
            usuario__centrotrabajo__empresa_id=empresa_id
        )

        serializer = bitacora_auditoria_sistema_serializer.DetailBitacoraAuditoriaSistemaSerializer(bitacora_auditoria)
        return Response(serializer.data, status=status.HTTP_200_OK)