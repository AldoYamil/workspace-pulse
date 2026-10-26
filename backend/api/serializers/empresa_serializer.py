import re
from rest_framework import serializers
from django.contrib.auth.models import User
from api.models.empresa_model import Empresa

RFC_REGEX = r'^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$'


## CRUD EMPRESA

## CREATE
class CreateEmpresaSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )
    rfc = serializers.CharField(
        max_length=13,
        min_length=12,
        style={"input_type": "text"}
    )

    class Meta:
        model = Empresa
        fields = [
            "id",
            "nombre",
            "rfc",
            "fecha_registro",
            "activo"
        ]
        read_only_fields = ("id", "fecha_registro")

    def validate_nombre(self, value):
        if Empresa.objects.filter(nombre__iexact=value.strip()).exists():
            raise serializers.ValidationError("Nombre already exists")
        return value.strip()

    def validate_rfc(self, value):
        rfc_limpio = value.strip().upper()
        if not re.match(RFC_REGEX, rfc_limpio):
            raise serializers.ValidationError("RFC format is invalid")
        if Empresa.objects.filter(rfc__iexact=rfc_limpio).exists():
            raise serializers.ValidationError("RFC already exists")
        return rfc_limpio

    def create(self, validated_data):
        return Empresa.objects.create(**validated_data)


## READ

# List
class ListEmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = [
            "id",
            "nombre",
            "rfc"
        ]


# Detail
class DetailEmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = "__all__"


## UPDATE
class UpdateEmpresaSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        required=False,
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )
    rfc = serializers.CharField(
        required=False,
        max_length=13,
        min_length=12,
        style={"input_type": "text"}
    )
    activo = serializers.BooleanField(required=False)

    class Meta:
        model = Empresa
        fields = [
            "nombre",
            "rfc",
            "activo"
        ]

    def validate_nombre(self, value):
        query = Empresa.objects.filter(nombre__iexact=value.strip())
        if self.instance:
            query = query.exclude(pk=self.instance.pk)
        if query.exists():
            raise serializers.ValidationError("Nombre already exists")
        return value.strip()

    def validate_rfc(self, value):
        rfc_limpio = value.strip().upper()
        if not re.match(RFC_REGEX, rfc_limpio):
            raise serializers.ValidationError("RFC format is invalid")

        query = Empresa.objects.filter(rfc__iexact=rfc_limpio)
        if self.instance:
            query = query.exclude(pk=self.instance.pk)
        if query.exists():
            raise serializers.ValidationError("RFC already exists")
        return rfc_limpio


## DELETE
class DeleteEmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ["id", "nombre"]
        read_only_fields = ("id", "nombre")