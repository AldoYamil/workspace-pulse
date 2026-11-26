from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from accounts.permissions import SoloGestion

from api.serializers import capacitacion_serializer
from api.models.capacitacion_model import Capacitacion
from api.models.usuario_model import Usuario


def obtener_empresa_id(request):
    email_usuario = getattr(request.user, 'email', None)
    if not email_usuario:
        return None
    perfil = (
        Usuario.objects.select_related('centro_trabajo')
        .filter(email__iexact=email_usuario)
        .first()
    )
    if not perfil:
        return None
    return getattr(perfil, 'empresa_id', None) or (
        perfil.centro_trabajo.empresa_id if getattr(perfil, 'centro_trabajo', None) else None
    )


##CREATE
class CreateCapacitacionApiView(generics.CreateAPIView):
    permission_classes = [SoloGestion]
    queryset = Capacitacion.objects.all()
    serializer_class = capacitacion_serializer.CreateCapacitacionSerializer


##READ
#List
class ListCapacitacionApiView(APIView):
    permission_classes = [SoloGestion]

    def get(self, request):
        empresa_id = obtener_empresa_id(request)
        if not empresa_id:
            if getattr(request.user, 'is_superuser', False):
                capacitaciones = Capacitacion.objects.all()
            else:
                return Response([], status=status.HTTP_200_OK)
        else:
            campos = {f.name for f in Capacitacion._meta.fields}
            if 'centro_trabajo' in campos:
                capacitaciones = Capacitacion.objects.filter(centro_trabajo__empresa_id=empresa_id)
            elif 'empresa' in campos:
                capacitaciones = Capacitacion.objects.filter(empresa_id=empresa_id)
            else:
                capacitaciones = Capacitacion.objects.all()

        serializer = capacitacion_serializer.ListCapacitacionSerializer(capacitaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


#Detail
class DetailCapacitacionApiView(APIView):
    permission_classes = [SoloGestion]

    def get(self, request, id):
        empresa_id = obtener_empresa_id(request)
        qs = Capacitacion.objects.filter(id=id)
        if empresa_id:
            campos = {f.name for f in Capacitacion._meta.fields}
            if 'centro_trabajo' in campos:
                qs = qs.filter(centro_trabajo__empresa_id=empresa_id)
            elif 'empresa' in campos:
                qs = qs.filter(empresa_id=empresa_id)

        capacitacion = qs.first()
        if not capacitacion:
            return Response({"detail": "Capacitación no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        serializer = capacitacion_serializer.DetailCapacitacionSerializer(capacitacion)
        return Response(serializer.data, status=status.HTTP_200_OK)


##UPDATE
class UpdateCapacitacionApiView(generics.UpdateAPIView):
    permission_classes = [SoloGestion]
    queryset = Capacitacion.objects.all()
    serializer_class = capacitacion_serializer.UpdateCapacitacionSerializer
    lookup_field = 'id'


##DELETE
class DeleteCapacitacionApiView(generics.DestroyAPIView):
    permission_classes = [SoloGestion]
    queryset = Capacitacion.objects.all()
    serializer_class = capacitacion_serializer.DeleteCapacitacionSerializer
    lookup_field = 'id'