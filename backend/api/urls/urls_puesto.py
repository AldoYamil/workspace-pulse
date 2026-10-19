from django.urls import path
from ..views import view_puesto 


urlpatterns = [
    path('v1/puesto/create/', view_puesto.CreatePuestoApiView.as_view(), name = "create_puesto"),
    path('v1/puesto/list/', view_puesto.ListPuestoApiView.as_view(), name = "list_puesto"),
    path('v1/puesto/detail/<int:id>', view_puesto.DetailPuestoApiView.as_view(), name = "detail_puesto"),
    path('v1/puesto/update/<int:pk>', view_puesto.UpdatePuestoApiView.as_view(), name = "update_puesto"),
    path('v1/puesto/delete/<int:pk>', view_puesto.DeletePuestoApiView.as_view(), name = "delete_puesto"),
]