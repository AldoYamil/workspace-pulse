from rest_framework import serializers
from django.utils import timezone
from api.models.touchpoint_model import Touchpoint
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer
from .puesto_serializer import DetailPuestoSerializer
from .area_serializer import DetailAreaSerializerByEmpresa

##CRUD RESULTADO RIESGO

##CREATE
class CreateTouchpointSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer()
    area = DetailAreaSerializerByEmpresa()
    puesto = DetailPuestoSerializer()
    class Meta:
        model = Touchpoint
        flieds = [
            "nombre",
            "codigo_qr_token",
            "centro_trabajo",
            "area",
            "puesto",
        ]

##READ

#List
class ListTouchpointSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer()
    area = DetailAreaSerializerByEmpresa()
    puesto = DetailPuestoSerializer()
    class Meta:
        model = Touchpoint
        flieds = [
            "nombre",
            "codigo_qr_token",
        ]

#Detail
class DetailTouchpointSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer()
    area = DetailAreaSerializerByEmpresa()
    puesto = DetailPuestoSerializer()
    class Meta:
        model = Touchpoint
        flieds = [
            "nombre",
            "codigo_qr_token",
            "centro_trabajo",
            "area",
            "puesto",
        ]

##UPDATE
class UpdateTouchpointSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer()
    area = DetailAreaSerializerByEmpresa()
    puesto = DetailPuestoSerializer()
    class Meta:
        model = Touchpoint
        flieds = [
            "nombre",
            "codigo_qr_token",
            "centro_trabajo",
            "area",
            "puesto",
        ]

##DELETE
class DeleteTouchpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Touchpoint
        flieds = [
            "nombre",
        ]