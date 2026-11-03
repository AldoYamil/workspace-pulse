from django.urls import path
from api.views import view_recomendacion_catalogo

urlpatterns = [
    path('v1/recomendacion_catalogo/create/', view_recomendacion_catalogo.CreateRecomendacionCatalogoApiView.as_view(), name="create_recomendacion_catalogo"),
    path('v1/recomendacion_catalogo/list/', view_recomendacion_catalogo.ListRecomendacionCatalogoApiView.as_view(), name="list_recomendacion_catalogo"),
]