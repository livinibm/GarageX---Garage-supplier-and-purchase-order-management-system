from django.core.management.base import BaseCommand
from vendor.services.vendor_score_service import calculate_vendor_scores


class Command(BaseCommand):
    help = "Calculate vendor score metrics from order history."

    def handle(self, *args, **options):
        results = calculate_vendor_scores()
        self.stdout.write(self.style.SUCCESS(f"Updated {len(results)} vendor scores."))
