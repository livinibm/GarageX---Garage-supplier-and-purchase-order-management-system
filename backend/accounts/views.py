from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin
from .serializers import AdminCreateUserSerializer
from .models import Profile

class AdminCreateUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)

class AdminOnlyView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({
            "message": "Welcome Admin! You have access."
        })

class GarageOnlyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.profile.role != "GARAGE":
            return Response(
                {"detail": "Garage staff only."},
                status=403
            )

        return Response({
            "message": "Welcome Garage Staff!"
        })


class SupplierOnlyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.profile.role != "SUPPLIER":
            return Response(
                {"detail": "Suppliers only."},
                status=403
            )

        return Response({
            "message": "Welcome Supplier!"
        })