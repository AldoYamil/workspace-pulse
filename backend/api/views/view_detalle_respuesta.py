from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status

from django.contrib.auth.models import User

from api.serializers import detalle_respuesta_serializer
from api.models.detalle_respuesta_model import DetalleRespuesta
from api.models.respuesta_evaluacion_model import Respuesta_evaluacion
from api.models.pregunta_model import Pregunta

##CREATE
class CreateDetalleRespuestaApiView(generics.CreateAPIView):
    queryset = DetalleRespuesta.objects.all()
    serializer_class = detalle_respuesta_serializer.CreateDetalleRespuestaSerializer

##READ

##List
class ListDetalleRespuestaApiView(APIView):
    def get(self, request):
        respuesta_id = request.query_params.get('respuesta_id')
        
        if not respuesta_id:
            return Response(
                {"error": "Los parámetros 'respuesta_id' son requeridos."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        detalle = DetalleRespuesta.objects.filter(respuesta=respuesta_id)
        data = detalle_respuesta_serializer.ListDetalleRespuestaSerializer(detalle, many=True).data
        return Response(data, status=status.HTTP_200_OK)
    
##Detail
class DetailDetalleRespuestaApiView(APIView):
    def get(self, request, id):
        respuesta_id = request.query_params.get('respuesta_id')
        
        if not respuesta_id:
            return Response(
                {"error": "Los parámetros 'respuesta_id' son requeridos."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        detalle = DetalleRespuesta.objects.filter(respuesta=respuesta_id)
        data = detalle_respuesta_serializer.DetailDetalleRespuestaSerializer(detalle).data
        return Response(data, status=status.HTTP_200_OK)
