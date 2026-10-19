from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics

from django.contrib.auth.models import User

from api.serializers import puesto_serializer
from api.models.puesto_model import Puesto

##VIEW CRUD

##CREATE
class CreatePuestoApiView(generics.CreateAPIView):
    queryset = Puesto.objects.all()
    serializer_class = puesto_serializer.CreatePuestoSerializer

##READ

##List
class ListPuestoApiView(APIView):
    def get(self, request):
        puesto = Puesto.objects.all()
        data = puesto_serializer.ListPuestoSerializer(puesto, many=True).data
        return Response (data)

##Detail
class DetailPuestoApiView(APIView):
    def get(self, request, id):
        puesto = Puesto.objects.get(pk = id)
        data = puesto_serializer.DetailPuestoSerializer(puesto).data
        return Response (data)    

##UPDATE
class UpdatePuestoApiView(generics.UpdateAPIView):
    queryset = Puesto.objects.all()
    serializer_class = puesto_serializer.UpdatePuestoSerializer

##DELETE
class DeletePuestoApiView(generics.DestroyAPIView):
    queryset = Puesto.objects.all()
    serializer_class = puesto_serializer.DeletePuestoSerializer