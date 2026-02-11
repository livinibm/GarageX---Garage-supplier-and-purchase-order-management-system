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

export default function PaymentForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({
    supplier: '',
    purchase_order: '',
    amount: '',
    payment_date: '',
    payment_method: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch suppliers
    apiFetch('/api/vendor/suppliers/')
      .then(res => res.json())
      .then(data => {
        const normalized = Array.isArray(data) ? data : [];
        setSuppliers(normalized);
      })
      .catch(err => {
        console.error('Supplier fetch error:', err);
        setSuppliers([]);
      });
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
        supplier: initialData.supplier || '',
        purchase_order: initialData.purchase_order || '',
        amount: initialData.amount || '',
        payment_date: initialData.payment_date || '',
        payment_method: initialData.payment_method || ''
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
        <label style={styles.label}>Vendor</label>
        <select name="supplier" value={form.supplier} onChange={handleChange} style={styles.select} required>
          <option value="">Select Vendor</option>
          {suppliers.map(s => (
            <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>
          ))}
        </select>
      </div>
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
        <label style={styles.label}>Amount</label>
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} style={styles.input} required />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Payment Date</label>
        <input name="payment_date" type="date" value={form.payment_date} onChange={handleChange} style={styles.input} required />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Payment Method</label>
        <select name="payment_method" value={form.payment_method} onChange={handleChange} style={styles.select} required>
          <option value="">Select Payment Method</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CASH">Cash</option>
          <option value="CHEQUE">Cheque</option>
        </select>
      </div>
      <div style={styles.buttonGroup}>
        <button type="submit" style={styles.submitButton}>Save Payment</button>
        {onCancel && <button type="button" onClick={onCancel} style={styles.cancelButton}>Cancel</button>}
      </div>
    </form>
  );
}
