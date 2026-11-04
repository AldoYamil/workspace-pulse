from rest_framework import serializers
from django.utils import timezone
from api.models.bitacora_notificacion_model import Bitacora_notificacion
from .campana_evaluacion_serializer import DetailCampanaEvaluacionSerializer

##CREATE
class CreateBitacoraNotificacionSerializer(serializers.ModelSerializer):
    campana = DetailCampanaEvaluacionSerializer()
    class Meta:
        model = Bitacora_notificacion
        fields = [
            "proveedor",
            "id_transaccion_externa",
            "estado_envio",
            "fecha_envio",
            "campana",
        ]

##READ
#List
class ListBitacoraNotificacionSerializer(serializers.ModelSerializer):
    campana = DetailCampanaEvaluacionSerializer(read_only=True)
    class Meta:
        model = Bitacora_notificacion
        fields = [
            "proveedor",
            "id_transaccion_externa",
            "estado_envio",
            "fecha_envio",
            "campana",
        ]