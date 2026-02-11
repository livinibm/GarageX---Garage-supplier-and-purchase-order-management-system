import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api';
import { useNavigate } from 'react-router-dom';
import '../../styles/vendorDashboard/VendorManagement.css';

const PurchaseOrderList = ({ user }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await apiClient.get('/api/vendor/purchase-orders/');
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    };

    const formatLocalDateTime = (dateStr) => {
        if (!dateStr) return '';
        let cleanDate = dateStr;
        if (dateStr.includes('T')) {
            cleanDate = dateStr.split('T')[0] + ' ' + dateStr.split('T')[1].split('+')[0];
        }
        const parts = cleanDate.split(' ');
        if (parts.length >= 2) {
            const datePart = parts[0];
            const timePart = parts[1];
            const [year, month, day] = datePart.split('-');
            return `${month}/${day}/${year} ${timePart}`;
        }
        return dateStr;
    };

    const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

    const isStatus = (status, expected) => normalizeStatus(status) === expected;

    const renderBadgeStyle = (status) => {
        const normalizedStatus = normalizeStatus(status);
        const baseStyle = { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '500' };
        switch (normalizedStatus) {
            case 'approved':
                return { ...baseStyle, background: 'rgba(40, 167, 69, 0.1)', color: 'var(--success-color)' };
            case 'pending':
                return { ...baseStyle, background: 'rgba(255, 193, 7, 0.1)', color: '#856404' };
            case 'cancelled':
            case 'canceled':
            case 'rejected':
                return { ...baseStyle, background: 'rgba(220, 53, 69, 0.1)', color: 'var(--danger-color)' };
            case 'delivered':
                return { ...baseStyle, background: 'rgba(40, 167, 69, 0.2)', color: 'var(--success-color)' };
            default: return { ...baseStyle, background: 'var(--surface-color)', color: 'var(--text-secondary)' };
        }
    };

    const handleApprove = async (orderId) => {
        try {
            await apiClient.post(`/api/vendor/purchase-orders/${orderId}/approve/`);
            fetchOrders();
        } catch (err) {
            console.error("Error approving order:", err);
            alert("Failed to approve order.");
        }
    };

    const handleReject = async (orderId) => {
        try {
            await apiClient.post(`/api/vendor/purchase-orders/${orderId}/reject/`);
            fetchOrders();
        } catch (err) {
            console.error("Error rejecting order:", err);
            alert("Failed to reject order.");
        }
    };

    const handleDelivered = async (orderId) => {
        try {
            await apiClient.post(`/api/vendor/purchase-orders/${orderId}/delivered/`);
            fetchOrders();
        } catch (err) {
            console.error("Error marking order delivered:", err);
            alert("Failed to mark order delivered.");
        }
    };

    return (
        <div className="supplier-page" style={{ padding: '0', background: 'var(--gray-100)' }}>
            <div className="dashboard-header" style={{
                padding: '1.25rem 2rem',
                background: 'var(--white)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate('/')}>
                        &larr; Dashboard
                    </button>
                    <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700', letterSpacing: '-0.02em' }}>Orders</h1>
                </div>
                <div className="nav-right">
                    <button className="btn-primary" onClick={() => navigate('/purchase-orders/new')}>+ Create Order</button>
                </div>
            </div>

            <div className="content-area" style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 2rem' }}>
                <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: '#fafbfc' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Order Timeline</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px', tableLayout: 'fixed' }}>
                            <thead>
                                <tr style={{ background: 'var(--gray-100)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', width: '150px' }}>Order Ref</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', width: '180px' }}>Vendor</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', width: '120px' }}>Order Date</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', width: '140px' }}>Expected</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', width: '120px' }}>Total</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', width: '130px' }}>Status</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', width: '180px' }}>Timeline</th>
                                    {currentUser.role === 'ADMIN' && <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', width: '200px' }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.order_id} style={{ borderBottom: '1px solid var(--gray-200)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fcfcfc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary-blue)', whiteSpace: 'nowrap' }}>{order.po_reference_number}</td>
                                        <td style={{ padding: '1rem' }}>{order.supplier_name}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(order.order_date).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{order.expected_delivery_date}</td>
                                        <td style={{ padding: '1rem', fontWeight: '700' }}>${order.total_amount}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={renderBadgeStyle(order.status)}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <div>{order.approved_at ? `Appr: ${formatLocalDateTime(order.approved_at).split(' ')[0]}` : null}</div>
                                            <div>{order.delivered_at ? `Deliv: ${formatLocalDateTime(order.delivered_at).split(' ')[0]}` : null}</div>
                                        </td>
                                        {currentUser.role === 'ADMIN' && (
                                            <td style={{ padding: '1rem' }}>
                                                {isStatus(order.status, 'pending') && (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleApprove(order.order_id)}>Approve</button>
                                                        <button className="btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleReject(order.order_id)}>Reject</button>
                                                    </div>
                                                )}
                                                {isStatus(order.status, 'approved') && (
                                                    <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: '100%' }} onClick={() => handleDelivered(order.order_id)}>Mark Delivered</button>
                                                )}
                                                {(isStatus(order.status, 'rejected') || isStatus(order.status, 'delivered') || isStatus(order.status, 'cancelled') || isStatus(order.status, 'canceled')) && (
                                                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>No actions</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderList;
