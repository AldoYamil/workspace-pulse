from django.urls import path
from ..views import view_pregunta 


urlpatterns = [
    path('v1/pregunta/create/', view_pregunta.CreatePreguntaApiView.as_view(), name = "create_pregunta"),
    path('v1/pregunta/list/<int:guia_id>', view_pregunta.ListPreguntaApiView.as_view(), name = "list_pregunta"),
    path('v1/pregunta/detail/<int:guia_id>', view_pregunta.DetailPreguntaApiView.as_view(), name = "detail_pregunta"),
    path('v1/pregunta/update/<int:id>', view_pregunta.UpdatePreguntaApiView.as_view(), name = "update_pregunta"),
    path('v1/pregunta/delet/<int:id>', view_pregunta.DeletePreguntaApiView.as_view(), name = "delete_pregunta"),
]