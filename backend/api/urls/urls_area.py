from django.urls import path
from ..views import view_area 


urlpatterns = [
    path('v1/area/create/', view_area.CreateAreaApiView.as_view(), name = "create_area"),
    path('v1/area/list/', view_area.ListAreaApiView.as_view(), name = "list_area"),
    path('v1/area/detail/<int:id>', view_area.DetailAreaApiView.as_view(), name = "detail_area"),
    path('v1/area/update/<int:pk>', view_area.UpdateAreaApiView.as_view(), name = "update_area"),
    path('v1/area/delete/<int:pk>', view_area.DeleteAreaApiView.as_view(), name = "delete_area"),
]