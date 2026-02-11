from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from identity.permissions import IsAdmin
from .models import Supplier, SparePart, SupplierPayment, PurchaseOrder, PurchaseOrderItem, PurchaseInvoice, VendorScore
from .serializers import SupplierSerializer, SparePartSerializer, SupplierPaymentSerializer, PurchaseOrderSerializer, PurchaseInvoiceSerializer, VendorScoreSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.db import transaction
from datetime import datetime
from django.utils import timezone
from identity.models import Notification, Profile
from django.contrib.auth.models import User

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.select_related('vendor_score').all()
    serializer_class = SupplierSerializer

class SparePartViewSet(viewsets.ModelViewSet):
    queryset = SparePart.objects.all()
    serializer_class = SparePartSerializer

class SupplierPaymentViewSet(viewsets.ModelViewSet):
    queryset = SupplierPayment.objects.all()
    serializer_class = SupplierPaymentSerializer


class VendorScoreViewSet(viewsets.ModelViewSet):
    queryset = VendorScore.objects.select_related('supplier').all()
    serializer_class = VendorScoreSerializer

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def recalculate(self, request):
        from .services.vendor_score_service import calculate_vendor_scores
        results = calculate_vendor_scores()
        return Response({
            'updated': len(results),
            'vendors': results
        })

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer

    def perform_create(self, serializer):
        serializer.save(created_by_user=self.request.user)
    def get_permissions(self):
        if getattr(self, 'action', None) in {'approve', 'reject', 'delivered'}:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        po = self.get_object()
        if po.status != 'Pending':
            return Response({'error': 'Only pending orders can be approved.'}, status=status.HTTP_400_BAD_REQUEST)
        po.status = 'Approved'
        po.approved_at = timezone.now()
        po.save(update_fields=['status', 'approved_at'])
        po.refresh_from_db(fields=['approved_at'])
        # Notify supplier
        supplier_user = None
        if hasattr(po.supplier, 'user'):
            supplier_user = po.supplier.user
        elif hasattr(po.supplier, 'contact_email'):
            supplier_user = User.objects.filter(email=po.supplier.contact_email).first()
        if supplier_user:
            Notification.objects.create(
                user=supplier_user,
                notif_type='ORDER_APPROVED',
                message=f"Your purchase order {po.po_reference_number} has been approved."
            )
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
            po.delivered_at = timezone.now()
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
                        # Create notification for all admins
                        admins = User.objects.filter(profile__role='ADMIN')
                        for admin in admins:
                            Notification.objects.create(
                                user=admin,
                                notif_type='LOW_STOCK',
                                message=f"Low stock alert: {part.part_name} (ID: {part.part_id}) is at {part.current_stock} units!"
                            )

        return Response({'success': 'Purchase order marked as delivered and inventory updated.'})

class PurchaseInvoiceViewSet(viewsets.ModelViewSet):
    queryset = PurchaseInvoice.objects.all()
    serializer_class = PurchaseInvoiceSerializer

class ReportViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'])
    def monthly_purchases(self, request):
        from datetime import datetime, timedelta
        filter_type = request.query_params.get('filter_type', 'month')
        date_str = request.query_params.get('date')
        try:
            base_date = datetime.strptime(date_str, '%Y-%m-%d') if date_str else datetime.now()
        except Exception:
            base_date = datetime.now()
        qs = PurchaseOrder.objects.all()
        period = ''
        if filter_type == 'day':
            qs = qs.filter(order_date__date=base_date.date())
            period = base_date.strftime('%Y-%m-%d')
        elif filter_type == 'week':
            start = base_date - timedelta(days=base_date.weekday())
            end = start + timedelta(days=6)
            qs = qs.filter(order_date__date__gte=start.date(), order_date__date__lte=end.date())
            period = f"{start.strftime('%Y-%m-%d')} to {end.strftime('%Y-%m-%d')}"
        elif filter_type == 'month':
            qs = qs.filter(order_date__year=base_date.year, order_date__month=base_date.month)
            period = base_date.strftime('%B %Y')
        elif filter_type == 'year':
            qs = qs.filter(order_date__year=base_date.year)
            period = str(base_date.year)
        total = qs.aggregate(total=Sum('total_amount'))['total'] or 0
        return Response({'total_purchases': total, 'period': period})

    @action(detail=False, methods=['get'])
    def stock_levels(self, request):
        parts = SparePart.objects.all().values('part_id', 'part_name', 'current_stock')
        return Response({'stock': list(parts)})

    @action(detail=False, methods=['get'])
    def supplier_summary(self, request):
        suppliers = Supplier.objects.annotate(order_count=Count('purchase_orders')).values('supplier_id', 'supplier_name', 'order_count')
        return Response({'suppliers': list(suppliers)})
