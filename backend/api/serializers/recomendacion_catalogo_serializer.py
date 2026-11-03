from rest_framework import serializers
from django.utils import timezone
from api.models.recomendacion_catalogo_model import RecomendacionCatalogo

##CREATE
class CreateRecomendacionCatalogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecomendacionCatalogo
        fields = [
            "dominio",
            "nivel_riesgo",
            "titulo_recomendacion",
            "descripcion_accion",
            "referencia_normativa",   
        ]

##READ

#List
class ListRecomendacionCatalogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecomendacionCatalogo
        fields = [
            "id",
            "dominio",
            "nivel_riesgo",
            "titulo_recomendacion",
            "descripcion_accion",
            "referencia_normativa",
        ]