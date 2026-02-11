from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction
from django.utils import timezone
from vendor.models import Supplier, PurchaseOrder, VendorScore


def _to_decimal(value):
    return Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def _clamp_score(value):
    return max(0, min(100, value))


@transaction.atomic
def calculate_vendor_scores():
    results = []
    suppliers = Supplier.objects.all()

    for supplier in suppliers:
        orders = PurchaseOrder.objects.filter(supplier=supplier)
        total_orders = orders.count()

        delivered_orders = orders.filter(status='Delivered').exclude(delivered_at__isnull=True)
        delivered_count = delivered_orders.count()

        completion_rate = (delivered_count / total_orders * 100) if total_orders else 0

        on_time_total = 0
        on_time_count = 0
        for order in delivered_orders.exclude(expected_delivery_date__isnull=True):
            on_time_total += 1
            if order.delivered_at.date() <= order.expected_delivery_date:
                on_time_count += 1
        on_time_rate = (on_time_count / on_time_total * 100) if on_time_total else 0

        approval_hours = []
        for order in orders.exclude(approved_at__isnull=True).exclude(order_date__isnull=True):
            delta = order.approved_at - order.order_date
            approval_hours.append(delta.total_seconds() / 3600)
        avg_approval_hours = sum(approval_hours) / len(approval_hours) if approval_hours else 0

        dispute_rate = 0

        approval_score = _clamp_score(100 - avg_approval_hours)
        score = (
            (on_time_rate * 0.45)
            + (completion_rate * 0.35)
            + (approval_score * 0.20)
            - (dispute_rate * 0.10)
        )
        score = _clamp_score(score)

        vendor_score, _ = VendorScore.objects.get_or_create(supplier=supplier)
        vendor_score.score = _to_decimal(score)
        vendor_score.on_time_rate = _to_decimal(on_time_rate)
        vendor_score.avg_approval_hours = _to_decimal(avg_approval_hours)
        vendor_score.dispute_rate = _to_decimal(dispute_rate)
        vendor_score.completion_rate = _to_decimal(completion_rate)
        vendor_score.last_calculated_at = timezone.now()
        vendor_score.save()

        results.append({
            'supplier_id': supplier.supplier_id,
            'supplier_name': supplier.supplier_name,
            'score': str(vendor_score.score)
        })

    return results
