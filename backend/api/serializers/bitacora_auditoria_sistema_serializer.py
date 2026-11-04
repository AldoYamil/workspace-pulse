from rest_framework import serializers
from django.utils import timezone
from api.models.bitacora_auditoria_sistema_model import BitacoraAuditoriaSistema
from .usuario_serializer import DetailUsuarioSerializer

##CREATE
class CreateBitacoraAuditoriaSistemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BitacoraAuditoriaSistema
        fields = [
            'accion', 
            'tabla_afectada', 
            'detalles_json', 
            'usuario'
            ]

    def create(self, validated_data):
        validated_data['fecha_evento'] = timezone.now()
        return super().create(validated_data)

##READ

#List
class ListBitacoraAuditoriaSistemaSerializer(serializers.ModelSerializer):
    usuario = DetailUsuarioSerializer(read_only=True)
    class Meta:
        model = BitacoraAuditoriaSistema
        fields = [
            'accion', 
            'tabla_afectada', 
            'detalles_json', 
            'usuario'
            ]

#Detail
class DetailBitacoraAuditoriaSistemaSerializer(serializers.ModelSerializer):
    usuario = DetailUsuarioSerializer(read_only=True)
    class Meta:
        model = BitacoraAuditoriaSistema
        fields = [
            'accion', 
            'tabla_afectada', 
            'detalles_json', 
            'usuario'
            ]