from django.urls import path
from ..views import view_campana_evaluacion 


urlpatterns = [
    path('v1/campana/create/', view_campana_evaluacion.CreateCampanaEvaluacionApiView.as_view(), name = "create_campana_evaluacionview_campana_evaluacion"),
    path('v1/campana/list/<int:guia_id>/<int:centro_id>', view_campana_evaluacion.ListCampanaEvaluacionApiView.as_view(), name = "list_campana_evaluacionview_campana_evaluacion"),
    path('v1/campana/detail/<int:guia_id>/<int:centro_id>', view_campana_evaluacion.DetailCampanaEvaluacionApiView.as_view(), name = "detail_campana_evaluacionview_campana_evaluacion"),
    path('v1/campana/update/<int:guia_id>/<int:centro_id>', view_campana_evaluacion.UpdateCampanaEvaluacionApiView.as_view(), name = "update_campana_evaluacionview_campana_evaluacion"),
    path('v1/campana/delet/<int:guia_id>/<int:centro_id>', view_campana_evaluacion.DeleteCampanaEvaluacionApiView.as_view(), name = "delete_campana_evaluacionview_campana_evaluacion"),
]