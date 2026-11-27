from rest_framework import serializers
from api.models.campana_evaluacion_model import Campana_evaluacion
from api.models.respuesta_evaluacion_model import Respuesta_evaluacion
from api.models.usuario_model import Usuario
from .guia_referencia_serializer import DetailGuiaReferenciaSerializer
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer


def _normalizar_estado(validated_data):
    if "estado" in validated_data and isinstance(validated_data["estado"], str):
        validated_data["estado"] = validated_data["estado"].strip().lower() in (
            "activa",
            "activo",
            "true",
            "1",
            "si",
            "sí",
        )
    return validated_data


class CreateCampanaEvaluacionSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )
    fecha_inicio = serializers.DateField(style={"input_type": "date"})
    fecha_fin = serializers.DateField(style={"input_type": "date"})
    estado = serializers.CharField(
        required=False,
        default="activa",
        style={"input_type": "text"}
    )

    class Meta:
        model = Campana_evaluacion
        fields = [
            "id",
            "nombre",
            "fecha_inicio",
            "fecha_fin",
            "estado",
            "guia_referencia",
            "centro_trabajo",
        ]
        read_only_fields = ("id",)

    def validate_nombre(self, value):
        nombre_limpio = value.strip()
        if not nombre_limpio:
            raise serializers.ValidationError("El nombre no puede estar vacío.")
        return nombre_limpio

    def validate(self, attrs):
        nombre = attrs.get("nombre")
        centro_trabajo = attrs.get("centro_trabajo")
        fecha_inicio = attrs.get("fecha_inicio")
        fecha_fin = attrs.get("fecha_fin")

        if fecha_inicio and fecha_fin and fecha_inicio > fecha_fin:
            raise serializers.ValidationError({
                "fecha_inicio": "La fecha de inicio no puede ser posterior a la fecha de fin."
            })

        if nombre and centro_trabajo:
            if Campana_evaluacion.objects.filter(nombre__iexact=nombre, centro_trabajo=centro_trabajo).exists():
                raise serializers.ValidationError({
                    "nombre": "Nombre already exists in this centro de trabajo"
                })

        return attrs

    def create(self, validated_data):
        validated_data = _normalizar_estado(validated_data)
        return Campana_evaluacion.objects.create(**validated_data)


class ListCampanaEvaluacionSerializer(serializers.ModelSerializer):
    guia_referencia = DetailGuiaReferenciaSerializer(read_only=True)
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    total_respuestas = serializers.SerializerMethodField()
    total_asignados = serializers.SerializerMethodField()

    class Meta:
        model = Campana_evaluacion
        fields = [
            "id",
            "nombre",
            "fecha_inicio",
            "fecha_fin",
            "estado",
            "guia_referencia",
            "centro_trabajo",
            "total_respuestas",
            "total_asignados",
        ]

    def get_total_respuestas(self, obj):
        return Respuesta_evaluacion.objects.filter(campana_id=obj.id).count()

    def get_total_asignados(self, obj):
        return Usuario.objects.filter(
            centro_trabajo_id=obj.centro_trabajo_id,
            activo=True
        ).count()


class DetailCampanaEvaluacionSerializer(serializers.ModelSerializer):
    guia_referencia = DetailGuiaReferenciaSerializer(read_only=True)
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)
    total_respuestas = serializers.SerializerMethodField()
    total_asignados = serializers.SerializerMethodField()

    class Meta:
        model = Campana_evaluacion
        fields = [
            "id",
            "nombre",
            "fecha_inicio",
            "fecha_fin",
            "estado",
            "guia_referencia",
            "centro_trabajo",
            "total_respuestas",
            "total_asignados",
        ]

    def get_total_respuestas(self, obj):
        return Respuesta_evaluacion.objects.filter(campana_id=obj.id).count()

    def get_total_asignados(self, obj):
        return Usuario.objects.filter(
            centro_trabajo_id=obj.centro_trabajo_id,
            activo=True
        ).count()


class UpdateCampanaEvaluacionSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        required=False,
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )
    fecha_inicio = serializers.DateField(required=False, style={"input_type": "date"})
    fecha_fin = serializers.DateField(required=False, style={"input_type": "date"})
    estado = serializers.CharField(required=False, style={"input_type": "text"})

    class Meta:
        model = Campana_evaluacion
        fields = [
            "nombre",
            "fecha_inicio",
            "fecha_fin",
            "estado",
            "guia_referencia",
            "centro_trabajo",
        ]

    def validate_nombre(self, value):
        nombre_limpio = value.strip()
        if not nombre_limpio:
            raise serializers.ValidationError("El nombre no puede estar vacío.")
        return nombre_limpio

    def validate(self, attrs):
        nombre = attrs.get("nombre", self.instance.nombre if self.instance else None)
        centro_trabajo = attrs.get("centro_trabajo", self.instance.centro_trabajo if self.instance else None)
        fecha_inicio = attrs.get("fecha_inicio", self.instance.fecha_inicio if self.instance else None)
        fecha_fin = attrs.get("fecha_fin", self.instance.fecha_fin if self.instance else None)

        if fecha_inicio and fecha_fin and fecha_inicio > fecha_fin:
            raise serializers.ValidationError({
                "fecha_inicio": "La fecha de inicio no puede ser posterior a la fecha de fin."
            })

        if nombre and centro_trabajo:
            query = Campana_evaluacion.objects.filter(nombre__iexact=nombre, centro_trabajo=centro_trabajo)
            if self.instance:
                query = query.exclude(pk=self.instance.pk)

            if query.exists():
                raise serializers.ValidationError({
                    "nombre": "Nombre already exists in this centro de trabajo"
                })

        return attrs

    def update(self, instance, validated_data):
        validated_data = _normalizar_estado(validated_data)
        return super().update(instance, validated_data)


class DeleteCampanaEvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campana_evaluacion
        fields = ["id", "nombre"]
        read_only_fields = ("id", "nombre")