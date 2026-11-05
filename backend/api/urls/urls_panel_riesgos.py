from django.urls import path
from api.views.view_panel_riesgos import PanelRiesgosView

urlpatterns = [
    path("v1/panel-riesgos/", PanelRiesgosView.as_view(), name="panel-riesgos"),
]