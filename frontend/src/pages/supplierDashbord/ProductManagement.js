import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/supplierDashbord/ProductManagement.css'; 

const ProductManagement = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [formData, setFormData] = useState({ 
        part_name: '', sku_code: '', unit_price: '', current_stock: '', supplier: '' 
    });

    useEffect(() => {
        fetchProducts();
        fetchSuppliers();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/supplier/parts/');
            setProducts(res.data);
        } catch (err) { console.error("Error fetching products:", err); }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/supplier/suppliers/');
            setSuppliers(res.data);
        } catch (err) { console.error("Error fetching suppliers:", err); }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`http://127.0.0.1:8000/api/supplier/parts/${isEditing}/`, formData);
            } else {
                await axios.post('http://127.0.0.1:8000/api/supplier/parts/', formData);
            }
            setFormData({ part_name: '', sku_code: '', unit_price: '', current_stock: '', supplier: '' });
            setIsEditing(null);
            fetchProducts();
        } catch (err) { alert("Action failed. Ensure SKU is unique and Supplier is selected."); }
    };

    const handleEdit = (p) => {
        setIsEditing(p.part_id);
        setFormData({
            part_name: p.part_name,
            sku_code: p.sku_code,
            unit_price: p.unit_price,
            current_stock: p.current_stock,
            supplier: p.supplier
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="supplier-page">
            <nav className="mgmt-navbar">
                <div className="nav-left">
                    <button className="back-btn" onClick={() => navigate('/supplier-dashboard')}>← Dashboard</button>
                    <h1>Inventory Control</h1>
                </div>
            </nav>

            <div className="content-area">
                <div className="form-container">
                    <div className="glass-card">
                        <h3 className="section-title">{isEditing ? '📝 Update Part' : '➕ Add Spare Part'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <input name="part_name" placeholder="Part Name" value={formData.part_name} onChange={handleInputChange} required />
                                <input name="sku_code" placeholder="SKU/Barcode" value={formData.sku_code} onChange={handleInputChange} required />
                                <input name="unit_price" type="number" placeholder="Price ($)" value={formData.unit_price} onChange={handleInputChange} required />
                                <input name="current_stock" type="number" placeholder="Stock Level" value={formData.current_stock} onChange={handleInputChange} required />
                                <select name="supplier" value={formData.supplier} onChange={handleInputChange} required className="full-width">
                                    <option value="">-- Select Supplier --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.company_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-footer-btns">
                                <button type="submit" className="submit-btn">{isEditing ? 'Save Changes' : 'Register Part'}</button>
                                {isEditing && <button className="cancel-btn" onClick={() => setIsEditing(null)}>Cancel</button>}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="section-divider">
                    <span>Parts Registry</span>
                </div>

                <div className="table-container">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Part Details</th>
                                <th>SKU</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Supplier</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.part_id} className="table-row-hover">
                                    <td><strong>{p.part_name}</strong></td>
                                    <td><code>{p.sku_code}</code></td>
                                    <td>${p.unit_price}</td>
                                    <td>
                                        <span className={p.current_stock < 10 ? 'badge inactive' : 'badge active'}>
                                            {p.current_stock} pcs
                                        </span>
                                    </td>
                                    <td>{suppliers.find(s => s.id === p.supplier)?.company_name || '...'}</td>
                                    <td><button className="edit-btn-small" onClick={() => handleEdit(p)}>Edit</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;