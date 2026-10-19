from django.urls import path
from ..views import view_empresa 


urlpatterns = [
    path('v1/empresa/create/', view_empresa.CreateEmpresaApiView.as_view(), name = "create_empresa"),
    path('v1/empresa/list/', view_empresa.ListEmpresaApiView.as_view(), name = "list_empresa"),
    path('v1/empresa/detail/<int:id>', view_empresa.DetailEmpresaApiView.as_view(), name = "detail_empresa"),
    path('v1/empresa/update/<int:pk>', view_empresa.UpdateEmpresaApiView.as_view(), name = "update_empresa"),
    path('v1/empresa/delete/<int:pk>', view_empresa.DeleteEmpresaApiView.as_view(), name = "delete_empresa"),
]