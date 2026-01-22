-- Sample data for purchase_orders and suppliers tables
-- Run this in your MySQL database

-- Insert sample suppliers first
INSERT INTO suppliers (supplier_name, contact_person, phone, email, address, is_active, created_at) VALUES
('Auto Parts Inc.', 'John Smith', '555-0101', 'john@autoparts.com', '123 Main St, City, State', 1, NOW()),
('Quality Supplies', 'Jane Doe', '555-0102', 'jane@quality.com', '456 Oak Ave, City, State', 1, NOW()),
('Global Components', 'Bob Johnson', '555-0103', 'bob@global.com', '789 Pine Rd, City, State', 1, NOW());

-- Insert sample purchase orders
INSERT INTO purchase_orders (supplier_id, total_amount, status, order_date) VALUES
(1, 15000.00, 'Pending', '2026-01-21 10:00:00'),
(2, 25000.00, 'Pending', '2026-01-20 14:30:00'),
(3, 18000.00, 'Approved', '2026-01-19 09:15:00'),
(1, 32000.00, 'Rejected', '2026-01-18 16:45:00'),
(2, 22000.00, 'Delivered', '2026-01-17 11:20:00');

-- Update some orders with approval info
UPDATE purchase_orders 
SET approved_by = 1, approved_date = NOW() 
WHERE status IN ('Approved', 'Rejected');

-- Add rejection reason for rejected order
UPDATE purchase_orders 
SET rejection_reason = 'Budget constraints - need management approval' 
WHERE status = 'Rejected' AND supplier_id = 1;

-- Verify data
SELECT 
    po.order_id,
    po.supplier_id,
    s.supplier_name,
    po.total_amount,
    po.status,
    po.order_date,
    po.approved_by,
    po.approved_date,
    po.rejection_reason
FROM purchase_orders po
LEFT JOIN suppliers s ON po.supplier_id = s.supplier_id
ORDER BY po.order_date DESC;
