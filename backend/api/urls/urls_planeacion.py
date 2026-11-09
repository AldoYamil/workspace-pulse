from django.urls import path
from api.views import view_planeacion

urlpatterns = [
    path('v1/planeacion/create/', view_planeacion.CreatePlaneacionApiView.as_view(), name="create_planeacion"),
    path('v1/planeacion/list/', view_planeacion.ListPlaneacionApiView.as_view(), name="list_planeacion"),
    path('v1/planeacion/detail/<int:id>', view_planeacion.DetailPlaneacionApiView.as_view(), name="detail_planeacion"),
    path('v1/planeacion/update/<int:id>', view_planeacion.UpdatePlaneacionApiView.as_view(), name="update_planeacion"),
    path('v1/planeacion/delete/<int:id>', view_planeacion.DeletePlaneacionApiView.as_view(), name="delete_planeacion"),
    path('v1/planeacion/list-create/', view_planeacion.ListCreatePlaneacionApiView.as_view(), name='list_create_planeacion'),
    path('v1/planeacion/update-delete/<int:pk>/', view_planeacion.UpdateDeletePlaneacionApiView.as_view(), name='update_delete_planeacion'),
]