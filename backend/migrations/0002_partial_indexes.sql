-- Partial/conditional indexes to avoid over-indexing while speeding common lookups

-- Products: barcode/sku lookups only when present
CREATE INDEX IF NOT EXISTS idx_products_barcode_nonnull ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_sku_nonnull ON products(sku) WHERE sku IS NOT NULL;

-- Products: frequently filtered by active status
CREATE INDEX IF NOT EXISTS idx_products_active ON products(status) WHERE status = 'active';

-- Customers: email lookups only when present
CREATE INDEX IF NOT EXISTS idx_customers_email_nonnull ON customers(email) WHERE email IS NOT NULL;

-- Sales: customer filter only when customer_id is set
CREATE INDEX IF NOT EXISTS idx_sales_customer_nonnull ON sales(customer_id) WHERE customer_id IS NOT NULL;

-- Returns: filter by user and customer only when present
CREATE INDEX IF NOT EXISTS idx_returns_user_nonnull ON returns(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_returns_customer_nonnull ON returns(customer_id) WHERE customer_id IS NOT NULL;


