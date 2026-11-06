import re
from rest_framework import serializers
from django.utils import timezone
from api.models.politica_prevencion_model import Politica_prevencion
from api.models.empresa_model import Empresa
from api.models.centro_trabajo_model import Centro_trabajo
from .empresa_serializer import DetailEmpresaSerializer
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer


## CREATE
class CreatePoliticaPrevencionSerializer(serializers.ModelSerializer):
    titulo = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        error_messages={
            "blank": "El título de la política no puede estar vacío."
        }
    )
    contenido_texto = serializers.CharField(
        trim_whitespace=True,
        error_messages={
            "blank": "El contenido del texto de la política no puede estar vacío."
        }
    )
    version = serializers.CharField(
        max_length=20,
        default="v1.0",
        trim_whitespace=True
    )
    estado = serializers.BooleanField(default=True)
    empresa = serializers.PrimaryKeyRelatedField(
        queryset=Empresa.objects.all(),
        error_messages={
            "does_not_exist": "La empresa especificada no existe."
        }
    )
    centro_trabajo = serializers.PrimaryKeyRelatedField(
        queryset=Centro_trabajo.objects.all(),
        error_messages={
            "does_not_exist": "El centro de trabajo especificado no existe."
        }
    )

    class Meta:
        model = Politica_prevencion
        fields = [
            "titulo",
            "contenido_texto",
            "version",
            "estado",
            "empresa",
            "centro_trabajo",
        ]

    def validate_titulo(self, value):
        titulo_limpio = value.strip()
        if len(titulo_limpio) < 5:
            raise serializers.ValidationError(
                "El título debe tener una longitud mínima de 5 caracteres."
            )
        return titulo_limpio

    def validate_contenido_texto(self, value):
        contenido_limpio = value.strip()
        if len(contenido_limpio) < 20:
            raise serializers.ValidationError(
                "El contenido de la política de prevención debe ser extenso (mínimo 20 caracteres)."
            )
        return contenido_limpio

    def validate_version(self, value):
        version_limpia = value.strip()
        patron_version = r'^v?\d+\.\d+(\.\d+)?$'
        if not re.match(patron_version, version_limpia, re.IGNORECASE):
            raise serializers.ValidationError(
                "El formato de versión es inválido. Use formatos como '1.0', 'v1.0' o '1.0.0'."
            )
        return version_limpia

    def validate(self, attrs):
        empresa = attrs.get('empresa')
        centro_trabajo = attrs.get('centro_trabajo')
        titulo = attrs.get('titulo')

        if empresa and centro_trabajo:
            if centro_trabajo.empresa_id != empresa.id:
                raise serializers.ValidationError({
                    "centro_trabajo": "El centro de trabajo seleccionado no pertenece a la empresa especificada."
                })

        if self.instance is None and centro_trabajo and titulo:
            existe = Politica_prevencion.objects.filter(
                centro_trabajo=centro_trabajo,
                titulo__iexact=titulo,
                estado=True
            ).exists()
            if existe:
                raise serializers.ValidationError({
                    "titulo": "Ya existe una política activa registrada con este título para el mismo centro de trabajo."
                })

        return attrs

    def create(self, validated_data):
        validated_data['fecha_publicacion'] = timezone.now()
        return super().create(validated_data)


## READ

# List
class ListPoliticaPrevencionSerializer(serializers.ModelSerializer):
    empresa_nombre = serializers.ReadOnlyField(source='empresa.nombre')
    centro_trabajo_nombre = serializers.ReadOnlyField(source='centro_trabajo.nombre')
    fecha_publicacion = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = Politica_prevencion
        fields = [
            "id",
            "titulo",
            "contenido_texto",
            "fecha_publicacion",
            "version",
            "estado",
            "empresa_nombre",
            "centro_trabajo_nombre",
        ]


# Detail
class DetailPoliticaPrevencionSerializer(serializers.ModelSerializer):
    empresa = DetailEmpresaSerializer(read_only=True)
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    fecha_publicacion = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = Politica_prevencion
        fields = [
            "id",
            "titulo",
            "contenido_texto",
            "fecha_publicacion",
            "version",
            "estado",
            "empresa",
            "centro_trabajo",
        ]


## UPDATE
class UpdatePoliticaPrevencionSerializer(serializers.ModelSerializer):
    titulo = serializers.CharField(
        required=False,
        max_length=100,
        trim_whitespace=True
    )
    contenido_texto = serializers.CharField(
        required=False,
        trim_whitespace=True
    )
    version = serializers.CharField(
        required=False,
        max_length=20,
        trim_whitespace=True
    )
    estado = serializers.BooleanField(required=False)

    class Meta:
        model = Politica_prevencion
        fields = [
            "titulo",
            "contenido_texto",
            "version",
            "estado",
        ]

    def validate_titulo(self, value):
        if value and len(value.strip()) < 5:
            raise serializers.ValidationError(
                "El título debe tener al menos 5 caracteres."
            )
        return value.strip() if value else value

    def validate_contenido_texto(self, value):
        if value and len(value.strip()) < 20:
            raise serializers.ValidationError(
                "El contenido debe tener al menos 20 caracteres."
            )
        return value.strip() if value else value

    def validate_version(self, value):
        if value:
            version_limpia = value.strip()
            patron_version = r'^v?\d+\.\d+(\.\d+)?$'
            if not re.match(patron_version, version_limpia, re.IGNORECASE):
                raise serializers.ValidationError(
                    "El formato de versión es inválido. Use formatos como '1.0', 'v1.0' o '1.0.0'."
                )
            return version_limpia
        return value


## DELETE
class DeletePoliticaPrevencionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Politica_prevencion
        fields = [
            "id",
            "titulo",
        ]