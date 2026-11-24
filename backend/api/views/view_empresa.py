from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.apps import apps
from django.db import transaction
from rest_framework.permissions import AllowAny

from django.contrib.auth.models import User

from api.serializers import empresa_serializer
from api.models.empresa_model import Empresa 

##VIEW CRUD
def _m(nombre):
    return apps.get_model("api", nombre)

##CREATE
class CreateEmpresaApiView(generics.CreateAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    queryset = Empresa.objects.all()
    serializer_class = empresa_serializer.CreateEmpresaSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        dominio = (data.get("dominio_correo") or data.get("dominio") or "").strip().lower().lstrip("@")
        if dominio:
            data["dominio_correo"] = dominio
            data["dominio"] = dominio

        nombre_admin = (data.get("nombre_admin") or "").strip()
        email_admin = (data.get("email_admin") or "").strip().lower()
        supabase_uid = (data.get("supabase_uid") or "").strip()

        if dominio and email_admin:
            if "@" not in email_admin or email_admin.split("@")[-1] != dominio:
                return Response(
                    {"detail": f"El correo del administrador debe pertenecer al dominio @{dominio}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        Usuario = apps.get_model("api", "Usuario")
        CentroTrabajo = apps.get_model("api", "Centro_trabajo")

        if email_admin and Usuario.objects.filter(email=email_admin).exists():
            return Response(
                {"detail": "Ya existe un usuario registrado con ese correo electrónico."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                empresa = serializer.save()

                campos_empresa = {f.name for f in Empresa._meta.fields}
                actualizado = False
                if dominio and "dominio_correo" in campos_empresa and not getattr(empresa, "dominio_correo", None):
                    empresa.dominio_correo = dominio
                    actualizado = True
                elif dominio and "dominio" in campos_empresa and not getattr(empresa, "dominio", None):
                    empresa.dominio = dominio
                    actualizado = True
                if email_admin and "email" in campos_empresa and not getattr(empresa, "email", None):
                    empresa.email = email_admin
                    actualizado = True
                if actualizado:
                    empresa.save()

                usuario_id = None
                if email_admin:
                    centro_kwargs = {
                        "nombre": f"Matriz - {empresa.nombre}",
                        "empresa": empresa,
                    }
                    campos_centro = {f.name for f in CentroTrabajo._meta.fields}
                    if "direccion" in campos_centro:
                        centro_kwargs["direccion"] = "Oficina Central"
                    if "num_empleados" in campos_centro:
                        centro_kwargs["num_empleados"] = 1
                    elif "total_empleados" in campos_centro:
                        centro_kwargs["total_empleados"] = 1

                    centro = CentroTrabajo.objects.create(**centro_kwargs)

                    campos_usuario = {f.name for f in Usuario._meta.fields}
                    usuario_kwargs = {
                        "email": email_admin,
                        "centro_trabajo": centro,
                    }
                    if "empresa" in campos_usuario:
                        usuario_kwargs["empresa"] = empresa
                    if "nombre" in campos_usuario:
                        usuario_kwargs["nombre"] = nombre_admin or "Administrador"
                    if "rol" in campos_usuario:
                        usuario_kwargs["rol"] = "administrador"
                    if "supabase_uid" in campos_usuario and supabase_uid:
                        usuario_kwargs["supabase_uid"] = supabase_uid
                    if "activo" in campos_usuario:
                        usuario_kwargs["activo"] = True

                    usuario = Usuario.objects.create(**usuario_kwargs)
                    usuario_id = usuario.id

            respuesta = serializer.data
            if usuario_id:
                respuesta["usuario_admin_id"] = usuario_id

            headers = self.get_success_headers(serializer.data)
            return Response(respuesta, status=status.HTTP_201_CREATED, headers=headers)

        except Exception as exc:
            return Response(
                {"detail": f"Error al completar el registro empresarial: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
##READ

##List
class ListEmpresaApiView(APIView):
    def get(self, request):
        empresa = Empresa.objects.all()
        data = empresa_serializer.ListEmpresaSerializer(empresa, many=True).data
        return Response (data)

##Detail
class DetailEmpresaApiView(APIView):
    def get(self, request, id):
        empresa = Empresa.objects.get(pk = id)
        data = empresa_serializer.DetailEmpresaSerializer(empresa).data
        return Response (data)    

##UPDATE
class UpdateEmpresaApiView(generics.UpdateAPIView):
    queryset = Empresa.objects.all()
    serializer_class = empresa_serializer.UpdateEmpresaSerializer

##DELETE
class DeleteEmpresaApiView(generics.DestroyAPIView):
    queryset = Empresa.objects.all()
    serializer_class = empresa_serializer.DeleteEmpresaSerializer