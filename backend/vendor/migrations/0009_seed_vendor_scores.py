from django.db import migrations


def seed_vendor_scores(apps, schema_editor):
    Supplier = apps.get_model('supplier', 'Supplier')
    VendorScore = apps.get_model('supplier', 'VendorScore')

    for supplier in Supplier.objects.all():
        VendorScore.objects.get_or_create(supplier=supplier)


class Migration(migrations.Migration):

    dependencies = [
        ('supplier', '0008_vendor_score'),
    ]

    operations = [
        migrations.RunPython(seed_vendor_scores, migrations.RunPython.noop),
    ]
