from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics

from django.contrib.auth.models import User

from api.serializers import campana_evaluacion_serializer
from api.models.campana_evaluacion_model import Campana_evaluacion
from api.models.giua_referencia_model import Guia_referencia
from api.models.centro_trabajo_model import Centro_trabajo

##CREATE
class CreateCampanaEvaluacionApiView(generics.CreateAPIView):
    queryset = Campana_evaluacion.objects.all()
    serializer_class = campana_evaluacion_serializer.CreateCampanaEvaluacionSerializer

##READ

##List
class ListCampanaEvaluacionApiView(APIView):
    def get(self, request):
        guia_id = request.query_params.get('guia_id')
        centro_id = request.query_params.get('centro_id')
        
        if not guia_id or not centro_id:
            return Response(
                {"error": "El parámetro 'guia_id' o 'centro_id' es requerido."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

            
        campana = Campana_evaluacion.objects.filter(guia_referencia_id=guia_id, centro_trabajo=centro_id)
        data = campana_evaluacion_serializer.ListCampanaEvaluacionSerializer(campana, many=True).data
        return Response(data, status=status.HTTP_200_OK)
    
##Detail
class DetailCampanaEvaluacionApiView(APIView):
    def get(self, request, id):
        guia_id = request.query_params.get('guia_id')
        centro_id = request.query_params.get('centro_id')
        
        if not guia_id or not centro_id:
            return Response(
                {"error": "El parámetro 'guia_id' o 'centro_id' es requerido."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        campana = Campana_evaluacion.objects.filter(guia_referencia_id=guia_id)
        data = campana_evaluacion_serializer.DetailCampanaEvaluacionSerializer(campana).data
        return Response(data, status=status.HTTP_200_OK)

##UPDATE
class UpdateCampanaEvaluacionApiView(generics.UpdateAPIView):
    queryset = Campana_evaluacion.objects.all()
    serializer_class = campana_evaluacion_serializer.UpdateCampanaEvaluacionSerializer

##DELETE
class DeleteCampanaEvaluacionApiView(generics.DestroyAPIView):
    queryset = Campana_evaluacion.objects.all()
    serializer_class = campana_evaluacion_serializer.DeleteCampanaEvaluacionSerializer