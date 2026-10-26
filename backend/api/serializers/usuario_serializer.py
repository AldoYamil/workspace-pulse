import re
from rest_framework import serializers
from api.models.usuario_model import Usuario
from .empresa_serializer import DetailEmpresaSerializer
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

ROLES_PERMITIDOS = ["admin", "evaluador"]


## CRUD USUARIO

## CREATE
class CreateUsuarioSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )
    email = serializers.EmailField(
        style={"input_type": "email"}
    )
    password_hash = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"}
    )
    rol = serializers.CharField(
        max_length=50,
        style={"input_type": "text"}
    )
    activo = serializers.BooleanField(default=True, required=False)

    class Meta:
        model = Usuario
        fields = [
            "id",
            "nombre",
            "email",
            "password_hash",
            "rol",
            "activo",
            "empresa",
            "centro_trabajo",
        ]
        read_only_fields = ("id",)

    def validate_nombre(self, value):
        nombre_limpio = value.strip()
        if not nombre_limpio:
            raise serializers.ValidationError("El nombre del usuario no puede estar vacío.")
        return nombre_limpio

    def validate_email(self, value):
        email_limpio = value.strip().lower()
        if not re.match(EMAIL_REGEX, email_limpio):
            raise serializers.ValidationError("El correo electrónico no tiene un formato válido.")

        if Usuario.objects.filter(email__iexact=email_limpio).exists():
            raise serializers.ValidationError("Email already exists")

        return email_limpio

    def validate_rol(self, value):
        rol_limpio = value.strip().lower()
        if rol_limpio not in ROLES_PERMITIDOS:
            raise serializers.ValidationError(
                f"Rol no válido. Los roles permitidos son: {', '.join(ROLES_PERMITIDOS)}"
            )
        return rol_limpio

    def validate(self, attrs):
        empresa = attrs.get("empresa")
        centro_trabajo = attrs.get("centro_trabajo")

        if centro_trabajo and empresa and centro_trabajo.empresa != empresa:
            raise serializers.ValidationError({
                "centro_trabajo": "El centro de trabajo seleccionado no pertenece a la empresa especificada."
            })

        return attrs

    def create(self, validated_data):
        return Usuario.objects.create(**validated_data)


## READ

## List
class ListUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "id",
            "nombre",
            "email",
            "rol",
            "activo",
        ]


## Detail
class DetailUsuarioSerializer(serializers.ModelSerializer):
    empresa = DetailEmpresaSerializer(read_only=True)
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)

    class Meta:
        model = Usuario
        fields = [
            "id",
            "nombre",
            "email",
            "rol",
            "activo",
            "empresa",
            "centro_trabajo",
        ]


## UPDATE
class UpdateUsuarioSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        required=False,
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )
    email = serializers.EmailField(
        required=False,
        style={"input_type": "email"}
    )
    password_hash = serializers.CharField(
        required=False,
        write_only=True,
        min_length=8,
        style={"input_type": "password"}
    )
    rol = serializers.CharField(
        required=False,
        max_length=50,
        style={"input_type": "text"}
    )
    activo = serializers.BooleanField(required=False)

    class Meta:
        model = Usuario
        fields = [
            "nombre",
            "email",
            "password_hash",
            "rol",
            "activo",
            "empresa",
            "centro_trabajo",
        ]

    def validate_nombre(self, value):
        nombre_limpio = value.strip()
        if not nombre_limpio:
            raise serializers.ValidationError("El nombre del usuario no puede estar vacío.")
        return nombre_limpio

    def validate_email(self, value):
        email_limpio = value.strip().lower()
        if not re.match(EMAIL_REGEX, email_limpio):
            raise serializers.ValidationError("El correo electrónico no tiene un formato válido.")

        query = Usuario.objects.filter(email__iexact=email_limpio)
        if self.instance:
            query = query.exclude(pk=self.instance.pk)

        if query.exists():
            raise serializers.ValidationError("Email already exists")

        return email_limpio

    def validate_rol(self, value):
        rol_limpio = value.strip().lower()
        if rol_limpio not in ROLES_PERMITIDOS:
            raise serializers.ValidationError(
                f"Rol no válido. Los roles permitidos son: {', '.join(ROLES_PERMITIDOS)}"
            )
        return rol_limpio

    def validate(self, attrs):
        empresa = attrs.get("empresa", self.instance.empresa if self.instance else None)
        centro_trabajo = attrs.get("centro_trabajo", self.instance.centro_trabajo if self.instance else None)

        if centro_trabajo and empresa and centro_trabajo.empresa != empresa:
            raise serializers.ValidationError({
                "centro_trabajo": "El centro de trabajo seleccionado no pertenece a la empresa especificada."
            })

        return attrs


## DELETE
class DeleteUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["id", "nombre", "email"]
        read_only_fields = ("id", "nombre", "email")