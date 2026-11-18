from rest_framework import serializers
from django.utils import timezone
from api.models.metrica_rendimiento_rh_model import MetricaRendimientoRH
from api.models.centro_trabajo_model import Centro_trabajo
from api.models.area_model import Area
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer
from .area_serializer import DetailAreaSerializerByEmpresa


## CREATE
class CreateMetricaRHSerializer(serializers.ModelSerializer):
    periodo_mes = serializers.IntegerField(
        min_value=1,
        max_value=12,
        error_messages={
            "min_value": "El mes debe estar entre 1 (Enero) y 12 (Diciembre).",
            "max_value": "El mes debe estar entre 1 (Enero) y 12 (Diciembre).",
            "invalid": "Ingrese un número entero válido para el mes."
        }
    )
    periodo_anio = serializers.IntegerField(
        min_value=2000,
        max_value=2100,
        error_messages={
            "min_value": "El año debe ser igual o posterior al 2000.",
            "max_value": "El año ingresado excede el límite permitido."
        }
    )
    tasa_rotacion = serializers.FloatField(
        min_value=0.0,
        max_value=100.0,
        error_messages={
            "min_value": "La tasa de rotación no puede ser negativa.",
            "max_value": "La tasa de rotación no puede exceder el 100%."
        }
    )
    dias_ausentismo = serializers.FloatField(
        min_value=0.0,
        error_messages={
            "min_value": "Los días de ausentismo no pueden ser negativos."
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
        model = MetricaRendimientoRH
        fields = [
            "periodo_mes",
            "periodo_anio",
            "tasa_rotacion",
            "dias_ausentismo",
            "centro_trabajo",
            "area",
        ]

    def validate_periodo_anio(self, value):
        anio_actual = timezone.now().year
        if value > anio_actual:
            raise serializers.ValidationError(
                f"No se pueden registrar métricas para años futuros ({value})."
            )
        return value

    def validate(self, attrs):
        centro_trabajo = attrs.get('centro_trabajo')
        area = attrs.get('area')
        periodo_mes = attrs.get('periodo_mes')
        periodo_anio = attrs.get('periodo_anio')

        if area and centro_trabajo:
            if area.centro_trabajo_id != centro_trabajo.id:
                raise serializers.ValidationError({
                    "area": "El área seleccionada no pertenece al centro de trabajo especificado."
                })

        anio_actual = timezone.now().year
        mes_actual = timezone.now().month
        if periodo_anio == anio_actual and periodo_mes > mes_actual:
            raise serializers.ValidationError({
                "periodo_mes": "No se pueden registrar métricas para meses futuros del año en curso."
            })

        if self.instance is None and area and periodo_mes and periodo_anio:
            existe = MetricaRendimientoRH.objects.filter(
                area=area,
                centro_trabajo=centro_trabajo,
                periodo_mes=periodo_mes,
                periodo_anio=periodo_anio
            ).exists()
            if existe:
                raise serializers.ValidationError(
                    f"Ya existen métricas de RH registradas para esta área en el periodo {periodo_mes}/{periodo_anio}."
                )

        return attrs


## READ

# List
class ListMetricaRHSerializer(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)

    class Meta:
        model = MetricaRendimientoRH
        fields = [
            "id",
            "periodo_mes",
            "periodo_anio",
            "tasa_rotacion",
            "dias_ausentismo",
            "centro_trabajo",
            "area",
        ]
