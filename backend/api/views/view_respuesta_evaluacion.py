from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status

from django.contrib.auth.models import User

from api.serializers import respuesta_evaluacion_serializer
from api.models.respuesta_evaluacion_model import Respuesta_evaluacion
from api.models.campana_evaluacion_model import Campana_evaluacion
from api.models.area_model import Area

##CREATE
class CreateRespuestaEvaluacionApiView(generics.CreateAPIView):
    queryset = Respuesta_evaluacion.objects.all()
    serializer_class = respuesta_evaluacion_serializer.CreateRespuestaEvaluacionSerializer

##READ

##List
class ListRespuestaEvaluacionApiView(APIView):
    def get(self, request):
        campana_id = request.query_params.get('campana_id')
        area_id = request.query_params.get('area_id')
        
        if not campana_id or not area_id:
            return Response(
                {"error": "Los parámetros 'campana_id' y 'area_id' son requeridos."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        respuesta = Respuesta_evaluacion.objects.filter(campana=campana_id, area=area_id)
        data = respuesta_evaluacion_serializer.ListRespuestaEvaluacionSerializer(respuesta, many=True).data
        return Response(data, status=status.HTTP_200_OK)
    
##Detail
class DetailRespuestaEvaluacionApiView(APIView):
    def get(self, request, id):
        campana_id = request.query_params.get('campana_id')
        area_id = request.query_params.get('area_id')

        if not campana_id or not area_id:
            return Response(
                {"error": "Los parámetros 'campana_id' y 'area_id' son requeridos."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        respuesta = Respuesta_evaluacion.objects.filter(campana=campana_id, area=area_id)
        data = respuesta_evaluacion_serializer.DetailRespuestaEvaluacionSerializer(respuesta).data
        return Response(data, status=status.HTTP_200_OK)
