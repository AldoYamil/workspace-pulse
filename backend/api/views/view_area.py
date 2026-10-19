from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics

from django.contrib.auth.models import User

from api.serializers import area_serializer
from api.models.area_model import Area

##VIEW CRUD

##CREATE
class CreateAreaApiView(generics.CreateAPIView):
    queryset = Area.objects.all()
    serializer_class = area_serializer.CreateAreaSerializer

##READ

##List
class ListAreaApiView(APIView):
    def get(self, request):
        area = Area.objects.all()
        data = area_serializer.ListAreaSerializerByEmpresa(area, many=True).data
        return Response (data)

##Detail
class DetailAreaApiView(APIView):
    def get(self, request, id):
        area = Area.objects.get(pk = id)
        data = area_serializer.DetailPuestoSerializer(area).data
        return Response (data)   

##UPDATE
class UpdateAreaApiView(generics.UpdateAPIView):
    queryset = Area.objects.all()
    serializer_class = area_serializer.UpdateAreaSerializerByEmpresa

##DELETE
class DeleteAreaApiView(generics.DestroyAPIView):
    queryset = Area.objects.all()
    serializer_class = area_serializer.DeleteAreaSerializerByEmpresa