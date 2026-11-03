from django.urls import path
from api.views import view_touchpoint

urlpatterns = [
    path('v1/touchpoint/create/', view_touchpoint.CreateTouchpointApiView.as_view(), name="create_touchpoint"),
    path('v1/touchpoint/list/', view_touchpoint.ListTouchpointApiView.as_view(), name="list_touchpoint"),
    path('v1/touchpoint/detail/<int:touchpoint_id>/', view_touchpoint.DetailTouchpointApiView.as_view(), name="detail_touchpoint"),
    path('v1/touchpoint/update/<int:touchpoint_id>/', view_touchpoint.UpdateTouchpointApiView.as_view(), name="update_touchpoint"),
    path('v1/touchpoint/delete/<int:touchpoint_id>/', view_touchpoint.DeleteTouchpointApiView.as_view(), name="delete_touchpoint")
]