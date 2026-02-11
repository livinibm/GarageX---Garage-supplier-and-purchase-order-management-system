import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

const styles = {
  container: {
    padding: '24px',
    backgroundColor: 'transparent',
    minHeight: '100vh'
  },
  header: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#0d1117',
    marginBottom: '14px'
  },
  subheader: {
    color: '#57606a',
    fontSize: '14px',
    marginBottom: '20px'
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #d1d9e0',
    borderRadius: '10px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },
  notificationList: {
    listStyle: 'none',
    padding: '0',
    margin: '0'
  },
  notificationItem: {
    padding: '14px 16px',
    marginBottom: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid #e1e4e8',
    borderLeft: '4px solid var(--primary-blue)',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px'
  },
  notificationItemUnread: {
    padding: '14px 16px',
    marginBottom: '12px',
    backgroundColor: '#eef5ff',
    border: '1px solid #c9ddff',
    borderLeft: '4px solid var(--primary-blue)',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    fontWeight: '600'
  },
  notificationBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    marginRight: '10px'
  },
  badgeWarning: {
    backgroundColor: '#cf222e',
    color: '#ffffff'
  },
  badgeInfo: {
    backgroundColor: 'var(--primary-blue)',
    color: '#ffffff'
  },
  badgeSuccess: {
    backgroundColor: '#1a7f37',
    color: '#ffffff'
  },
  notificationText: {
    flex: 1
  },
  notificationTime: {
    fontSize: '12px',
    color: '#57606a',
    whiteSpace: 'nowrap',
    marginLeft: '10px'
  },
  removeButton: {
    marginLeft: '10px',
    padding: '6px 12px',
    backgroundColor: 'var(--primary-blue)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#57606a',
    fontSize: '16px'
  }
};

function NotificationList() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    apiFetch('/api/accounts/notifications/')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(data => setNotifications(data))
      .catch(() => {
        setNotifications([]);
      });
  }, []);

  const getBadgeStyle = (type) => {
    switch(type) {
      case 'LOW_STOCK':
        return { ...styles.notificationBadge, ...styles.badgeWarning };
      case 'ORDER_APPROVED':
        return { ...styles.notificationBadge, ...styles.badgeSuccess };
      case 'PAYMENT_DUE':
        return { ...styles.notificationBadge, ...styles.badgeWarning };
      default:
        return { ...styles.notificationBadge, ...styles.badgeInfo };
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'LOW_STOCK': '📉 Low Stock',
      'ORDER_APPROVED': '✅ Order Approved',
      'PAYMENT_DUE': '💳 Payment Due'
    };
    return labels[type] || type;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleRemove = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '12px', padding: '6px 12px', backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
        ←
      </button>
      <h2 style={styles.header}>🔔 Alerts</h2>
      <div style={styles.subheader}>Stay ahead of delays, approvals, and stock risks.</div>
      <div style={styles.card}>
        {notifications && notifications.length > 0 ? (
          <ul style={styles.notificationList}>
            {notifications.map(n => (
              <li key={n.id} style={n.is_read ? styles.notificationItem : styles.notificationItemUnread}>
                <div style={styles.notificationText}>
                  <span style={getBadgeStyle(n.notif_type)}>{getTypeLabel(n.notif_type)}</span>
                  <div style={{marginTop: '6px', color: '#0d1117', fontWeight: '500'}}>
                    {n.message}
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span style={styles.notificationTime}>{formatTime(n.created_at)}</span>
                  <button type="button" style={styles.removeButton} onClick={() => handleRemove(n.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={styles.emptyState}>No notifications</p>
        )}
      </div>
    </div>
  );
}

export default NotificationList;
