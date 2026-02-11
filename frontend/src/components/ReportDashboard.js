
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiFetch } from '../api';

const styles = {
  container: {
    padding: '20px',
    backgroundColor: 'transparent'
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #d1d9e0'
  },
  heading: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0d1117',
    marginBottom: '15px'
  },
  subheading: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0d1117',
    marginBottom: '10px'
  },
  filterGroup: {
    marginBottom: '15px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  label: {
    fontWeight: '600',
    color: '#57606a',
    fontSize: '14px'
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #d1d9e0',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #d1d9e0',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: 'var(--primary-blue)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px'
  },
  dataBox: {
    padding: '15px',
    backgroundColor: '#ffffff',
    borderLeft: '4px solid var(--primary-blue)',
    borderRadius: '4px',
    marginBottom: '10px'
  },
  tableContainer: {
    marginTop: '15px',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  },
  tableHeader: {
    backgroundColor: 'var(--primary-blue)',
    color: '#ffffff',
    padding: '10px',
    textAlign: 'left',
    fontWeight: '600'
  },
  tableCell: {
    padding: '10px',
    borderBottom: '1px solid #d1d9e0',
    color: '#0d1117'
  },
  tableRowAlt: {
    backgroundColor: '#f6f8fa'
  }
};

function ReportDashboard() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [stock, setStock] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filterType, setFilterType] = useState('month');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const fetchReport = () => {
    const params = new URLSearchParams({
      filter_type: filterType,
      date: date
    });
    apiFetch(`/api/vendor/reports/monthly_purchases/?${params.toString()}`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(data => {
        const normalized = data && Object.keys(data).length > 0 ? data : null;
        setReport(normalized);
      })
      .catch(() => {
        setReport(null);
      });
  };

  useEffect(() => {
    fetchReport();
  }, [filterType, date]);

  useEffect(() => {
    apiFetch('/api/vendor/reports/stock_levels/')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(data => {
        const normalized = Array.isArray(data?.stock) ? data.stock : [];
        setStock(normalized);
      })
      .catch(() => {
        setStock([]);
      });
    apiFetch('/api/vendor/reports/supplier_summary/')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(data => {
        const normalized = Array.isArray(data?.suppliers) ? data.suppliers : [];
        setSuppliers(normalized);
      })
      .catch(() => {
        setSuppliers([]);
      });
  }, []);

  // PDF download handler
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Vendor Performance Report', 14, 16);
    let tableBody = [];
    let columns = [];
    let title = '';
    if (filterType === 'day' || filterType === 'week' || filterType === 'month' || filterType === 'year') {
      columns = ['Period', 'Total Purchases'];
      tableBody = [[report?.period || '', report?.total_purchases || 0]];
      title = `Purchases (${filterType.charAt(0).toUpperCase() + filterType.slice(1)})`;
    }
    autoTable(doc, {
      head: [columns],
      body: tableBody,
      startY: 24,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    doc.save(`report_${filterType}_${date}.pdf`);
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '12px', padding: '6px 12px', backgroundColor: 'var(--primary-blue)', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
        ←
      </button>
      <h1 style={styles.heading}>📊 Insights Dashboard</h1>
      
      <div style={styles.section}>
        <h2 style={styles.subheading}>Spend Summary</h2>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Filter by:</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={styles.select}>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} />
          {report && <button onClick={handleDownloadPDF} style={styles.button}>📥 Download PDF</button>}
        </div>
        {report && (
          <div style={styles.dataBox}>
            <b style={{color: 'var(--primary-blue)'}}>Total Spend:</b> <span style={{fontSize: '18px', fontWeight: '700', color: '#0d1117'}}>${report.total_purchases || 0}</span>
            {report.period && <span style={{color: '#57606a', marginLeft: '10px'}}>({report.period})</span>}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.subheading}>Stock Health</h2>
        {stock.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={{backgroundColor: '#15803d'}}>
                  <th style={styles.tableHeader}>Item</th>
                  <th style={styles.tableHeader}>Current Stock</th>
                  <th style={styles.tableHeader}>Min Level</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item, idx) => (
                  <tr key={idx} style={idx % 2 === 0 ? styles.tableRowAlt : {}}>
                    <td style={styles.tableCell}>{item.part_name}</td>
                    <td style={styles.tableCell}>{item.current_stock}</td>
                    <td style={styles.tableCell}>{item.minimum_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{color: '#57606a'}}>No stock data available</p>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.subheading}>Vendor Summary</h2>
        {suppliers.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={{backgroundColor: '#e11d48'}}>
                  <th style={styles.tableHeader}>Vendor</th>
                  <th style={styles.tableHeader}>Total Orders</th>
                  <th style={styles.tableHeader}>Outstanding Balance</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier, idx) => (
                  <tr key={idx} style={idx % 2 === 0 ? styles.tableRowAlt : {}}>
                    <td style={styles.tableCell}>{supplier.supplier_name}</td>
                    <td style={styles.tableCell}>{supplier.total_orders}</td>
                    <td style={styles.tableCell}>${supplier.outstanding_balance || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{color: '#57606a'}}>No supplier data available</p>
        )}
      </div>
    </div>
  );
}

export default ReportDashboard;
