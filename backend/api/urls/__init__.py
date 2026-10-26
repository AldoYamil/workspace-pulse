from django.urls import path, include
app_name = "api"

urlpatterns = [
    path('', include('api.urls.urls_empresa')),
    path('', include('api.urls.urls_area')),
    path('', include('api.urls.urls_centro_trabajo')),
    path('', include('api.urls.urls_puesto')),
    path('', include('api.urls.urls_usuario')),
    path('', include('api.urls.urls_guia_referencia')),
]