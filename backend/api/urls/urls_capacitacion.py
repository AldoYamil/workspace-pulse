from django.urls import path
from api.views import view_capacitacion

urlpatterns = [
    path('v1/capacitacion/create/', view_capacitacion.CreateCapacitacionApiView.as_view(), name="create_capacitacion"),
    path('v1/capacitacion/list/', view_capacitacion.ListCapacitacionApiView.as_view(), name="list_capacitacion"),
    path('v1/capacitacion/detail/<int:id>', view_capacitacion.DetailCapacitacionApiView.as_view(), name="detail_capacitacion"),
    path('v1/capacitacion/update/<int:id>', view_capacitacion.UpdateCapacitacionApiView.as_view(), name="update_capacitacion"),
    path('v1/capacitacion/delete/<int:id>', view_capacitacion.DeleteCapacitacionApiView.as_view(), name="delete_capacitacion"),
]