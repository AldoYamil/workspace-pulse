from rest_framework.views import APIView
from rest_framework.response import Response
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