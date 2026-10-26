from rest_framework import serializers
from api.models.puesto_model import Puesto
from .area_serializer import DetailAreaSerializerByEmpresa


## CRUD PUESTO

## CREATE
class CreatePuestoSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )

    class Meta:
        model = Puesto
        fields = [
            "id",
            "nombre",
            "area",
        ]
        read_only_fields = ("id",)

    def validate_nombre(self, value):
        nombre_limpio = value.strip()
        if not nombre_limpio:
            raise serializers.ValidationError("El nombre del puesto no puede estar vacío.")
        return nombre_limpio

    def validate(self, attrs):
        nombre = attrs.get("nombre")
        area = attrs.get("area")

        if nombre and area:
            if Puesto.objects.filter(nombre__iexact=nombre, area=area).exists():
                raise serializers.ValidationError({
                    "nombre": "Nombre already exists in this area"
                })

        return attrs

    def create(self, validated_data):
        return Puesto.objects.create(**validated_data)


## READ

## List
class ListPuestoSerializer(serializers.ModelSerializer):
    area = DetailAreaSerializerByEmpresa(read_only=True)

    class Meta:
        model = Puesto
        fields = [
            "id",
            "nombre",
            "area",
        ]


## Detail
class DetailPuestoSerializer(serializers.ModelSerializer):
    area = DetailAreaSerializerByEmpresa(read_only=True)

    class Meta:
        model = Puesto
        fields = [
            "id",
            "nombre",
            "area",
        ]


## UPDATE
class UpdatePuestoSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        required=False,
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )

    class Meta:
        model = Puesto
        fields = [
            "id",
            "nombre",
            "area",
        ]
        read_only_fields = ("id",)

    def validate_nombre(self, value):
        nombre_limpio = value.strip()
        if not nombre_limpio:
            raise serializers.ValidationError("El nombre del puesto no puede estar vacío.")
        return nombre_limpio

    def validate(self, attrs):
        nombre = attrs.get("nombre", self.instance.nombre if self.instance else None)
        area = attrs.get("area", self.instance.area if self.instance else None)

        if nombre and area:
            query = Puesto.objects.filter(nombre__iexact=nombre, area=area)
            if self.instance:
                query = query.exclude(pk=self.instance.pk)

            if query.exists():
                raise serializers.ValidationError({
                    "nombre": "Nombre already exists in this area"
                })

        return attrs


## DELETE
class DeletePuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puesto
        fields = ["id", "nombre"]
        read_only_fields = ("id", "nombre")