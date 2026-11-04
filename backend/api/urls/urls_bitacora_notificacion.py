from django.urls import path
from ..views import view_bitacora_notificacion


urlpatterns = [
    path('v1/notificacion/create/', view_bitacora_notificacion.CreateBitacoraNotificacionApiView.as_view(), name = "create_notificacion"),
    path('v1/notificacion/list/', view_bitacora_notificacion.ListBitacoraNotificacionApiView.as_view(), name = "list_notificacion"),
]