from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('supplier', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='approved_at',
            field=models.DateTimeField(blank=True, db_column='approved_at', null=True),
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='delivered_at',
            field=models.DateTimeField(blank=True, db_column='delivered_at', null=True),
        ),
    ]
