from rest_framework import serializers
from django.utils import timezone
from api.models.capacitacion_model import Capacitacion
from .planeacion_serializer import DetailPlaneacionSerializer
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer

##CREATE
class CreateCapacitacionSerializer(serializers.ModelSerializer):
    planeacion = DetailPlaneacionSerializer(read_only=True)
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    class Meta:
        model = Capacitacion
        fields = [
            "nombre_taller",
            "instructor",
            "fecha_taller",
            "horas_duracion",
            "planeacion",
            "centro_trabajo",
        ]

##READ
#List
class ListCapacitacionSerializer(serializers.ModelSerializer):
    planeacion = DetailPlaneacionSerializer(read_only=True)
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    class Meta:
        model = Capacitacion
        fields = [
            "nombre_taller",
            "instructor",
            "fecha_taller",
            "horas_duracion",
            "planeacion",
        ]

#Detail
class DetailCapacitacionSerializer(serializers.ModelSerializer):
    planeacion = DetailPlaneacionSerializer(read_only=True)
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    class Meta:
        model = Capacitacion
        fields = [
            "id",
            "nombre_taller",
            "instructor",
            "fecha_taller",
            "horas_duracion",
            "planeacion",
            "centro_trabajo",
        ]

##UPDATE
class UpdateCapacitacionSerializer(serializers.ModelSerializer):
    planeacion = DetailPlaneacionSerializer(read_only=True)
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    class Meta:
        model = Capacitacion
        fields = [
            "nombre_taller",
            "instructor",
            "fecha_taller",
            "horas_duracion",
            "planeacion",
        ]

##DELETE
class DeleteCapacitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Capacitacion
        fields = [
            "nombre_taller",
        ]