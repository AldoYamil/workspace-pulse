from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics

from django.contrib.auth.models import User

from api.serializers import empresa_serializer
from api.models.empresa_model import Empresa 

##VIEW CRUD

##CREATE
class CreateEmpresaApiView(generics.CreateAPIView):
    queryset = Empresa.objects.all()
    serializer_class = empresa_serializer.CreateEmpresaSerializer

##READ

##List
class ListEmpresaApiView(APIView):
    def get(self, request):
        empresa = Empresa.objects.all()
        data = empresa_serializer.ListEmpresaSerializer(empresa, many=True).data
        return Response (data)

##Detail
class DetailEmpresaApiView(APIView):
    def get(self, request, id):
        empresa = Empresa.objects.get(pk = id)
        data = empresa_serializer.DetailEmpresaSerializer(empresa).data
        return Response (data)    

##UPDATE
class UpdateEmpresaApiView(generics.UpdateAPIView):
    queryset = Empresa.objects.all()
    serializer_class = empresa_serializer.UpdateEmpresaSerializer

##DELETE
class DeleteEmpresaApiView(generics.DestroyAPIView):
    queryset = Empresa.objects.all()
    serializer_class = empresa_serializer.DeleteEmpresaSerializer