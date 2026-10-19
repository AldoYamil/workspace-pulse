from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics

from django.contrib.auth.models import User

from api.serializers import usuario_serializer
from api.models.usuario_model import Usuario

##VIEW CRUD

##CREATE
class CreateUsuarioApiView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = usuario_serializer.CreateUsuarioSerializer

##READ

##List
class ListUsuarioApiView(APIView):
    def get(self, request):
        usuario = Usuario.objects.all()
        data = usuario_serializer.ListUsuarioSerializer(usuario, many=True).data
        return Response (data)

##Detail
class DetailUsuarioApiView(APIView):
    def get(self, request, id):
        usuario = Usuario.objects.get(pk = id)
        data = usuario_serializer.DetailUsuarioSerializer(usuario).data
        return Response (data)    

##UPDATE
class UpdateUsuarioApiView(generics.UpdateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = usuario_serializer.UpdateUsuarioSerializer

##DELETE
class DeleteUsuarioApiView(generics.DestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = usuario_serializer.DeleteUsuarioSerializer