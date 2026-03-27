from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Supplier, Part, PurchaseOrder, PurchaseOrderApproval
from .serializers import (
    SupplierSerializer, PartSerializer, PurchaseOrderSerializer, 
    PurchaseOrderApprovalSerializer, PurchaseOrderApproveRejectSerializer
)

# Template Views (Traditional Django MVT)
def supplier_dashboard(request):
    """Template view for supplier dashboard"""
    if not request.user.is_authenticated:
        return render(request, 'supplier/error.html', {'message': 'Please login'})
    
    if request.user.profile.role not in ['SUPPLIER', 'ADMIN']:
        return render(request, 'supplier/error.html', {'message': 'Access denied'})
    
    if request.user.profile.role == 'ADMIN':
        # Admin sees all suppliers and their data
        suppliers = Supplier.objects.filter(is_active=True)
        parts = Part.objects.filter(is_active=True)
        purchase_orders = PurchaseOrder.objects.all()
        context = {
            'admin_view': True,
            'suppliers': suppliers,
            'parts': parts,
            'purchase_orders': purchase_orders,
        }
    else:
        # Supplier sees only their own data
        supplier = get_object_or_404(Supplier, user=request.user)
        parts = Part.objects.filter(supplier=supplier, is_active=True)
        purchase_orders = PurchaseOrder.objects.filter(supplier=supplier)
        context = {
            'admin_view': False,
            'supplier': supplier,
            'parts': parts,
            'purchase_orders': purchase_orders,
        }
    
    return render(request, 'supplier/dashboard.html', context)

def part_catalog(request):
    """Template view for parts catalog"""
    if not request.user.is_authenticated:
        return render(request, 'supplier/error.html', {'message': 'Please login'})
    
    parts = Part.objects.filter(is_active=True)
    context = {'parts': parts}
    return render(request, 'supplier/part_catalog.html', context)

# API ViewSets
class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        """Fetch all parts with supplier information"""
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        p.id,
                        p.name,
                        p.part_number,
                        p.description,
                        p.part_type,
                        p.price,
                        p.stock_quantity,
                        p.min_stock_level,
                        p.supplier_id,
                        s.supplier_name,
                        p.is_active
                    FROM supplier_part p
                    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
                    WHERE p.is_active = 1
                    ORDER BY p.name
                """)
                columns = [col[0] for col in cursor.description]
                parts = []
                for row in cursor.fetchall():
                    part_dict = dict(zip(columns, row))
                    parts.append(part_dict)
                
                print(f"Found {len(parts)} parts")
                return Response(parts)
                
        except Exception as e:
            print(f"Error in PartViewSet.list: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to fetch parts: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        """Fetch all purchase orders from garagex_db.purchase_orders.

        This uses SQL with a fallback supplier join because different DB setups may use
        either a `suppliers` table or Django's `supplier_supplier` table.
        """
        from django.db import connection

        base_select = """
            SELECT
                po.order_id,
                po.po_reference_number,
                po.supplier_id,
                po.created_by_user_id,
                po.order_date,
                po.expected_delivery_date,
                po.total_amount,
                po.status
        """

        def _iso(dt_value):
            if dt_value is None:
                return None
            return dt_value.isoformat() if hasattr(dt_value, 'isoformat') else str(dt_value)

        # Some projects use `purchase_orders`, others use `supplier_purchaseorder`.
        table_names = ['purchase_orders', 'supplier_purchaseorder']

        queries = []
        for table in table_names:
            queries.extend([
                (
                    base_select + ", s.supplier_name AS supplier_name\n" +
                    f"FROM {table} po\nLEFT JOIN suppliers s ON po.supplier_id = s.supplier_id\n" +
                    "ORDER BY po.order_date DESC",
                    True,
                ),
                (
                    base_select + ", s.company_name AS supplier_name\n" +
                    f"FROM {table} po\nLEFT JOIN supplier_supplier s ON po.supplier_id = s.id\n" +
                    "ORDER BY po.order_date DESC",
                    True,
                ),
                (
                    base_select + "\n" +
                    f"FROM {table} po\nORDER BY po.order_date DESC",
                    False,
                ),
            ])

        last_error = None
        for sql, has_supplier_name in queries:
            try:
                with connection.cursor() as cursor:
                    cursor.execute(sql)
                    columns = [col[0] for col in cursor.description]
                    rows = cursor.fetchall()

                data = []
                for row in rows:
                    item = dict(zip(columns, row))
                    item['order_date'] = _iso(item.get('order_date'))
                    item['expected_delivery_date'] = _iso(item.get('expected_delivery_date'))
                    if not has_supplier_name:
                        item['supplier_name'] = None
                    data.append(item)

                return Response(data)
            except Exception as e:
                last_error = e
                continue

        print(f"Error in PurchaseOrderViewSet.list: {last_error}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Failed to fetch purchase orders: {str(last_error)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a purchase order"""
        from django.db import connection
        from django.utils import timezone

        try:
            last_error = None
            for table in ['purchase_orders', 'supplier_purchaseorder']:
                try:
                    with connection.cursor() as cursor:
                        cursor.execute(f"SELECT status FROM {table} WHERE order_id = %s", [pk])
                        row = cursor.fetchone()
                        if not row:
                            last_error = None
                            continue
                        if row[0] != 'Pending':
                            return Response({'error': 'Only pending orders can be approved'}, status=status.HTTP_400_BAD_REQUEST)

                        try:
                            cursor.execute(
                                f"""
                                UPDATE {table}
                                SET status = 'Approved', approved_by = %s, approved_date = %s
                                WHERE order_id = %s
                                """,
                                [request.user.id, timezone.now(), pk],
                            )
                        except Exception:
                            cursor.execute(
                                f"UPDATE {table} SET status = 'Approved' WHERE order_id = %s",
                                [pk],
                            )

                    return Response({'message': 'Order approved successfully'})
                except Exception as e:
                    last_error = e
                    continue

            if last_error:
                raise last_error
            return Response({'error': 'Purchase order not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to approve order: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a purchase order"""
        from django.db import connection
        from django.utils import timezone

        rejection_reason = request.data.get('rejection_reason', '')

        try:
            last_error = None
            for table in ['purchase_orders', 'supplier_purchaseorder']:
                try:
                    with connection.cursor() as cursor:
                        cursor.execute(f"SELECT status FROM {table} WHERE order_id = %s", [pk])
                        row = cursor.fetchone()
                        if not row:
                            last_error = None
                            continue
                        if row[0] != 'Pending':
                            return Response({'error': 'Only pending orders can be rejected'}, status=status.HTTP_400_BAD_REQUEST)

                        try:
                            cursor.execute(
                                f"""
                                UPDATE {table}
                                SET status = 'Rejected', approved_by = %s, approved_date = %s, rejection_reason = %s
                                WHERE order_id = %s
                                """,
                                [request.user.id, timezone.now(), rejection_reason, pk],
                            )
                        except Exception:
                            cursor.execute(
                                f"UPDATE {table} SET status = 'Rejected' WHERE order_id = %s",
                                [pk],
                            )

                    return Response({'message': 'Order rejected successfully'})
                except Exception as e:
                    last_error = e
                    continue

            if last_error:
                raise last_error
            return Response({'error': 'Purchase order not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to reject order: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PurchaseOrderApprovalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PurchaseOrderApproval.objects.all()
    serializer_class = PurchaseOrderApprovalSerializer
    permission_classes = [IsAuthenticated]
