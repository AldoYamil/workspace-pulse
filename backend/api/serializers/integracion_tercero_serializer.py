from rest_framework import serializers
from api.models.integracion_tercero_model import IntergracionTercero


## CREATE
class CreateIntegracionTerceroSerializer(serializers.ModelSerializer):
    proveedor = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        error_messages={
            "blank": "El nombre del proveedor no puede estar vacío."
        }
    )
    clave_api = serializers.CharField(
        max_length=200,
        trim_whitespace=True,
        write_only=True,
        error_messages={
            "blank": "La clave API es requerida para registrar la integración."
        }
    )
    activo = serializers.BooleanField(default=True)

    class Meta:
        model = IntergracionTercero
        fields = [
            "proveedor",
            "clave_api",
            "activo"
        ]

    def validate_proveedor(self, value):
        proveedor_limpio = value.strip()
        if len(proveedor_limpio) < 2:
            raise serializers.ValidationError(
                "El nombre del proveedor debe tener al menos 2 caracteres."
            )
        return proveedor_limpio

    def validate_clave_api(self, value):
        clave_limpia = value.strip()
        if len(clave_limpia) < 8:
            raise serializers.ValidationError(
                "La clave API debe tener una longitud mínima de 8 caracteres por seguridad."
            )
        return clave_limpia

    def validate(self, attrs):
        proveedor = attrs.get('proveedor')

        if self.instance is None and proveedor:
            existe = IntergracionTercero.objects.filter(
                proveedor__iexact=proveedor
            ).exists()
            if existe:
                raise serializers.ValidationError({
                    "proveedor": f"Ya existe una integración registrada para el proveedor '{proveedor}'."
                })

        return attrs


## READ

# List
class ListIntegracionTerceroSerializer(serializers.ModelSerializer):
    clave_api_enmascarada = serializers.SerializerMethodField()

    class Meta:
        model = IntergracionTercero
        fields = [
            "id",
            "proveedor",
            "clave_api_enmascarada",
            "activo"
        ]

    def get_clave_api_enmascarada(self, obj):
        if obj.clave_api and len(obj.clave_api) > 4:
            return "*" * (len(obj.clave_api) - 4) + obj.clave_api[-4:]
        return "********"


# Detail
class DetailIntegracionTerceroSerializer(serializers.ModelSerializer):
    clave_api_enmascarada = serializers.SerializerMethodField()

    class Meta:
        model = IntergracionTercero
        fields = [
            "id",
            "proveedor",
            "clave_api_enmascarada",
            "activo"
        ]

    def get_clave_api_enmascarada(self, obj):
        if obj.clave_api and len(obj.clave_api) > 4:
            return "*" * (len(obj.clave_api) - 4) + obj.clave_api[-4:]
        return "********"


## UPDATE
class UpdateIntegracionTerceroSerializer(serializers.ModelSerializer):
    proveedor = serializers.CharField(
        required=False,
        max_length=100,
        trim_whitespace=True
    )
    clave_api = serializers.CharField(
        required=False,
        max_length=200,
        trim_whitespace=True,
        write_only=True
    )
    activo = serializers.BooleanField(required=False)

    class Meta:
        model = IntergracionTercero
        fields = [
            "proveedor",
            "clave_api",
            "activo"
        ]

    def validate_proveedor(self, value):
        if value and len(value.strip()) < 2:
            raise serializers.ValidationError(
                "El nombre del proveedor debe tener al menos 2 caracteres."
            )
        return value.strip() if value else value

    def validate_clave_api(self, value):
        if value and len(value.strip()) < 8:
            raise serializers.ValidationError(
                "La clave API debe tener al menos 8 caracteres."
            )
        return value.strip() if value else value


## DELETE
class DeleteIntegracionTerceroSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntergracionTercero
        fields = [
            "id",
            "proveedor",
        ]