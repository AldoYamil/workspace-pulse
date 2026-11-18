from rest_framework import serializers
from django.contrib.auth.models import User
from api.models.alerta_clima_model import AlertaClima
from api.models.configuracion_umbral_model import ConfiguracionUmbral


## CREATE
class CreateAlertaClimaSerializer(serializers.ModelSerializer):
    configuracion_umbral = serializers.PrimaryKeyRelatedField(
        queryset=ConfiguracionUmbral.objects.all(),
        source='configuracion_umbral'
    )
    valor_destacado = serializers.FloatField(
        min_value=0.0,
        max_value=100.0,
        error_messages={
            "min_value": "El valor destacado no puede ser negativo.",
            "max_value": "El valor destacado no puede exceder 100.0."
        }
    )
    mensaje = serializers.CharField(
        max_length=500,
        trim_whitespace=True,
        error_messages={
            "blank": "El mensaje de la alerta no puede estar vacío."
        }
    )

    class Meta:
        model = AlertaClima
        fields = [
            "valor_destacado",
            "mensaje",
            "resuelta",
            "configuracion_umbral",
        ]

    def validate_mensaje(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "El mensaje debe ser descriptivo (mínimo 10 caracteres)."
            )
        return value

    def validate(self, attrs):
        if attrs.get('resuelta', False):
            raise serializers.ValidationError(
                {"resuelta": "Una nueva alerta de clima no puede crearse ya resuelta."}
            )
        return attrs


## READ

# List
class ListAlertaClimaSerializer(serializers.ModelSerializer):
    configuracion_umbral_nombre = serializers.ReadOnlyField(
        source='configuracion_umbral.metrica'
    )

    class Meta:
        model = AlertaClima
        fields = [
            "id",
            "valor_destacado",
            "mensaje",
            "fecha_alerta",
            "resuelta",
            "configuracion_umbral_nombre",
        ]


# Detail
class DetailAlertaClimaSerializer(serializers.ModelSerializer):
    configuracion_umbral = serializers.SerializerMethodField()

    class Meta:
        model = AlertaClima
        fields = [
            "id",
            "valor_destacado",
            "mensaje",
            "fecha_alerta",
            "resuelta",
            "configuracion_umbral",
        ]

    def get_configuracion_umbral(self, obj):
        return {
            "id": obj.configuracion_umbral.id,
            "metrica": obj.configuracion_umbral.metrica,
            "valor_minimo_aceptable": obj.configuracion_umbral.valor_minimo_aceptable,
        }


## UPDATE
class UpdateAlertaClimaSerializer(serializers.ModelSerializer):
    valor_destacado = serializers.FloatField(
        required=False,
        min_value=0.0,
        max_value=100.0
    )
    mensaje = serializers.CharField(
        required=False,
        max_length=500,
        trim_whitespace=True
    )
    resuelta = serializers.BooleanField(required=False)

    class Meta:
        model = AlertaClima
        fields = [
            "valor_destacado",
            "mensaje",
            "resuelta",
        ]

    def validate_mensaje(self, value):
        if value and len(value.strip()) < 10:
            raise serializers.ValidationError(
                "El mensaje debe tener al menos 10 caracteres."
            )
        return value