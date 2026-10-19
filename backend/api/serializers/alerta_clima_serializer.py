from rest_framework import serializers
from django.contrib.auth.models import User
from api.models.alerta_clima_model import AlertaClima

##CREATE 
class CreateAlertaClimaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertaClima
        fields = [
            "id",
            "valor_destacado",
            "mensaje",
            "fecha_alerta",
            "resuelta",
            "configuracion_umbral_id",
        ]

##READ

#List
class ListAlertaClimaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertaClima
        fields = [
            "valor_destacado",
            "mensaje",
            "fecha_alerta",
            "resuelta",
        ]

#Detail
class DetailAlertaClimaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertaClima
        fields = [
            "id",
            "valor_destacado",
            "mensaje",
            "fecha_alerta",
            "resuelta",
            "configuracion_umbral_id",
        ]

##UPDATE
class UpdateAlertaClimaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertaClima
        fields = [
            "valor_destacado",
            "mensaje",
            "resuelta",
        ]

##DELETE
class DeleteAlertaClimaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertaClima
        fields = [
            "valor_destacado",
        ]