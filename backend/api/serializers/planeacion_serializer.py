from rest_framework import serializers
from api.models import Planeacion

class PlaneacionSerializer(serializers.ModelSerializer):
    area_nombre = serializers.CharField(source='resultado_riesgo.area.nombre', read_only=True)
    nivel_riesgo = serializers.CharField(source='resultado_riesgo.nivel_riesgo', read_only=True)
    responsable_nombre = serializers.CharField(source='usuario.nombre', read_only=True)

    class Meta:
        model = Planeacion
        fields = [
            'id', 
            'titulo', 
            'descripcion_medida', 
            'fecha_compromiso', 
            'estado', 
            'resultado_riesgo', 
            'usuario',
            'area_nombre',
            'nivel_riesgo',
            'responsable_nombre'
        ]