from rest_framework import serializers
from api.models.area_model import Area
from api.models.centro_trabajo_model import Centro_trabajo
from .centro_trabajo_serializer import DetailCentroTrabajoSerializer


## CRUD AREA

## CREATE
class CreateAreaSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )
    descripcion = serializers.CharField(
        required=False,
        allow_blank=True,
        style={"input_type": "text"}
    )

    class Meta:
        model = Area
        fields = [
            "id",
            "nombre",
            "descripcion",
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

        if Area.objects.filter(nombre__iexact=nombre, centro_trabajo=centro_trabajo).exists():
            raise serializers.ValidationError({
                "nombre": "Nombre already exists in this centro de trabajo"
            })
        return attrs

    def create(self, validated_data):
        return Area.objects.create(**validated_data)


## READ

## List
class ListAreaSerializerByEmpresa(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)

    class Meta:
        model = Area
        fields = [
            "id",
            "nombre",
            "descripcion",
            "centro_trabajo",
        ]


## Detail
class DetailAreaSerializerByEmpresa(serializers.ModelSerializer):
    centro_trabajo = DetailCentroTrabajoSerializer(read_only=True)

    class Meta:
        model = Area
        fields = [
            "id",
            "nombre",
            "descripcion",
            "centro_trabajo",
        ]


## UPDATE
class UpdateAreaSerializerByEmpresa(serializers.ModelSerializer):
    nombre = serializers.CharField(
        required=False,
        max_length=150,
        min_length=2,
        style={"input_type": "text"}
    )
    descripcion = serializers.CharField(
        required=False,
        allow_blank=True,
        style={"input_type": "text"}
    )

    class Meta:
        model = Area
        fields = [
            "nombre",
            "descripcion",
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

        if nombre and centro_trabajo:
            query = Area.objects.filter(nombre__iexact=nombre, centro_trabajo=centro_trabajo)
            if self.instance:
                query = query.exclude(pk=self.instance.pk)
            
            if query.exists():
                raise serializers.ValidationError({
                    "nombre": "Nombre already exists in this centro de trabajo"
                })

        return attrs


## DELETE
class DeleteAreaSerializerByEmpresa(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ["id", "nombre"]
        read_only_fields = ("id", "nombre")