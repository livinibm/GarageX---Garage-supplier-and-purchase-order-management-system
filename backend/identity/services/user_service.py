from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .activity_service import (
    log_login_attempt, log_logout, log_password_change,
    log_profile_update, log_password_reset, log_account_creation,
    log_account_status_change
)

User = get_user_model()

def authenticate_user(username, password, request):
    """Authenticate user and return JWT tokens with activity logging"""
    user = authenticate(username=username, password=password)
    
    if user:
        # Log successful login
        log_login_attempt(username, request, success=True, user=user)
        
        refresh = RefreshToken.for_user(user)
        return {
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.profile.role,
                'phone': user.profile.phone
            }
        }
    else:
        # Log failed login attempt
        log_login_attempt(username, request, success=False)
        return None

def get_user_profile(user):
    """Get user profile with role-specific data"""
    profile_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.profile.role,
        'phone': user.profile.phone,
        'date_joined': user.date_joined,
        'is_active': user.is_active
    }
    
    # Add role-specific data
    if user.profile.role == 'OPS':
        profile_data['ops_info'] = get_ops_details(user)
    elif user.profile.role == 'SUPPLIER':
        profile_data['supplier_info'] = get_supplier_details(user)
    
    return profile_data

def create_user(user_data, admin_user, request):
    """Create new user with profile (admin only) with activity logging"""
    if admin_user.profile.role != 'ADMIN':
        raise PermissionError("Only admins can create users")
    
    user = User.objects.create_user(
        username=user_data['username'],
        email=user_data['email'],
        password=user_data['password']
    )
    
    Profile.objects.create(
        user=user,
        phone=user_data['phone'],
        role=user_data['role']
    )
    
    # Log account creation
    log_account_creation(user, request, created_by=admin_user)
    
    return user

def update_user_profile(user, profile_data, request):
    """Update user profile with activity logging"""
    changed_fields = []
    
    # Track what fields are being changed
    if 'phone' in profile_data and profile_data['phone'] != user.profile.phone:
        changed_fields.append('phone')
        user.profile.phone = profile_data['phone']
    
    if 'email' in profile_data and profile_data['email'] != user.email:
        changed_fields.append('email')
        user.email = profile_data['email']
    
    if 'first_name' in profile_data and profile_data['first_name'] != user.first_name:
        changed_fields.append('first_name')
        user.first_name = profile_data['first_name']
    
    if 'last_name' in profile_data and profile_data['last_name'] != user.last_name:
        changed_fields.append('last_name')
        user.last_name = profile_data['last_name']
    
    # Save changes
    user.save()
    user.profile.save()
    
    # Log profile update if there were changes
    if changed_fields:
        log_profile_update(user, request, changed_fields)
    
    return user

def change_user_password(user, new_password, request):
    """Change user password with activity logging"""
    user.set_password(new_password)
    user.save()
    
    # Log password change
    log_password_change(user, request)
    
    return user

def reset_user_password(user, new_password, admin_user, request):
    """Reset user password by admin with activity logging"""
    user.set_password(new_password)
    user.save()
    
    # Log password reset
    log_password_reset(user, request)
    
    return user

def toggle_user_status(user, admin_user, request):
    """Toggle user active status with activity logging"""
    user.is_active = not user.is_active
    user.save()
    
    # Log account status change
    log_account_status_change(user, request, user.is_active, changed_by=admin_user)
    
    return user

def logout_user(user, request):
    """Log user logout"""
    log_logout(user, request)

# Helper functions for role-specific data
def get_ops_details(user):
    """Get ops-specific details for user"""
    # This would typically fetch ops-specific information
    return {
        'department': 'Operations',
        'access_level': 'Full Ops Access'
    }

def get_supplier_details(user):
    """Get supplier-specific details for user"""
    # This would typically fetch supplier-specific information
    return {
        'supplier_type': 'Parts Supplier',
        'access_level': 'Supplier Portal'
    }
