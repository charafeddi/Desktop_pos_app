-- Migration: Fix sale_items tax_rate constraint
-- This migration makes tax_rate have a default value to prevent NOT NULL errors
-- The application will provide tax_rate values, but the column should have a default

-- Note: This migration will be executed WITHOUT foreign key constraints
-- The migration runner will handle disabling/enabling foreign keys

-- Step 1: Create new sale_items table with tax_rate having default value
CREATE TABLE IF NOT EXISTS sale_items_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    tax_rate REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Copy all data from old table to new table
INSERT INTO sale_items_new (
    id, sale_id, product_id, quantity, unit_price, tax_rate,
    discount_amount, tax_amount, total_amount, created_at
)
SELECT 
    id, sale_id, product_id, quantity, unit_price, 
    COALESCE(tax_rate, 0) as tax_rate,
    COALESCE(discount_amount, 0) as discount_amount,
    COALESCE(tax_amount, 0) as tax_amount,
    total_amount, created_at
FROM sale_items;

-- Step 3: Drop old table
DROP TABLE sale_items;

-- Step 4: Rename new table to original name
ALTER TABLE sale_items_new RENAME TO sale_items;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
