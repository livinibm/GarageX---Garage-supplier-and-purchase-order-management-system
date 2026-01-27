import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/supplierDashbord/SupplierManagement.css';

const InventoryManagement = ({ user }) => {
    const navigate = useNavigate();
    const [parts, setParts] = useState([]);
    const [editingPart, setEditingPart] = useState(null);
    const [formData, setFormData] = useState({
        part_name: '',
        sku_code: '',
        description: '',
        unit_price: '',
        current_stock: '',
        supplier: ''
    });
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        fetchParts();
        fetchSuppliers();
    }, []);

    const fetchParts = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('http://127.0.0.1:8000/api/supplier/parts/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParts(res.data);
        } catch (err) {
            console.error('Error fetching parts:', err);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('http://127.0.0.1:8000/api/supplier/suppliers/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuppliers(res.data);
        } catch (err) {
            console.error('Error fetching suppliers:', err);
        }
    };

    const handleEdit = (part) => {
        setEditingPart(part);
        setFormData({
            part_name: part.part_name,
            sku_code: part.sku_code,
            description: part.description || '',
            unit_price: part.unit_price,
            current_stock: part.current_stock,
            supplier: part.supplier
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            await axios.put(`http://127.0.0.1:8000/api/supplier/parts/${editingPart.part_id}/`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Part updated successfully!');
            setEditingPart(null);
            fetchParts();
        } catch (err) {
            console.error('Error updating part:', err);
            alert('Failed to update part.');
        }
    };

    const handleDelete = async (partId) => {
        if (!window.confirm('Are you sure you want to delete this part?')) return;
        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`http://127.0.0.1:8000/api/supplier/parts/${partId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Part deleted successfully!');
            fetchParts();
        } catch (err) {
            console.error('Error deleting part:', err);
            alert('Failed to delete part.');
        }
    };

    const getStockBadge = (stock) => {
        if (stock <= 5) return 'badge inactive'; // low stock
        return 'badge active'; // in stock
    };

    return (
        <div className="supplier-page">
            <nav className="mgmt-navbar">
                <div className="nav-left">
                    <button className="back-btn" onClick={() => navigate('/')}>← Dashboard</button>
                    <h1>Inventory Management</h1>
                </div>
            </nav>

            <div className="content-area">
                {editingPart && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Edit Part</h3>
                            <form onSubmit={handleUpdate}>
                                <div className="form-row">
                                    <input type="text" name="part_name" placeholder="Part Name" value={formData.part_name} onChange={handleChange} required />
                                    <input type="text" name="sku_code" placeholder="SKU Code" value={formData.sku_code} onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <input type="number" name="unit_price" placeholder="Unit Price" value={formData.unit_price} onChange={handleChange} step="0.01" required />
                                    <input type="number" name="current_stock" placeholder="Current Stock" value={formData.current_stock} onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <select name="supplier" value={formData.supplier} onChange={handleChange} required>
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => (
                                            <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows="3" />
                                <div className="form-actions">
                                    <button type="submit">Update Part</button>
                                    <button type="button" onClick={() => setEditingPart(null)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="table-container">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Part Name</th>
                                <th>SKU</th>
                                <th>Supplier</th>
                                <th>Unit Price</th>
                                <th>Current Stock</th>
                                <th>Status</th>
                                {user?.role === 'ADMIN' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {parts.map(part => (
                                <tr key={part.part_id}>
                                    <td>{part.part_name}</td>
                                    <td>{part.sku_code}</td>
                                    <td>{part.supplier_name}</td>
                                    <td>${part.unit_price}</td>
                                    <td>{part.current_stock}</td>
                                    <td>
                                        <span className={getStockBadge(part.current_stock)}>
                                            {part.current_stock <= 5 ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    {user?.role === 'ADMIN' && (
                                        <td>
                                            <button className="submit-btn" style={{ marginRight: '8px' }} onClick={() => handleEdit(part)}>Edit</button>
                                            <button className="cancel-btn" onClick={() => handleDelete(part.part_id)}>Delete</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryManagement;
