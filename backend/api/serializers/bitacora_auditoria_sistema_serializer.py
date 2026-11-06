import json
from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth.models import User
from api.models.bitacora_auditoria_sistema_model import BitacoraAuditoriaSistema


## CREATE
class CreateBitacoraAuditoriaSistemaSerializer(serializers.ModelSerializer):
    accion = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        error_messages={
            "blank": "La acción registrada en la bitácora no puede estar vacía."
        }
    )
    tabla_afectada = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        error_messages={
            "blank": "Debe especificar la tabla afectada por el evento."
        }
    )
    detalles_json = serializers.JSONField(
        error_messages={
            "invalid": "El formato de los detalles debe ser un objeto JSON válido."
        }
    )
    usuario = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False, 
        allow_null=True
    )

    class Meta:
        model = BitacoraAuditoriaSistema
        fields = [
            'accion', 
            'tabla_afectada', 
            'detalles_json', 
            'usuario'
        ]

    def validate_accion(self, value):
        accion_limpia = value.strip().upper()
        if len(accion_limpia) < 3:
            raise serializers.ValidationError(
                "La acción debe tener una longitud mínima de 3 caracteres."
            )
        return accion_limpia

    def validate_detalles_json(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Los detalles de auditoría deben ser una estructura de diccionario (JSON object)."
            )
        return value

    def create(self, validated_data):
        validated_data['fecha_evento'] = timezone.now()
        
        request = self.context.get('request')
        if 'usuario' not in validated_data and request and request.user.is_authenticated:
            validated_data['usuario'] = request.user
            
        return super().create(validated_data)


## READ
class UserAuditoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


# List
class ListBitacoraAuditoriaSistemaSerializer(serializers.ModelSerializer):
    usuario = UserAuditoriaSerializer(read_only=True)
    fecha_evento = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = BitacoraAuditoriaSistema
        fields = [
            'id',
            'accion', 
            'tabla_afectada', 
            'detalles_json', 
            'fecha_evento',
            'usuario'
        ]


# Detail
class DetailBitacoraAuditoriaSistemaSerializer(serializers.ModelSerializer):
    usuario = UserAuditoriaSerializer(read_only=True)
    fecha_evento = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = BitacoraAuditoriaSistema
        fields = [
            'id',
            'accion', 
            'tabla_afectada', 
            'detalles_json', 
            'fecha_evento',
            'usuario'
        ]