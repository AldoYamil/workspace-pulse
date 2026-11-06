import uuid
from rest_framework import serializers
from api.models.touchpoint_model import Touchpoint
from api.models.centro_trabajo_model import Centro_trabajo
from api.models.area_model import Area
from api.models.puesto_model import Puesto
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer
from .puesto_serializer import DetailPuestoSerializer
from .area_serializer import DetailAreaSerializerByEmpresa


## CREATE
class CreateTouchpointSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        error_messages={
            "blank": "El nombre o ubicación del punto de acceso (Touchpoint) es requerido."
        }
    )
    codigo_qr_token = serializers.CharField(
        max_length=255,
        required=False,
        trim_whitespace=True
    )
    centro_trabajo = serializers.PrimaryKeyRelatedField(
        queryset=Centro_trabajo.objects.all(),
        error_messages={
            "does_not_exist": "El centro de trabajo especificado no existe."
        }
    )
    area = serializers.PrimaryKeyRelatedField(
        queryset=Area.objects.all(),
        required=False,
        allow_null=True,
        error_messages={
            "does_not_exist": "El área especificada no existe."
        }
    )
    puesto = serializers.PrimaryKeyRelatedField(
        queryset=Puesto.objects.all(),
        required=False,
        allow_null=True,
        error_messages={
            "does_not_exist": "El puesto especificado no existe."
        }
    )

    class Meta:
        model = Touchpoint
        fields = [
            "nombre",
            "codigo_qr_token",
            "centro_trabajo",
            "area",
            "puesto",
        ]

    def validate_nombre(self, value):
        nombre_limpio = value.strip()
        if len(nombre_limpio) < 3:
            raise serializers.ValidationError(
                "El nombre del Touchpoint debe tener al menos 3 caracteres (ej. 'Kiosco Recepción')."
            )
        return nombre_limpio

    def validate_codigo_qr_token(self, value):
        if value:
            token_limpio = value.strip()
            if len(token_limpio) < 8:
                raise serializers.ValidationError(
                    "El token del código QR debe tener una longitud mínima de 8 caracteres."
                )
            if Touchpoint.objects.filter(codigo_qr_token=token_limpio).exists():
                raise serializers.ValidationError(
                    "El token QR especificado ya está registrado en otro Touchpoint."
                )
            return token_limpio
        return value

    def validate(self, attrs):
        centro_trabajo = attrs.get('centro_trabajo')
        area = attrs.get('area')
        puesto = attrs.get('puesto')

        if area and centro_trabajo:
            if area.centro_trabajo_id != centro_trabajo.id:
                raise serializers.ValidationError({
                    "area": "El área seleccionada no pertenece al centro de trabajo especificado."
                })

        if puesto and area:
            if puesto.area_id != area.id:
                raise serializers.ValidationError({
                    "puesto": "El puesto seleccionado no pertenece al área especificada."
                })

        nombre = attrs.get('nombre')
        if self.instance is None and centro_trabajo and nombre:
            existe = Touchpoint.objects.filter(
                centro_trabajo=centro_trabajo,
                nombre__iexact=nombre
            ).exists()
            if existe:
                raise serializers.ValidationError({
                    "nombre": f"Ya existe un Touchpoint registrado con el nombre '{nombre}' en este centro de trabajo."
                })

        return attrs

    def create(self, validated_data):
        if not validated_data.get('codigo_qr_token'):
            validated_data['codigo_qr_token'] = f"TP-{uuid.uuid4().hex[:12].upper()}"
        return super().create(validated_data)


## READ

# List
class ListTouchpointSerializer(serializers.ModelSerializer):
    centro_trabajo_nombre = serializers.ReadOnlyField(source='centro_trabajo.nombre')
    area_nombre = serializers.ReadOnlyField(source='area.nombre')

    class Meta:
        model = Touchpoint
        fields = [
            "id",
            "nombre",
            "codigo_qr_token",
            "centro_trabajo_nombre",
            "area_nombre",
        ]


# Detail
class DetailTouchpointSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)
    puesto = DetailPuestoSerializer(read_only=True)

    class Meta:
        model = Touchpoint
        fields = [
            "id",
            "nombre",
            "codigo_qr_token",
            "centro_trabajo",
            "area",
            "puesto",
        ]


## UPDATE
class UpdateTouchpointSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        required=False,
        max_length=100,
        trim_whitespace=True
    )
    codigo_qr_token = serializers.CharField(
        required=False,
        max_length=255,
        trim_whitespace=True
    )
    centro_trabajo = serializers.PrimaryKeyRelatedField(
        queryset=Centro_trabajo.objects.all(),
        required=False
    )
    area = serializers.PrimaryKeyRelatedField(
        queryset=Area.objects.all(),
        required=False,
        allow_null=True
    )
    puesto = serializers.PrimaryKeyRelatedField(
        queryset=Puesto.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Touchpoint
        fields = [
            "nombre",
            "codigo_qr_token",
            "centro_trabajo",
            "area",
            "puesto",
        ]

    def validate_nombre(self, value):
        if value and len(value.strip()) < 3:
            raise serializers.ValidationError(
                "El nombre del Touchpoint debe tener al menos 3 caracteres."
            )
        return value.strip() if value else value

    def validate_codigo_qr_token(self, value):
        if value:
            token_limpio = value.strip()
            existe = Touchpoint.objects.filter(
                codigo_qr_token=token_limpio
            ).exclude(pk=self.instance.pk).exists()
            if existe:
                raise serializers.ValidationError(
                    "El token QR especificado ya está asignado a otro Touchpoint."
                )
            return token_limpio
        return value


## DELETE
class DeleteTouchpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Touchpoint
        fields = [
            "id",
            "nombre",
        ]