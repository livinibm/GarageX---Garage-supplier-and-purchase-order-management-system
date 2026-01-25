import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' }
});

const withAuth = () => {
  const token = localStorage.getItem('access_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const NotificationBell = ({
  buttonClass = 'navbar-icon-btn',
  dropdownWidth = 400,
  iconSize = '1.25rem',
  badgeSize = 20
}) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const [lowStockRes, pendingRes] = await Promise.all([
        api.get('/notifications/low-stock/', withAuth()).catch(() => ({ data: { alerts: [] } })),
        api.get('/notifications/pending-approvals/', withAuth()).catch(() => ({ data: { alerts: [] } }))
      ]);

      const lowStockAlerts = (lowStockRes.data?.alerts || []).map((a) => ({
        id: a.id,
        type: 'low_stock',
        title: `Low Stock: ${a.part_name}`,
        message: `${a.part_number} needs restock (Current: ${a.current_stock}, Min: ${a.minimum_level})`,
        icon: '⚠️',
        part_name: a.part_name,
        part_number: a.part_number,
        current_stock: a.current_stock,
        min_level: a.minimum_level,
        shortage: a.shortage,
        amount: a.amount,
        time: 'Just now'
      }));

      const pendingAlerts = (pendingRes.data?.alerts || []).map((a) => ({
        id: a.id,
        type: a.type,
        title: a.type === 'overdue_invoice' ? 'Overdue Invoice' : 'Pending Order',
        message: a.message,
        icon: '⏳',
        order_number: a.order_number,
        invoice_number: a.invoice_number,
        supplier: a.supplier,
        amount: a.amount,
        due_date: a.due_date || a.expected_delivery,
        time: 'Action required'
      }));

      const all = [...lowStockAlerts, ...pendingAlerts];
      setNotifications(all);
      setUnreadCount(all.length);
    } catch (err) {
      console.error('Notifications fetch failed', err);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setNotificationsOpen((prev) => {
      const next = !prev;
      if (!prev) setUnreadCount(0);
      return next;
    });
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button
        className={buttonClass}
        title="Notifications"
        onClick={handleToggle}
        style={{
          position: 'relative',
          transition: 'all 0.3s ease',
          transform: notificationsOpen ? 'scale(1.1)' : 'scale(1)'
        }}
      >
        <span style={{ fontSize: iconSize }}>🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              borderRadius: '50%',
              width: `${badgeSize}px`,
              height: `${badgeSize}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: '700',
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
              animation: 'pulse-badge 2s ease-in-out infinite'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {notificationsOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.75rem',
            width: `${dropdownWidth}px`,
            background: 'linear-gradient(to bottom, #ffffff 0%, #f8fbff 100%)',
            borderRadius: '14px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 1000,
            maxHeight: '520px',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '1.1rem 1.3rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1e40af' }}>Notifications</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#2563eb' }}>Real-time alerts</p>
            </div>
            <span
              style={{
                background: 'linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%)',
                color: '#0f172a',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '700',
                boxShadow: '0 2px 8px rgba(96, 165, 250, 0.25)'
              }}
            >
              {notifications.length}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {notifications.length > 0 ? (
              notifications.map((notification, idx) => {
                const isLowStock = notification.type === 'low_stock';

                return (
                  <div
                    key={notification.id || idx}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: idx < notifications.length - 1 ? '1px solid #f1f5f9' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'white',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isLowStock ? '#e0f2fe30' : '#e0f2fe15';
                      e.currentTarget.style.borderLeft = isLowStock ? '3px solid #2563eb' : '3px solid #0ea5e9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderLeft = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: isLowStock ? '#dbeafe' : '#e0f2fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '1.25rem',
                          boxShadow: isLowStock
                            ? '0 4px 12px rgba(59, 130, 246, 0.20)'
                            : '0 4px 12px rgba(14, 165, 233, 0.18)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {notification.icon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem'
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: '700',
                              color: '#1e293b',
                              flex: 1
                            }}
                          >
                            {notification.title}
                          </div>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              color: '#94a3b8',
                              fontWeight: '500',
                              whiteSpace: 'nowrap',
                              marginLeft: '0.5rem'
                            }}
                          >
                            {notification.time}
                          </span>
                        </div>

                        <p
                          style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '0.8rem',
                            color: '#475569',
                            lineHeight: '1.5'
                          }}
                        >
                          {notification.message}
                        </p>

                        {notification.supplier && (
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.75rem',
                              fontSize: '0.75rem',
                              color: '#6b7280'
                            }}
                          >
                            <span
                              style={{
                                background: '#f3f4f6',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '4px',
                                fontWeight: '500'
                              }}
                            >
                              {notification.supplier}
                            </span>
                            {notification.amount && (
                              <span
                                style={{
                                  background: isLowStock ? '#dbeafe' : '#e0f2fe',
                                  color: isLowStock ? '#1d4ed8' : '#0369a1',
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '4px',
                                  fontWeight: '600'
                                }}
                              >
                                ${Number(notification.amount).toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  color: '#94a3b8'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                <p style={{ margin: '0', fontSize: '0.95rem', fontWeight: '500' }}>All caught up!</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>No new notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
