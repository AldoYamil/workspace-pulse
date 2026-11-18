from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import integracion_tercero_serializer
from api.models.integracion_tercero_model import IntergracionTercero

##CREATE
class CreateIntegracionTerceroApiView(generics.CreateAPIView):
    queryset = IntergracionTercero.objects.all()
    serializer_class = integracion_tercero_serializer.CreateIntegracionTerceroSerializer

##READ

#List
class ListIntegracionTerceroApiView(APIView):
    def get(self, request):
        terceros = IntergracionTercero.objects.all()
        data = integracion_tercero_serializer.ListIntegracionTerceroSerializer(terceros, many=True).data
        return Response (data)

#Detail
class DetailIntegracionTerceroApiView(APIView):
    def get(self, request, id):
        terceros = IntergracionTercero.objects.get(id=id)
        data = integracion_tercero_serializer.ListIntegracionTerceroSerializer(terceros, many=True).data
        return Response (data)

##UPDATE
class UpdateIntegracionTerceroApiView(generics.CreateAPIView):
    queryset = IntergracionTercero.objects.all()
    serializer_class = integracion_tercero_serializer.UpdateIntegracionTerceroSerializer

##DELETE
class DeleteIntegracionTerceroApiView(generics.CreateAPIView):
    queryset = IntergracionTercero.objects.all()
    serializer_class = integracion_tercero_serializer.DeleteIntegracionTerceroSerializer