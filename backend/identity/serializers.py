from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from .models import Notification


class AdminCreateUserSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=15)
    role = serializers.ChoiceField(choices=["SUPPLIER", "OPS"])

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data["username"]
        password = validated_data["password"]

        user = User.objects.create_user(
            username=username,
            password=password,
            email=validated_data.get("email", ""),
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            is_active=True,
        )

        role = validated_data["role"]
        phone = validated_data.get("phone")

        if not hasattr(user, "profile"):
            from .models import Profile

            Profile.objects.create(user=user, role=role, phone=phone or None)
        else:
            user.profile.role = role
            if phone is not None:
                user.profile.phone = phone or None
            user.profile.save()

        return user

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "username": instance.username,
            "email": instance.email,
            "first_name": instance.first_name,
            "last_name": instance.last_name,
            "is_active": instance.is_active,
            "role": getattr(getattr(instance, "profile", None), "role", None),
            "phone": getattr(getattr(instance, "profile", None), "phone", None),
        }


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "user", "notif_type", "message", "created_at", "is_read"]
        read_only_fields = ["id", "created_at"]
