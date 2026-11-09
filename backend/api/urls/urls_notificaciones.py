# backend/api/urls/urls_notificaciones.py
from django.urls import path

from api.views.view_notificaciones import EvaluarAlertasView, PruebaCorreoView

urlpatterns = [
    path("v1/alertas/evaluar/", EvaluarAlertasView.as_view(), name="alertas-evaluar"),
    path("v1/notificaciones/prueba/", PruebaCorreoView.as_view(), name="notificaciones-prueba"),
]
