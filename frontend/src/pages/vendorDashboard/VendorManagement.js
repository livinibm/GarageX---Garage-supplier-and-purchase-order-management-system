import React, { useState, useEffect, useMemo, useRef } from 'react';
import { apiClient } from '../../api';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import '../../styles/vendorDashboard/VendorManagement.css';

const sampleSuppliers = [
    {
        supplier_id: 1,
        supplier_name: 'Northline Components',
        contact_email: 'ops@northline.example',
        phone_number: '+94 77 123 4567',
        address: 'Colombo 07',
        is_active: true,
        score: 86.4,
        on_time_rate: 92.1
    },
    {
        supplier_id: 2,
        supplier_name: 'Bluecrest Supply',
        contact_email: 'contact@bluecrest.example',
        phone_number: '+94 76 555 2211',
        address: 'Kandy',
        is_active: true,
        score: 78.9,
        on_time_rate: 84.6
    },
    {
        supplier_id: 3,
        supplier_name: 'Forgewell Partners',
        contact_email: 'hello@forgewell.example',
        phone_number: '+94 71 909 7788',
        address: 'Galle',
        is_active: false,
        score: 52.2,
        on_time_rate: 60.5
    },
    {
        supplier_id: 4,
        supplier_name: 'Harborline Industrial',
        contact_email: 'team@harborline.example',
        phone_number: '+94 75 333 9911',
        address: 'Negombo',
        is_active: true,
        score: 81.7,
        on_time_rate: 88.2
    },
    {
        supplier_id: 5,
        supplier_name: 'Union Peak Labs',
        contact_email: 'admin@unionpeak.example',
        phone_number: '+94 77 221 3344',
        address: 'Matara',
        is_active: true,
        score: 90.3,
        on_time_rate: 95.0
    },
    {
        supplier_id: 6,
        supplier_name: 'VectorBay Logistics',
        contact_email: 'hello@vectorbay.example',
        phone_number: '+94 71 555 6633',
        address: 'Kurunegala',
        is_active: true,
        score: 73.4,
        on_time_rate: 79.1
    },
    {
        supplier_id: 7,
        supplier_name: 'Cobalt Ridge Co.',
        contact_email: 'supply@cobaltridge.example',
        phone_number: '+94 76 444 8899',
        address: 'Jaffna',
        is_active: false,
        score: 48.6,
        on_time_rate: 55.0
    },
    {
        supplier_id: 8,
        supplier_name: 'Atlas Reach',
        contact_email: 'hello@atlasreach.example',
        phone_number: '+94 72 888 2233',
        address: 'Anuradhapura',
        is_active: true,
        score: 88.8,
        on_time_rate: 90.2
    },
    {
        supplier_id: 9,
        supplier_name: 'Brightwire Manufacturing',
        contact_email: 'contact@brightwire.example',
        phone_number: '+94 78 991 1122',
        address: 'Gampaha',
        is_active: true,
        score: 69.9,
        on_time_rate: 77.4
    },
    {
        supplier_id: 10,
        supplier_name: 'Skyline Components',
        contact_email: 'sales@skyline.example',
        phone_number: '+94 75 667 4455',
        address: 'Ratnapura',
        is_active: false,
        score: 58.1,
        on_time_rate: 62.7
    }
];

const VendorManagement = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
    const formRef = useRef(null);

    const [formData, setFormData] = useState({
        supplier_name: '',
        contact_email: '',
        phone_number: '',
        address: '',
        is_active: true
    });

    useEffect(() => { fetchSuppliers(); }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await apiClient.get('/api/vendor/suppliers/');
            const normalized = Array.isArray(res.data) ? res.data : [];
            setSuppliers(normalized.length > 0 ? normalized : sampleSuppliers);
        } catch (err) {
            console.error('Fetch error:', err);
            setSuppliers(sampleSuppliers);
        }
    };

    const activeCount = suppliers.filter(s => s.is_active).length;
    const inactiveCount = suppliers.length - activeCount;
    const chartData = [
        { name: 'Active', value: activeCount },
        { name: 'Inactive', value: inactiveCount },
    ];
    const COLORS = ['#22c55e', '#ef4444'];

    const summary = useMemo(() => {
        const scores = suppliers
            .map(s => Number(s.score))
            .filter(v => Number.isFinite(v) && v > 0);
        const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        const atRisk = suppliers.filter(s => Number(s.score || 0) < 60).length;
        const onTimeAvg = suppliers
            .map(s => Number(s.on_time_rate))
            .filter(v => Number.isFinite(v) && v > 0);
        const avgOnTime = onTimeAvg.length ? (onTimeAvg.reduce((a, b) => a + b, 0) / onTimeAvg.length) : 0;
        const riskBuckets = suppliers.reduce((acc, supplier) => {
            const scoreValue = Number(supplier.score || 0);
            if (scoreValue >= 80) acc.low += 1;
            else if (scoreValue >= 60) acc.medium += 1;
            else acc.high += 1;
            return acc;
        }, { low: 0, medium: 0, high: 0 });
        return { avgScore, atRisk, avgOnTime, riskBuckets };
    }, [suppliers]);

    const filteredSuppliers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        let list = suppliers.filter(s => {
            const matchesQuery = !normalizedQuery || [
                s.supplier_name,
                s.contact_email,
                s.phone_number,
                s.address
            ].some(value => String(value || '').toLowerCase().includes(normalizedQuery));
            const matchesStatus = statusFilter === 'all'
                || (statusFilter === 'active' && s.is_active)
                || (statusFilter === 'inactive' && !s.is_active);
            return matchesQuery && matchesStatus;
        });

        const directionFactor = sortConfig.direction === 'asc' ? 1 : -1;
        const getValue = (supplier) => {
            switch (sortConfig.key) {
                case 'name':
                    return String(supplier.supplier_name || '').toLowerCase();
                case 'score':
                    return Number(supplier.score || 0);
                case 'on_time':
                    return Number(supplier.on_time_rate || 0);
                case 'status':
                    return supplier.is_active ? 1 : 0;
                case 'contact':
                    return String(supplier.contact_email || '').toLowerCase();
                default:
                    return 0;
            }
        };

        list = [...list].sort((a, b) => {
            const valueA = getValue(a);
            const valueB = getValue(b);
            if (valueA < valueB) return -1 * directionFactor;
            if (valueA > valueB) return 1 * directionFactor;
            return 0;
        });

        return list;
    }, [suppliers, query, statusFilter, sortConfig]);

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: key === 'name' ? 'asc' : 'desc' };
        });
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const getSparklinePoints = (supplier) => {
        const base = Number(supplier.score || 0) || 60;
        const seed = Number(supplier.supplier_id || 1) * 1.7;
        const values = Array.from({ length: 6 }, (_, idx) => {
            const variation = Math.sin(seed + idx * 0.9) * 6;
            const drift = idx * 0.6 - 1.5;
            return Math.max(20, Math.min(100, base + variation + drift));
        });
        const width = 72;
        const height = 24;
        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max - min || 1;
        const step = width / (values.length - 1);
        return values.map((value, index) => {
            const x = index * step;
            const y = height - ((value - min) / range) * height;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await apiClient.put(`/api/vendor/suppliers/${isEditing}/`, formData);
            } else {
                await apiClient.post('/api/vendor/suppliers/', formData);
            }
            resetForm();
            fetchSuppliers();
        } catch (err) {
            console.error('Error Response:', err.response?.data);
            alert('Action failed. Ensure backend models match database columns.');
        }
    };

    const handleEditClick = (supplier) => {
        setIsEditing(supplier.supplier_id);
        setFormData({
            supplier_name: supplier.supplier_name,
            contact_email: supplier.contact_email,
            phone_number: supplier.phone_number || '',
            address: supplier.address || '',
            is_active: Boolean(supplier.is_active)
        });
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const resetForm = () => {
        setFormData({ supplier_name: '', contact_email: '', phone_number: '', address: '', is_active: true });
        setIsEditing(null);
    };

    const handleScrollToForm = () => {
        resetForm();
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const getRiskLabel = (scoreValue) => {
        if (scoreValue >= 80) return 'Low Risk';
        if (scoreValue >= 60) return 'Medium Risk';
        return 'High Risk';
    };

    return (
        <div className="supplier-page vendor-scorecard-page">
            <div className="page-hero">
                <div className="hero-left">
                    <button className="btn-secondary" onClick={() => navigate('/')}>
                        &larr; Dashboard
                    </button>
                    <div>
                        <p className="hero-eyebrow">Vendor Intelligence</p>
                        <h1 className="hero-title">Vendor Scorecards</h1>
                        <p className="hero-subtitle">Track reliability, compliance, and delivery performance across every partner.</p>
                    </div>
                </div>
                <div className="hero-actions">
                    <button className="btn-primary" onClick={handleScrollToForm}>Add Vendor</button>
                </div>
            </div>

            <div className="content-area">
                <div className="stat-grid">
                    <div className="stat-card">
                        <p className="stat-label">Total Vendors</p>
                        <p className="stat-value">{suppliers.length}</p>
                        <p className="stat-meta">Across all regions</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Avg Score</p>
                        <p className="stat-value">{summary.avgScore ? summary.avgScore.toFixed(1) : '--'}</p>
                        <p className="stat-meta">Target 85+</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Avg On-Time</p>
                        <p className="stat-value">{summary.avgOnTime ? `${summary.avgOnTime.toFixed(1)}%` : '--'}</p>
                        <p className="stat-meta">Last 90 days</p>
                    </div>
                    <div className="stat-card highlight">
                        <p className="stat-label">At Risk</p>
                        <p className="stat-value">{summary.atRisk}</p>
                        <p className="stat-meta">Score below 60</p>
                    </div>
                </div>

                <div className="analytics-row">
                    <div className="card chart-card">
                        <h3>Vendor Status</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} innerRadius={62} outerRadius={90} paddingAngle={6} dataKey="value">
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="card insight-card">
                        <h3>Quick Insights</h3>
                        <ul>
                            <li><strong>{activeCount}</strong> active vendors ready for new orders.</li>
                            <li><strong>{inactiveCount}</strong> vendors currently paused or inactive.</li>
                            <li><strong>{summary.atRisk}</strong> vendors require immediate follow-up.</li>
                        </ul>
                        <div className="pill-row">
                            <span className="pill success">Stable</span>
                            <span className="pill warning">Watchlist</span>
                            <span className="pill danger">High Risk</span>
                        </div>
                    </div>
                </div>

                <div className="form-container" ref={formRef}>
                    <div className="card">
                        <h3>{isEditing ? 'Update Vendor' : 'Register Vendor'}</h3>
                        <p className="form-subtitle">Keep vendor contact details and activation status current.</p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <input className="input-field" name="supplier_name" placeholder="Vendor Name" value={formData.supplier_name} onChange={handleInputChange} required />
                                <input className="input-field" name="contact_email" type="email" placeholder="Email" value={formData.contact_email} onChange={handleInputChange} required />
                                <input className="input-field" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleInputChange} />
                                <label className="check-box-ui">
                                    <input name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} />
                                    Active Status
                                </label>
                                <textarea
                                    name="address"
                                    placeholder="Address"
                                    className="input-field full-width"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">{isEditing ? 'Save Changes' : 'Add Vendor'}</button>
                                {isEditing && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="table-container">
                    <div className="risk-banner">
                        <div>
                            <strong>Risk summary:</strong> {summary.riskBuckets.low} low-risk, {summary.riskBuckets.medium} watchlist, {summary.riskBuckets.high} high-risk vendors.
                        </div>
                        <div className="risk-badges">
                            <span className="risk-pill low">Low Risk</span>
                            <span className="risk-pill medium">Watchlist</span>
                            <span className="risk-pill high">High Risk</span>
                        </div>
                    </div>
                    <div className="table-toolbar">
                        <div className="toolbar-left">
                            <h3>Vendor Directory</h3>
                            <p>{filteredSuppliers.length} vendors</p>
                        </div>
                        <div className="toolbar-right">
                            <input
                                className="search-input"
                                placeholder="Search vendors"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <select
                                className="filter-select"
                                value={sortConfig.key}
                                onChange={(e) => handleSort(e.target.value)}
                            >
                                <option value="score">Sort by Score</option>
                                <option value="name">Sort by Name</option>
                                <option value="on_time">Sort by On-Time</option>
                                <option value="status">Sort by Status</option>
                                <option value="contact">Sort by Contact</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-scroll">
                        <table className="vendor-table">
                            <thead>
                                <tr>
                                    <th>
                                        <button type="button" className="sort-button" onClick={() => handleSort('name')}>
                                            Vendor <span className="sort-indicator">{getSortIndicator('name')}</span>
                                        </button>
                                    </th>
                                    <th>
                                        <button type="button" className="sort-button" onClick={() => handleSort('score')}>
                                            Score <span className="sort-indicator">{getSortIndicator('score')}</span>
                                        </button>
                                    </th>
                                    <th>
                                        <button type="button" className="sort-button" onClick={() => handleSort('on_time')}>
                                            On-Time <span className="sort-indicator">{getSortIndicator('on_time')}</span>
                                        </button>
                                    </th>
                                    <th>
                                        <button type="button" className="sort-button" onClick={() => handleSort('status')}>
                                            Status <span className="sort-indicator">{getSortIndicator('status')}</span>
                                        </button>
                                    </th>
                                    <th>
                                        <button type="button" className="sort-button" onClick={() => handleSort('contact')}>
                                            Contact <span className="sort-indicator">{getSortIndicator('contact')}</span>
                                        </button>
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSuppliers.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="empty-state">No vendors match this filter.</td>
                                    </tr>
                                )}
                                {filteredSuppliers.map((supplier) => {
                                    const scoreValue = Number(supplier.score || 0);
                                    const onTimeValue = Number(supplier.on_time_rate || 0);
                                    const riskLabel = getRiskLabel(scoreValue);

                                    return (
                                        <tr key={supplier.supplier_id} className="vendor-row">
                                            <td>
                                                <div className="vendor-name">{supplier.supplier_name}</div>
                                                <div className="vendor-sub">{supplier.address || 'Location not provided'}</div>
                                            </td>
                                            <td>
                                                <div className="score-stack">
                                                    <div className="score-chip" data-risk={riskLabel.toLowerCase().replace(' ', '-')}
                                                    >
                                                        {scoreValue ? scoreValue.toFixed(1) : '--'}
                                                    </div>
                                                    <svg className="sparkline" viewBox="0 0 72 24" aria-hidden="true">
                                                        <polyline points={getSparklinePoints(supplier)} />
                                                    </svg>
                                                    <span className="risk-label">{riskLabel}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="metric">{onTimeValue ? `${onTimeValue.toFixed(1)}%` : '--'}</div>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${supplier.is_active ? 'active' : 'inactive'}`}>
                                                    {supplier.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="vendor-contact">{supplier.contact_email || 'No email'}</div>
                                                <div className="vendor-sub">{supplier.phone_number || 'No phone'}</div>
                                            </td>
                                            <td>
                                                <button className="edit-btn-small" onClick={() => handleEditClick(supplier)}>Edit</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorManagement;
