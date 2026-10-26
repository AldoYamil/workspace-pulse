from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics

from django.contrib.auth.models import User

from api.serializers import guia_referencia_serializer
from api.models.giua_referencia_model import Guia_referencia

##CREATE
class CreateGuiaReferenciaApiView(generics.CreateAPIView):
    queryset = Guia_referencia.objects.all()
    serializer_class = guia_referencia_serializer.CreateGuiaReferenciaSerializer

##READ

##List
class ListGuiaReferenciaApiView(APIView):
    def get(self, request):
        guia_referencia = Guia_referencia.objects.all()
        data = guia_referencia_serializer.DetailGuiaReferenciaSerializer(guia_referencia, many=True).data
        return Response(data)
    
##Detail
class DetailGuiaReferenciaApiView(APIView):
    def get(self, request, id):
        guia_referencia = Guia_referencia.objects.get(pk = id)
        data = guia_referencia_serializer.ListGuiaReferenciaSerializer(guia_referencia).data
        return Response(data)

##UPDATE
class UpdateGuiaReferenciaApiView(generics.UpdateAPIView):
    queryset = Guia_referencia.objects.all()
    serializer_class = guia_referencia_serializer.UpdateGuiaReferenciaSerializer

##DELETE
class DeleteGuiaReferenciaApiView(generics.DestroyAPIView):
    queryset = Guia_referencia.objects.all()
    serializer_class = guia_referencia_serializer.DeleteGuiaReferenciaSerializer