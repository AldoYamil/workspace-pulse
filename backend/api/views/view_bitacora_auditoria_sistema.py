from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from accounts.permissions import PersonalRH, SoloGestion, CualquierRol

from api.serializers import bitacora_auditoria_sistema_serializer
from api.models.bitacora_auditoria_sistema_model import BitacoraAuditoriaSistema
from api.models.usuario_model import Usuario

##CREATE
class CreateBitacoraAuditoriaSistemaApiView(generics.CreateAPIView):
    permission_classes = [PersonalRH]
    queryset = BitacoraAuditoriaSistema.objects.all()
    serializer_class = bitacora_auditoria_sistema_serializer.CreateBitacoraAuditoriaSistemaSerializer

##READ
#List
class ListBitacoraAuditoriaSistemaApiView(APIView):
    permission_classes = [PersonalRH]

    def get(self, request):
        try:
            email_usuario = getattr(request.user, 'email', None)
            perfil = (
                Usuario.objects.select_related('centro_trabajo')
                .filter(email__iexact=email_usuario)
                .first()
                if email_usuario
                else None
            )

            if not perfil:
                if getattr(request.user, 'is_superuser', False):
                    registros = BitacoraAuditoriaSistema.objects.all()
                else:
                    return Response([], status=status.HTTP_200_OK)
            else:
                empresa_id = getattr(perfil, 'empresa_id', None) or (
                    perfil.centro_trabajo.empresa_id if getattr(perfil, 'centro_trabajo', None) else None
                )
                if not empresa_id:
                    return Response([], status=status.HTTP_200_OK)

                campos = {f.name: f for f in BitacoraAuditoriaSistema._meta.fields}
                if 'empresa' in campos:
                    registros = BitacoraAuditoriaSistema.objects.filter(empresa_id=empresa_id)
                elif 'usuario' in campos and campos['usuario'].related_model == Usuario:
                    registros = BitacoraAuditoriaSistema.objects.filter(
                        usuario__centro_trabajo__empresa_id=empresa_id
                    )
                else:
                    registros = BitacoraAuditoriaSistema.objects.all()

            data = bitacora_auditoria_sistema_serializer.ListBitacoraAuditoriaSistemaSerializer(
                registros, many=True
            ).data
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#Detail
class DetailBitacoraAuditoriaSistemaApiView(APIView):
    permission_classes = [PersonalRH]
    def get(self, request, id):
        usuario_logeado = request.user
        empresa_id = usuario_logeado.centrotrabajo.empresa_id
        bitacora_auditoria = BitacoraAuditoriaSistema.objects.filter(id=id,
            usuario__centrotrabajo__empresa_id=empresa_id
        )

        serializer = bitacora_auditoria_sistema_serializer.DetailBitacoraAuditoriaSistemaSerializer(bitacora_auditoria)
        return Response(serializer.data, status=status.HTTP_200_OK)