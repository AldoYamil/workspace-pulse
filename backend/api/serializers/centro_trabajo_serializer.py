import re
from rest_framework import serializers
from api.models.centro_trabajo_model import Centro_trabajo
from .empresa_serializer import DetailEmpresaSerializer

CP_REGEX = r'^\d{5}$'

## CRUD CENTRO TRABAJO

## CREATE
class CreateCentroTrabajoSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )
    direccion = serializers.CharField(
        max_length=255,
        style={"input_type": "text"}
    )
    num_empleados = serializers.IntegerField(
        min_value=0,
        style={"input_type": "number"}
    )
    codigo_postal = serializers.CharField(
        max_length=5,
        min_length=5,
        style={"input_type": "text"}
    )

    class Meta:
        model = Centro_trabajo
        fields = [
            "id",
            "nombre",
            "direccion",
            "num_empleados",
            "codigo_postal",
            "empresa",
        ]
        read_only_fields = ("id",)

    def validate_nombre(self, value):
        nombre_limpio = value.strip()
        if not nombre_limpio:
            raise serializers.ValidationError("El nombre no puede estar vacío.")
        return nombre_limpio

    def validate_codigo_postal(self, value):
        cp_limpio = value.strip()
        if not re.match(CP_REGEX, cp_limpio):
            raise serializers.ValidationError("El código postal debe tener exactamente 5 dígitos numéricos.")
        return cp_limpio

    def validate(self, attrs):
        nombre = attrs.get("nombre")
        empresa = attrs.get("empresa")

        if nombre and empresa:
            if Centro_trabajo.objects.filter(nombre__iexact=nombre, empresa=empresa).exists():
                raise serializers.ValidationError({
                    "nombre": "Nombre already exists in this empresa"
                })

        return attrs

    def create(self, validated_data):
        return Centro_trabajo.objects.create(**validated_data)


## READ

## List
class ListCentroTrabajoSerializer(serializers.ModelSerializer):
    empresa = DetailEmpresaSerializer(read_only=True)

    class Meta:
        model = Centro_trabajo
        fields = [
            "id",
            "nombre",
            "direccion",
            "empresa",
        ]


## Detail
class DetailCentroTrabajoSerializer(serializers.ModelSerializer):
    empresa = DetailEmpresaSerializer(read_only=True)

    class Meta:
        model = Centro_trabajo
        fields = [
            "id",
            "nombre",
            "direccion",
            "num_empleados",
            "codigo_postal",
            "empresa",
        ]


## UPDATE
class UpdateCentroTrabajoSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        required=False,
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )
    direccion = serializers.CharField(
        required=False,
        max_length=255,
        style={"input_type": "text"}
    )
    num_empleados = serializers.IntegerField(
        required=False,
        min_value=0,
        style={"input_type": "number"}
    )
    codigo_postal = serializers.CharField(
        required=False,
        max_length=5,
        min_length=5,
        style={"input_type": "text"}
    )

    class Meta:
        model = Centro_trabajo
        fields = [
            "nombre",
            "direccion",
            "num_empleados",
            "codigo_postal",
            "empresa",
        ]

    def validate_nombre(self, value):
        nombre_limpio = value.strip()
        if not nombre_limpio:
            raise serializers.ValidationError("El nombre no puede estar vacío.")
        return nombre_limpio

    def validate_codigo_postal(self, value):
        cp_limpio = value.strip()
        if not re.match(CP_REGEX, cp_limpio):
            raise serializers.ValidationError("El código postal debe tener exactamente 5 dígitos numéricos.")
        return cp_limpio

    def validate(self, attrs):
        nombre = attrs.get("nombre", self.instance.nombre if self.instance else None)
        empresa = attrs.get("empresa", self.instance.empresa if self.instance else None)

        if nombre and empresa:
            query = Centro_trabajo.objects.filter(nombre__iexact=nombre, empresa=empresa)
            if self.instance:
                query = query.exclude(pk=self.instance.pk)

            if query.exists():
                raise serializers.ValidationError({
                    "nombre": "Nombre already exists in this empresa"
                })

        return attrs


## DELETE
class DeleteCentroTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centro_trabajo
        fields = ["id", "nombre"]
        read_only_fields = ("id", "nombre")