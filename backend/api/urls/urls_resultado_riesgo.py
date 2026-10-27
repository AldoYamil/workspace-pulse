from django.urls import path
from api.views import view_resultado_riesgo

urlpatterns = [
    path('v1/resultado-riesgo/create/', view_resultado_riesgo.CreateResultadoRiesgoApiView.as_view(), name="create_resultado_riesgo"),
    path('v1/resultado-riesgo/list-by-campana/<int:campana_id>/', view_resultado_riesgo.ListResultadoRiesgoByCampanaApiView.as_view(), name="list_resultado_riesgo_by_campana"),
    path('v1/resultado-riesgo/list-by-area-campana/<int:campana_id>/<int:area_id>/', view_resultado_riesgo.ListResultadoRiesgoByAreaCampanaApiView.as_view(), name="list_resultado_riesgo_by_area_campana"),
]