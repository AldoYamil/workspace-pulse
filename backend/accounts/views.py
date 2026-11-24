from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import CualquierRol


class MeView(APIView):
    permission_classes = [CualquierRol]

    def get(self, request):
        return Response({"email": request.user.email, "rol": request.user.rol})