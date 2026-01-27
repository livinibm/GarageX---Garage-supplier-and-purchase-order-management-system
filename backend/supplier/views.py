from rest_framework import viewsets
from .models import Supplier, SparePart
from .serializers import SupplierSerializer, SparePartSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class SparePartViewSet(viewsets.ModelViewSet):
    queryset = SparePart.objects.all()
    serializer_class = SparePartSerializer

# Banuka Start

from .models import PurchaseOrder, PurchaseOrderItem, SparePart
from .serializers import PurchaseOrderSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from datetime import datetime
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
   #Ravindu
    def get_permissions(self):
        if getattr(self, 'action', None) in {'approve', 'reject', 'delivered'}:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
   #Ravindu

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        po = self.get_object()
        if po.status != 'Pending':
            return Response({'error': 'Only pending orders can be approved.'}, status=status.HTTP_400_BAD_REQUEST)
        po.status = 'Approved'
        # Use naive datetime to avoid timezone conversion
        from datetime import datetime, timedelta
        utc_now = datetime.utcnow()
        lk_time = utc_now + timedelta(hours=5, minutes=30)
        print(f"DEBUG: utc_now={utc_now}, lk_time={lk_time}")
        po.approved_at = lk_time
        po.save(update_fields=['status', 'approved_at'])
        po.refresh_from_db(fields=['approved_at'])
        print(f"DEBUG: Saved in DB: {po.approved_at}")
        return Response({'success': 'Purchase order approved.'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        po = self.get_object()
        if po.status != 'Pending':
            return Response({'error': 'Only pending orders can be rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        po.status = 'Rejected'
        po.save(update_fields=['status'])
        return Response({'success': 'Purchase order rejected.'})

    @action(detail=True, methods=['post'])
    def delivered(self, request, pk=None):
        low_stock_threshold = 5

        with transaction.atomic():
            try:
                po = PurchaseOrder.objects.select_for_update().get(pk=pk)
            except PurchaseOrder.DoesNotExist:
                return Response({'error': 'Purchase order not found.'}, status=status.HTTP_404_NOT_FOUND)

            if po.status == 'Delivered' or po.delivered_at is not None:
                return Response({'error': 'This purchase order was already delivered.'}, status=status.HTTP_400_BAD_REQUEST)

            if po.status != 'Approved':
                return Response({'error': 'Only approved orders can be marked as delivered.'}, status=status.HTTP_400_BAD_REQUEST)

            po.status = 'Delivered'
            # Use naive datetime to avoid timezone conversion
            from datetime import datetime, timedelta
            utc_now = datetime.utcnow()
            lk_time = utc_now + timedelta(hours=5, minutes=30)
            po.delivered_at = lk_time
            po.save(update_fields=['status', 'delivered_at'])

            items = list(
                PurchaseOrderItem.objects.select_related('spare_part').filter(purchase_order=po)
            )

            qty_by_part_id = {}
            for item in items:
                part_id = item.spare_part_id
                qty_by_part_id[part_id] = qty_by_part_id.get(part_id, 0) + item.quantity

            if qty_by_part_id:
                parts = list(
                    SparePart.objects.select_for_update().filter(part_id__in=qty_by_part_id.keys())
                )
                part_by_id = {p.part_id: p for p in parts}

                for part_id, qty in qty_by_part_id.items():
                    SparePart.objects.filter(part_id=part_id).update(
                        current_stock=F('current_stock') + qty
                    )

                for part_id in qty_by_part_id.keys():
                    part = part_by_id.get(part_id)
                    if part is None:
                        continue
                    part.refresh_from_db(fields=['current_stock'])
                    if part.current_stock <= low_stock_threshold:
                        print(
                            f"Low stock alert: {part.part_name} (ID: {part.part_id}) is at {part.current_stock} units!"
                        )

        return Response({'success': 'Purchase order marked as delivered and inventory updated.'})
# Banuka End