from django.urls import path
from ..views import view_guia_referencia 


urlpatterns = [
    path('v1/guiareferencia/create/', view_guia_referencia.CreateGuiaReferenciaApiView.as_view(), name = "create_guia_referencia"),
    path('v1/guiareferencia/list/', view_guia_referencia.ListGuiaReferenciaApiView.as_view(), name = "list_guia_referencia"),
    path('v1/guiareferencia/detail/<int:id>', view_guia_referencia.DetailGuiaReferenciaApiView.as_view(), name = "detail_guia_referencia"),
    path('v1/guiareferencia/update/<int:id>', view_guia_referencia.UpdateGuiaReferenciaApiView.as_view(), name = "update_guia_referencia"),
    path('v1/guiareferencia/delet/<int:id>', view_guia_referencia.DeleteGuiaReferenciaApiView.as_view(), name = "delete_guia_referencia"),
]