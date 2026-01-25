import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import NotificationBell from '../../components/NotificationBell';
import '../../styles/supplierDashbord/SupplierDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' }
});

const withAuth = () => {
  const token = localStorage.getItem('access_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const Reports = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('monthly');
  const [reportData, setReportData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [filteredMonthlyData, setFilteredMonthlyData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Report generation filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('All');

  // Chart refs for download
  const monthlyChartRef = useRef(null);
  const supplierChartRef = useRef(null);
  const trendChartRef = useRef(null);

  // Utility function
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  // Filter data based on selected year and month
  const filterReportData = (data, year, month) => {
    if (!data || data.length === 0) return data;
    
    return data.filter(item => {
      const itemMonth = new Date(item.month + '-01');
      const itemYear = itemMonth.getFullYear().toString();
      const itemMonthNum = itemMonth.getMonth() + 1;
      
      const yearMatch = itemYear === year;
      const monthMatch = month === 'All' || itemMonthNum === parseInt(month);
      
      return yearMatch && monthMatch;
    });
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [monthlyRes, supplierRes] = await Promise.all([
          api.get('/reports/monthly-purchases/', withAuth()).catch(() => ({ data: { data: [] } })),
          api.get('/reports/suppliers/', withAuth()).catch(() => ({ data: { data: [] } }))
        ]);

        // Extract data properly from responses
        const monthlyData = monthlyRes.data?.data || [];
        const supplierData = supplierRes.data?.data || [];
        
        // Transform monthly data to include month_name for display
        const transformedMonthly = monthlyData.map(item => {
          const date = new Date(item.month + '-01');
          return {
            ...item,
            month_name: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          };
        });
        
        setMonthlyData(transformedMonthly);
        setFilteredMonthlyData(transformedMonthly);
        setSupplierData(supplierData);

      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Download chart as image
  const downloadChart = (chartRef, filename) => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
    }
  };

  // Generate report based on year/month filters
  const generateReport = () => {
    const filtered = filterReportData(monthlyData, selectedYear, selectedMonth);
    setFilteredMonthlyData(filtered);
  };

  // Export data to CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeTab === 'monthly') {
      csvContent += "Month,Total Amount,Transaction Count\n";
      monthlyData.forEach(item => {
        csvContent += `${item.month_name},${item.total_amount},${item.count}\n`;
      });
    } else if (activeTab === 'suppliers') {
      csvContent += "Supplier,Total Amount,Transaction Count\n";
      supplierData.forEach(item => {
        csvContent += `${item.supplier},${item.total_amount},${item.count}\n`;
      });
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare chart data
  const monthlyChartData = {
    labels: filteredMonthlyData.slice(0, 6).map(item => item.month_name),
    datasets: [
      {
        label: 'Monthly Purchases',
        data: filteredMonthlyData.slice(0, 6).map(item => item.total_amount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 50,
      }
    ]
  };

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12, weight: '600' },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => `Amount: ${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: (value) => formatCurrency(value),
          font: { size: 11 }
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  const supplierChartData = {
    labels: supplierData.slice(0, 5).map(item => item.supplier),
    datasets: [
      {
        label: 'Supplier Spending',
        data: supplierData.slice(0, 5).map(item => item.total_amount),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(37, 99, 235, 1)',
          'rgba(5, 150, 105, 1)',
          'rgba(217, 119, 6, 1)',
          'rgba(220, 38, 38, 1)',
          'rgba(109, 40, 217, 1)',
        ],
        borderWidth: 2,
      }
    ]
  };

  const supplierChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          font: { size: 11, weight: '600' },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: (context) => `${context.label}: ${formatCurrency(context.parsed)}`
        }
      }
    }
  };

  const trendChartData = {
    labels: filteredMonthlyData.slice(0, 6).map(item => item.month_name),
    datasets: [
      {
        label: 'Purchase Trend',
        data: filteredMonthlyData.slice(0, 6).map(item => item.total_amount),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12, weight: '600' },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: (context) => `Amount: ${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: (value) => formatCurrency(value),
          font: { size: 11 }
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  return (
    <div className="invoice-page-wrapper">
      {/* Navigation Bar */}
      <nav className="invoice-navbar">
        <div className="invoice-navbar-container">
          <div className="invoice-navbar-brand">
            <h1>GarageX</h1>
          </div>

          {/* Desktop Navigation Menu */}
          <ul className="invoice-nav-menu">
            <li className="invoice-nav-menu-item">
              <a href="/dashboard" className="invoice-nav-menu-link">Dashboard</a>
            </li>
            <li className="invoice-nav-menu-item">
              <a href="/supplier-payment" className="invoice-nav-menu-link">Supplier Payment</a>
            </li>
            <li className="invoice-nav-menu-item">
              <a href="/invoices" className="invoice-nav-menu-link">Invoice</a>
            </li>
            <li className="invoice-nav-menu-item">
              <a href="/reports" className="invoice-nav-menu-link active">Reports</a>
            </li>
          </ul>

          {/* Search Bar */}
          <div className="invoice-navbar-search">
            <span className="invoice-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="invoice-navbar-actions">
            <NotificationBell buttonClass="invoice-navbar-icon-btn" dropdownWidth={400} />

            {/* User Profile */}
            <div style={{ position: 'relative' }}>
              <button
                className={`invoice-user-profile-btn ${userDropdownOpen ? 'active' : ''}`}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="invoice-user-profile-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </button>

              {userDropdownOpen && (
                <div className="invoice-dropdown-menu active">
                  <ul className="invoice-dropdown-menu-list">
                    <li className="invoice-dropdown-menu-item">
                      <a href="#profile" className="invoice-dropdown-menu-link">My Profile</a>
                    </li>
                    <li className="invoice-dropdown-menu-item">
                      <a href="#settings" className="invoice-dropdown-menu-link">Settings</a>
                    </li>
                    <div className="invoice-dropdown-divider"></div>
                    <li className="invoice-dropdown-menu-item">
                      <button
                        onClick={onLogout}
                        className="invoice-dropdown-menu-link"
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={`invoice-mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="invoice-mobile-menu active">
          <ul className="invoice-mobile-menu-list">
            <li className="invoice-mobile-menu-item">
              <a href="/dashboard" className="invoice-mobile-menu-link">Dashboard</a>
            </li>
            <li className="invoice-mobile-menu-item">
              <a href="/supplier-payment" className="invoice-mobile-menu-link">Supplier Payment</a>
            </li>
            <li className="invoice-mobile-menu-item">
              <a href="/invoices" className="invoice-mobile-menu-link">Invoice</a>
            </li>
            <li className="invoice-mobile-menu-item">
              <a href="/reports" className="invoice-mobile-menu-link active">Reports</a>
            </li>
          </ul>
        </div>
      )}

      {/* Main Content */}
      <main className="invoice-main-content">
        <div style={{ padding: '2rem' }}>
          {/* Main Report Content */}
          <div style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  Business Intelligence Reports
                </h1>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: '#64748b'
              }}>
                <span>🕐</span>
                <span>Last updated: {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Report Generation Controls */}
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '1px solid #bae6fd',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              alignItems: 'end'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0c4a6e' }}>
                  📅 Select Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #7dd3fc',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    background: 'white',
                    cursor: 'pointer',
                    color: '#1e293b'
                  }}
                >
                  <option>2024</option>
                  <option>2025</option>
                  <option>2026</option>
                  <option>2027</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0c4a6e' }}>
                  🗓️ Select Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #7dd3fc',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    background: 'white',
                    cursor: 'pointer',
                    color: '#1e293b'
                  }}
                >
                  <option value="All">All Months</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>

              <div>
                <button
                  onClick={generateReport}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s',
                    marginBottom: 0
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <span>🔄</span> Generate
                </button>
              </div>

              <div>
                <button
                  onClick={exportToCSV}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.2s',
                    marginBottom: 0
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <span>📊</span> Export CSV
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9' }}>
              <button
                onClick={() => setActiveTab('monthly')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: activeTab === 'monthly' ? 'white' : 'transparent',
                  color: activeTab === 'monthly' ? '#3b82f6' : '#64748b',
                  border: 'none',
                  borderBottom: activeTab === 'monthly' ? '2px solid #3b82f6' : '2px solid transparent',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '-2px'
                }}
              >
                Monthly Purchase Overview
              </button>
              <button
                onClick={() => setActiveTab('stock')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  borderBottom: '2px solid transparent',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '-2px'
                }}
              >
                Stock Level Analysis
              </button>
              <button
                onClick={() => setActiveTab('supplier')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  borderBottom: '2px solid transparent',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '-2px'
                }}
              >
                Supplier Performance
              </button>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Total Spend Card */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      Total Spend (MTD)
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      {formatCurrency(reportData?.payments?.total_amount)}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span>📈</span>
                      <span>+12.5% vs last month</span>
                    </div>
                  </div>
                  <button style={{
                    background: '#eff6ff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1.25rem'
                  }}>
                    📥
                  </button>
                </div>
              </div>

              {/* Pending Orders Card */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      Pending / Overdue Invoices
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      {reportData?.invoices?.overdue_count || 0}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span>📉</span>
                      <span>-2% vs last month</span>
                    </div>
                  </div>
                  <button style={{
                    background: '#fef3c7',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1.25rem'
                  }}>
                    🛒
                  </button>
                </div>
              </div>

              {/* Inventory Valuation Card */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      Inventory Valuation
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      $124,800.00
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span>📈</span>
                      <span>+15.4% vs last week</span>
                    </div>
                  </div>
                  <button style={{
                    background: '#d1fae5',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1.25rem'
                  }}>
                    📊
                  </button>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Monthly Spending Breakdown with Chart.js */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem', color: '#1e293b' }}>
                      📊 Monthly Purchase Trend
                    </h3>
                    <p style={{ fontSize: '0.813rem', color: '#64748b', margin: 0 }}>
                      Last 6 months spending analysis
                    </p>
                  </div>
                  <button
                    onClick={() => downloadChart(monthlyChartRef, 'monthly_purchases.png')}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.813rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    ⬇️ Download
                  </button>
                </div>
                <div style={{ height: '280px' }}>
                  <Bar ref={monthlyChartRef} data={monthlyChartData} options={monthlyChartOptions} />
                </div>
              </div>

              {/* Supplier Distribution Pie Chart */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem', color: '#1e293b' }}>
                      🏢 Supplier Distribution
                    </h3>
                    <p style={{ fontSize: '0.813rem', color: '#64748b', margin: 0 }}>
                      Top suppliers by spending
                    </p>
                  </div>
                  <button
                    onClick={() => downloadChart(supplierChartRef, 'supplier_distribution.png')}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.813rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    ⬇️ Download
                  </button>
                </div>
                <div style={{ height: '280px' }}>
                  <Doughnut ref={supplierChartRef} data={supplierChartData} options={supplierChartOptions} />
                </div>
              </div>
            </div>

            {/* Full Width Trend Chart */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #f1f5f9',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem', color: '#1e293b' }}>
                    📈 Purchase Trend Analysis
                  </h3>
                  <p style={{ fontSize: '0.813rem', color: '#64748b', margin: 0 }}>
                    6-month trend with predictive insights
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => downloadChart(trendChartRef, 'purchase_trend.png')}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.813rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    ⬇️ Download
                  </button>
                  <button
                    onClick={exportToCSV}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.813rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    📄 Export CSV
                  </button>
                </div>
              </div>
              <div style={{ height: '320px' }}>
                <Line ref={trendChartRef} data={trendChartData} options={trendChartOptions} />
              </div>
            </div>

            {/* Top Purchasing Categories */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>
                  Supplier Performance Summary
                </h3>
                <a href="#" style={{ fontSize: '0.875rem', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                  View All Details
                </a>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                      SUPPLIER
                    </th>
                    <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                      TOTAL SPEND
                    </th>
                    <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                      TRANSACTIONS
                    </th>

                    <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {supplierData.map((supplier, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          background: '#eff6ff',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem'
                        }}>
                          🏢
                        </div>
                        <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{supplier.supplier}</span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '1rem', fontSize: '0.875rem', fontWeight: '600' }}>
                        {formatCurrency(supplier.total_amount)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                        {supplier.count}
                      </td>
                      <td style={{ textAlign: 'center', padding: '1rem' }}>
                        <button style={{
                          background: '#f8fafc',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}>
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
