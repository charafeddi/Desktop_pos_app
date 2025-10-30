-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- INSERT | UPDATE | DELETE
    old_data TEXT,        -- JSON
    new_data TEXT,        -- JSON
    changed_by INTEGER,   -- users.id (nullable if unknown)
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON audit_log(changed_at);

-- Products INSERT trigger
CREATE TRIGGER IF NOT EXISTS trg_products_insert_audit
AFTER INSERT ON products
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
        'products',
        NEW.id,
        'INSERT',
        NULL,
        json_object(
            'id', NEW.id,
            'name', NEW.name,
            'sku', NEW.sku,
            'barcode', NEW.barcode,
            'category_id', NEW.category_id,
            'product_type_id', NEW.product_type_id,
            'product_unit_id', NEW.product_unit_id,
            'supplier_id', NEW.supplier_id,
            'purchase_price', NEW.purchase_price,
            'selling_price', NEW.selling_price,
            'tax_rate', NEW.tax_rate,
            'min_stock_level', NEW.min_stock_level,
            'current_stock', NEW.current_stock,
            'status', NEW.status,
            'is_active', NEW.is_active,
            'image', NEW.image
        ),
        NULL
    );
END;

-- Products UPDATE trigger
CREATE TRIGGER IF NOT EXISTS trg_products_update_audit
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
        'products',
        OLD.id,
        'UPDATE',
        json_object(
            'id', OLD.id,
            'name', OLD.name,
            'sku', OLD.sku,
            'barcode', OLD.barcode,
            'category_id', OLD.category_id,
            'product_type_id', OLD.product_type_id,
            'product_unit_id', OLD.product_unit_id,
            'supplier_id', OLD.supplier_id,
            'purchase_price', OLD.purchase_price,
            'selling_price', OLD.selling_price,
            'tax_rate', OLD.tax_rate,
            'min_stock_level', OLD.min_stock_level,
            'current_stock', OLD.current_stock,
            'status', OLD.status,
            'is_active', OLD.is_active,
            'image', OLD.image
        ),
        json_object(
            'id', NEW.id,
            'name', NEW.name,
            'sku', NEW.sku,
            'barcode', NEW.barcode,
            'category_id', NEW.category_id,
            'product_type_id', NEW.product_type_id,
            'product_unit_id', NEW.product_unit_id,
            'supplier_id', NEW.supplier_id,
            'purchase_price', NEW.purchase_price,
            'selling_price', NEW.selling_price,
            'tax_rate', NEW.tax_rate,
            'min_stock_level', NEW.min_stock_level,
            'current_stock', NEW.current_stock,
            'status', NEW.status,
            'is_active', NEW.is_active,
            'image', NEW.image
        ),
        NULL
    );
END;

-- Products DELETE trigger
CREATE TRIGGER IF NOT EXISTS trg_products_delete_audit
AFTER DELETE ON products
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
        'products',
        OLD.id,
        'DELETE',
        json_object(
            'id', OLD.id,
            'name', OLD.name,
            'sku', OLD.sku,
            'barcode', OLD.barcode,
            'category_id', OLD.category_id,
            'product_type_id', OLD.product_type_id,
            'product_unit_id', OLD.product_unit_id,
            'supplier_id', OLD.supplier_id,
            'purchase_price', OLD.purchase_price,
            'selling_price', OLD.selling_price,
            'tax_rate', OLD.tax_rate,
            'min_stock_level', OLD.min_stock_level,
            'current_stock', OLD.current_stock,
            'status', OLD.status,
            'is_active', OLD.is_active,
            'image', OLD.image
        ),
        NULL,
        NULL
    );
END;

