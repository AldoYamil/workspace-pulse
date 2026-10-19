from rest_framework import serializers
from django.contrib.auth.models import User
from api.models.puesto_model import Puesto
from .area_serializer import DetailAreaSerializerByEmpresa

##CRUD PUESTO

##CREATE
class CreatePuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puesto
        fields = [
            "id",
            "nombre",
            "area"
        ]

##READ

##List
class ListPuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puesto
        fields = [
            "id",
            "nombre",
            "area"
        ]

##Detail
class DetailPuestoSerializer(serializers.ModelSerializer):
    area = DetailAreaSerializerByEmpresa()
    class Meta:
        model = Puesto
        fields = [
            "id",
            "nombre",
            "area"
        ]

##UPDATE
class UpdatePuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puesto
        fields = [
            "id",
            "nombre",
            "area"
        ]

##DELETE
class DeletePuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puesto
        fields = [
            "nombre"
        ]