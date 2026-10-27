from django.urls import path
from api.views import view_configuracion_umbral

urlpatterns = [
    path('v1/configuracionumbral/create/', view_configuracion_umbral.CreateConfiguracionUmbralApiView.as_view(), name="create_configuracion_umbral"),
    path('v1/configuracionumbral/list/', view_configuracion_umbral.ListConfiguracionUmbralApiView.as_view(), name="list_configuracion_umbral"),
    path('v1/configuracionumbral/by-centro/<int:centro_id>/', view_configuracion_umbral.ListConfiguracionUmbralApiView.as_view(), name="list_configuracion_umbral_by_centro"),
    path('v1/configuracionumbral/detail/<int:id>/', view_configuracion_umbral.DetailConfiguracionUmbralApiView.as_view(), name="detail_configuracion_umbral"),
    path('v1/configuracionumbral/update/<int:pk>/', view_configuracion_umbral.UpdateConfiguracionUmbralApiView.as_view(), name="update_configuracion_umbral"),
    path('v1/configuracionumbral/delete/<int:pk>/', view_configuracion_umbral.DeleteConfiguracionUmbralApiView.as_view(), name="delete_configuracion_umbral"),
]