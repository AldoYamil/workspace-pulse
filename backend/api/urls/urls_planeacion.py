from django.urls import path
from api.views import view_planeacion

urlpatterns = [
    path('v1/planeacion/list-create/', view_planeacion.ListCreatePlaneacionApiView.as_view(), name='list_create_planeacion'),
    path('v1/planeacion/update-delete/<int:pk>/', view_planeacion.UpdateDeletePlaneacionApiView.as_view(), name='update_delete_planeacion'),
]