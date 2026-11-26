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
##List
class ListUsuarioApiView(APIView):
    def get_empresa_id_usuario(self, request):
        campos = {f.name for f in Usuario._meta.fields}
        perfil = None
        if "supabase_uid" in campos:
            perfil = Usuario.objects.filter(supabase_uid=request.user.username).first()
        if not perfil and getattr(request.user, "email", None):
            perfil = Usuario.objects.filter(email__iexact=request.user.email).first()

        if not perfil:
            return None

        return getattr(perfil, "empresa_id", None) or (
            perfil.centro_trabajo.empresa_id if getattr(perfil, "centro_trabajo", None) else None
        )

    def get(self, request):
        empresa_id = self.get_empresa_id_usuario(request)
        if not empresa_id:
            return Response([])

        usuarios = Usuario.objects.filter(empresa_id=empresa_id).select_related(
            "empresa", "centro_trabajo"
        )
        data = usuario_serializer.ListUsuarioSerializer(usuarios, many=True).data
        return Response(data)

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