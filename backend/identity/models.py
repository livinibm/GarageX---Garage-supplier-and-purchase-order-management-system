from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):

    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('OPS', 'Ops Manager'),
        ('SUPPLIER', 'Vendor'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone =models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class UserActivityLog(models.Model):
    """Track user activities for security and audit purposes"""
    
    ACTION_CHOICES = (
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('FAILED_LOGIN', 'Failed Login'),
        ('PASSWORD_CHANGE', 'Password Change'),
        ('PROFILE_UPDATE', 'Profile Update'),
        ('PASSWORD_RESET', 'Password Reset'),
        ('ACCOUNT_CREATED', 'Account Created'),
        ('ACCOUNT_ACTIVATED', 'Account Activated'),
        ('ACCOUNT_DEACTIVATED', 'Account Deactivated'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, 
                             help_text="User who performed the action (null for failed logins)")
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField(help_text="IP address of the request")
    user_agent = models.TextField(blank=True, help_text="Browser/client information")
    timestamp = models.DateTimeField(auto_now_add=True, help_text="When the action occurred")
    username_attempted = models.CharField(max_length=150, blank=True, 
                                        help_text="Username attempted (for failed logins)")
    success = models.BooleanField(default=True, help_text="Whether the action was successful")
    details = models.JSONField(default=dict, blank=True, help_text="Additional action details")
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "User Activity Log"
        verbose_name_plural = "User Activity Logs"
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['ip_address', 'timestamp']),
        ]
    
    def __str__(self):
        if self.user:
            return f"{self.user.username} - {self.action} at {self.timestamp}"
        return f"Anonymous - {self.action} at {self.timestamp}"


class Notification(models.Model):
    NOTIF_TYPE_CHOICES = (
        ('LOW_STOCK', 'Low Stock'),
        ('ORDER_APPROVED', 'Order Approved'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    notif_type = models.CharField(max_length=20, choices=NOTIF_TYPE_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notif_type}: {self.message[:40]}"
