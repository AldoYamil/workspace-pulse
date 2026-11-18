from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import centro_trabajo_serializer
from api.models.centro_trabajo_model import Centro_trabajo
from api.models.usuario_model import Usuario

def get_usuario_perfil(user_auth):
    usuario_perfil = getattr(user_auth, 'usuario', None)
    if not usuario_perfil and hasattr(user_auth, 'email'):
        usuario_perfil = Usuario.objects.filter(email=user_auth.email).first()
    return usuario_perfil

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
        usuario_perfil = getattr(usuario_logueado, 'usuario', None)
        if not usuario_perfil:
            usuario_perfil = Usuario.objects.filter(email=usuario_logueado.email).first()

        if not usuario_perfil or not usuario_perfil.centro_trabajo:
            if usuario_logueado.is_superuser:
                centros = Centro_trabajo.objects.all()
                data = centro_trabajo_serializer.ListCentroTrabajoSerializer(centros, many=True).data
                return Response(data, status=status.HTTP_200_OK)
            
            return Response(
                {"error": "El usuario autenticado no tiene una empresa/centro asignado en su perfil."},
                status=status.HTTP_400_BAD_REQUEST
            )

        empresa_id = usuario_perfil.centro_trabajo.empresa_id
        centro_trabajo = Centro_trabajo.objects.filter(empresa_id=empresa_id)
        data = centro_trabajo_serializer.ListCentroTrabajoSerializer(centro_trabajo, many=True).data
        return Response(data, status=status.HTTP_200_OK)

##Detail
class DetailCentroTrabajoApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        usuario_logueado = request.user
        usuario_perfil = getattr(usuario_logueado, 'usuario', None)

        if not usuario_perfil or not usuario_perfil.centro_trabajo:
            if usuario_logueado.is_superuser:
                centro_trabajo = Centro_trabajo.objects.filter(pk=id).first()
                if not centro_trabajo:
                    return Response({"error": "Centro de trabajo no encontrado."}, status=status.HTTP_404_NOT_FOUND)
                data = centro_trabajo_serializer.DetailCentroTrabajoSerializer(centro_trabajo).data
                return Response(data, status=status.HTTP_200_OK)

            return Response(
                {"error": "El usuario autenticado no tiene un perfil configurado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        empresa_id = usuario_perfil.centrotrabajo.empresa_id
        centro_trabajo = Centro_trabajo.objects.filter(pk = id,empresa_id=empresa_id)

        if not centro_trabajo:
            return Response({"error": "Centro de trabajo no encontrado o no pertenece a su empresa."}, status=status.HTTP_404_NOT_FOUND)
        
        data = centro_trabajo_serializer.DetailCentroTrabajoSerializer(centro_trabajo).data
        return Response(data, status=status.HTTP_200_OK)    

##UPDATE
class UpdateCentroTrabajoApiView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = centro_trabajo_serializer.UpdateCentroTrabajoSerializer

    def get_queryset(self):
        usuario_perfil = get_usuario_perfil(self.request.user)
        if usuario_perfil and usuario_perfil.centro_trabajo:
            return Centro_trabajo.objects.filter(empresa_id=usuario_perfil.centro_trabajo.empresa_id)
        if self.request.user.is_superuser:
            return Centro_trabajo.objects.all()
        return Centro_trabajo.objects.none()

##DELETE
class DeleteCentroTrabajoApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = centro_trabajo_serializer.DeleteCentroTrabajoSerializer

    def get_queryset(self):
        usuario_perfil = get_usuario_perfil(self.request.user)
        if usuario_perfil and usuario_perfil.centro_trabajo:
            return Centro_trabajo.objects.filter(empresa_id=usuario_perfil.centro_trabajo.empresa_id)
        if self.request.user.is_superuser:
            return Centro_trabajo.objects.all()
        return Centro_trabajo.objects.none()