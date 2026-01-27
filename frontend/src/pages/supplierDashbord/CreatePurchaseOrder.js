// Banuka Start
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/supplierDashbord/SupplierManagement.css';

const CreatePurchaseOrder = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [availableParts, setAvailableParts] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [expectedDate, setExpectedDate] = useState('');
    const [orderItems, setOrderItems] = useState([]);
    const [poReference, setPoReference] = useState(`PO-${Date.now().toString().slice(-6)}`);

    // Initial fetch for suppliers
    useEffect(() => {
        fetchSuppliers();
    }, []);

    // Fetch parts when supplier changes
    useEffect(() => {
        if (selectedSupplier) {
            fetchPartsBySupplier(selectedSupplier);
            setOrderItems([]); // Clear items if supplier changes
        } else {
            setAvailableParts([]);
        }
    }, [selectedSupplier]);

    const fetchSuppliers = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('http://127.0.0.1:8000/api/supplier/suppliers/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuppliers(res.data);
        } catch (err) { console.error("Error fetching suppliers:", err); }
    };

    const fetchPartsBySupplier = async (supplierId) => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('http://127.0.0.1:8000/api/supplier/parts/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter parts by supplier on frontend for now (ideal: backend filter)
            const parts = res.data.filter(p => p.supplier === parseInt(supplierId));
            setAvailableParts(parts);
        } catch (err) { console.error("Error fetching parts:", err); }
    };

    const handleAddItem = () => {
        setOrderItems([...orderItems, { spare_part: '', quantity: 1, agreed_price: 0, line_total: 0 }]);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...orderItems];
        newItems[index][field] = value;

        if (field === 'spare_part') {
            const part = availableParts.find(p => p.part_id === parseInt(value));
            if (part) {
                newItems[index].agreed_price = part.unit_price;
            }
        }

        // Recalculate line_total (locally for display)
        if (field === 'quantity' || field === 'spare_part') {
            newItems[index].line_total = newItems[index].quantity * newItems[index].agreed_price;
        }

        setOrderItems(newItems);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...orderItems];
        newItems.splice(index, 1);
        setOrderItems(newItems);
    };

    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => sum + item.line_total, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            const payload = {
                po_reference_number: poReference,
                supplier: selectedSupplier,
                expected_delivery_date: expectedDate,
                items: orderItems,
                // total_amount is calculated on backend but we pass it if required
                total_amount: calculateTotal(),
                created_by_user: 1 // Link to a dummy user for now
            };
            await axios.post('http://127.0.0.1:8000/api/supplier/purchase-orders/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/purchase-orders');
        } catch (err) {
            console.error("Error creating order:", err.response?.data);
            alert("Failed to create order. " + JSON.stringify(err.response?.data || "Check all fields."));
        }
    };

    return (
        <div className="supplier-page">
            <nav className="mgmt-navbar">
                <div className="nav-left">
                    <button className="back-btn" onClick={() => navigate('/purchase-orders')}>← Back</button>
                    <h1>Create Purchase Order</h1>
                </div>
            </nav>

            <div className="content-area">
                <div className="form-container">
                    <div className="glass-card">
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="full-width">
                                    <label>PO Reference Number:</label>
                                    <input
                                        type="text"
                                        value={poReference}
                                        onChange={(e) => setPoReference(e.target.value)}
                                        required
                                    />
                                </div>

                                <select
                                    className="full-width"
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Supplier --</option>
                                    {suppliers.map(s => (
                                        <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>
                                    ))}
                                </select>

                                <div className="full-width">
                                    <label>Expected Delivery Date:</label>
                                    <input
                                        type="date"
                                        value={expectedDate}
                                        onChange={(e) => setExpectedDate(e.target.value)}
                                        required
                                        style={{ marginTop: '5px' }}
                                    />
                                </div>
                            </div>

                            <hr className="divider" style={{ margin: '20px 0', border: '0', borderTop: '1px solid rgba(255,255,255,0.1)' }} />

                            <h3 className="section-title">Order Items</h3>

                            {orderItems.map((item, index) => (
                                <div key={index} className="form-grid" style={{ marginBottom: '10px', alignItems: 'center' }}>
                                    <select
                                        value={item.spare_part}
                                        onChange={(e) => handleItemChange(index, 'spare_part', e.target.value)}
                                        required
                                        style={{ flex: 2 }}
                                    >
                                        <option value="">-- Select Part --</option>
                                        {availableParts.map(p => (
                                            <option key={p.part_id} value={p.part_id}>{p.part_name} (${p.unit_price})</option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                        required
                                        style={{ flex: 1 }}
                                    />

                                    <div style={{ flex: 1, color: 'white', textAlign: 'right' }}>
                                        ${item.line_total.toFixed(2)}
                                    </div>

                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => handleRemoveItem(index)}
                                        style={{ width: 'auto', padding: '5px 10px' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            <button type="button" className="edit-btn-small" onClick={handleAddItem} style={{ marginBottom: '20px' }}>
                                + Add Item
                            </button>

                            <div className="total-section" style={{ textAlign: 'right', fontSize: '1.2em', color: '#00d2ff', marginBottom: '20px' }}>
                                <strong>Grand Total: ${calculateTotal().toFixed(2)}</strong>
                            </div>

                            <div className="form-footer-btns">
                                <button type="submit" className="submit-btn">Submit Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePurchaseOrder;
// Banuka End
