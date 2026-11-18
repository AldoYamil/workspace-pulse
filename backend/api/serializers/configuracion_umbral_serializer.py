from rest_framework import serializers
from api.models.configuracion_umbral_model import ConfiguracionUmbral
from api.models.centro_trabajo_model import Centro_trabajo
from api.models.area_model import Area
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer
from .area_serializer import DetailAreaSerializerByEmpresa


## CREATE
class CreateConfiguracionUmbralSerializer(serializers.ModelSerializer):
    metrica = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        error_messages={
            "blank": "El nombre de la métrica no puede estar vacío."
        }
    )
    valor_minimo_aceptable = serializers.FloatField(
        min_value=0.0,
        max_value=100.0,
        error_messages={
            "min_value": "El valor mínimo aceptable no puede ser negativo.",
            "max_value": "El valor mínimo aceptable no puede ser mayor a 100.0."
        }
    )
    centro_trabajo = serializers.PrimaryKeyRelatedField(
        queryset=Centro_trabajo.objects.all(),
        error_messages={
            "does_not_exist": "El centro de trabajo especificado no existe."
        }
    )
    area = serializers.PrimaryKeyRelatedField(
        queryset=Area.objects.all(),
        error_messages={
            "does_not_exist": "El área especificada no existe."
        }
    )

    class Meta:
        model = ConfiguracionUmbral
        fields = [
            "metrica",
            "valor_minimo_aceptable",
            "centro_trabajo",
            "area",
        ]

    def validate_metrica(self, value):
        metrica_limpia = value.strip()
        if len(metrica_limpia) < 3:
            raise serializers.ValidationError(
                "El nombre de la métrica debe tener al menos 3 caracteres."
            )
        return metrica_limpia

    def validate(self, attrs):
        centro_trabajo = attrs.get('centro_trabajo')
        area = attrs.get('area')
        metrica = attrs.get('metrica')

        if area and centro_trabajo:
            if area.centro_trabajo_id != centro_trabajo.id:
                raise serializers.ValidationError({
                    "area": "El área seleccionada no pertenece al centro de trabajo especificado."
                })

        if self.instance is None and area and metrica:
            existe = ConfiguracionUmbral.objects.filter(
                area=area,
                metrica__iexact=metrica
            ).exists()
            if existe:
                raise serializers.ValidationError({
                    "metrica": "Ya existe una configuración de umbral para esta métrica en el área seleccionada."
                })

        return attrs


## READ

# List
class ListConfiguracionUmbralSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)

    class Meta:
        model = ConfiguracionUmbral
        fields = [
            "id",
            "metrica",
            "valor_minimo_aceptable",
            "centro_trabajo",
            "area",
        ]


# Detail
class DetailConfiguracionUmbralSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)

    class Meta:
        model = ConfiguracionUmbral
        fields = [
            "id",
            "metrica",
            "valor_minimo_aceptable",
            "centro_trabajo",
            "area",
        ]


## UPDATE
class UpdateConfiguracionUmbralSerializer(serializers.ModelSerializer):
    metrica = serializers.CharField(
        required=False,
        max_length=100,
        trim_whitespace=True
    )
    valor_minimo_aceptable = serializers.FloatField(
        required=False,
        min_value=0.0,
        max_value=100.0
    )

    class Meta:
        model = ConfiguracionUmbral
        fields = [
            "metrica",
            "valor_minimo_aceptable",
        ]

    def validate_metrica(self, value):
        if value and len(value.strip()) < 3:
            raise serializers.ValidationError(
                "El nombre de la métrica debe tener al menos 3 caracteres."
            )
        return value.strip() if value else value


## DELETE
class DeleteConfiguracionUmbralSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionUmbral
        fields = [
            "id",
            "metrica",
        ]