# backend/api/urls/urls_planes_accion.py
from django.urls import path

from api.views.view_planes_accion import (
    AreasView,
    PlanAccionDetalleView,
    PlanesAccionView,
    RecomendacionesView,
)

urlpatterns = [
    path("v1/planes-accion/", PlanesAccionView.as_view(), name="planes-accion"),
    path("v1/planes-accion/recomendaciones/", RecomendacionesView.as_view(), name="planes-recomendaciones"),
    path("v1/planes-accion/areas/", AreasView.as_view(), name="planes-areas"),
    path("v1/planes-accion/<int:pk>/", PlanAccionDetalleView.as_view(), name="planes-accion-detalle"),
]
