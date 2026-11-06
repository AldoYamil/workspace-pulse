from rest_framework import serializers
from django.utils import timezone
from api.models.planeacion_model import Planeacion
from api.models.resultado_riesgo_model import ResultadoRiesgo
from api.models.usuario_model import Usuario
from .resultado_riesgo_serializer import DetailResultadoRiesgoSerializer
from .usuario_serializer import DetailUsuarioSerializer


## CREATE
class CreatePlaneacionSerializer(serializers.ModelSerializer):
    titulo = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        error_messages={
            "blank": "El título de la medida de planeación es requerido."
        }
    )
    descripcion_medida = serializers.CharField(
        trim_whitespace=True,
        error_messages={
            "blank": "La descripción detallada de la medida no puede estar vacía."
        }
    )
    fecha_compromiso = serializers.DateField(
        error_messages={
            "invalid": "Ingrese una fecha válida en formato YYYY-MM-DD."
        }
    )
    estado = serializers.CharField(
        max_length=50,
        default="Pendiente",
        trim_whitespace=True
    )
    resultado_riesgo = serializers.PrimaryKeyRelatedField(
        queryset=ResultadoRiesgo.objects.all(),
        error_messages={
            "does_not_exist": "El resultado de riesgo especificado no existe."
        }
    )
    usuario = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Planeacion
        fields = [
            "titulo",
            "descripcion_medida",
            "fecha_compromiso",
            "estado",
            "resultado_riesgo",
            "usuario",
        ]

    def validate_titulo(self, value):
        titulo_limpio = value.strip()
        if len(titulo_limpio) < 5:
            raise serializers.ValidationError(
                "El título debe tener una longitud mínima de 5 caracteres."
            )
        return titulo_limpio

    def validate_descripcion_medida(self, value):
        desc_limpia = value.strip()
        if len(desc_limpia) < 15:
            raise serializers.ValidationError(
                "La descripción de la medida preventiva debe ser detallada (mínimo 15 caracteres)."
            )
        return desc_limpia

    def validate_fecha_compromiso(self, value):
        # La fecha de compromiso debe ser presente o futura
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "La fecha de compromiso no puede ser una fecha pasada."
            )
        return value

    def validate_estado(self, value):
        estados_validos = ["Pendiente", "En Proceso", "Completado", "Cancelado"]
        estado_normalizado = value.strip().title()

        if estado_normalizado not in estados_validos:
            raise serializers.ValidationError(
                f"Estado inválido. Los estados permitidos son: {', '.join(estados_validos)}."
            )
        return estado_normalizado

    def create(self, validated_data):
        # Si no se envía el usuario explícitamente, se intenta tomar del contexto del request
        request = self.context.get('request')
        if 'usuario' not in validated_data and request and hasattr(request.user, 'usuario'):
            validated_data['usuario'] = request.user.usuario
        return super().create(validated_data)


## READ

# List
class ListPlaneacionSerializer(serializers.ModelSerializer):
    resultado_riesgo = DetailResultadoRiesgoSerializer(read_only=True)
    usuario_nombre = serializers.ReadOnlyField(source='usuario.nombre')

    class Meta:
        model = Planeacion
        fields = [
            "id",
            "titulo",
            "descripcion_medida",
            "fecha_compromiso",
            "estado",
            "resultado_riesgo",
            "usuario_nombre",
        ]


# Detail
class DetailPlaneacionSerializer(serializers.ModelSerializer):
    resultado_riesgo = DetailResultadoRiesgoSerializer(read_only=True)
    usuario = DetailUsuarioSerializer(read_only=True)

    class Meta:
        model = Planeacion
        fields = [
            "id",
            "titulo",
            "descripcion_medida",
            "fecha_compromiso",
            "estado",
            "resultado_riesgo",
            "usuario",
        ]


## UPDATE
class UpdatePlaneacionSerializer(serializers.ModelSerializer):
    titulo = serializers.CharField(
        required=False,
        max_length=100,
        trim_whitespace=True
    )
    descripcion_medida = serializers.CharField(
        required=False,
        trim_whitespace=True
    )
    fecha_compromiso = serializers.DateField(required=False)
    estado = serializers.CharField(
        required=False,
        max_length=50,
        trim_whitespace=True
    )
    resultado_riesgo = serializers.PrimaryKeyRelatedField(
        queryset=ResultadoRiesgo.objects.all(),
        required=False
    )
    usuario = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        required=False
    )

    class Meta:
        model = Planeacion
        fields = [
            "titulo",
            "descripcion_medida",
            "fecha_compromiso",
            "estado",
            "resultado_riesgo",
            "usuario",
        ]

    def validate_titulo(self, value):
        if value and len(value.strip()) < 5:
            raise serializers.ValidationError(
                "El título debe tener al menos 5 caracteres."
            )
        return value.strip() if value else value

    def validate_descripcion_medida(self, value):
        if value and len(value.strip()) < 15:
            raise serializers.ValidationError(
                "La descripción de la medida debe tener al menos 15 caracteres."
            )
        return value.strip() if value else value

    def validate_fecha_compromiso(self, value):
        if value and value < timezone.now().date():
            raise serializers.ValidationError(
                "La fecha de compromiso no puede actualizarse a una fecha pasada."
            )
        return value

    def validate_estado(self, value):
        if value:
            estados_validos = ["Pendiente", "En Proceso", "Completado", "Cancelado"]
            estado_normalizado = value.strip().title()
            if estado_normalizado not in estados_validos:
                raise serializers.ValidationError(
                    f"Estado inválido. Opciones: {', '.join(estados_validos)}."
                )
            return estado_normalizado
        return value


## DELETE
class DeletePlaneacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Planeacion
        fields = [
            "id",
            "titulo",
        ]