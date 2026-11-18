from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import planeacion_serializer
from api.models.planeacion_model import Planeacion
from api.models.resultado_riesgo_model import ResultadoRiesgo
from api.models.usuario_model import Usuario

##CREATE
class CreatePlaneacionApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Planeacion.objects.all()
    serializer_class = planeacion_serializer.CreatePlaneacionSerializer

##READ
#List
class ListPlaneacionApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        usuario_logeado = request.user
        empresa_id = usuario_logeado.centrotrabajo.empresa_id
        planeaciones = Planeacion.objects.filter(
            usuario__centrotrabajo__empresa_id=empresa_id
        )

        resultado_riesgo_id = request.query_params.get('resultado_riesgo_id')
        nivel_riesgo = request.query_params.get('riesgo')

        if resultado_riesgo_id:
            planeaciones = planeaciones.filter(resultado_riesgo_id=resultado_riesgo_id)

        if nivel_riesgo:
            planeaciones = planeaciones.filter(resultado_riesgo__nivel__iexact=nivel_riesgo)

        serializer = planeacion_serializer.ListPlaneacionSerializer(planeaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

#Detail
class DetailPlaneacionApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        usuario_logeado = request.user
        empresa_id = usuario_logeado.centrotrabajo.empresa_id
        planeacion = Planeacion.objects.filter(id=id,
            usuario__centrotrabajo__empresa_id=empresa_id
        )
        serializer = planeacion_serializer.DetailPlaneacionSerializer(planeacion)
        return Response(serializer.data, status=status.HTTP_200_OK)

##UPDATE
class UpdatePlaneacionApiView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Planeacion.objects.all()
    serializer_class = planeacion_serializer.UpdatePlaneacionSerializer

##DELETE
class DeletePlaneacionApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Planeacion.objects.all()
    serializer_class = planeacion_serializer.DeletePlaneacionSerializer
from rest_framework import status
from api.models import Planeacion, ResultadoRiesgo, Usuario
from api.serializers.planeacion_serializer import PlaneacionSerializer

class ListCreatePlaneacionApiView(APIView):
    def get(self, request):
        planes = Planeacion.objects.select_related('resultado_riesgo__area', 'usuario').all()
        serializer = PlaneacionSerializer(planes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PlaneacionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateDeletePlaneacionApiView(APIView):
    def put(self, request, pk):
        try:
            planeacion = Planeacion.objects.get(pk=pk)
        except Planeacion.DoesNotExist:
            return Response({"error": "Plan de acción no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PlaneacionSerializer(planeacion, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            planeacion = Planeacion.objects.get(pk=pk)
            planeacion.delete()
            return Response({"message": "Plan eliminado correctamente"}, status=status.HTTP_204_NO_CONTENT)
        except Planeacion.DoesNotExist:
            return Response({"error": "Plan no encontrado"}, status=status.HTTP_404_NOT_FOUND)
