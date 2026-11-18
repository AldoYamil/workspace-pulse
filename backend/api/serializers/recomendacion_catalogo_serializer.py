from rest_framework import serializers
from api.models.recomendacion_catalogo_model import RecomendacionCatalogo


## CREATE
class CreateRecomendacionCatalogoSerializer(serializers.ModelSerializer):
    dominio = serializers.CharField(
        max_length=100,
        trim_whitespace=True,
        error_messages={
            "blank": "El dominio o categoría de la recomendación es requerido."
        }
    )
    nivel_riesgo = serializers.CharField(
        max_length=50,
        trim_whitespace=True,
        error_messages={
            "blank": "El nivel de riesgo es obligatorio."
        }
    )
    titulo_recomendacion = serializers.CharField(
        max_length=150,
        trim_whitespace=True,
        error_messages={
            "blank": "El título de la recomendación no puede estar vacío."
        }
    )
    descripcion_accion = serializers.CharField(
        trim_whitespace=True,
        error_messages={
            "blank": "La descripción de la acción preventiva no puede estar vacía."
        }
    )
    referencia_normativa = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        trim_whitespace=True
    )

    class Meta:
        model = RecomendacionCatalogo
        fields = [
            "dominio",
            "nivel_riesgo",
            "titulo_recomendacion",
            "descripcion_accion",
            "referencia_normativa",   
        ]

    def validate_dominio(self, value):
        dominio_limpio = value.strip().title()
        if len(dominio_limpio) < 3:
            raise serializers.ValidationError(
                "El dominio debe tener una longitud mínima de 3 caracteres."
            )
        return dominio_limpio

    def validate_nivel_riesgo(self, value):
        niveles_validos = ["Nulo", "Bajo", "Medio", "Alto", "Muy Alto"]
        nivel_normalizado = value.strip().title()

        if nivel_normalizado not in niveles_validos:
            raise serializers.ValidationError(
                f"Nivel de riesgo inválido. Los niveles permitidos por la NOM-035 son: {', '.join(niveles_validos)}."
            )
        return nivel_normalizado

    def validate_titulo_recomendacion(self, value):
        titulo_limpio = value.strip()
        if len(titulo_limpio) < 5:
            raise serializers.ValidationError(
                "El título de la recomendación debe tener al menos 5 caracteres."
            )
        return titulo_limpio

    def validate_descripcion_accion(self, value):
        desc_limpia = value.strip()
        if len(desc_limpia) < 15:
            raise serializers.ValidationError(
                "La descripción de la acción debe ser detallada (mínimo 15 caracteres)."
            )
        return desc_limpia

    def validate(self, attrs):
        dominio = attrs.get('dominio')
        nivel_riesgo = attrs.get('nivel_riesgo')
        titulo = attrs.get('titulo_recomendacion')

        # Control de duplicidad: evitar crear dos recomendaciones idénticas para el mismo dominio y nivel
        if self.instance is None and dominio and nivel_riesgo and titulo:
            existe = RecomendacionCatalogo.objects.filter(
                dominio__iexact=dominio,
                nivel_riesgo__iexact=nivel_riesgo,
                titulo_recomendacion__iexact=titulo
            ).exists()
            if existe:
                raise serializers.ValidationError({
                    "titulo_recomendacion": "Ya existe una recomendación en el catálogo con este título para el mismo dominio y nivel de riesgo."
                })

        return attrs


## READ

# List
class ListRecomendacionCatalogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecomendacionCatalogo
        fields = [
            "id",
            "dominio",
            "nivel_riesgo",
            "titulo_recomendacion",
            "descripcion_accion",
            "referencia_normativa",
        ]
