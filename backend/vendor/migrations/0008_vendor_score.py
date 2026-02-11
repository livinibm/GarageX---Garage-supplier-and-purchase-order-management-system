from django.db import migrations, models
import django.db.models.deletion
from decimal import Decimal


class Migration(migrations.Migration):

    dependencies = [
        ('supplier', '0007_remove_purchaseorder_created_by_user'),
    ]

    operations = [
        migrations.CreateModel(
            name='VendorScore',
            fields=[
                ('score_id', models.AutoField(primary_key=True, serialize=False, db_column='score_id')),
                ('score', models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), db_column='score')),
                ('on_time_rate', models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), db_column='on_time_rate')),
                ('avg_approval_hours', models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'), db_column='avg_approval_hours')),
                ('dispute_rate', models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), db_column='dispute_rate')),
                ('completion_rate', models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), db_column='completion_rate')),
                ('last_calculated_at', models.DateTimeField(auto_now=True, db_column='last_calculated_at')),
                ('supplier', models.OneToOneField(db_column='supplier_id', on_delete=django.db.models.deletion.CASCADE, related_name='vendor_score', to='supplier.supplier')),
            ],
            options={
                'db_table': 'vendor_scores',
            },
        ),
    ]
