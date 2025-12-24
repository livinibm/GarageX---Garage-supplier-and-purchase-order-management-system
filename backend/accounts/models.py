from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):

    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('GARAGE', 'Garage Staff'),
        ('SUPPLIER', 'Supplier'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone =models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
