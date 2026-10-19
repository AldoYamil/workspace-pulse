from rest_framework import serializers
from django.contrib.auth.models import User
from api.models.empresa_model import Empresa

##CRUD EMPRESA

##CREATE
class CreateEmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = [
        'id', 
        'nombre', 
        'rfc', 
        'fecha_registro', 
        'activo'
        ]

##READ

#List
class ListEmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = [
        'nombre', 
        'rfc', 
        ]

#Detail
class DetailEmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = "__all__"

##UPDATE
class UpdateEmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = [
        'nombre', 
        'rfc', 
        'activo'
        ]

##DELETE
class DeleteEmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = [ 
        'nombre'
        ]