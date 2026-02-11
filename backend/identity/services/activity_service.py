from django.contrib.auth import get_user_model
from ..models import UserActivityLog

User = get_user_model()

def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def log_user_activity(user, action, request, success=True, username_attempted=None, details=None):
    """
    Log user activity for security and audit purposes
    
    Args:
        user: User object (can be None for failed logins)
        action: Action string from UserActivityLog.ACTION_CHOICES
        request: Django request object
        success: Whether the action was successful
        username_attempted: Username attempted (for failed logins)
        details: Additional details as dictionary
    """
    UserActivityLog.objects.create(
        user=user,
        action=action,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        username_attempted=username_attempted or '',
        success=success,
        details=details or {}
    )

def log_login_attempt(username, request, success=True, user=None):
    """Log login attempt (successful or failed)"""
    if success and user:
        log_user_activity(user, 'LOGIN', request, success=True)
    else:
        log_user_activity(None, 'FAILED_LOGIN', request, success=False, 
                         username_attempted=username)

def log_logout(user, request):
    """Log user logout"""
    log_user_activity(user, 'LOGOUT', request)

def log_password_change(user, request):
    """Log password change"""
    log_user_activity(user, 'PASSWORD_CHANGE', request)

def log_profile_update(user, request, changed_fields=None):
    """Log profile update"""
    details = {'changed_fields': changed_fields or []}
    log_user_activity(user, 'PROFILE_UPDATE', request, details=details)

def log_password_reset(user, request):
    """Log password reset"""
    log_user_activity(user, 'PASSWORD_RESET', request)

def log_account_creation(user, request, created_by=None):
    """Log new account creation"""
    details = {'created_by': created_by.username if created_by else 'self'}
    log_user_activity(user, 'ACCOUNT_CREATED', request, details=details)

def log_account_status_change(user, request, activated, changed_by=None):
    """Log account activation/deactivation"""
    action = 'ACCOUNT_ACTIVATED' if activated else 'ACCOUNT_DEACTIVATED'
    details = {'changed_by': changed_by.username if changed_by else 'system'}
    log_user_activity(user, action, request, details=details)

def get_user_activity_logs(user=None, action=None, start_date=None, end_date=None, 
                          ip_address=None, limit=100):
    """
    Get user activity logs with filtering options
    
    Args:
        user: Filter by specific user
        action: Filter by action type
        start_date: Filter logs from this date
        end_date: Filter logs until this date
        ip_address: Filter by IP address
        limit: Maximum number of logs to return
    
    Returns:
        QuerySet of UserActivityLog objects
    """
    logs = UserActivityLog.objects.all()
    
    if user:
        logs = logs.filter(user=user)
    
    if action:
        logs = logs.filter(action=action)
    
    if start_date:
        logs = logs.filter(timestamp__gte=start_date)
    
    if end_date:
        logs = logs.filter(timestamp__lte=end_date)
    
    if ip_address:
        logs = logs.filter(ip_address=ip_address)
    
    return logs[:limit]

def get_failed_login_attempts(username=None, hours=24, ip_address=None):
    """
    Get failed login attempts for security monitoring
    
    Args:
        username: Filter by username
        hours: Look back this many hours
        ip_address: Filter by IP address
    
    Returns:
        QuerySet of failed login attempts
    """
    from django.utils import timezone
    import datetime
    
    time_threshold = timezone.now() - datetime.timedelta(hours=hours)
    
    logs = UserActivityLog.objects.filter(
        action='FAILED_LOGIN',
        timestamp__gte=time_threshold
    )
    
    if username:
        logs = logs.filter(username_attempted=username)
    
    if ip_address:
        logs = logs.filter(ip_address=ip_address)
    
    return logs

def get_suspicious_activity():
    """
    Get potentially suspicious activity for security monitoring
    
    Returns:
        Dictionary with suspicious activity metrics
    """
    from django.utils import timezone
    import datetime
    
    last_24h = timezone.now() - datetime.timedelta(hours=24)
    
    # Multiple failed logins from same IP
    failed_by_ip = {}
    for log in UserActivityLog.objects.filter(
        action='FAILED_LOGIN', 
        timestamp__gte=last_24h
    ):
        failed_by_ip[log.ip_address] = failed_by_ip.get(log.ip_address, 0) + 1
    
    suspicious_ips = {ip: count for ip, count in failed_by_ip.items() if count > 5}
    
    # Failed logins for same username
    failed_by_user = {}
    for log in UserActivityLog.objects.filter(
        action='FAILED_LOGIN',
        timestamp__gte=last_24h
    ):
        if log.username_attempted:
            failed_by_user[log.username_attempted] = failed_by_user.get(log.username_attempted, 0) + 1
    
    suspicious_users = {user: count for user, count in failed_by_user.items() if count > 3}
    
    return {
        'suspicious_ips': suspicious_ips,
        'suspicious_users': suspicious_users,
        'total_failed_logins_24h': len(UserActivityLog.objects.filter(
            action='FAILED_LOGIN', timestamp__gte=last_24h
        )),
        'unique_ips_24h': len(set(log.ip_address for log in UserActivityLog.objects.filter(
            timestamp__gte=last_24h
        ))),
    }
