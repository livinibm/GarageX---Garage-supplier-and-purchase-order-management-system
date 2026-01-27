import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import '../../styles/supplierDashbord/SupplierManagement.css';

const SupplierManagement = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    
    // UPDATED: Field names now match database columns: supplier_name, contact_email, phone_number
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
            const res = await axios.get('http://127.0.0.1:8000/api/supplier/suppliers/');
            setSuppliers(res.data);
        } catch (err) { 
            console.error("Fetch error:", err); 
        }
    };

    // Analytics Data Calculation
    const activeCount = suppliers.filter(s => s.is_active).length;
    const inactiveCount = suppliers.length - activeCount;
    const chartData = [
        { name: 'Available', value: activeCount },
        { name: 'Unavailable', value: inactiveCount },
    ];
    const COLORS = ['#00d2ff', '#ff4757'];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Use supplier_id (primary key from SQL)
                await axios.put(`http://127.0.0.1:8000/api/supplier/suppliers/${isEditing}/`, formData);
            } else {
                await axios.post('http://127.0.0.1:8000/api/supplier/suppliers/', formData);
            }
            resetForm();
            fetchSuppliers();
        } catch (err) { 
            console.error("Error Response:", err.response?.data);
            alert("Action failed. Ensure backend models match database columns."); 
        }
    };

    const handleEditClick = (supplier) => {
        setIsEditing(supplier.supplier_id);
        // UPDATED: Mapping incoming database fields to form state
        setFormData({
            supplier_name: supplier.supplier_name,
            contact_email: supplier.contact_email,
            phone_number: supplier.phone_number || '',
            address: supplier.address || '',
            is_active: Boolean(supplier.is_active)
        });
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ supplier_name: '', contact_email: '', phone_number: '', address: '', is_active: true });
        setIsEditing(null);
    };

    return (
        <div className="supplier-page">
            <nav className="mgmt-navbar">
                <div className="nav-left">
                    <button className="back-btn" onClick={() => navigate('/supplier-dashboard')}>← Dashboard</button>
                    <h1>Supplier Control Center</h1>
                </div>
            </nav>

            <div className="content-area">
                <div className="analytics-row">
                    <div className="glass-card stat-card">
                        <h3>Total Suppliers</h3>
                        <p className="stat-number">{suppliers.length}</p>
                    </div>
                    
                    {/* FIXED: Explicit height on container to resolve Recharts width(-1) warning */}
                    <div className="glass-card chart-card" style={{ height: '320px', minHeight: '320px' }}>
                        <h3>Availability Overview</h3>
                        <div style={{ width: '100%', height: '230px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
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
                </div>

                <div className="form-container">
                    <div className="glass-card">
                        <h3>{isEditing ? '📝 Update Details' : '➕ Register Supplier'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <input name="supplier_name" placeholder="Supplier Name" value={formData.supplier_name} onChange={handleInputChange} required />
                                <input name="contact_email" type="email" placeholder="Email" value={formData.contact_email} onChange={handleInputChange} required />
                                <input name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleInputChange} />
                                <label className="check-box-ui">
                                    <input name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} />
                                    Active Status
                                </label>
                                <textarea name="address" placeholder="Address" className="full-width" value={formData.address} onChange={handleInputChange} />
                            </div>
                            <button type="submit" className="submit-btn">{isEditing ? 'Save Changes' : 'Add Supplier'}</button>
                            {isEditing && <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>}
                        </form>
                    </div>
                </div>

                <div className="table-container">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Supplier Name</th>
                                <th>Contact Email</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(s => (
                                <tr key={s.supplier_id}>
                                    <td><strong>{s.supplier_name}</strong></td>
                                    <td>{s.contact_email}</td>
                                    <td>
                                        <span className={s.is_active ? 'badge active' : 'badge inactive'}>
                                            {s.is_active ? 'Available' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td><button className="edit-btn-small" onClick={() => handleEditClick(s)}>Edit</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupplierManagement;