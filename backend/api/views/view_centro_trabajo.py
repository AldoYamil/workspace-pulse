from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import centro_trabajo_serializer
from api.models.centro_trabajo_model import Centro_trabajo

##VIEW CRUD

##CREATE
class CreateCentroTrabajoApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Centro_trabajo.objects.all()
    serializer_class = centro_trabajo_serializer.CreateCentroTrabajoSerializer

##READ

##List
class ListCentroTrabajoApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        centro_trabajo = Centro_trabajo.objects.filter(empresa_id=empresa_id)
        data = centro_trabajo_serializer.ListCentroTrabajoSerializer(centro_trabajo, many=True).data
        return Response (data)

##Detail
class DetailCentroTrabajoApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        centro_trabajo = Centro_trabajo.objects.filter(pk = id,empresa_id=empresa_id)
        data = centro_trabajo_serializer.DetailCentroTrabajoSerializer(centro_trabajo).data
        return Response (data)    

##UPDATE
class UpdateCentroTrabajoApiView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Centro_trabajo.objects.all()
    serializer_class = centro_trabajo_serializer.UpdateCentroTrabajoSerializer
    def get_queryset(self):
        empresa_id = self.request.user.centrotrabajo.empresa_id
        return Centro_trabajo.objects.filter(empresa_id=empresa_id)

##DELETE
class DeleteCentroTrabajoApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Centro_trabajo.objects.all()
    serializer_class = centro_trabajo_serializer.DeleteCentroTrabajoSerializer
    def get_queryset(self):
        empresa_id = self.request.user.centrotrabajo.empresa_id
        return Centro_trabajo.objects.filter(empresa_id=empresa_id)