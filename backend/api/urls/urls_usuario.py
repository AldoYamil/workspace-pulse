from django.urls import path
from ..views import view_usuario 


urlpatterns = [
    path('v1/usuario/create/', view_usuario.CreateUsuarioApiView.as_view(), name = "create_usuario"),
    path('v1/usuario/list/', view_usuario.ListUsuarioApiView.as_view(), name = "list_usuario"),
    path('v1/usuario/detail/<int:id>', view_usuario.DetailUsuarioApiView.as_view(), name = "detail_usuario"),
    path('v1/usuario/update/<int:pk>', view_usuario.UpdateUsuarioApiView.as_view(), name = "update_usuario"),
    path('v1/usuario/delete/<int:pk>', view_usuario.DeleteUsuarioApiView.as_view(), name = "delete_usuario"),
]