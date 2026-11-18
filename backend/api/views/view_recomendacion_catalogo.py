from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status

from django.contrib.auth.models import User

from api.serializers import recomendacion_catalogo_serializer
from api.models.recomendacion_catalogo_model import RecomendacionCatalogo

##CREATE
class CreateRecomendacionCatalogoApiView(generics.CreateAPIView):
    queryset = RecomendacionCatalogo.objects.all()
    serializer_class = recomendacion_catalogo_serializer.CreateRecomendacionCatalogoSerializer

##READ

#List
class ListRecomendacionCatalogoApiView(APIView):
    def get(self, request):
        recomendaciones = RecomendacionCatalogo.objects.all()
        nivel_riesgo = request.query_params.get('nivel_riesgo')
        dominio = request.query_params.get('dominio')
        if nivel_riesgo:
            recomendaciones = recomendaciones.filter(nivel_riesgo__iexact=nivel_riesgo)
        if dominio:
            recomendaciones = recomendaciones.filter(dominio__iexact=dominio)
        serializer = recomendacion_catalogo_serializer.ListRecomendacionCatalogoSerializer(recomendaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
