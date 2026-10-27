from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import area_serializer
from api.models.area_model import Area

##VIEW CRUD

##CREATE
class CreateAreaApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Area.objects.all()
    serializer_class = area_serializer.CreateAreaSerializer

##READ

##List
class ListAreaApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        area = Area.objects.filter(centrotrabajo__empresa_id=empresa_id)
        data = area_serializer.ListAreaSerializerByEmpresa(area, many=True).data
        return Response (data)

##Detail
class DetailAreaApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        area = Area.objects.filter(pk = id, centrotrabajo__empresa_id=empresa_id)
        data = area_serializer.DetailAreaSerializerByEmpresa(area).data
        return Response (data)   

##UPDATE
class UpdateAreaApiView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Area.objects.all()
    serializer_class = area_serializer.UpdateAreaSerializerByEmpresa
    def get_queryset(self):
        empresa_id = self.request.user.centrotrabajo.empresa_id
        return Area.objects.filter(centrotrabajo__empresa_id=empresa_id)

##DELETE
class DeleteAreaApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Area.objects.all()
    serializer_class = area_serializer.DeleteAreaSerializerByEmpresa
    def get_queryset(self):
        empresa_id = self.request.user.centrotrabajo.empresa_id
        return Area.objects.filter(centrotrabajo__empresa_id=empresa_id)