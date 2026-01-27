// Banuka Start
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/supplierDashbord/SupplierManagement.css'; // Reusing existing styles for consistency

const PurchaseOrderList = ({ user }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    console.log('PurchaseOrderList currentUser:', currentUser);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('http://127.0.0.1:8000/api/supplier/purchase-orders/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    };

    const formatLocalDateTime = (dateStr) => {
        if (!dateStr) return '';
        // Handle formats: "2026-01-27 06:14:27" or "2026-01-27T06:14:27+05:30"
        let cleanDate = dateStr;
        if (dateStr.includes('T')) {
            // Remove timezone part if present
            cleanDate = dateStr.split('T')[0] + ' ' + dateStr.split('T')[1].split('+')[0];
        }
        const parts = cleanDate.split(' ');
        if (parts.length >= 2) {
            const datePart = parts[0];
            const timePart = parts[1];
            // Format: YYYY-MM-DD HH:MM:SS -> MM/DD/YYYY HH:MM:SS
            const [year, month, day] = datePart.split('-');
            return `${month}/${day}/${year} ${timePart}`;
        }
        return dateStr;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED': return 'badge active';
            case 'PENDING': return 'badge warning'; // You might need to add 'warning' style
            case 'CANCELLED': return 'badge inactive';
            case 'DELIVERED': return 'badge success'; // Add 'success' style
            default: return 'badge';
        }
    };

    const handleApprove = async (orderId) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`http://127.0.0.1:8000/api/purchase-orders/${orderId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOrders();
        } catch (err) {
            console.error("Error approving order:", err);
            alert("Failed to approve order.");
        }
    };

    const handleReject = async (orderId) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`http://127.0.0.1:8000/api/purchase-orders/${orderId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOrders();
        } catch (err) {
            console.error("Error rejecting order:", err);
            alert("Failed to reject order.");
        }
    };

    const handleDelivered = async (orderId) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`http://127.0.0.1:8000/api/purchase-orders/${orderId}/delivered`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOrders();
        } catch (err) {
            console.error("Error marking order delivered:", err);
            alert("Failed to mark order delivered.");
        }
    };

    return (
        <div className="supplier-page">
            <nav className="mgmt-navbar">
                <div className="nav-left">
                    <button className="back-btn" onClick={() => navigate('/')}>← Dashboard</button>
                    <h1>Purchase Orders</h1>
                </div>
            </nav>

            <div className="content-area">
                
                <div className="table-container">
                    <div className="table-header-actions" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="submit-btn" onClick={() => navigate('/purchase-orders/new')}>+ Create New Order</button>
                    </div>

                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>PO ID</th>
                                <th>Supplier</th>
                                <th>Order Date</th>
                                <th>Expected Delivery</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Approved At</th>
                                <th>Delivered At</th>
                                <th>Items</th>
                                {currentUser.role === 'ADMIN' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.order_id}>
                                    <td>{order.po_reference_number}</td>
                                    <td>{order.supplier_name}</td>
                                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                    <td>{order.expected_delivery_date}</td>
                                    <td>${order.total_amount}</td>
                                    <td>
                                        <span className={getStatusBadge(order.status)}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{formatLocalDateTime(order.approved_at)}</td>
                                    <td>{formatLocalDateTime(order.delivered_at)}</td>
                                    <td>
                                        {order.items.length} items
                                    </td>
                                    {currentUser.role === 'ADMIN' && (
                                        <td>
                                            {order.status === 'Pending' && (
                                                <>
                                                    <button className="submit-btn" style={{ marginRight: '8px' }} onClick={() => handleApprove(order.order_id)}>Approve</button>
                                                    <button className="cancel-btn" onClick={() => handleReject(order.order_id)}>Reject</button>
                                                </>
                                            )}
                                            {order.status === 'Approved' && (
                                                <button className="submit-btn" onClick={() => handleDelivered(order.order_id)}>Mark Delivered</button>
                                            )}
                                            {order.status === 'Rejected' || order.status === 'Delivered' || order.status === 'Cancelled' ? (
                                                <span style={{ color: '#999' }}>No actions</span>
                                            ) : null}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderList;
// Banuka End