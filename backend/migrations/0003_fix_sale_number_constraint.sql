-- Migration: Fix sale_number NOT NULL constraint
-- This migration makes sale_number nullable to prevent errors when creating sales
-- The application will generate sale_number values, but the column should allow NULL
-- for backward compatibility with existing data

-- Note: This migration will be executed WITHOUT foreign key constraints
-- The migration runner will handle disabling/enabling foreign keys

-- Step 1: Create new sales table with sale_number as nullable (no foreign keys yet)
CREATE TABLE IF NOT EXISTS sales_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_number TEXT,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER,
    user_id INTEGER NOT NULL,
    subtotal REAL,
    total_amount REAL NOT NULL,
    discount_amount REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    final_amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'completed',
    sale_status TEXT DEFAULT 'completed',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Copy all data from old table to new table
INSERT INTO sales_new (
    id, sale_number, invoice_number, customer_id, user_id, subtotal,
    total_amount, discount_amount, tax_amount, final_amount, payment_method,
    payment_status, sale_status, notes, created_at, updated_at
)
SELECT 
    id, sale_number, invoice_number, customer_id, user_id, subtotal,
    total_amount, discount_amount, tax_amount, final_amount, payment_method,
    payment_status, sale_status, notes, created_at, updated_at
FROM sales;

-- Step 3: Drop old table
DROP TABLE sales;

-- Step 4: Rename new table to original name
ALTER TABLE sales_new RENAME TO sales;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_sale_number ON sales(sale_number);

-- Step 6: Update any NULL sale_numbers with generated values
UPDATE sales 
SET sale_number = 'SALE-' || (strftime('%s', created_at) || substr('000' || abs(random() % 1000), -3, 3))
WHERE sale_number IS NULL;
