from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import puesto_serializer
from api.models.puesto_model import Puesto

##VIEW CRUD

##CREATE
class CreatePuestoApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Puesto.objects.all()
    serializer_class = puesto_serializer.CreatePuestoSerializer

##READ

##List
class ListPuestoApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        puesto = Puesto.objects.filter(area__centrotrabajo__empresa_id=empresa_id)
        data = puesto_serializer.ListPuestoSerializer(puesto, many=True).data
        return Response (data)

##Detail
class DetailPuestoApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        puesto = Puesto.objects.filter(pk = id, area__centrotrabajo__empresa_id=empresa_id)
        data = puesto_serializer.DetailPuestoSerializer(puesto).data
        return Response (data)    

##UPDATE
class UpdatePuestoApiView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Puesto.objects.all()
    serializer_class = puesto_serializer.UpdatePuestoSerializer
    def get_queryset(self):
        empresa_id = self.request.user.centrotrabajo.empresa_id
        return Puesto.objects.filter(area__centrotrabajo__empresa_id=empresa_id)

##DELETE
class DeletePuestoApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Puesto.objects.all()
    serializer_class = puesto_serializer.DeletePuestoSerializer
    def get_queryset(self):
        empresa_id = self.request.user.centrotrabajo.empresa_id
        return Puesto.objects.filter(area__centrotrabajo__empresa_id=empresa_id)