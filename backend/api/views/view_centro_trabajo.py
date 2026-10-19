from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics

from django.contrib.auth.models import User

from api.serializers import centro_trabajo_serializer
from api.models.centro_trabajo_model import Centro_trabajo

##VIEW CRUD

##CREATE
class CreateCentroTrabajoApiView(generics.CreateAPIView):
    queryset = Centro_trabajo.objects.all()
    serializer_class = centro_trabajo_serializer.CreateCentroTrabajoSerializer

##READ

##List
class ListCentroTrabajoApiView(APIView):
    def get(self, request):
        centro_trabajo = Centro_trabajo.objects.all()
        data = centro_trabajo_serializer.ListCentroTrabajoSerializer(centro_trabajo, many=True).data
        return Response (data)

##Detail
class DetailCentroTrabajoApiView(APIView):
    def get(self, request, id):
        centro_trabajo = Centro_trabajo.objects.get(pk = id)
        data = centro_trabajo_serializer.DetailCentroTrabajoSerializer(centro_trabajo).data
        return Response (data)    

##UPDATE
class UpdateCentroTrabajoApiView(generics.UpdateAPIView):
    queryset = Centro_trabajo.objects.all()
    serializer_class = centro_trabajo_serializer.UpdateCentroTrabajoSerializer

##DELETE
class DeleteCentroTrabajoApiView(generics.DestroyAPIView):
    queryset = Centro_trabajo.objects.all()
    serializer_class = centro_trabajo_serializer.DeleteCentroTrabajoSerializer