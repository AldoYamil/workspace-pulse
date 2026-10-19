from django.urls import path
from ..views import view_centro_trabajo


urlpatterns = [
    path('v1/centrotrabajo/create/', view_centro_trabajo.CreateCentroTrabajoApiView.as_view(), name = "create_centro_trabajo"),
    path('v1/centrotrabajo/list/', view_centro_trabajo.ListCentroTrabajoApiView.as_view(), name = "list_centro_trabajo"),
    path('v1/centrotrabajo/detail/<int:id>', view_centro_trabajo.DetailCentroTrabajoApiView.as_view(), name = "detail_centro_trabajo"),
    path('v1/centrotrabajo/update/<int:pk>', view_centro_trabajo.UpdateCentroTrabajoApiView.as_view(), name = "update_centro_trabajo"),
    path('v1/centrotrabajo/delete/<int:pk>', view_centro_trabajo.DeleteCentroTrabajoApiView.as_view(), name = "delete_centro_trabajo"),
]