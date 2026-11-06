from django.urls import path
from ..views import view_metrica_rendimiento_rh


urlpatterns = [
    path('v1/metricarh/create/', view_metrica_rendimiento_rh.CreateMetricaRHApiView.as_view(), name = "create_metricarh"),
    path('v1/metricarh/list/', view_metrica_rendimiento_rh.ListMetricaRHApiView.as_view(), name = "list_metricarh"),
]