from rest_framework import serializers
from django.utils import timezone
from api.models.capacitacion_model import Capacitacion
from api.models.planeacion_model import Planeacion
from api.models.centro_trabajo_model import Centro_trabajo
from .planeacion_serializer import DetailPlaneacionSerializer
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer


## CREATE
class CreateCapacitacionSerializer(serializers.ModelSerializer):
    nombre_taller = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        error_messages={
            "blank": "El nombre del taller o capacitación no puede estar vacío."
        }
    )
    instructor = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        error_messages={
            "blank": "Debe especificar el nombre del instructor o facilitador."
        }
    )
    fecha_taller = serializers.DateField(
        error_messages={
            "invalid": "La fecha del taller debe tener un formato válido (YYYY-MM-DD)."
        }
    )
    horas_duracion = serializers.IntegerField(
        min_value=1,
        max_value=120,
        error_messages={
            "min_value": "La duración del taller debe ser de al menos 1 hora.",
            "max_value": "La duración del taller no puede exceder las 120 horas."
        }
    )
    planeacion = serializers.PrimaryKeyRelatedField(
        queryset=Planeacion.objects.all(),
        error_messages={
            "does_not_exist": "La planeación especificada no existe."
        }
    )
    centro_trabajo = serializers.PrimaryKeyRelatedField(
        queryset=Centro_trabajo.objects.all(),
        error_messages={
            "does_not_exist": "El centro de trabajo especificado no existe."
        }
    )

    class Meta:
        model = Capacitacion
        fields = [
            "nombre_taller",
            "instructor",
            "fecha_taller",
            "horas_duracion",
            "planeacion",
            "centro_trabajo",
        ]

    def validate_nombre_taller(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError(
                "El nombre del taller debe tener al menos 5 caracteres."
            )
        return value.strip()

    def validate_instructor(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "El nombre del instructor debe tener al menos 3 caracteres."
            )
        return value.strip()

    def validate(self, attrs):
        centro_trabajo = attrs.get("centro_trabajo")
        planeacion = attrs.get("planeacion")

        if centro_trabajo and planeacion and getattr(planeacion, "usuario", None):
            centro_origen = getattr(planeacion.usuario, "centro_trabajo", None)
            if centro_origen and centro_trabajo.empresa_id != centro_origen.empresa_id:
                raise serializers.ValidationError({
                    "centro_trabajo": "El centro de trabajo no pertenece a la misma empresa que la planeación de origen."
                })

        return attrs


## READ

# List
class ListCapacitacionSerializer(serializers.ModelSerializer):
    planeacion = DetailPlaneacionSerializer(read_only=True)
    centro_trabajo_nombre = serializers.ReadOnlyField(source='centro_trabajo.nombre')

    class Meta:
        model = Capacitacion
        fields = [
            "id",
            "nombre_taller",
            "instructor",
            "fecha_taller",
            "horas_duracion",
            "planeacion",
            "centro_trabajo_nombre",
        ]


# Detail
class DetailCapacitacionSerializer(serializers.ModelSerializer):
    planeacion = DetailPlaneacionSerializer(read_only=True)
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)

    class Meta:
        model = Capacitacion
        fields = [
            "id",
            "nombre_taller",
            "instructor",
            "fecha_taller",
            "horas_duracion",
            "planeacion",
            "centro_trabajo",
        ]


## UPDATE
class UpdateCapacitacionSerializer(serializers.ModelSerializer):
    nombre_taller = serializers.CharField(
        required=False,
        max_length=100,
        trim_whitespace=True
    )
    instructor = serializers.CharField(
        required=False,
        max_length=100,
        trim_whitespace=True
    )
    fecha_taller = serializers.DateField(required=False)
    horas_duracion = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=120
    )
    planeacion = serializers.PrimaryKeyRelatedField(
        queryset=Planeacion.objects.all(),
        required=False
    )

    class Meta:
        model = Capacitacion
        fields = [
            "nombre_taller",
            "instructor",
            "fecha_taller",
            "horas_duracion",
            "planeacion",
        ]

    def validate_nombre_taller(self, value):
        if value and len(value.strip()) < 5:
            raise serializers.ValidationError(
                "El nombre del taller debe tener al menos 5 caracteres."
            )
        return value.strip() if value else value
    
    def validate(self, attrs):
        centro_trabajo = attrs.get("centro_trabajo")
        planeacion = attrs.get("planeacion")

        if centro_trabajo and planeacion and getattr(planeacion, "usuario", None):
            centro_origen = getattr(planeacion.usuario, "centro_trabajo", None)
            if centro_origen and centro_trabajo.empresa_id != centro_origen.empresa_id:
                raise serializers.ValidationError({
                    "centro_trabajo": "El centro de trabajo no pertenece a la misma empresa que la planeación de origen."
                })

        return attrs


## DELETE
class DeleteCapacitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Capacitacion
        fields = [
            "id",
            "nombre_taller",
        ]