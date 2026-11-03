from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

from api.serializers import touchpoint_serializer
from api.models.touchpoint_model import Touchpoint
from api.models.centro_trabajo_model import Centro_trabajo
from api.models.puesto_model import Puesto
from api.models.area_model import Area

##CREATE
class CreateTouchpointApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Touchpoint.objects.all()
    cerailizer_class = touchpoint_serializer.CreateTouchpointSerializer

##READ

#List
class ListTouchpointApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        touchpoints = Touchpoint.objects.filter(
            centro_trabajo__empresa_id=empresa_id
        )

        centro_id = request.query_params.get('centro_id')
        area_id = request.query_params.get('area_id')

        if centro_id:
            touchpoints = touchpoints.filter(centro_trabajo_id=centro_id)

        if area_id:
            touchpoints = touchpoints.filter(area_id=area_id)

        serializer = touchpoint_serializer.ListTouchpointSerializer(touchpoints, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

#Detail
class DetailTouchpointApiView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, touchpoint_id):
        usuario_logueado = request.user
        empresa_id = usuario_logueado.centrotrabajo.empresa_id
        touchpoint = Touchpoint.objects.filter(
            id=touchpoint_id,
            centro_trabajo__empresa_id=empresa_id
        )

        serializer = touchpoint_serializer.DetailTouchpointSerializer(touchpoint)
        return Response(serializer.data, status=status.HTTP_200_OK)

##UPDATE
class UpdateTouchpointApiView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Touchpoint.objects.all()
    serializer_class = touchpoint_serializer.UpdateTouchpointSerializer

##DELETE
class DeleteTouchpointApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Touchpoint.objects.all()
    serializer_class = touchpoint_serializer.DeleteTouchpointSerializer