-- Sample Purchase Order Data
-- Make sure you have valid supplier_id and created_by_user_id values first

-- Check existing IDs first:
-- SELECT id, company_name FROM supplier_supplier;
-- SELECT id, username FROM auth_user;

INSERT INTO supplier_purchaseorder (
    order_number,
    supplier_id,
    ordered_by_user_id,
    order_date,
    expected_delivery_date,
    total_amount,
    status,
    notes
) VALUES (
    'PO-4001',
    1,  -- Replace with actual supplier_id
    6,  -- Replace with actual user_id  
    '2026-01-21 01:00:54',
    '2026-02-15',
    50000.00,
    'PENDING',
    'Sample order for testing approval workflow'
);

-- Add more sample orders for testing different statuses
INSERT INTO supplier_purchaseorder (
    order_number,
    supplier_id,
    ordered_by_user_id,
    order_date,
    expected_delivery_date,
    total_amount,
    status,
    notes,
    approved_by_id,
    approved_date
) VALUES (
    'PO-4002',
    1,  -- Replace with actual supplier_id
    6,  -- Replace with actual user_id
    '2026-01-20 10:30:00',
    '2026-02-10',
    25000.00,
    'APPROVED',
    'Approved order ready for processing',
    6,  -- Replace with actual admin user_id who approved
    '2026-01-20 11:00:00'
);

INSERT INTO supplier_purchaseorder (
    order_number,
    supplier_id,
    ordered_by_user_id,
    order_date,
    expected_delivery_date,
    total_amount,
    status,
    notes,
    approved_by_id,
    approved_date,
    rejection_reason
) VALUES (
    'PO-4003',
    2,  -- Replace with actual supplier_id
    6,  -- Replace with actual user_id
    '2026-01-19 14:20:00',
    '2026-02-05',
    15000.00,
    'REJECTED',
    'Rejected due to budget constraints',
    6,  -- Replace with actual admin user_id who rejected
    '2026-01-19 15:00:00',
    'Budget exceeded - need management approval'
);

INSERT INTO supplier_purchaseorder (
    order_number,
    supplier_id,
    ordered_by_user_id,
    order_date,
    expected_delivery_date,
    total_amount,
    status,
    notes,
    approved_by_id,
    approved_date
) VALUES (
    'PO-4004',
    3,  -- Replace with actual supplier_id
    6,  -- Replace with actual user_id
    '2026-01-18 09:15:00',
    '2026-01-25',
    35000.00,
    'ORDERED',
    'Order placed with supplier - awaiting delivery',
    6,  -- Replace with actual admin user_id who approved
    '2026-01-18 09:45:00'
);
