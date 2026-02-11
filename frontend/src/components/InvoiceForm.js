import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const styles = {
  form: {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #d1d9e0',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '5px',
    fontWeight: '600',
    color: '#0d1117',
    fontSize: '14px'
  },
  input: {
    padding: '10px',
    border: '1px solid #d1d9e0',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s'
  },
  select: {
    padding: '10px',
    border: '1px solid #d1d9e0',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px'
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: 'var(--primary-blue)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6e7681',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default function InvoiceForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({
    purchase_order: '',
    invoice_number: '',
    issue_date: '',
    due_date: '',
    total_amount: '',
    status: ''
  });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch purchase orders
    apiFetch('/api/vendor/purchase-orders/')
      .then(res => res.json())
      .then(data => {
        const normalized = Array.isArray(data) ? data : [];
        setOrders(normalized);
      })
      .catch(err => {
        console.error('Purchase order fetch error:', err);
        setOrders([]);
      });
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        purchase_order: initialData.purchase_order || '',
        invoice_number: initialData.invoice_number || '',
        issue_date: initialData.issue_date || '',
        due_date: initialData.due_date || '',
        total_amount: initialData.total_amount || '',
        status: initialData.status || ''
      });
    }
  }, [initialData]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Order</label>
        <select name="purchase_order" value={form.purchase_order} onChange={handleChange} style={styles.select} required>
          <option value="">Select Order</option>
          {orders.map(o => (
            <option key={o.order_id} value={o.order_id}>{o.po_reference_number}</option>
          ))}
        </select>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Invoice Number</label>
        <input name="invoice_number" placeholder="Invoice #" value={form.invoice_number} onChange={handleChange} style={styles.input} required />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Issue Date</label>
        <input name="issue_date" type="date" value={form.issue_date} onChange={handleChange} style={styles.input} required />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Due Date</label>
        <input name="due_date" type="date" value={form.due_date} onChange={handleChange} style={styles.input} required />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Total Amount</label>
        <input name="total_amount" type="number" placeholder="Total" value={form.total_amount} onChange={handleChange} style={styles.input} required />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Status</label>
        <select name="status" value={form.status} onChange={handleChange} style={styles.select} required>
          <option value="">Select Status</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>
      <div style={styles.buttonGroup}>
        <button type="submit" style={styles.submitButton}>Save Invoice</button>
        {onCancel && <button type="button" onClick={onCancel} style={styles.cancelButton}>Cancel</button>}
      </div>
    </form>
  );
}
