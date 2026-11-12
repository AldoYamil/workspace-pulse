from django.urls import path
from ..views import view_bitacora_auditoria_sistema


urlpatterns = [
    path('v1/bitacora/create/', view_bitacora_auditoria_sistema.CreateBitacoraAuditoriaSistemaApiView.as_view(), name = "create_bitacora"),
    path('v1/bitacora/list/', view_bitacora_auditoria_sistema.ListBitacoraAuditoriaSistemaApiView.as_view(), name = "list_bitacora"),
    path('v1/bitacora/detail/<int:id>', view_bitacora_auditoria_sistema.DetailBitacoraAuditoriaSistemaApiView.as_view(), name = "detail_bitacora"),
]