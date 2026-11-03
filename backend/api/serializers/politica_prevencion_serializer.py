from rest_framework import serializers
from django.utils import timezone
from api.models.politica_prevencion_model import Politica_prevencion
from .empresa_serializer import DetailEmpresaSerializer
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer

##CREATE
class CreatePoliticaPrevencionSerializer(serializers.ModelSerializer):
    empresa = DetailEmpresaSerializer()
    centro_trabajo = DetailCentroTrabajoSerializer()
    class Meta:
        model = Politica_prevencion
        fields = [
            "titulo",
            "contenido_texto",
            "fecha_publicacion",
            "version",
            "estado",
            "empresa",
            "centro_trabajo"
        ]

##READ

#List
class ListPoliticaPrevencionSerializer(serializers.ModelSerializer):
    empresa = DetailEmpresaSerializer()
    centro_trabajo = DetailCentroTrabajoSerializer()
    class Meta:
        model = Politica_prevencion
        fields = [
            "titulo",
            "contenido_texto",
            "fecha_publicacion",
        ]

#Detail
class DetailPoliticaPrevencionSerializer(serializers.ModelSerializer):
    empresa = DetailEmpresaSerializer()
    centro_trabajo = DetailCentroTrabajoSerializer()
    class Meta:
        model = Politica_prevencion
        fields = [
            "titulo",
            "contenido_texto",
            "fecha_publicacion",
            "version",
            "estado",
            "empresa",
            "centro_trabajo"
        ]

##UPDATE
class UpdatePoliticaPrevencionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Politica_prevencion
        fields = [
            "titulo",
            "contenido_texto",
            "fecha_publicacion",
            "version",
            "estado",
        ]

##DELETE
class DeletePoliticaPrevencionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Politica_prevencion
        fields = [
            "titulo",
        ]