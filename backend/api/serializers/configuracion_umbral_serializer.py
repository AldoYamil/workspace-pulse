from rest_framework import serializers
from django.utils import timezone
from api.models.configuracion_umbral_model import ConfiguracionUmbral
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer
from .area_serializer import DetailAreaSerializerByEmpresa

##CRUD CONFIGURACION UMBRAL

##CREATE
class CreateConfiguracionUmbralSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)
    class Meta:
        model = ConfiguracionUmbral
        fields = [
            "metrica",
            "valor_minimo_aceptable",
            "centro_trabajo",
            "area",
        ]

##READ

##List
class ListConfiguracionUmbralSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)
    class Meta:
        model = ConfiguracionUmbral
        fields = [
            "metrica",
            "valor_minimo_aceptable",
            "centro_trabajo",
            "area",
        ]

##Detail
class DetailConfiguracionUmbralSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)
    class Meta:
        model = ConfiguracionUmbral
        fields = [
            "metrica",
            "valor_minimo_aceptable",
            "centro_trabajo",
            "area",
        ]

##UPDATE
class UpdateConfiguracionUmbralSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)
    class Meta:
        model = ConfiguracionUmbral
        fields = [
            "metrica",
            "valor_minimo_aceptable",
        ]

##DELETE
class DeleteConfiguracionUmbralSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)
    class Meta:
        model = ConfiguracionUmbral
        fields = [
            "metrica",
        ]