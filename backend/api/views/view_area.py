from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import area_serializer
from api.models.area_model import Area
from api.models.usuario_model import Usuario

def get_usuario_perfil(user_auth):
    usuario_perfil = getattr(user_auth, 'usuario', None)
    if not usuario_perfil and hasattr(user_auth, 'email'):
        usuario_perfil = Usuario.objects.filter(email=user_auth.email).first()
    return usuario_perfil

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
        usuario_perfil = getattr(usuario_logueado, 'usuario', None)
        if not usuario_perfil:
            usuario_perfil = Usuario.objects.filter(email=usuario_logueado.email).first()
        
        if not usuario_perfil or not usuario_perfil.centro_trabajo:
            if usuario_logueado.is_superuser:
                area = Area.objects.all()
                data = area_serializer.ListAreaSerializerByEmpresa(area, many=True).data
                return Response(data, status=status.HTTP_200_OK)
                    
            return Response(
                {"error": "El usuario autenticado no tiene una empresa/centro asignado en su perfil."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        area = Area.objects.filter(centrotrabajo__empresa_id=empresa_id)
        data = area_serializer.ListAreaSerializerByEmpresa(area, many=True).data
        return Response (data)

##Detail
class DetailAreaApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        usuario_logueado = request.user
        usuario_perfil = getattr(usuario_logueado, 'usuario', None)
        if not usuario_perfil:
            usuario_perfil = Usuario.objects.filter(email=usuario_logueado.email).first()
        
        if not usuario_perfil or not usuario_perfil.centro_trabajo:
            if usuario_logueado.is_superuser:
                area = Area.objects.all()
                data = area_serializer.ListAreaSerializerByEmpresa(area, many=True).data
                return Response(data, status=status.HTTP_200_OK)
                    
            return Response(
                {"error": "El usuario autenticado no tiene una empresa/centro asignado en su perfil."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        area = Area.objects.filter(apk=id, centrotrabajo__empresa_id=empresa_id)
        data = area_serializer.DetailAreaSerializerByEmpresa(area).data
        return Response (data)   

##UPDATE
class UpdateAreaApiView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Area.objects.all()
    serializer_class = area_serializer.UpdateAreaSerializerByEmpresa
    def get_queryset(self):
        usuario_perfil = get_usuario_perfil(self.request.user)
        if usuario_perfil and usuario_perfil.centro_trabajo:
            return Area.objects.filter(empresa_id=usuario_perfil.centro_trabajo.empresa_id)
        if self.request.user.is_superuser:
            return Area.objects.all()
        return Area.objects.none()

##DELETE
class DeleteAreaApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Area.objects.all()
    serializer_class = area_serializer.DeleteAreaSerializerByEmpresa
    def get_queryset(self):
        usuario_perfil = get_usuario_perfil(self.request.user)
        if usuario_perfil and usuario_perfil.centro_trabajo:
            return Area.objects.filter(empresa_id=usuario_perfil.centro_trabajo.empresa_id)
        if self.request.user.is_superuser:
            return Area.objects.all()
        return Area.objects.none()