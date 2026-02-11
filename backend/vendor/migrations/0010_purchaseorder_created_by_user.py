# Generated manually for vendor purchase order auditing

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('supplier', '0009_seed_vendor_scores'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='created_by_user',
            field=models.ForeignKey(
                blank=True,
                null=True,
                db_column='created_by_user_id',
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='purchase_orders_created',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
