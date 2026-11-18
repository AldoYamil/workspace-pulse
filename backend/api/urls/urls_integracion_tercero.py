from django.urls import path
from ..views import view_integracion_tercero

urlpatterns = [
    path('v1/tercero/create/', view_integracion_tercero.CreateIntegracionTerceroApiView.as_view(), name = "create_tercero"),
    path('v1/tercero/list/', view_integracion_tercero.ListIntegracionTerceroApiView.as_view(), name = "list_tercero"),
    path('v1/tercero/detail/<int:id>', view_integracion_tercero.DetailIntegracionTerceroApiView.as_view(), name = "detail_tercero"),
    path('v1/tercero/update/<int:pk>', view_integracion_tercero.UpdateIntegracionTerceroApiView.as_view(), name = "update_tercero"),
    path('v1/tercero/delete/<int:pk>', view_integracion_tercero.DeleteIntegracionTerceroApiView.as_view(), name = "delete_tercero"),
]