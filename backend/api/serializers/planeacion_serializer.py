from rest_framework import serializers
from django.utils import timezone
from api.models.planeacion_model import Planeacion
from .resultado_riesgo_serializer import DetailResultadoRiesgoSerializer
from .usuario_serializer import DetailUsuarioSerializer

##CREATE
class CreatePlaneacionSerializer(serializers.ModelSerializer):
    resultado_riesgo = DetailResultadoRiesgoSerializer(read_only=True)
    usuario = DetailUsuarioSerializer(read_only=True)
    class Meta:
        model = Planeacion
        fields = [
            "titulo",
            "descripcion_medida",
            "fecha_compromiso",
            "estado",
            "resultado_riesgo",
            "usuario",
        ]

##REAS

#List
class ListPlaneacionSerializer(serializers.ModelSerializer):
    resultado_riesgo = DetailResultadoRiesgoSerializer(read_only=True)
    usuario = DetailUsuarioSerializer(read_only=True)
    class Meta:
        model = Planeacion
        fields = [
            "titulo",
            "descripcion_medida",
            "fecha_compromiso",
            "estado",
            "resultado_riesgo",
        ]

#Detail
class DetailPlaneacionSerializer(serializers.ModelSerializer):
    resultado_riesgo = DetailResultadoRiesgoSerializer(read_only=True)
    usuario = DetailUsuarioSerializer(read_only=True)
    class Meta:
        model = Planeacion
        fields = [
            "id",
            "titulo",
            "descripcion_medida",
            "fecha_compromiso",
            "estado",
            "resultado_riesgo",
            "usuario",
        ]

##UPDATE
class UpdatePlaneacionSerializer(serializers.ModelSerializer):
    resultado_riesgo = DetailResultadoRiesgoSerializer(read_only=True)
    usuario = DetailUsuarioSerializer(read_only=True)
    class Meta:
        model = Planeacion
        fields = [
            "titulo",
            "descripcion_medida",
            "fecha_compromiso",
            "estado",
            "resultado_riesgo",
            "usuario",
        ]

##DELETE
class DeletePlaneacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Planeacion
        fields = [
            "titulo",
        ]