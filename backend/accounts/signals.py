from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    default_role = "ADMIN" if instance.is_superuser else "SUPPLIER"

    profile, _ = Profile.objects.get_or_create(
        user=instance,
        defaults={"role": default_role},
    )

    if not profile.role:
        profile.role = default_role
        profile.save()
