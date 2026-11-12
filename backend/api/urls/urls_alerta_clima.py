from django.urls import path
from ..views import view_alerta_clima


urlpatterns = [
    path('v1/alerta-clima/create/', view_alerta_clima.CreateAlertaClimaApiView.as_view(), name="create_alerta_clima"),
    path('v1/alerta-clima/list/', view_alerta_clima.ListAlertaClimaApiView.as_view(), name="list_alerta_clima"),
    path('v1/alerta-clima/list-no-resueltas/', view_alerta_clima.ListAlertaClimaNoResueltasApiView.as_view(), name="list_no_resueltas_alerta_clima"),
    path('v1/alerta-clima/detail/<int:pk>', view_alerta_clima.DetailAlertaClimaApiView.as_view(), name="detail_alerta_clima"),
    path('v1/alerta-clima/update/<int:pk>', view_alerta_clima.UpdateAlertaClimaApiView.as_view(), name="update_alerta_clima"),
]