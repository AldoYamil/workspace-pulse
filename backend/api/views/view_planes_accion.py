# backend/api/views/view_planes_accion.py
#
# GET   /api/v1/planes-accion/                  -> lista de planes + resumen por estado
# POST  /api/v1/planes-accion/                  -> crea un plan
# PATCH /api/v1/planes-accion/<id>/             -> cambia estado, responsable, fecha, etc.
# POST  /api/v1/planes-accion/recomendaciones/  -> recomendaciones de IA (Groq) para un área
# GET   /api/v1/planes-accion/areas/            -> áreas de tu empresa (para el selector)

from django.apps import apps
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.services.permisos import empresa_del_usuario, perfil_usuario
from api.services.planes_service import SinDatos, recomendar

ESTADOS = ("Pendiente", "En Proceso", "Completada")


def _m(nombre):
    return apps.get_model("api", nombre)


def _sin_empresa():
    return Response(
        {"detail": "Tu usuario no está asociado a ninguna empresa."},
        status=status.HTTP_403_FORBIDDEN,
    )


def _planes_de(empresa_id):
    qs = _m("Planeacion").objects.select_related(
        "resultado_riesgo__area__centro_trabajo", "usuario"
    )
    if empresa_id is not None:
        qs = qs.filter(resultado_riesgo__area__centro_trabajo__empresa_id=empresa_id)
    return qs


def _plan_json(plan):
    riesgo = plan.resultado_riesgo
    area = riesgo.area
    return {
        "id": plan.id,
        "titulo": plan.titulo,
        "descripcion_medida": plan.descripcion_medida,
        "fecha_compromiso": plan.fecha_compromiso.isoformat(),
        "estado": plan.estado,
        "resultado_riesgo": {
            "id": riesgo.id,
            "nivel_riesgo": riesgo.nivel_riesgo,
            "puntuacion_riesgo": riesgo.puntuacion_riesgo,
        },
        "area": {"id": area.id, "nombre": area.nombre},
        "centro_trabajo": {"id": area.centro_trabajo_id, "nombre": area.centro_trabajo.nombre},
        "responsable": {"id": plan.usuario_id, "nombre": plan.usuario.nombre},
    }


def _usuario_de_empresa(usuario_id, empresa_id):
    qs = _m("Usuario").objects.filter(id=usuario_id, activo=True)
    if empresa_id is not None:
        qs = qs.filter(empresa_id=empresa_id)
    return qs.first()


# ----------------------------------------------------------------------
# Serializers de entrada (solo validan lo que manda el frontend)
# ----------------------------------------------------------------------

class CrearPlanSerializer(serializers.Serializer):
    titulo = serializers.CharField(max_length=100)
    descripcion_medida = serializers.CharField()
    fecha_compromiso = serializers.DateField()
    resultado_riesgo = serializers.IntegerField(required=False)
    area = serializers.IntegerField(required=False)
    usuario = serializers.IntegerField(required=False)

    def validate(self, attrs):
        if "resultado_riesgo" not in attrs and "area" not in attrs:
            raise serializers.ValidationError("Indica 'resultado_riesgo' o 'area'.")
        return attrs


class ActualizarPlanSerializer(serializers.Serializer):
    titulo = serializers.CharField(max_length=100, required=False)
    descripcion_medida = serializers.CharField(required=False)
    fecha_compromiso = serializers.DateField(required=False)
    estado = serializers.ChoiceField(choices=ESTADOS, required=False)
    usuario = serializers.IntegerField(required=False)


class RecomendacionesSerializer(serializers.Serializer):
    area = serializers.IntegerField()
    meses = serializers.ChoiceField(choices=(1, 3, 6, 12), required=False, default=6)


# ----------------------------------------------------------------------
# Vistas
# ----------------------------------------------------------------------

class PlanesAccionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        empresa_id = empresa_del_usuario(request)
        if empresa_id == 0:
            return _sin_empresa()

        planes = _planes_de(empresa_id)
        if request.query_params.get("estado") in ESTADOS:
            planes = planes.filter(estado=request.query_params["estado"])
        if str(request.query_params.get("area", "")).isdigit():
            planes = planes.filter(resultado_riesgo__area_id=int(request.query_params["area"]))

        planes = planes.order_by("fecha_compromiso", "id")
        lista = [_plan_json(p) for p in planes]
        return Response({
            "resumen": {estado: sum(1 for p in lista if p["estado"] == estado) for estado in ESTADOS}
                       | {"total": len(lista)},
            "planes": lista,
        })

    def post(self, request):
        empresa_id = empresa_del_usuario(request)
        if empresa_id == 0:
            return _sin_empresa()

        datos = CrearPlanSerializer(data=request.data)
        datos.is_valid(raise_exception=True)
        d = datos.validated_data

        # Resultado de riesgo al que responde el plan
        riesgos = _m("ResultadoRiesgo").objects.all()
        if empresa_id is not None:
            riesgos = riesgos.filter(area__centro_trabajo__empresa_id=empresa_id)
        if "resultado_riesgo" in d:
            riesgo = riesgos.filter(id=d["resultado_riesgo"]).first()
        else:
            riesgo = riesgos.filter(area_id=d["area"]).order_by("-fecha_calculo").first()
        if riesgo is None:
            return Response(
                {"detail": "No hay un resultado de riesgo para esa área; no se puede crear el plan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Responsable: el indicado o, si no se manda, quien crea el plan
        if "usuario" in d:
            responsable = _usuario_de_empresa(d["usuario"], empresa_id)
        else:
            responsable = perfil_usuario(request)
        if responsable is None:
            return Response(
                {"detail": "Indica un responsable válido (usuario activo de tu empresa)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        plan = _m("Planeacion").objects.create(
            titulo=d["titulo"],
            descripcion_medida=d["descripcion_medida"],
            fecha_compromiso=d["fecha_compromiso"],
            estado="Pendiente",
            resultado_riesgo=riesgo,
            usuario=responsable,
        )
        plan = _planes_de(empresa_id).get(id=plan.id)
        return Response(_plan_json(plan), status=status.HTTP_201_CREATED)


class PlanAccionDetalleView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        empresa_id = empresa_del_usuario(request)
        if empresa_id == 0:
            return _sin_empresa()

        plan = _planes_de(empresa_id).filter(id=pk).first()
        if plan is None:
            return Response({"detail": "Plan no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        datos = ActualizarPlanSerializer(data=request.data, partial=True)
        datos.is_valid(raise_exception=True)
        d = datos.validated_data

        if "usuario" in d:
            responsable = _usuario_de_empresa(d["usuario"], empresa_id)
            if responsable is None:
                return Response(
                    {"detail": "Responsable no válido (debe ser un usuario activo de tu empresa)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            plan.usuario = responsable

        for campo in ("titulo", "descripcion_medida", "fecha_compromiso", "estado"):
            if campo in d:
                setattr(plan, campo, d[campo])
        plan.save()

        return Response(_plan_json(_planes_de(empresa_id).get(id=plan.id)))


class RecomendacionesView(APIView):
    """
    Body: {"area": <id>, "meses": 6}
    Devuelve recomendaciones generadas por IA (Groq) o, si no está disponible,
    del catálogo. Siempre indica el 'origen' para mostrarlo en pantalla.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        empresa_id = empresa_del_usuario(request)
        if empresa_id == 0:
            return _sin_empresa()

        datos = RecomendacionesSerializer(data=request.data)
        datos.is_valid(raise_exception=True)

        areas = _m("Area").objects.select_related("centro_trabajo")
        if empresa_id is not None:
            areas = areas.filter(centro_trabajo__empresa_id=empresa_id)
        area = areas.filter(id=datos.validated_data["area"]).first()
        if area is None:
            return Response({"detail": "Área no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        try:
            return Response(recomendar(area, int(datos.validated_data["meses"])))
        except SinDatos as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class AreasView(APIView):
    """Áreas de la empresa del usuario, para el selector de recomendaciones."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        empresa_id = empresa_del_usuario(request)
        if empresa_id == 0:
            return _sin_empresa()

        areas = _m("Area").objects.select_related("centro_trabajo").order_by("centro_trabajo__nombre", "nombre")
        if empresa_id is not None:
            areas = areas.filter(centro_trabajo__empresa_id=empresa_id)

        return Response([
            {
                "id": area.id,
                "nombre": area.nombre,
                "centro_trabajo": {"id": area.centro_trabajo_id, "nombre": area.centro_trabajo.nombre},
            }
            for area in areas
        ])
