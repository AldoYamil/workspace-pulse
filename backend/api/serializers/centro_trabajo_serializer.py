from rest_framework import serializers
from django.contrib.auth.models import User
from api.models.centro_trabajo_model import Centro_trabajo

##CRUD CENTRO TRABAJO

##CREATE
class CreateCentroTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centro_trabajo
        fields = [
            "id",
            "nombre",
            "direccion",
            "num_empleados",
            "codigo_postal",
            "empresa",
        ]

##READ

##List
class ListCentroTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centro_trabajo
        fields = [
            "nombre",
            "direccion",
            "empresa",
        ] 

##Detail
class DetailCentroTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centro_trabajo
        fields = [
            "id",
            "nombre",
            "direccion",
            "num_empleados",
            "codigo_postal",
            "empresa",
        ]

##UPDATE
class UpdateCentroTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centro_trabajo
        fields = [
            "id",
            "nombre",
            "direccion",
            "num_empleados",
            "codigo_postal"
        ]

##DELETE
class DeleteCentroTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centro_trabajo
        fields = [
            "nombre",
        ]