from rest_framework import serializers
from django.utils import timezone
from api.models.respuesta_evaluacion_model import Respuesta_evaluacion
from .campana_evaluacion_serializer import DetailCampanaEvaluacionSerializer
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer
from .puesto_serializer import DetailPuestoSerializer
from .touchpoint_serializer import DetailTouchpointSerializer
from .area_serializer import DetailAreaSerializerByEmpresa


## CRUD RESPUESTA EVALUACIÓN

## CREATE
class CreateRespuestaEvaluacionSerializer(serializers.ModelSerializer):
    respuesta = serializers.IntegerField(
        min_value=0,
        max_value=10,
        style={"input_type": "number"}
    )
    fecha_respuesta = serializers.DateTimeField(
        required=False,
        style={"input_type": "datetime"}
    )

    class Meta:
        model = Respuesta_evaluacion
        fields = [
            "id",
            "respuesta",
            "fecha_respuesta",
            "campana",
            "centro_trabajo",
            "puesto",
            "touchpoint",
            "area",
        ]
        read_only_fields = ("id",)

    def validate_respuesta(self, value):
        if value < 0:
            raise serializers.ValidationError("La respuesta no puede ser un valor negativo.")
        return value

    def validate_fecha_respuesta(self, value):
        if value and value > timezone.now():
            raise serializers.ValidationError("La fecha de respuesta no puede ser en el futuro.")
        return value

    def validate(self, attrs):
        area = attrs.get("area")
        puesto = attrs.get("puesto")
        campana = attrs.get("campana")
        centro_trabajo = attrs.get("centro_trabajo")

        if puesto and area and puesto.area != area:
            raise serializers.ValidationError({
                "puesto": "El puesto seleccionado no pertenece al área especificada."
            })

        if campana and centro_trabajo and campana.centro_trabajo != centro_trabajo:
            raise serializers.ValidationError({
                "centro_trabajo": "El centro de trabajo no coincide con el registrado en la campaña."
            })

        return attrs

    def create(self, validated_data):
        return Respuesta_evaluacion.objects.create(**validated_data)


## READ

## List
class ListRespuestaEvaluacionSerializer(serializers.ModelSerializer):
    campana = DetailCampanaEvaluacionSerializer(read_only=True)
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    puesto = DetailPuestoSerializer(read_only=True)
    touchpoint = DetailTouchpointSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)

    class Meta:
        model = Respuesta_evaluacion
        fields = [
            "id",
            "respuesta",
            "fecha_respuesta",
            "campana",
            "centro_trabajo",
            "puesto",
            "touchpoint",
            "area",
        ]


## Detail
class DetailRespuestaEvaluacionSerializer(serializers.ModelSerializer):
    campana = DetailCampanaEvaluacionSerializer(read_only=True)
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    puesto = DetailPuestoSerializer(read_only=True)
    touchpoint = DetailTouchpointSerializer(read_only=True)
    area = DetailAreaSerializerByEmpresa(read_only=True)

    class Meta:
        model = Respuesta_evaluacion
        fields = [
            "id",
            "respuesta",
            "fecha_respuesta",
            "campana",
            "centro_trabajo",
            "puesto",
            "touchpoint",
            "area",
        ]


## UPDATE
class UpdateRespuestaEvaluacionSerializer(serializers.ModelSerializer):
    respuesta = serializers.IntegerField(
        required=False,
        min_value=0,
        max_value=10,
        style={"input_type": "number"}
    )
    fecha_respuesta = serializers.DateTimeField(
        required=False,
        style={"input_type": "datetime"}
    )

    class Meta:
        model = Respuesta_evaluacion
        fields = [
            "respuesta",
            "fecha_respuesta",
            "campana",
            "centro_trabajo",
            "puesto",
            "touchpoint",
            "area",
        ]

    def validate_respuesta(self, value):
        if value < 0:
            raise serializers.ValidationError("La respuesta no puede ser un valor negativo.")
        return value

    def validate_fecha_respuesta(self, value):
        if value and value > timezone.now():
            raise serializers.ValidationError("La fecha de respuesta no puede ser en el futuro.")
        return value

    def validate(self, attrs):
        area = attrs.get("area", self.instance.area if self.instance else None)
        puesto = attrs.get("puesto", self.instance.puesto if self.instance else None)
        campana = attrs.get("campana", self.instance.campana if self.instance else None)
        centro_trabajo = attrs.get("centro_trabajo", self.instance.centro_trabajo if self.instance else None)

        if puesto and area and puesto.area != area:
            raise serializers.ValidationError({
                "puesto": "El puesto seleccionado no pertenece al área especificada."
            })

        if campana and centro_trabajo and campana.centro_trabajo != centro_trabajo:
            raise serializers.ValidationError({
                "centro_trabajo": "El centro de trabajo no coincide con el registrado en la campaña."
            })

        return attrs


## DELETE
class DeleteRespuestaEvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Respuesta_evaluacion
        fields = ["id"]
        read_only_fields = ("id",)