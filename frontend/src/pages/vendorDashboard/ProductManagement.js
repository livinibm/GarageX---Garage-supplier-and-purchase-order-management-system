import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api';
import { useNavigate } from 'react-router-dom';
import '../../styles/vendorDashboard/ProductManagement.css';

const sampleProducts = [
    { part_id: 1, part_name: 'Precision Valve', sku_code: 'PV-1001', unit_price: 75, current_stock: 22, supplier: 1 },
    { part_id: 2, part_name: 'Flux Sensor', sku_code: 'FS-2002', unit_price: 15, current_stock: 48, supplier: 2 },
    { part_id: 3, part_name: 'Relay Core', sku_code: 'RC-3003', unit_price: 12, current_stock: 9, supplier: 3 },
    { part_id: 4, part_name: 'Intake Mesh', sku_code: 'IM-4004', unit_price: 18, current_stock: 14, supplier: 1 },
    { part_id: 5, part_name: 'Timing Coupler', sku_code: 'TC-5005', unit_price: 45, current_stock: 16, supplier: 4 },
    { part_id: 6, part_name: 'Torque Disc', sku_code: 'TD-6006', unit_price: 90, current_stock: 7, supplier: 5 },
    { part_id: 7, part_name: 'Flow Pump', sku_code: 'FP-7007', unit_price: 120, current_stock: 11, supplier: 6 },
    { part_id: 8, part_name: 'Power Cell', sku_code: 'PC-8008', unit_price: 150, current_stock: 6, supplier: 7 },
    { part_id: 9, part_name: 'Cooling Array', sku_code: 'CA-9009', unit_price: 200, current_stock: 5, supplier: 8 },
    { part_id: 10, part_name: 'Clutch Plate', sku_code: 'CP-1010', unit_price: 85, current_stock: 19, supplier: 9 }
];

const sampleSuppliers = [
    { supplier_id: 1, supplier_name: 'Northline Components' },
    { supplier_id: 2, supplier_name: 'Bluecrest Supply' },
    { supplier_id: 3, supplier_name: 'Forgewell Partners' },
    { supplier_id: 4, supplier_name: 'Harborline Industrial' },
    { supplier_id: 5, supplier_name: 'Union Peak Labs' },
    { supplier_id: 6, supplier_name: 'VectorBay Logistics' },
    { supplier_id: 7, supplier_name: 'Cobalt Ridge Co.' },
    { supplier_id: 8, supplier_name: 'Atlas Reach' },
    { supplier_id: 9, supplier_name: 'Brightwire Manufacturing' },
    { supplier_id: 10, supplier_name: 'Skyline Components' }
];

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
            const res = await apiClient.get('/api/vendor/parts/');
            const normalized = Array.isArray(res.data) ? res.data : [];
            setProducts(normalized.length > 0 ? normalized : sampleProducts);
        } catch (err) {
            console.error("Error fetching products:", err);
            setProducts(sampleProducts);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await apiClient.get('/api/vendor/suppliers/');
            const normalized = Array.isArray(res.data) ? res.data : [];
            setSuppliers(normalized.length > 0 ? normalized : sampleSuppliers);
        } catch (err) {
            console.error("Error fetching suppliers:", err);
            setSuppliers(sampleSuppliers);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await apiClient.put(`/api/vendor/parts/${isEditing}/`, formData);
            } else {
                await apiClient.post('/api/vendor/parts/', formData);
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
        <div className="supplier-page" style={{ padding: '2rem' }}>
            <div className="dashboard-header" style={{ marginBottom: '2rem', padding: '0', boxShadow: 'none', background: 'transparent', borderBottom: 'none' }}>
                <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={() => navigate('/')}
                    >
                        &larr;
                    </button>
                    <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Catalog Control</h1>
                </div>
            </div>

            <div className="content-area" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        {isEditing ? '📝 Update Item' : '➕ Add Catalog Item'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <input className="input-field" name="part_name" placeholder="Item Name" value={formData.part_name} onChange={handleInputChange} required />
                            <input className="input-field" name="sku_code" placeholder="SKU / Code" value={formData.sku_code} onChange={handleInputChange} required />
                            <input className="input-field" name="unit_price" type="number" placeholder="Unit Price" value={formData.unit_price} onChange={handleInputChange} required />
                            <input className="input-field" name="current_stock" type="number" placeholder="Available Stock" value={formData.current_stock} onChange={handleInputChange} required />
                            <select name="supplier" value={formData.supplier} onChange={handleInputChange} required className="input-field full-width">
                                <option value="">-- Select Vendor --</option>
                                {suppliers.map(s => (
                                    <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-footer-btns" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            {isEditing && <button type="button" className="btn-secondary" onClick={() => setIsEditing(null)}>Cancel</button>}
                            <button type="submit" className="btn-primary">{isEditing ? 'Save Changes' : 'Save Item'}</button>
                        </div>
                    </form>
                </div>

                <div className="section-divider" style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Catalog Registry</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)', marginLeft: '1rem' }}></div>
                </div>

                <div className="table-container">
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--surface-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', fontWeight: '600' }}>Item</th>
                                    <th style={{ padding: '1rem', fontWeight: '600' }}>SKU</th>
                                    <th style={{ padding: '1rem', fontWeight: '600' }}>Price</th>
                                    <th style={{ padding: '1rem', fontWeight: '600' }}>Stock</th>
                                    <th style={{ padding: '1rem', fontWeight: '600' }}>Vendor</th>
                                    <th style={{ padding: '1rem', fontWeight: '600' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.part_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}><strong>{p.part_name}</strong></td>
                                        <td style={{ padding: '1rem' }}><code style={{ background: 'var(--surface-color)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{p.sku_code}</code></td>
                                        <td style={{ padding: '1rem' }}>${p.unit_price}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                background: p.current_stock < 10 ? 'rgba(220, 53, 69, 0.1)' : 'rgba(40, 167, 69, 0.1)',
                                                color: p.current_stock < 10 ? 'var(--danger-color)' : 'var(--success-color)'
                                            }}>
                                                {p.current_stock} pcs
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{suppliers.find(s => s.supplier_id === p.supplier)?.supplier_name || '...'}</td>
                                        <td style={{ padding: '1rem' }}><button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={() => handleEdit(p)}>Edit</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;
