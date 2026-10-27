from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import configuracion_umbral_serializer
from api.models.configuracion_umbral_model import ConfiguracionUmbral
from api.models.centro_trabajo_model import Centro_trabajo
from api.models.area_model import Area

##CREATE
class CreateConfiguracionUmbralApiView(generics.CreateAPIView):
    queryset = ConfiguracionUmbral.objects.all()
    serializer_class = configuracion_umbral_serializer.CreateConfiguracionUmbralSerializer

##READ

##List
class ListConfiguracionUmbralApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, centro_id):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        umbrales = ConfiguracionUmbral.objects.filter(
            centrotrabajo_id=centro_id,
            centrotrabajo__empresa_id=empresa_id
        )
        serializer = configuracion_umbral_serializer.ListConfiguracionUmbralSerializer(umbrales, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

##Detail
class DetailConfiguracionUmbralApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        umbral = ConfiguracionUmbral.objects.get(pk=id,
                centrotrabajo__empresa_id=empresa_id)
        serializer = configuracion_umbral_serializer.DetailConfiguracionUmbralSerializer(umbral)
        return Response(serializer.data, status=status.HTTP_200_OK)

##UPDATE
class UpdateConfiguracionUmbralApiView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = configuracion_umbral_serializer.UpdateConfiguracionUmbralSerializer
    def get_queryset(self):
        empresa_id = self.request.user.centrotrabajo.empresa_id
        return ConfiguracionUmbral.objects.filter(centrotrabajo__empresa_id=empresa_id)

##DELETE
class DeleteConfiguracionUmbralApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = configuracion_umbral_serializer.DeleteConfiguracionUmbralSerializer
    def get_queryset(self):
        empresa_id = self.request.user.centrotrabajo.empresa_id
        return ConfiguracionUmbral.objects.filter(centrotrabajo__empresa_id=empresa_id)