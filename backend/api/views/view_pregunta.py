from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics

from django.contrib.auth.models import User

from api.serializers import pregunta_serializer
from api.models.giua_referencia_model import GuiaReferencia
from api.models.pregunta_model import Pregunta

##CREATE
class CreatePreguntaciaApiView(generics.CreateAPIView):
    queryset = Pregunta.objects.all()
    serializer_class = pregunta_serializer.CreatePreguntaSerializer

##READ

##List
class ListPreguntaApiView(APIView):
    def get(self, request):
        guia_id = request.query_params.get('guia_id')
        
        if not guia_id:
            return Response(
                {"error": "El parámetro 'guia_id' es requerido."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        pregunta = Pregunta.objects.filter(guia_referencia_id=guia_id)
        data = pregunta_serializer.ListPreguntaSerializerByGuia(pregunta, many=True).data
        return Response(data, status=status.HTTP_200_OK)
    
##Detail
class DetailPreguntaApiView(APIView):
    def get(self, request, id):
        guia_id = request.query_params.get('guia_id')
                
        if not guia_id:
            return Response(
                {"error": "El parámetro 'guia_id' es requerido."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        pregunta = Pregunta.objects.filter(guia_referencia_id=guia_id)
        data = pregunta_serializer.DetailPreguntaSerializerByGuia(pregunta).data
        return Response(data, status=status.HTTP_200_OK)

##UPDATE
class UpdatePreguntaApiView(generics.UpdateAPIView):
    queryset = Pregunta.objects.all()
    serializer_class = pregunta_serializer.UpdatePreguntaSerializer

##DELETE
class DeletePreguntaApiView(generics.DestroyAPIView):
    queryset = Pregunta.objects.all()
    serializer_class = pregunta_serializer.DeletePreguntaSerializer