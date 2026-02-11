from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .permissions import IsAdmin
from .serializers import AdminCreateUserSerializer, NotificationSerializer
from .models import Profile, Notification
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

User = get_user_model()


def _get_profile(user):
    return getattr(user, 'profile', None)

class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = _get_profile(request.user)
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "is_active": request.user.is_active,
            "role": profile.role if profile else None,
            "phone": profile.phone if profile else None
        })

class UsersView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.all()
        users_data = []
        for user in users:
            profile = _get_profile(user)
            users_data.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "role": profile.role if profile else None,
                "phone": profile.phone if profile else None
            })
        return Response(users_data)

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

class OpsOnlyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = _get_profile(request.user)
        if not profile or profile.role != "OPS":
            return Response(
                {"detail": "Ops staff only."},
                status=403
            )

        return Response({
            "message": "Welcome Ops Team!"
        })


class SupplierOnlyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = _get_profile(request.user)
        if not profile or profile.role != "SUPPLIER":
            return Response(
                {"detail": "Vendors only."},
                status=403
            )

        return Response({
            "message": "Welcome Vendor!"
        })

# Admin User Management Views
class AdminUserManagementView(APIView):
    """Admin-only user management endpoints"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        """Create new user (Ops Manager / Vendor)"""
        serializer = AdminCreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "success": True,
            "message": "User created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        """View all users with roles"""
        users = User.objects.all().select_related('profile')
        users_data = []
        for user in users:
            profile = _get_profile(user)
            users_data.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "role": profile.role if profile else None,
                "phone": profile.phone if profile else None,
                "date_joined": user.date_joined,
                "last_login": user.last_login
            })
        return Response({
            "success": True,
            "message": "Users retrieved successfully",
            "data": users_data
        })

class AdminUserToggleView(APIView):
    """Activate / deactivate user accounts"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, user_id):
        """Toggle user active status"""
        try:
            user = User.objects.get(id=user_id)
            # Prevent admin from deactivating themselves
            if user.id == request.user.id:
                return Response({
                    "success": False,
                    "message": "Cannot deactivate your own account"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.is_active = not user.is_active
            user.save()
            
            action = "activated" if user.is_active else "deactivated"
            return Response({
                "success": True,
                "message": f"User {user.username} {action} successfully",
                "data": {
                    "id": user.id,
                    "username": user.username,
                    "is_active": user.is_active
                }
            })
        except User.DoesNotExist:
            return Response({
                "success": False,
                "message": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)

class AdminPasswordResetView(APIView):
    """Reset user passwords"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        """Reset user password"""
        try:
            user = User.objects.get(id=user_id)
            new_password = request.data.get('new_password')
            
            if not new_password:
                return Response({
                    "success": False,
                    "message": "New password is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if len(new_password) < 8:
                return Response({
                    "success": False,
                    "message": "Password must be at least 8 characters long"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            
            return Response({
                "success": True,
                "message": f"Password for {user.username} has been reset successfully",
                "data": {
                    "id": user.id,
                    "username": user.username
                }
            })
        except User.DoesNotExist:
            return Response({
                "success": False,
                "message": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only show notifications for the current user
        return Notification.objects.filter(user=self.request.user)
