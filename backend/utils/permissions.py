from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """Only allow admin users"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.role == "ADMIN"
        )

class IsOpsStaff(BasePermission):
    """Only allow ops staff users"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.role == "OPS"
        )

class IsSupplier(BasePermission):
    """Only allow supplier users"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.role == "SUPPLIER"
        )

class IsAdminOrOpsStaff(BasePermission):
    """Allow admin or ops staff users"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.role in ["ADMIN", "OPS"]
        )

class IsAdminOrSupplier(BasePermission):
    """Allow admin or supplier users"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.role in ["ADMIN", "SUPPLIER"]
        )

class IsOwnerOrReadOnly(BasePermission):
    """Allow owners to edit, others to read only"""
    def has_object_permission(self, request, view, obj):
        # Read permissions for any authenticated user
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write permissions only for object owner
        return obj.owner == request.user
