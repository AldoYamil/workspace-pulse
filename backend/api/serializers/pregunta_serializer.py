from rest_framework import serializers
from api.models.pregunta_model import Pregunta
from .guia_referencia_serializer import DetailGuiaReferenciaSerializer


## CRUD PREGUNTA

## CREATE
class CreatePreguntaSerializer(serializers.ModelSerializer):
    texto_pregunta = serializers.CharField(
        min_length=5,
        style={"input_type": "textarea"}
    )
    codigo_reactivo = serializers.CharField(
        max_length=50,
        min_length=1,
        style={"input_type": "text"}
    )
    dominio = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=150,
        style={"input_type": "text"}
    )
    categoria = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=150,
        style={"input_type": "text"}
    )

    class Meta:
        model = Pregunta
        fields = [
            "id",
            "texto_pregunta",
            "codigo_reactivo",
            "dominio",
            "categoria",
            "guia_referencia",
        ]
        read_only_fields = ("id",)

    def validate_texto_pregunta(self, value):
        texto_limpio = value.strip()
        if not texto_limpio:
            raise serializers.ValidationError("El texto de la pregunta no puede estar vacío.")
        return texto_limpio

    def validate_codigo_reactivo(self, value):
        codigo_limpio = value.strip().upper()
        if not codigo_limpio:
            raise serializers.ValidationError("El código de reactivo no puede estar vacío.")
        return codigo_limpio

    def validate(self, attrs):
        codigo_reactivo = attrs.get("codigo_reactivo")
        guia_referencia = attrs.get("guia_referencia")

        if codigo_reactivo and guia_referencia:
            if Pregunta.objects.filter(
                codigo_reactivo__iexact=codigo_reactivo, 
                guia_referencia=guia_referencia
            ).exists():
                raise serializers.ValidationError({
                    "codigo_reactivo": "Codigo reactivo already exists in this guia de referencia"
                })

        return attrs

    def create(self, validated_data):
        return Pregunta.objects.create(**validated_data)


## READ

## List
class ListPreguntaSerializerByGuia(serializers.ModelSerializer):
    class Meta:
        model = Pregunta
        fields = [
            "id",
            "texto_pregunta",
            "codigo_reactivo",
            "guia_referencia",
        ]


## Detail
class DetailPreguntaSerializerByGuia(serializers.ModelSerializer):
    guia_referencia = DetailGuiaReferenciaSerializer(read_only=True)

    class Meta:
        model = Pregunta
        fields = [
            "id",
            "texto_pregunta",
            "codigo_reactivo",
            "dominio",
            "categoria",
            "guia_referencia",
        ]


## UPDATE
class UpdatePreguntaSerializer(serializers.ModelSerializer):
    texto_pregunta = serializers.CharField(
        required=False,
        min_length=5,
        style={"input_type": "textarea"}
    )
    codigo_reactivo = serializers.CharField(
        required=False,
        max_length=50,
        min_length=1,
        style={"input_type": "text"}
    )
    dominio = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=150,
        style={"input_type": "text"}
    )
    categoria = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=150,
        style={"input_type": "text"}
    )

    class Meta:
        model = Pregunta
        fields = [
            "texto_pregunta",
            "codigo_reactivo",
            "dominio",
            "categoria",
            "guia_referencia",
        ]

    def validate_texto_pregunta(self, value):
        texto_limpio = value.strip()
        if not texto_limpio:
            raise serializers.ValidationError("El texto de la pregunta no puede estar vacío.")
        return texto_limpio

    def validate_codigo_reactivo(self, value):
        codigo_limpio = value.strip().upper()
        if not codigo_limpio:
            raise serializers.ValidationError("El código de reactivo no puede estar vacío.")
        return codigo_limpio

    def validate(self, attrs):
        codigo_reactivo = attrs.get(
            "codigo_reactivo", 
            self.instance.codigo_reactivo if self.instance else None
        )
        guia_referencia = attrs.get(
            "guia_referencia", 
            self.instance.guia_referencia if self.instance else None
        )

        if codigo_reactivo and guia_referencia:
            query = Pregunta.objects.filter(
                codigo_reactivo__iexact=codigo_reactivo, 
                guia_referencia=guia_referencia
            )
            if self.instance:
                query = query.exclude(pk=self.instance.pk)

            if query.exists():
                raise serializers.ValidationError({
                    "codigo_reactivo": "Codigo reactivo already exists in this guia de referencia"
                })

        return attrs


## DELETE
class DeletePreguntaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pregunta
        fields = ["id", "texto_pregunta", "codigo_reactivo"]
        read_only_fields = ("id", "texto_pregunta", "codigo_reactivo")