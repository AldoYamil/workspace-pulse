from rest_framework import serializers
from django.contrib.auth.models import User
from api.models.usuario_model import Usuario

##CRUS USUARIO

##CREATE
class CreateUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "id",
            "nombre",
            "email",
            "password_hash",
            "rol",
            "activo",
            "empresa",
            "centro_trabajo",
        ]

##READ

##List
class ListUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "nombre",
            "email",
            "rol",
        ]

##Detail
class DetailUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "id",
            "nombre",
            "email",
            "password_hash",
            "rol",
            "activo",
            "empresa",
            "centro_trabajo",
        ]

##UPDATE
class UpdateUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "nombre",
            "email",
            "password_hash",
            "rol",
            "activo",
            "empresa",
            "centro_trabajo",
        ]

##DELETE
class DeleteUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "nombre"
        ]