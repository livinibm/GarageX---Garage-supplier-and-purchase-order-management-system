from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import models
from .permissions import IsAdmin
from .models import UserActivityLog
from .services.activity_service import (
    get_user_activity_logs, get_failed_login_attempts, 
    get_suspicious_activity
)

User = get_user_model()

# Admin Activity Log Views
class AdminActivityLogsView(APIView):
    """Admin-only access to user activity logs"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """Get user activity logs with filtering options"""
        # Parse query parameters
        user_id = request.query_params.get('user_id')
        action = request.query_params.get('action')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        ip_address = request.query_params.get('ip_address')
        limit = int(request.query_params.get('limit', 100))
        
        # Convert user_id to User object if provided
        user = None
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({
                    "success": False,
                    "message": "User not found"
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Convert date strings to datetime objects
        start_dt = None
        end_dt = None
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            except ValueError:
                return Response({
                    "success": False,
                    "message": "Invalid start_date format. Use ISO format."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            except ValueError:
                return Response({
                    "success": False,
                    "message": "Invalid end_date format. Use ISO format."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get logs with filters
        logs = get_user_activity_logs(
            user=user,
            action=action,
            start_date=start_dt,
            end_date=end_dt,
            ip_address=ip_address,
            limit=limit
        )
        
        # Format logs for response
        logs_data = []
        for log in logs:
            log_data = {
                'id': log.id,
                'user': {
                    'id': log.user.id,
                    'username': log.user.username
                } if log.user else None,
                'action': log.action,
                'ip_address': log.ip_address,
                'user_agent': log.user_agent,
                'timestamp': log.timestamp,
                'username_attempted': log.username_attempted,
                'success': log.success,
                'details': log.details
            }
            logs_data.append(log_data)
        
        return Response({
            "success": True,
            "message": "Activity logs retrieved successfully",
            "data": logs_data,
            "filters_applied": {
                "user_id": user_id,
                "action": action,
                "start_date": start_date,
                "end_date": end_date,
                "ip_address": ip_address,
                "limit": limit
            }
        })

class AdminFailedLoginsView(APIView):
    """Admin-only access to failed login attempts"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """Get failed login attempts for security monitoring"""
        username = request.query_params.get('username')
        hours = int(request.query_params.get('hours', 24))
        ip_address = request.query_params.get('ip_address')
        
        failed_attempts = get_failed_login_attempts(
            username=username,
            hours=hours,
            ip_address=ip_address
        )
        
        # Format failed attempts
        attempts_data = []
        for attempt in failed_attempts:
            attempt_data = {
                'id': attempt.id,
                'username_attempted': attempt.username_attempted,
                'ip_address': attempt.ip_address,
                'user_agent': attempt.user_agent,
                'timestamp': attempt.timestamp,
                'details': attempt.details
            }
            attempts_data.append(attempt_data)
        
        return Response({
            "success": True,
            "message": "Failed login attempts retrieved successfully",
            "data": attempts_data,
            "filters_applied": {
                "username": username,
                "hours": hours,
                "ip_address": ip_address
            }
        })

class AdminSuspiciousActivityView(APIView):
    """Admin-only access to suspicious activity monitoring"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """Get suspicious activity metrics"""
        suspicious = get_suspicious_activity()
        
        return Response({
            "success": True,
            "message": "Suspicious activity data retrieved successfully",
            "data": suspicious
        })

class AdminActivityStatsView(APIView):
    """Admin-only access to activity statistics"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """Get activity statistics for dashboard"""
        days = int(request.query_params.get('days', 7))
        start_date = timezone.now() - timedelta(days=days)
        
        # Get statistics
        total_logs = UserActivityLog.objects.filter(timestamp__gte=start_date).count()
        
        login_count = UserActivityLog.objects.filter(
            action='LOGIN', 
            timestamp__gte=start_date
        ).count()
        
        logout_count = UserActivityLog.objects.filter(
            action='LOGOUT', 
            timestamp__gte=start_date
        ).count()
        
        failed_login_count = UserActivityLog.objects.filter(
            action='FAILED_LOGIN', 
            timestamp__gte=start_date
        ).count()
        
        # Unique users who logged in
        unique_logins = UserActivityLog.objects.filter(
            action='LOGIN',
            timestamp__gte=start_date
        ).values('user').distinct().count()
        
        # Top IPs by activity
        top_ips = UserActivityLog.objects.filter(
            timestamp__gte=start_date
        ).values('ip_address').annotate(
            count=models.Count('ip_address')
        ).order_by('-count')[:10]
        
        # Activity by action type
        action_stats = UserActivityLog.objects.filter(
            timestamp__gte=start_date
        ).values('action').annotate(
            count=models.Count('action')
        ).order_by('-count')
        
        return Response({
            "success": True,
            "message": "Activity statistics retrieved successfully",
            "data": {
                "period_days": days,
                "total_activities": total_logs,
                "successful_logins": login_count,
                "successful_logouts": logout_count,
                "failed_logins": failed_login_count,
                "unique_users_logged_in": unique_logins,
                "top_ip_addresses": list(top_ips),
                "activity_by_action": list(action_stats)
            }
        })
