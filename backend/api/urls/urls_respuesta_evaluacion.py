from django.urls import path
from ..views import view_respuesta_evaluacion 


urlpatterns = [
    path('v1/respuesta/create/', view_respuesta_evaluacion.CreateRespuestaEvaluacionApiView.as_view(), name = "create_respuesta_evaluacionview_respuesta_evaluacion"),
    path('v1/respuesta/list/<int:campana_id>/<int:area_id>', view_respuesta_evaluacion.ListRespuestaEvaluacionApiView.as_view(), name = "list_respuesta_evaluacionview_respuesta_evaluacion"),
    path('v1/respuesta/detail/<int:campana_id>/<int:area_id>', view_respuesta_evaluacion.DetailRespuestaEvaluacionApiView.as_view(), name = "detail_respuesta_evaluacionview_respuesta_evaluacion"),
    path("v1/encuesta-publica/", view_respuesta_evaluacion.EncuestaPublicaDetalleView.as_view(), name="encuesta-publica-detalle"),
    path("v1/encuesta-publica/responder/", view_respuesta_evaluacion.ResponderEncuestaPublicaView.as_view(), name="encuesta-publica-responder"),
    path('v1/encuesta-publica/simular/', view_respuesta_evaluacion.SimularEncuestasMasivasView.as_view(), name='simular-encuestas'),
    path("encuesta-publica/validar-dominio/", view_respuesta_evaluacion.ValidarDominioEncuestaView.as_view(), name="validar-dominio-encuesta"),
]