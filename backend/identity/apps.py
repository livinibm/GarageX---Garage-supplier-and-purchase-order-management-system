from django.apps import AppConfig


class IdentityConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'identity'
    label = 'accounts'
    verbose_name = 'Identity'

    def ready(self):
        import identity.signals
