from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import politica_prevencion_serializer
from api.models.politica_prevencion_model import Politica_prevencion
from api.models.centro_trabajo_model import Centro_trabajo
from api.models.empresa_model import Empresa

##CREATE
class CreatePoliticaPrevencionApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Politica_prevencion.objects.all()
    serializer_class = politica_prevencion_serializer.CreatePoliticaPrevencionSerializer

##READ

#List
class ListPoliticaPrevencionApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        politicas_prevencion = Politica_prevencion.objects.filter(
            centro_trabajo__empresa_id=empresa_id
        )
        solo_vigentes = request.query_params.get('vigente') or request.query_params.get('solo_vigentes')

        if solo_vigentes and solo_vigentes.lower() == 'true':
            politicas_prevencion = politicas_prevencion.filter(vigente=True)

        serializer = politica_prevencion_serializer.ListPoliticaPrevencionSerializer(politicas_prevencion, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

#Detail
class DetailPoliticaPrevencionApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, ploitica_prevencion_id):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        politicas_prevencion = Politica_prevencion.objects.filter(
            centro_trabajo__empresa_id=empresa_id
        )
    
        serializer = politica_prevencion_serializer.DetailPoliticaPrevencionSerializer(politicas_prevencion, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

##UPDATE
class UpdatePoliticaPrevencionApiView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Politica_prevencion.objects.all()
    serializer_class = politica_prevencion_serializer.UpdatePoliticaPrevencionSerializer

##DELETE
class DeletePoliticaPrevencionApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Politica_prevencion.objects.all()
    serializer_class = politica_prevencion_serializer.DeletePoliticaPrevencionSerializer