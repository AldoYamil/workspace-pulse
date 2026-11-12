from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import puesto_serializer
from api.models.puesto_model import Puesto
from api.models.usuario_model import Usuario

def get_usuario_perfil(user_auth):
    usuario_perfil = getattr(user_auth, 'usuario', None)
    if not usuario_perfil and hasattr(user_auth, 'email'):
        usuario_perfil = Usuario.objects.filter(email=user_auth.email).first()
    return usuario_perfil

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
        usuario_perfil = getattr(usuario_logueado, 'usuario', None)
        if not usuario_perfil:
            usuario_perfil = Usuario.objects.filter(email=usuario_logueado.email).first()

        if not usuario_perfil or not usuario_perfil.centro_trabajo:
            if usuario_logueado.is_superuser:
                puesto = Puesto.objects.all()
                data =puesto_serializer.ListPuestoSerializer(puesto, many=True).data
                return Response(data, status=status.HTTP_200_OK)
            
            return Response(
                {"error": "El usuario autenticado no tiene una puesto asignado en su perfil."},
                status=status.HTTP_400_BAD_REQUEST
            )
        perfil = Usuario.objects.select_related('centro_trabajo').filter(email=request.user.email).first()
        if not perfil or not perfil.centro_trabajo:
            return Response(
                {"error": "El usuario no tiene un centro de trabajo o empresa asignada."},
                status=status.HTTP_400_BAD_REQUEST
            )

        empresa_id = perfil.centro_trabajo.empresa_id
        puesto = Puesto.objects.filter(area__centro_trabajo__empresa_id=empresa_id)
        data = puesto_serializer.ListPuestoSerializer(puesto, many=True).data
        return Response (data)

##Detail
class DetailPuestoApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        usuario_logueado = request.user
        usuario_perfil = getattr(usuario_logueado, 'usuario', None)
        if not usuario_perfil:
            usuario_perfil = Usuario.objects.filter(email=usuario_logueado.email).first()

        if not usuario_perfil or not usuario_perfil.centro_trabajo:
            if usuario_logueado.is_superuser:
                puesto = Puesto.objects.all()
                data =puesto_serializer.ListPuestoSerializer(puesto, many=True).data
                return Response(data, status=status.HTTP_200_OK)
            
            return Response(
                {"error": "El usuario autenticado no tiene una puesto asignado en su perfil."},
                status=status.HTTP_400_BAD_REQUEST
            )
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
        usuario_perfil = get_usuario_perfil(self.request.user)
        if usuario_perfil and usuario_perfil.centro_trabajo:
            return Puesto.objects.filter(empresa_id=usuario_perfil.area.centro_trabajo.empresa_id)
        if self.request.user.is_superuser:
            return Puesto.objects.all()
        return Puesto.objects.none()

##DELETE
class DeletePuestoApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Puesto.objects.all()
    serializer_class = puesto_serializer.DeletePuestoSerializer
    def get_queryset(self):
        usuario_perfil = get_usuario_perfil(self.request.user)
        if usuario_perfil and usuario_perfil.centro_trabajo:
            return Puesto.objects.filter(empresa_id=usuario_perfil.area.centro_trabajo.empresa_id)
        if self.request.user.is_superuser:
            return Puesto.objects.all()
        return Puesto.objects.none()