from rest_framework import serializers
from django.utils import timezone
from api.models.resultado_riesgo_model import ResultadoRiesgo
from api.models.campana_evaluacion_model import Campana_evaluacion
from api.models.area_model import Area
from api.models.puesto_model import Puesto
from .campana_evaluacion_serializer import DetailCampanaEvaluacionSerializer
from .puesto_serializer import DetailPuestoSerializer
from .area_serializer import DetailAreaSerializerByEmpresa


## CREATE
class CreateResultadoRiesgoSerializer(serializers.ModelSerializer):
    puntuacion_riesgo = serializers.FloatField(
        min_value=0.0,
        error_messages={
            "min_value": "La puntuación de riesgo no puede ser negativa.",
            "invalid": "Ingrese un valor numérico válido para la puntuación."
        }
    )
    nivel_riesgo = serializers.CharField(
        max_length=50,
        trim_whitespace=True,
        error_messages={
            "blank": "El nivel de riesgo es obligatorio."
        }
    )
    campaña_evaluacion = serializers.PrimaryKeyRelatedField(
        queryset=Campana_evaluacion.objects.all(),
        error_messages={
            "does_not_exist": "La campaña de evaluación especificada no existe."
        }
    )
    area = serializers.PrimaryKeyRelatedField(
        queryset=Area.objects.all(),
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
        model = ResultadoRiesgo
        fields = [
            "puntuacion_riesgo",
            "nivel_riesgo",
            "campaña_evaluacion",
            "area",
            "puesto",
        ]

    def validate_nivel_riesgo(self, value):
        niveles_validos = ["Nulo", "Bajo", "Medio", "Alto", "Muy Alto"]
        nivel_normalizado = value.strip().title()

        if nivel_normalizado not in niveles_validos:
            raise serializers.ValidationError(
                f"Nivel de riesgo inválido. Los niveles permitidos por la NOM-035 son: {', '.join(niveles_validos)}."
            )
        return nivel_normalizado

    def validate(self, attrs):
        area = attrs.get('area')
        puesto = attrs.get('puesto')
        campana = attrs.get('campaña_evaluacion')

        if puesto and area:
            if puesto.area_id != area.id:
                raise serializers.ValidationError({
                    "puesto": "El puesto seleccionado no pertenece al área especificada."
                })

        if area and campana:
            if area.centro_trabajo_id != campana.centro_trabajo_id:
                raise serializers.ValidationError({
                    "area": "El área seleccionada no pertenece al centro de trabajo asignado a esta campaña de evaluación."
                })

        if self.instance is None and campana and area:
            existe = ResultadoRiesgo.objects.filter(
                campaña_evaluacion=campana,
                area=area,
                puesto=puesto
            ).exists()
            if existe:
                raise serializers.ValidationError(
                    "Ya existe un resultado de riesgo calculado para este área y puesto en la campaña de evaluación seleccionada."
                )

        return attrs

    def create(self, validated_data):
        validated_data['fecha_calculo'] = timezone.now()
        return super().create(validated_data)


## READ

# By Campaña
class ListResultadoRiesgoByCampanaSerializer(serializers.ModelSerializer):
    campaña_evaluacion = DetailCampanaEvaluacionSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)
    puesto = DetailPuestoSerializer(read_only=True)
    fecha_calculo = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = ResultadoRiesgo
        fields = [
            "id",
            "puntuacion_riesgo",
            "nivel_riesgo",
            "fecha_calculo",
            "campaña_evaluacion",
            "area",
            "puesto",
        ]


# By Area en Campaña
class ListResultadoRiesgoByAreaCampanaSerializer(serializers.ModelSerializer):
    campaña_evaluacion = DetailCampanaEvaluacionSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)
    puesto = DetailPuestoSerializer(read_only=True)
    fecha_calculo = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = ResultadoRiesgo
        fields = [
            "id",
            "puntuacion_riesgo",
            "nivel_riesgo",
            "fecha_calculo",
            "campaña_evaluacion",
            "area",
            "puesto",
        ]