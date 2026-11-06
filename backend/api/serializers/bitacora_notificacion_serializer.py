from rest_framework import serializers
from django.utils import timezone
from api.models.bitacora_notificacion_model import Bitacora_notificacion
from api.models.campana_evaluacion_model import Campana_evaluacion
from .campana_evaluacion_serializer import DetailCampanaEvaluacionSerializer

## CREATE / UPDATE
class CreateBitacoraNotificacionSerializer(serializers.ModelSerializer):
    proveedor = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        error_messages={
            "blank": "El nombre del proveedor de notificación no puede estar vacío."
        }
    )
    id_transaccion_externa = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        error_messages={
            "blank": "El ID de transacción externa es requerido para auditoría."
        }
    )
    estado_envio = serializers.CharField(
        max_length=50,
        trim_whitespace=True,
        error_messages={
            "blank": "El estado de envío es requerido."
        }
    )
    campana = serializers.PrimaryKeyRelatedField(
        queryset=Campana_evaluacion.objects.all(),
        error_messages={
            "does_not_exist": "La campaña de evaluación seleccionada no existe."
        }
    )

    class Meta:
        model = Bitacora_notificacion
        fields = [
            "proveedor",
            "id_transaccion_externa",
            "estado_envio",
            "campana",
        ]

    def validate_proveedor(self, value):
        proveedores_permitidos = ["SendGrid", "Twilio", "AWS SES", "Firebase", "WhatsApp API", "SMTP Internal"]
        proveedor_limpio = value.strip()
        
        if len(proveedor_limpio) < 2:
            raise serializers.ValidationError("El nombre del proveedor debe tener al menos 2 caracteres.")
            
        return proveedor_limpio

    def validate_estado_envio(self, value):
        estados_validos = ["Entregado", "Pendiente", "Fallido", "Rebotado", "Enviado"]
        estado_normalizado = value.strip().capitalize()

        if estado_normalizado not in estados_validos:
            raise serializers.ValidationError(
                f"Estado no válido. Los estados permitidos son: {', '.join(estados_validos)}."
            )
        return estado_normalizado

    def validate(self, attrs):
        id_transaccion = attrs.get("id_transaccion_externa")
        proveedor = attrs.get("proveedor")

        if self.instance is None and id_transaccion and proveedor:
            existe = Bitacora_notificacion.objects.filter(
                id_transaccion_externa=id_transaccion,
                proveedor=proveedor
            ).exists()
            if existe:
                raise serializers.ValidationError({
                    "id_transaccion_externa": "Ya existe un registro de notificación con este ID de transacción para el mismo proveedor."
                })

        return attrs

    def create(self, validated_data):
        validated_data['fecha_envio'] = timezone.now()
        return super().create(validated_data)


## READ

# List
class ListBitacoraNotificacionSerializer(serializers.ModelSerializer):
    campana_nombre = serializers.ReadOnlyField(source='campana.nombre')
    fecha_envio = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = Bitacora_notificacion
        fields = [
            "id",
            "proveedor",
            "id_transaccion_externa",
            "estado_envio",
            "fecha_envio",
            "campana",
            "campana_nombre",
        ]

