
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InvoiceForm from './InvoiceForm';
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

function InvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = () => {
    setLoading(true);
    apiFetch('/api/vendor/purchase-invoices/')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(data => {
        const normalized = Array.isArray(data) ? data : [];
        setInvoices(normalized);
      })
      .catch(() => {
        setInvoices([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (invoice) => {
    setEditing({
      invoice_id: invoice.invoice_id,
      purchase_order: invoice.purchase_order,
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      total_amount: invoice.total_amount,
      status: invoice.status
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    apiFetch(`/api/vendor/purchase-invoices/${id}/`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        fetchInvoices();
      })
      .catch(err => {
        setInvoices(prev => prev.filter(inv => inv.invoice_id !== id));
        console.error('Delete failed:', err);
      });
  };

  const handleFormSubmit = (form) => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing
      ? `/api/vendor/purchase-invoices/${editing.invoice_id}/`
      : '/api/vendor/purchase-invoices/';
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
        fetchInvoices();
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
      <h2>Invoices</h2>
      <button onClick={handleCreate} style={styles.addButton}>Record Invoice</button>
      {showForm && (
        <InvoiceForm
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
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>Order Ref</th>
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>Invoice #</th>
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>Issue Date</th>
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>Due Date</th>
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>Total</th>
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>Status</th>
            <th style={{textAlign: 'left', padding: '10px', fontWeight: '600'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.invoice_id} style={{borderBottom: '1px solid #eee'}}>
              <td style={{padding: '10px'}}>{inv.invoice_id}</td>
              <td style={{padding: '10px'}}>{inv.purchase_order_ref}</td>
              <td style={{padding: '10px'}}>{inv.invoice_number}</td>
              <td style={{padding: '10px'}}>{inv.issue_date}</td>
              <td style={{padding: '10px'}}>{inv.due_date}</td>
              <td style={{padding: '10px'}}>{inv.total_amount}</td>
              <td style={{padding: '10px'}}>{inv.status}</td>
              <td style={{padding: '10px'}}>
                <button onClick={() => handleEdit(inv)} style={styles.editButton}>Edit</button>
                <button onClick={() => handleDelete(inv.invoice_id)} style={styles.deleteButton}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
}

export default InvoiceList;
