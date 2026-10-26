from rest_framework import serializers
from api.models.detalle_respuesta_model import DetalleRespuesta
from .respuesta_evaluacion_serializer import DetailRespuestaEvaluacionSerializer
from .pregunta_serializer import DetailPreguntaSerializerByGuia


## CRUD DETALLE RESPUESTA

## CREATE
class CreateDetalleRespuestaSerializer(serializers.ModelSerializer):
    valor_ponderado = serializers.IntegerField(
        min_value=0,
        max_value=10,
        style={"input_type": "number"}
    )

    class Meta:
        model = DetalleRespuesta
        fields = [
            "id",
            "valor_ponderado",
            "respuesta_evaluacion",
            "pregunta",
        ]
        read_only_fields = ("id",)

    def validate_valor_ponderado(self, value):
        if value < 0:
            raise serializers.ValidationError("El valor ponderado no puede ser negativo.")
        return value

    def validate(self, attrs):
        respuesta_evaluacion = attrs.get("respuesta_evaluacion")
        pregunta = attrs.get("pregunta")

        if respuesta_evaluacion and pregunta:
            if DetalleRespuesta.objects.filter(respuesta_evaluacion=respuesta_evaluacion, pregunta=pregunta).exists():
                raise serializers.ValidationError({
                    "pregunta": "Esta pregunta ya ha sido respondida en esta evaluación."
                })

        return attrs

    def create(self, validated_data):
        return DetalleRespuesta.objects.create(**validated_data)


## READ

## List
class ListDetalleRespuestaSerializer(serializers.ModelSerializer):
    respuesta_evaluacion = DetailRespuestaEvaluacionSerializer(read_only=True)
    pregunta = DetailPreguntaSerializerByGuia(read_only=True)

    class Meta:
        model = DetalleRespuesta
        fields = [
            "id",
            "valor_ponderado",
            "respuesta_evaluacion",
            "pregunta",
        ]


## Detail
class DetailDetalleRespuestaSerializer(serializers.ModelSerializer):
    respuesta_evaluacion = DetailRespuestaEvaluacionSerializer(read_only=True)
    pregunta = DetailPreguntaSerializerByGuia(read_only=True)

    class Meta:
        model = DetalleRespuesta
        fields = [
            "id",
            "valor_ponderado",
            "respuesta_evaluacion",
            "pregunta",
        ]


## UPDATE
class UpdateDetalleRespuestaSerializer(serializers.ModelSerializer):
    valor_ponderado = serializers.IntegerField(
        required=False,
        min_value=0,
        max_value=10,
        style={"input_type": "number"}
    )

    class Meta:
        model = DetalleRespuesta
        fields = [
            "valor_ponderado",
            "respuesta_evaluacion",
            "pregunta",
        ]

    def validate_valor_ponderado(self, value):
        if value < 0:
            raise serializers.ValidationError("El valor ponderado no puede ser negativo.")
        return value

    def validate(self, attrs):
        respuesta_evaluacion = attrs.get("respuesta_evaluacion", self.instance.respuesta_evaluacion if self.instance else None)
        pregunta = attrs.get("pregunta", self.instance.pregunta if self.instance else None)

        if respuesta_evaluacion and pregunta:
            query = DetalleRespuesta.objects.filter(respuesta_evaluacion=respuesta_evaluacion, pregunta=pregunta)
            if self.instance:
                query = query.exclude(pk=self.instance.pk)

            if query.exists():
                raise serializers.ValidationError({
                    "pregunta": "Esta pregunta ya ha sido respondida en esta evaluación."
                })

        return attrs


## DELETE
class DeleteDetalleRespuestaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleRespuesta
        fields = ["id"]
        read_only_fields = ("id",)