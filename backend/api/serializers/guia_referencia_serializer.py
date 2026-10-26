from rest_framework import serializers
from api.models.giua_referencia_model import Guia_referencia


## CRUD GUÍA REFERENCIA

## CREATE
class CreateGuiaReferenciaSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(
        max_length=50,
        min_length=2,
        style={"input_type": "text"}
    )
    nombre = serializers.CharField(
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )
    tipo = serializers.CharField(
        max_length=50,
        style={"input_type": "text"}
    )
    descripcion = serializers.CharField(
        required=False,
        allow_blank=True,
        style={"input_type": "text"}
    )

    class Meta:
        model = Guia_referencia
        fields = [
            "id",
            "codigo",
            "nombre",
            "tipo",
            "descripcion",
        ]
        read_only_fields = ("id",)

    def validate_codigo(self, value):
        codigo_limpio = value.strip().upper()
        if not codigo_limpio:
            raise serializers.ValidationError("El código no puede estar vacío.")
        
        if Guia_referencia.objects.filter(codigo__iexact=codigo_limpio).exists():
            raise serializers.ValidationError("Codigo already exists")
            
        return codigo_limpio

    def validate_nombre(self, value):
        nombre_limpio = value.strip()
        if not nombre_limpio:
            raise serializers.ValidationError("El nombre no puede estar vacío.")
        return nombre_limpio

    def create(self, validated_data):
        return Guia_referencia.objects.create(**validated_data)


## READ

## List
class ListGuiaReferenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guia_referencia
        fields = [
            "id",
            "codigo",
            "nombre",
            "tipo",
            "descripcion",
        ]


## Detail
class DetailGuiaReferenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guia_referencia
        fields = [
            "id",
            "codigo",
            "nombre",
            "tipo",
            "descripcion",
        ]


## UPDATE
class UpdateGuiaReferenciaSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(
        required=False,
        max_length=50,
        min_length=2,
        style={"input_type": "text"}
    )
    nombre = serializers.CharField(
        required=False,
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )
    tipo = serializers.CharField(
        required=False,
        max_length=50,
        style={"input_type": "text"}
    )
    descripcion = serializers.CharField(
        required=False,
        allow_blank=True,
        style={"input_type": "text"}
    )

    class Meta:
        model = Guia_referencia
        fields = [
            "codigo",
            "nombre",
            "tipo",
            "descripcion",
        ]

    def validate_codigo(self, value):
        codigo_limpio = value.strip().upper()
        if not codigo_limpio:
            raise serializers.ValidationError("El código no puede estar vacío.")

        query = Guia_referencia.objects.filter(codigo__iexact=codigo_limpio)
        if self.instance:
            query = query.exclude(pk=self.instance.pk)

        if query.exists():
            raise serializers.ValidationError("Codigo already exists")

        return codigo_limpio

    def validate_nombre(self, value):
        nombre_limpio = value.strip()
        if not nombre_limpio:
            raise serializers.ValidationError("El nombre no puede estar vacío.")
        return nombre_limpio


## DELETE
class DeleteGuiaReferenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guia_referencia
        fields = ["id", "codigo", "nombre"]
        read_only_fields = ("id", "codigo", "nombre")