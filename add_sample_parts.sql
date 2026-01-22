-- Sample data for parts table
-- Run this in your MySQL database

-- First check if supplier_part table exists, if not create it
CREATE TABLE IF NOT EXISTS supplier_part (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    part_number VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    part_type VARCHAR(20),
    price DECIMAL(10,2),
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    supplier_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- Insert sample parts
INSERT INTO supplier_part (name, part_number, description, part_type, price, stock_quantity, min_stock_level, supplier_id) VALUES
('Brake Pads', 'BP-001', 'Front brake pads for sedans', 'BRAKE', 45.99, 25, 10, 1),
('Oil Filter', 'OF-002', 'Standard oil filter', 'ENGINE', 12.99, 50, 20, 1),
('Spark Plugs', 'SP-003', 'Copper core spark plugs (set of 4)', 'ENGINE', 28.99, 15, 8, 2),
('Alternator', 'AL-004', '12V alternator for compact cars', 'ELECTRICAL', 189.99, 3, 5, 2),
('Shock Absorbers', 'SA-005', 'Front shock absorbers (pair)', 'SUSPENSION', 89.99, 8, 6, 3),
('Clutch Kit', 'CK-006', 'Complete clutch kit', 'TRANSMISSION', 156.99, 4, 3, 3),
('Headlight Assembly', 'HA-007', 'Right headlight assembly', 'BODY', 67.99, 12, 8, 1),
('Battery', 'BT-008', '12V car battery', 'ELECTRICAL', 124.99, 20, 10, 2),
('Air Filter', 'AF-009', 'Engine air filter', 'ENGINE', 18.99, 35, 15, 1),
('Disc Rotors', 'DR-010', 'Front brake disc rotors (pair)', 'BRAKE', 78.99, 6, 4, 3),
('Starter Motor', 'SM-011', '12V starter motor', 'ELECTRICAL', 145.99, 2, 3, 2),
('Radiator', 'RD-012', 'Aluminum radiator', 'ENGINE', 234.99, 5, 4, 3),
('Door Handle', 'DH-013', 'Left front door handle', 'BODY', 34.99, 18, 10, 1),
('Water Pump', 'WP-014', 'Engine water pump', 'ENGINE', 67.99, 7, 5, 2),
('Fuel Filter', 'FF-015', 'In-line fuel filter', 'ENGINE', 22.99, 28, 12, 3);

-- Verify data
SELECT 
    p.id,
    p.name,
    p.part_number,
    p.part_type,
    p.price,
    p.stock_quantity,
    p.min_stock_level,
    s.supplier_name
FROM supplier_part p
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
ORDER BY p.name;
