-- ============================================================
--  BillApp - Complete Schema + Test Data
--  Usage:
--    mysql -u root -p < schema-and-data.sql
--  Or inside MySQL:
--    source /path/to/schema-and-data.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS billdb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE billdb;

-- ============================================================
--  RESET (safe drop order)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS bill_items;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  TABLE: users
-- ============================================================
CREATE TABLE users (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    role        ENUM('ADMIN','USER') NOT NULL DEFAULT 'ADMIN',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  TABLE: bills
-- ============================================================
CREATE TABLE bills (
    id               BIGINT          NOT NULL AUTO_INCREMENT,
    bill_number      VARCHAR(20)     NOT NULL UNIQUE,
    customer_name    VARCHAR(150)    NOT NULL,
    customer_email   VARCHAR(100),
    customer_phone   VARCHAR(20),
    customer_address VARCHAR(300),
    bill_date        DATE            NOT NULL,
    due_date         DATE,
    subtotal         DECIMAL(12,2)   DEFAULT 0.00,
    tax_rate         DECIMAL(5,2)    DEFAULT 0.00,
    tax_amount       DECIMAL(12,2)   DEFAULT 0.00,
    discount         DECIMAL(12,2)   DEFAULT 0.00,
    total_amount     DECIMAL(12,2)   DEFAULT 0.00,
    status           ENUM('DRAFT','PENDING','PAID','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    notes            TEXT,
    company_name     VARCHAR(150),
    company_address  VARCHAR(300),
    company_phone    VARCHAR(20),
    company_email    VARCHAR(100),
    created_by       BIGINT,
    created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_bills_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  TABLE: bill_items
-- ============================================================
CREATE TABLE bill_items (
    id          BIGINT         NOT NULL AUTO_INCREMENT,
    bill_id     BIGINT         NOT NULL,
    description VARCHAR(300)   NOT NULL,
    quantity    DECIMAL(10,2)  NOT NULL DEFAULT 1.00,
    unit_price  DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    total_price DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    unit        VARCHAR(30),
    PRIMARY KEY (id),
    CONSTRAINT fk_items_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  INDEXES
-- ============================================================
CREATE INDEX idx_bills_status     ON bills(status);
CREATE INDEX idx_bills_date       ON bills(bill_date);
CREATE INDEX idx_bills_customer   ON bills(customer_name);
CREATE INDEX idx_bills_created_by ON bills(created_by);
CREATE INDEX idx_items_bill_id    ON bill_items(bill_id);

-- ============================================================
--  TEST USERS
--  All passwords = admin123
--  BCrypt hashes below are freshly generated and verified for password: admin123
-- ============================================================
INSERT INTO users (username, password, email, role, created_at) VALUES
('admin',        '$2b$10$65GXbH8Gc1VG7oyQABLO2us7uIMrpWHI9O4tKH6r5yYg.NzUgaUlK', 'admin@billapp.com',  'ADMIN', NOW() - INTERVAL 90 DAY),
('john_doe',     '$2b$10$CdPN.I/GYTqokNJUUqo3PO9kGPV0pYyBjejUDtwofD3/nsk1hWWXK', 'john@billapp.com',   'ADMIN', NOW() - INTERVAL 60 DAY),
('priya_sharma', '$2b$10$9kkBPtf8wiGFhX12ey/OC.5bIuLvlv/ixWswGmVfHpAZ4FIG0Qe02', 'priya@billapp.com',  'ADMIN', NOW() - INTERVAL 30 DAY);

-- ============================================================
--  TEST BILLS
-- ============================================================
INSERT INTO bills (bill_number, customer_name, customer_email, customer_phone, customer_address, bill_date, due_date, subtotal, tax_rate, tax_amount, discount, total_amount, status, notes, company_name, company_address, company_phone, company_email, created_by, created_at, updated_at) VALUES

('BILL0001', 'Tata Consultancy Services', 'accounts@tcs.com', '+91-22-6778-9999', '11th Floor, Air India Building, Nariman Point, Mumbai, MH 400021',
 CURDATE() - INTERVAL 60 DAY, CURDATE() - INTERVAL 30 DAY,
 85000.00, 18.00, 15300.00, 5000.00, 95300.00, 'PAID',
 'Payment received on time. Thank you for your business.',
 'BillApp Solutions Pvt Ltd', '42, MG Road, Bengaluru, KA 560001', '+91-80-4567-8901', 'billing@billapp.in',
 1, NOW() - INTERVAL 60 DAY, NOW() - INTERVAL 30 DAY),

('BILL0002', 'Infosys Limited', 'vendor@infosys.com', '+91-80-2852-0261', 'Electronics City, Phase-I, Bengaluru, KA 560100',
 CURDATE() - INTERVAL 55 DAY, CURDATE() - INTERVAL 25 DAY,
 120000.00, 18.00, 21600.00, 10000.00, 131600.00, 'PAID',
 'Net 30 payment terms. GST 18%.',
 'BillApp Solutions Pvt Ltd', '42, MG Road, Bengaluru, KA 560001', '+91-80-4567-8901', 'billing@billapp.in',
 1, NOW() - INTERVAL 55 DAY, NOW() - INTERVAL 28 DAY),

('BILL0003', 'Wipro Technologies', 'procurement@wipro.com', '+91-80-2844-0011', 'Doddakannelli, Sarjapur Road, Bengaluru, KA 560035',
 CURDATE() - INTERVAL 20 DAY, CURDATE() + INTERVAL 10 DAY,
 45000.00, 18.00, 8100.00, 0.00, 53100.00, 'PENDING',
 'PO: WPR-2024-00891. Reference PO in payment.',
 'BillApp Solutions Pvt Ltd', '42, MG Road, Bengaluru, KA 560001', '+91-80-4567-8901', 'billing@billapp.in',
 1, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY),

('BILL0004', 'HCL Technologies Ltd', 'finance@hcl.com', '+91-120-432-6000', 'Plot No. 3A, Sector 126, Noida, UP 201304',
 CURDATE() - INTERVAL 15 DAY, CURDATE() + INTERVAL 15 DAY,
 72000.00, 18.00, 12960.00, 2000.00, 82960.00, 'PENDING',
 'Quarterly software license renewal - Q1 2025.',
 'BillApp Solutions Pvt Ltd', '42, MG Road, Bengaluru, KA 560001', '+91-80-4567-8901', 'billing@billapp.in',
 2, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY),

('BILL0005', 'Reliance Industries Ltd', 'ap@ril.com', '+91-22-3555-5000', '3rd Floor, Maker Chambers IV, 222 Nariman Point, Mumbai, MH 400021',
 CURDATE() - INTERVAL 45 DAY, CURDATE() - INTERVAL 15 DAY,
 200000.00, 18.00, 36000.00, 20000.00, 216000.00, 'PAID',
 'Enterprise annual contract. Includes implementation and support.',
 'BillApp Solutions Pvt Ltd', '42, MG Road, Bengaluru, KA 560001', '+91-80-4567-8901', 'billing@billapp.in',
 1, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 10 DAY),

('BILL0006', 'Mahindra & Mahindra', 'vendor.payments@mahindra.com', '+91-22-2490-1441', 'Gateway Building, Apollo Bunder, Mumbai, MH 400001',
 CURDATE() - INTERVAL 3 DAY, CURDATE() + INTERVAL 27 DAY,
 38500.00, 18.00, 6930.00, 0.00, 45430.00, 'DRAFT',
 'Draft pending internal approval before sending to client.',
 'BillApp Solutions Pvt Ltd', '42, MG Road, Bengaluru, KA 560001', '+91-80-4567-8901', 'billing@billapp.in',
 2, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),

('BILL0007', 'Bajaj Auto Limited', 'accounts@bajaj.com', '+91-20-6610-6432', 'Mumbai-Pune Road, Akurdi, Pune, MH 411035',
 CURDATE() - INTERVAL 30 DAY, CURDATE() - INTERVAL 5 DAY,
 25000.00, 18.00, 4500.00, 0.00, 29500.00, 'CANCELLED',
 'Cancelled - customer requested postponement to next quarter.',
 'BillApp Solutions Pvt Ltd', '42, MG Road, Bengaluru, KA 560001', '+91-80-4567-8901', 'billing@billapp.in',
 3, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 25 DAY),

('BILL0008', 'Flipkart Internet Pvt Ltd', 'finance@flipkart.com', '+91-80-4900-8585', 'Embassy Tech Village, Outer Ring Road, Bengaluru, KA 560103',
 CURDATE() - INTERVAL 5 DAY, CURDATE() + INTERVAL 25 DAY,
 96000.00, 18.00, 17280.00, 6000.00, 107280.00, 'PENDING',
 'Cloud infrastructure setup + 6 month support contract.',
 'BillApp Solutions Pvt Ltd', '42, MG Road, Bengaluru, KA 560001', '+91-80-4567-8901', 'billing@billapp.in',
 2, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),

('BILL0009', 'HDFC Bank Limited', 'vendor.management@hdfcbank.com', '+91-22-6652-1000', 'HDFC Bank House, Senapati Bapat Marg, Lower Parel, Mumbai, MH 400013',
 CURDATE() - INTERVAL 40 DAY, CURDATE() - INTERVAL 10 DAY,
 150000.00, 18.00, 27000.00, 15000.00, 162000.00, 'PAID',
 'Banking software integration project - Phase 2 completion milestone.',
 'BillApp Solutions Pvt Ltd', '42, MG Road, Bengaluru, KA 560001', '+91-80-4567-8901', 'billing@billapp.in',
 1, NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 8 DAY),

('BILL0010', 'Zomato Ltd', 'finance@zomato.com', '+91-124-402-5174', '139 P, Sector 44, Gurugram, HR 122002',
 CURDATE(), CURDATE() + INTERVAL 30 DAY,
 18000.00, 18.00, 3240.00, 0.00, 21240.00, 'DRAFT',
 'UX audit and dashboard redesign project.',
 'BillApp Solutions Pvt Ltd', '42, MG Road, Bengaluru, KA 560001', '+91-80-4567-8901', 'billing@billapp.in',
 3, NOW(), NOW());

-- ============================================================
--  TEST BILL ITEMS
-- ============================================================

-- BILL0001
INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, unit) VALUES
(1, 'Enterprise Software License (Annual)',      1.00, 50000.00, 50000.00, 'license'),
(1, 'Implementation & Configuration Services',  40.00,   750.00, 30000.00, 'hrs'),
(1, 'Training Sessions (2-day onsite)',           1.00,  5000.00,  5000.00, 'session');

-- BILL0002
INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, unit) VALUES
(2, 'Custom ERP Module Development',   200.00,  500.00, 100000.00, 'hrs'),
(2, 'API Integration Services',         40.00,  400.00,  16000.00, 'hrs'),
(2, 'Project Management',                1.00, 4000.00,   4000.00, 'fixed');

-- BILL0003
INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, unit) VALUES
(3, 'Cloud Hosting AWS EC2 (3 months)',   3.00, 8000.00, 24000.00, 'months'),
(3, 'SSL Certificate Wildcard 1yr',       1.00, 3000.00,  3000.00, 'pcs'),
(3, 'DevOps Consulting',                 24.00,  750.00, 18000.00, 'hrs');

-- BILL0004
INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, unit) VALUES
(4, 'Software License Renewal Q1 2025',  1.00, 60000.00, 60000.00, 'license'),
(4, 'Priority Support Plan (3 months)',  3.00,  4000.00, 12000.00, 'months');

-- BILL0005
INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, unit) VALUES
(5, 'Enterprise Annual Contract Platinum',   1.00, 150000.00, 150000.00, 'license'),
(5, 'Data Migration Services',               1.00,  30000.00,  30000.00, 'fixed'),
(5, 'Dedicated Account Manager 12 months',   1.00,  20000.00,  20000.00, 'fixed');

-- BILL0006
INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, unit) VALUES
(6, 'Mobile App Development Phase 1',   60.00, 500.00, 30000.00, 'hrs'),
(6, 'UI/UX Design & Prototyping',       17.00, 500.00,  8500.00, 'hrs');

-- BILL0007
INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, unit) VALUES
(7, 'Analytics Dashboard Setup',        1.00, 20000.00, 20000.00, 'fixed'),
(7, 'Reporting Module Customization',  10.00,   500.00,  5000.00, 'hrs');

-- BILL0008
INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, unit) VALUES
(8, 'Cloud Infrastructure Setup AWS',   1.00, 45000.00, 45000.00, 'fixed'),
(8, 'Kubernetes Cluster Configuration', 1.00, 25000.00, 25000.00, 'fixed'),
(8, 'DevOps Support 6 months',          6.00,  4000.00, 24000.00, 'months'),
(8, 'Monitoring & Alerting Setup',      1.00,  2000.00,  2000.00, 'fixed');

-- BILL0009
INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, unit) VALUES
(9, 'Banking Software Integration Phase 2',  1.00, 100000.00, 100000.00, 'fixed'),
(9, 'Security Audit & Compliance Review',    1.00,  30000.00,  30000.00, 'fixed'),
(9, 'Performance Testing & Optimization',   40.00,     500.00,  20000.00, 'hrs');

-- BILL0010
INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price, unit) VALUES
(10, 'UX Audit & Heuristic Evaluation',  1.00, 10000.00, 10000.00, 'fixed'),
(10, 'Dashboard Redesign 4 screens',     4.00,  2000.00,  8000.00, 'screens');

-- ============================================================
--  VERIFICATION QUERIES
-- ============================================================
SELECT '===== USERS =====' AS Info;
SELECT id, username, email, role, DATE(created_at) AS joined FROM users;

SELECT '===== BILLS SUMMARY =====' AS Info;
SELECT
    b.bill_number,
    b.customer_name,
    b.bill_date,
    b.due_date,
    CONCAT('Rs.', FORMAT(b.total_amount,2)) AS total,
    b.status,
    u.username AS created_by
FROM bills b
LEFT JOIN users u ON b.created_by = u.id
ORDER BY b.id;

SELECT '===== ITEM COUNT PER BILL =====' AS Info;
SELECT b.bill_number, COUNT(bi.id) AS item_count, CONCAT('Rs.', FORMAT(SUM(bi.total_price),2)) AS items_subtotal
FROM bills b JOIN bill_items bi ON b.id = bi.bill_id
GROUP BY b.id, b.bill_number ORDER BY b.id;

SELECT '===== DASHBOARD STATS =====' AS Info;
SELECT
    COUNT(*)                                                            AS total_bills,
    SUM(status = 'PAID')                                               AS paid,
    SUM(status = 'PENDING')                                            AS pending,
    SUM(status = 'DRAFT')                                              AS draft,
    SUM(status = 'CANCELLED')                                          AS cancelled,
    CONCAT('Rs.', FORMAT(SUM(CASE WHEN status='PAID' THEN total_amount ELSE 0 END),2)) AS revenue_from_paid
FROM bills;
