from django.urls import path
from ..views import view_asistencia_capacitacion


urlpatterns = [
    path('v1/asistencia/create/', view_asistencia_capacitacion.CreateAsistenciaCapacitacionApiView.as_view(), name = "create_asistencia"),
    path('v1/asistencia/list/', view_asistencia_capacitacion.ListAsistenciaCapacitacionApiView.as_view(), name = "list_asistencia"),
]