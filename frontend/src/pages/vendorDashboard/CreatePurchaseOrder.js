import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api';
import { useNavigate } from 'react-router-dom';
import '../../styles/vendorDashboard/VendorManagement.css';

const CreatePurchaseOrder = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [allParts, setAllParts] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [expectedDelivery, setExpectedDelivery] = useState('');
    const [orderItems, setOrderItems] = useState([]);
    const [poReference, setPoReference] = useState(`PO-${Date.now().toString().slice(-6)}`);

    useEffect(() => {
        fetchSuppliers();
        fetchAllParts();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await apiClient.get('/api/vendor/suppliers/');
            setSuppliers(res.data);
        } catch (err) { console.error("Error fetching suppliers:", err); }
    };

    const fetchAllParts = async () => {
        try {
            const res = await apiClient.get('/api/vendor/parts/');
            setAllParts(res.data);
        } catch (err) { console.error("Error fetching parts:", err); }
    };

    const handleAddItem = () => {
        setOrderItems([...orderItems, { spare_part: '', quantity: 1, agreed_price: 0, subtotal: 0 }]);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...orderItems];
        newItems[index][field] = value;

        if (field === 'spare_part') {
            const part = allParts.find(p => p.part_id === parseInt(value));
            if (part) {
                newItems[index].agreed_price = part.unit_price;
                newItems[index].supplier_id = part.supplier;
            }
        }

        if (field === 'quantity' || field === 'spare_part') {
            newItems[index].subtotal = (newItems[index].quantity || 0) * (newItems[index].agreed_price || 0);
        }

        setOrderItems(newItems);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...orderItems];
        newItems.splice(index, 1);
        setOrderItems(newItems);
    };

    const calculateGrandTotal = () => {
        return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const ordersBySupplier = {};
            orderItems.forEach(item => {
                if (!item.spare_part) return;
                const part = allParts.find(p => p.part_id === parseInt(item.spare_part));
                const supId = part ? part.supplier : selectedSupplier;

                if (!ordersBySupplier[supId]) {
                    ordersBySupplier[supId] = [];
                }
                ordersBySupplier[supId].push(item);
            });

            const promises = Object.keys(ordersBySupplier).map((supId, index) => {
                const supplierItems = ordersBySupplier[supId];
                const totalAmount = supplierItems.reduce((sum, item) => sum + item.subtotal, 0);
                const refSuffix = Object.keys(ordersBySupplier).length > 1 ? `-${index + 1}` : '';

                const payload = {
                    po_reference_number: `${poReference}${refSuffix}`,
                    supplier: parseInt(supId),
                    order_date: orderDate,
                    expected_delivery_date: expectedDelivery,
                    items: supplierItems.map(item => ({
                        spare_part: item.spare_part,
                        quantity: item.quantity,
                        agreed_price: item.agreed_price,
                        subtotal: item.subtotal
                    })),
                    total_amount: totalAmount
                };

                return apiClient.post('/api/vendor/purchase-orders/', payload);
            });

            await Promise.all(promises);
            alert("Order(s) created successfully!");
            navigate('/purchase-orders');
        } catch (err) {
            console.error("Error creating order:", err.response?.data);
            alert("Failed to create order. " + JSON.stringify(err.response?.data || "Check all fields."));
        }
    };

    return (
        <div className="supplier-page" style={{ padding: '0', background: 'var(--gray-100)', minHeight: '100vh' }}>
            <div className="dashboard-header" style={{
                padding: '1.25rem 2rem',
                background: 'var(--white)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate('/purchase-orders')}>
                        &larr; Back
                    </button>
                    <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700', letterSpacing: '-0.02em' }}>Create Order</h1>
                </div>
            </div>

            <div className="content-area" style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 2rem' }}>
                <div className="card" style={{ border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Order Details</h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                            <div className="full-width" style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ORDER REFERENCE</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    value={poReference}
                                    onChange={(e) => setPoReference(e.target.value)}
                                    required
                                    style={{ marginBottom: '0.5rem' }}
                                />
                                {orderItems.length > 0 && Object.keys(orderItems.reduce((acc, item) => {
                                    const p = allParts.find(x => x.part_id === parseInt(item.spare_part));
                                    if (p) acc[p.supplier] = true;
                                    return acc;
                                }, {})).length > 1 && (
                                        <small style={{ color: 'var(--primary-blue)', display: 'block', marginTop: '0.25rem', fontWeight: '500' }}>
                                            * Items from multiple vendors detected. Multiple orders will be created.
                                        </small>
                                    )}
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ORDER DATE</label>
                                <input
                                    className="input-field"
                                    type="date"
                                    value={orderDate}
                                    onChange={(e) => setOrderDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>EXPECTED DELIVERY</label>
                                <input
                                    className="input-field"
                                    type="date"
                                    value={expectedDelivery}
                                    onChange={(e) => setExpectedDelivery(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'var(--gray-100)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem' }}>Order Items</h4>
                            {orderItems.map((item, index) => (
                                <div key={index} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr auto',
                                    gap: '1rem',
                                    marginBottom: '1rem',
                                    alignItems: 'end',
                                    padding: '1rem',
                                    background: 'var(--white)',
                                    borderRadius: '6px',
                                    border: '1px solid var(--gray-300)'
                                }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>SELECT ITEM</label>
                                        <select
                                            className="input-field"
                                            value={item.spare_part}
                                            onChange={(e) => handleItemChange(index, 'spare_part', e.target.value)}
                                            required
                                            style={{ marginBottom: 0 }}
                                        >
                                            <option value="">-- Choose --</option>
                                            {allParts.map(p => (
                                                <option key={p.part_id} value={p.part_id}>
                                                    {p.part_name} (${p.unit_price}) - {suppliers.find(s => s.supplier_id === p.supplier)?.supplier_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>QUANTITY</label>
                                        <input
                                            className="input-field"
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                            required
                                            style={{ marginBottom: 0 }}
                                        />
                                    </div>
                                    <div style={{ textAlign: 'right', paddingBottom: '0.6rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Subtotal:</span>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>${item.subtotal.toFixed(2)}</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-danger"
                                        onClick={() => handleRemoveItem(index)}
                                        style={{ padding: '0.5rem', background: 'transparent', color: 'var(--danger-color)', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="btn-secondary" onClick={handleAddItem} style={{ marginTop: '0.5rem' }}>+ Add Item</button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Total: ${calculateGrandTotal().toFixed(2)}</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => navigate('/purchase-orders')}>Cancel</button>
                                <button type="submit" className="btn-primary">Submit Order</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePurchaseOrder;
