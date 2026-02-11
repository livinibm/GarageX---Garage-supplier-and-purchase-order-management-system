
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentForm from './PaymentForm';
import { apiFetch } from '../api';

const styles = {
  addButton: {
    padding: '8px 16px',
    backgroundColor: 'var(--primary-blue)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '15px'
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: 'var(--primary-blue)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '5px'
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: 'var(--primary-blue)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  }
};

function PaymentList() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPayments = () => {
    setLoading(true);
    apiFetch('/api/vendor/supplier-payments/')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(data => {
        const normalized = Array.isArray(data) ? data : [];
        setPayments(normalized);
      })
      .catch(() => {
        setPayments([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (payment) => {
    // Map to form fields for edit
    setEditing({
      payment_id: payment.payment_id,
      supplier: payment.supplier,
      purchase_order: payment.purchase_order,
      amount: payment.amount,
      payment_date: payment.payment_date,
      payment_method: payment.payment_method
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this payment?')) return;
    apiFetch(`/api/vendor/supplier-payments/${id}/`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        fetchPayments();
      })
      .catch(err => {
        setPayments(prev => prev.filter(p => p.payment_id !== id));
        console.error('Delete failed:', err);
      });
  };

  const handleFormSubmit = (form) => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing
      ? `/api/vendor/supplier-payments/${editing.payment_id}/`
      : '/api/vendor/supplier-payments/';
    apiFetch(url, {
      method,
      body: JSON.stringify(form)
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(() => {
        setShowForm(false);
        setEditing(null);
        fetchPayments();
      })
      .catch(err => {
        alert('Save failed: ' + err);
      });
  };

  return (
    <div>
      <button onClick={() => navigate('/')} style={{ marginBottom: '12px', padding: '6px 12px', backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
        ←
      </button>
      <h2>Payments</h2>
      <button onClick={handleCreate} style={styles.addButton}>Record Payment</button>
      {showForm && (
        <PaymentForm
          onSubmit={handleFormSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          initialData={editing}
        />
      )}
      {loading ? <div>Loading...</div> : (
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{borderBottom: '2px solid #ddd'}}>
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>ID</th>
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>Vendor</th>
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>Order Ref</th>
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>Amount</th>
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>Date</th>
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>Method</th>
            
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.payment_id} style={{borderBottom: '1px solid #eee'}}>
              <td style={{padding: '10px'}}>{p.payment_id}</td>
              <td style={{padding: '10px'}}>{p.supplier_name}</td>
              <td style={{padding: '10px'}}>{p.purchase_order_ref}</td>
              <td style={{padding: '10px'}}>{p.amount}</td>
              <td style={{padding: '10px'}}>{p.payment_date}</td>
              <td style={{padding: '10px'}}>{p.payment_method}</td>
              
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
}

export default PaymentList;
