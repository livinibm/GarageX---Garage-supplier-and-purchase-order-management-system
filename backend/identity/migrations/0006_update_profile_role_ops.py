from django.db import migrations


def update_roles_to_ops(apps, schema_editor):
    Profile = apps.get_model('accounts', 'Profile')
    Profile.objects.filter(role='OPS_LEGACY').update(role='OPS')


def revert_roles_to_legacy(apps, schema_editor):
    Profile = apps.get_model('accounts', 'Profile')
    Profile.objects.filter(role='OPS').update(role='OPS_LEGACY')


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_notification'),
    ]

    operations = [
        migrations.RunPython(update_roles_to_ops, revert_roles_to_legacy),
    ]
