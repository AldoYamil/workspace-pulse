from rest_framework import serializers
from api.models.asistencia_capacitacion_model import AsistenciaCapacitacion
from api.models.area_model import Area
from api.models.capacitacion_model import Capacitacion
from .capacitacion_serializer import DetailCapacitacionSerializer
from .area_serializer import DetailAreaSerializerByEmpresa


## CREATE / UPDATE
class CreateAsistenciaCapacitacionSerializer(serializers.ModelSerializer):
    total_asistentes = serializers.IntegerField(
        min_value=1,
        error_messages={
            "min_value": "El total de asistentes debe ser de al menos 1 persona.",
            "invalid": "Ingrese un número entero válido para los asistentes."
        }
    )
    area = serializers.PrimaryKeyRelatedField(
        queryset=Area.objects.all(),
        error_messages={
            "does_not_exist": "El área seleccionada no existe."
        }
    )
    capacitacion = serializers.PrimaryKeyRelatedField(
        queryset=Capacitacion.objects.all(),
        error_messages={
            "does_not_exist": "La capacitación seleccionada no existe."
        }
    )

    class Meta:
        model = AsistenciaCapacitacion
        fields = [
            "total_asistentes",
            "area",
            "capacitacion"
        ]

    def validate(self, attrs):
        area = attrs.get('area')
        capacitacion = attrs.get('capacitacion')

        if area and capacitacion:
            if area.centro_trabajo_id != capacitacion.centro_trabajo_id:
                raise serializers.ValidationError({
                    "area": "El área seleccionada no pertenece al mismo centro de trabajo donde se imparte la capacitación."
                })

        if area and attrs.get('total_asistentes'):
            num_empleados_centro = area.centro_trabajo.num_empleados
            if attrs['total_asistentes'] > num_empleados_centro:
                raise serializers.ValidationError({
                    "total_asistentes": f"El total de asistentes ({attrs['total_asistentes']}) excede el número total de empleados del centro de trabajo ({num_empleados_centro})."
                })

        if self.instance is None: 
            existe_registro = AsistenciaCapacitacion.objects.filter(
                area=area,
                capacitacion=capacitacion
            ).exists()
            if existe_registro:
                raise serializers.ValidationError(
                    "Ya existe un registro de asistencia para esta área en la capacitación seleccionada."
                )

        return attrs


## READ

# List
class ListAsistenciaCapacitacionSerializer(serializers.ModelSerializer):
    area_nombre = serializers.ReadOnlyField(source='area.nombre')
    capacitacion_taller = serializers.ReadOnlyField(source='capacitacion.nombre_taller')

    class Meta:
        model = AsistenciaCapacitacion
        fields = [
            "id",
            "total_asistentes",
            "area",
            "area_nombre",
            "capacitacion",
            "capacitacion_taller",
        ]

