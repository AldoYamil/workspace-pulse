from rest_framework import serializers
from django.utils import timezone
from api.models.resultado_riesgo_model import ResultadoRiesgo
from .campana_evaluacion_serializer import DetailCampanaEvaluacionSerializer
from .puesto_serializer import DetailPuestoSerializer
from .area_serializer import DetailAreaSerializerByEmpresa

##CRUD RESULTADO RIESGO

##CREATE
class CreateResultadoRiesgoSerializer(serializers.ModelSerializer):
    campaña_evaluacion = DetailCampanaEvaluacionSerializer()
    area = DetailAreaSerializerByEmpresa()
    puesto = DetailPuestoSerializer()
    class Meta:
        model = ResultadoRiesgo
        fields = [
            "puntuacion_riesgo",
            "nivel_riesgo",
            "fecha_calculo",
            "campaña_evaluacion",
            "area",
            "puesto"
        ]

##READ

##By Campaña
class ListResultadoRiesgoByCampanaSerializer(serializers.ModelSerializer):
    campaña_evaluacion = DetailCampanaEvaluacionSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)
    puesto = DetailPuestoSerializer(read_only=True)
    class Meta:
        model = ResultadoRiesgo
        fields = [
            "puntuacion_riesgo",
            "nivel_riesgo",
            "fecha_calculo",
        ]


##By Area en Campaña
class ListResultadoRiesgoByAreaCampanaSerializer(serializers.ModelSerializer):
    campaña_evaluacion = DetailCampanaEvaluacionSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)
    puesto = DetailPuestoSerializer(read_only=True)
    class Meta:
        model = ResultadoRiesgo
        fields = [
            "puntuacion_riesgo",
            "nivel_riesgo",
            "fecha_calculo",
            "campaña_evaluacion",
            "area",
            "puesto"
        ]