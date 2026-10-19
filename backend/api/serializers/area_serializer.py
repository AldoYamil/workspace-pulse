from rest_framework import serializers
from django.contrib.auth.models import User
from api.models.area_model import Area

##CRUD AREA

##CREATE
class CreateAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = [
            "id",
            "nombre",
            "descripcion",
            "centro_trabajo",
        ]

##READ

##List
class ListAreaSerializerByEmpresa(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = [
            "nombre",
            "descripcion",
            "centro_trabajo",
        ]

##Detail
class DetailAreaSerializerByEmpresa(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = [
            "nombre",
            "descripcion",
            "centro_trabajo",
        ]

##UPDATE
class UpdateAreaSerializerByEmpresa(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = [
            "nombre",
            "descripcion",
            "centro_trabajo",
        ]

##DELETE
class DeleteAreaSerializerByEmpresa(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = [
            "nombre",
        ]