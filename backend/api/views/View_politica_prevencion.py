from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from accounts.permissions import PersonalRH, SoloGestion, CualquierRol

from api.serializers import politica_prevencion_serializer
from api.models.politica_prevencion_model import Politica_prevencion
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
class CreatePoliticaPrevencionApiView(generics.CreateAPIView):
    permission_classes = [PersonalRH]
    queryset = Politica_prevencion.objects.all()
    serializer_class = politica_prevencion_serializer.CreatePoliticaPrevencionSerializer


##READ

#List
class ListPoliticaPrevencionApiView(APIView):
    permission_classes = [PersonalRH]

    def get(self, request):
        empresa_id = obtener_empresa_id(request)

        if not empresa_id:
            if getattr(request.user, 'is_superuser', False):
                politicas_prevencion = Politica_prevencion.objects.all()
            else:
                return Response([], status=status.HTTP_200_OK)
        else:
            politicas_prevencion = Politica_prevencion.objects.filter(
                centro_trabajo__empresa_id=empresa_id
            )

        solo_vigentes = request.query_params.get('vigente') or request.query_params.get('solo_vigentes')
        if solo_vigentes and solo_vigentes.lower() == 'true':
            politicas_prevencion = politicas_prevencion.filter(vigente=True)

        serializer = politica_prevencion_serializer.ListPoliticaPrevencionSerializer(
            politicas_prevencion, many=True
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


#Detail
class DetailPoliticaPrevencionApiView(APIView):
    permission_classes = [PersonalRH]

    def get(self, request, politica_prevencion_id=None, **kwargs):
        registro_id = politica_prevencion_id or kwargs.get('ploitica_prevencion_id') or kwargs.get('id') or kwargs.get('pk')
        empresa_id = obtener_empresa_id(request)

        if not empresa_id:
            if getattr(request.user, 'is_superuser', False):
                politicas_prevencion = Politica_prevencion.objects.filter(pk=registro_id)
            else:
                return Response([], status=status.HTTP_200_OK)
        else:
            politicas_prevencion = Politica_prevencion.objects.filter(
                pk=registro_id,
                centro_trabajo__empresa_id=empresa_id
            )

        serializer = politica_prevencion_serializer.DetailPoliticaPrevencionSerializer(
            politicas_prevencion, many=True
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


##UPDATE
class UpdatePoliticaPrevencionApiView(generics.UpdateAPIView):
    permission_classes = [PersonalRH]
    queryset = Politica_prevencion.objects.all()
    serializer_class = politica_prevencion_serializer.UpdatePoliticaPrevencionSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'politica_prevencion_id'


##DELETE
class DeletePoliticaPrevencionApiView(generics.DestroyAPIView):
    permission_classes = [PersonalRH]
    queryset = Politica_prevencion.objects.all()
    serializer_class = politica_prevencion_serializer.DeletePoliticaPrevencionSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'politica_prevencion_id'