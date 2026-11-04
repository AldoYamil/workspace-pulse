from rest_framework import serializers
from django.utils import timezone
from api.models.asistencia_capacitacion_model import AsistenciaCapacitacion
from .capacitacion_serializer import DetailCapacitacionSerializer
from .area_serializer import DetailAreaSerializerByEmpresa

##CREATE
class CreateAsistenciaCapacitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsistenciaCapacitacion
        fields = [
            "total_asistentes",
            "area",
            "capacitacion"
        ]

##READ
#List
class ListAsistenciaCapacitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsistenciaCapacitacion
        fields = [
            "total_asistentes",
            "area",
            "capacitacion"
        ]