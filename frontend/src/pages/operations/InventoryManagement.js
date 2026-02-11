import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api';
import { useNavigate } from 'react-router-dom';
import '../../styles/vendorDashboard/VendorManagement.css';

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
            const res = await apiClient.get('/api/vendor/parts/');
            setParts(res.data);
        } catch (err) {
            console.error('Error fetching parts:', err);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await apiClient.get('/api/vendor/suppliers/');
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
            await apiClient.put(`/api/vendor/parts/${editingPart.part_id}/`, formData);
            alert('Item updated successfully!');
            setEditingPart(null);
            fetchParts();
        } catch (err) {
            console.error('Error updating item:', err);
            alert('Failed to update item.');
        }
    };

    const handleDelete = async (partId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await apiClient.delete(`/api/vendor/parts/${partId}/`);
            alert('Item deleted successfully!');
            fetchParts();
        } catch (err) {
            console.error('Error deleting item:', err);
            alert('Failed to delete item.');
        }
    };

    const getStockBadge = (stock) => {
        if (stock <= 5) return 'badge inactive';
        return 'badge active';
    };

    return (
        <div className="supplier-page">
            <nav className="mgmt-navbar">
                <div className="nav-left">
                    <button className="back-btn" onClick={() => navigate('/')}>← Dashboard</button>
                    <h1>Stock Health</h1>
                </div>
            </nav>

            <div className="content-area">
                {editingPart && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Edit Item</h3>
                            <form onSubmit={handleUpdate}>
                                <div className="form-row">
                                    <input type="text" name="part_name" placeholder="Item Name" value={formData.part_name} onChange={handleChange} required />
                                    <input type="text" name="sku_code" placeholder="SKU Code" value={formData.sku_code} onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <input type="number" name="unit_price" placeholder="Unit Price" value={formData.unit_price} onChange={handleChange} step="0.01" required />
                                    <input type="number" name="current_stock" placeholder="Current Stock" value={formData.current_stock} onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <select name="supplier" value={formData.supplier} onChange={handleChange} required>
                                        <option value="">Select Vendor</option>
                                        {suppliers.map(s => (
                                            <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows="3" />
                                <div className="form-actions">
                                    <button type="submit">Update Item</button>
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
                                <th>Item</th>
                                <th>SKU</th>
                                <th>Vendor</th>
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
