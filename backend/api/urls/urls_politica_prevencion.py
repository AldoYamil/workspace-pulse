from django.urls import path
from api.views import View_politica_prevencion

urlpatterns = [
    path('v1/politica_prevencion/create/', View_politica_prevencion.CreatePoliticaPrevencionApiView.as_view(), name="create_politica_prevencion"),
    path('v1/politica_prevencion/list/', View_politica_prevencion.ListPoliticaPrevencionApiView.as_view(), name="list_politica_prevencion"),
    path('v1/politica_prevencion/detail/<int:politica_prevencion_id>/', View_politica_prevencion.DetailPoliticaPrevencionApiView.as_view(), name="detail_politica_prevencion"),
    path('v1/politica_prevencion/update/<int:politica_prevencion_id>/', View_politica_prevencion.UpdatePoliticaPrevencionApiView.as_view(), name="update_politica_prevencion"),
    path('v1/politica_prevencion/delete/<int:politica_prevencion_id>/', View_politica_prevencion.DeletePoliticaPrevencionApiView.as_view(), name="delete_politica_prevencion")
]