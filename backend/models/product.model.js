const db = require('../config/database');

class Product {
    static async create(productData) {
        const {
            name, sku, barcode, description,
            category_id, product_type_id, product_unit_id,
            supplier_id, purchase_price, selling_price,
            tax_rate, min_stock_level, current_stock
        } = productData;

        try {
            const stmt = db.prepare(`
                INSERT INTO products (
                    name, sku, barcode, description,
                    category_id, product_type_id, product_unit_id,
                    supplier_id, purchase_price, selling_price,
                    tax_rate, min_stock_level, current_stock
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(
                name, sku, barcode, description,
                category_id, product_type_id, product_unit_id,
                supplier_id, purchase_price, selling_price,
                tax_rate, min_stock_level, current_stock
            );
            return result.lastInsertRowid;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const stmt = db.prepare(`
                SELECT p.*, 
                    c.name as category_name,
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    s.name as supplier_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.id = ?
            `);
            return stmt.get(id);
        } catch (error) {
            throw error;
        }
    }

    static async findBySku(sku) {
        try {
            const stmt = db.prepare('SELECT * FROM products WHERE sku = ?');
            return stmt.get(sku);
        } catch (error) {
            throw error;
        }
    }

    static async findByBarcode(barcode) {
        try {
            const stmt = db.prepare('SELECT * FROM products WHERE barcode = ?');
            return stmt.get(barcode);
        } catch (error) {
            throw error;
        }
    }

    static async update(id, productData) {
        const {
            name, sku, barcode, description,
            category_id, product_type_id, product_unit_id,
            supplier_id, purchase_price, selling_price,
            tax_rate, min_stock_level, current_stock
        } = productData;

        try {
            const updateFields = [];
            const values = [];
            
            if (name !== undefined) { updateFields.push('name = ?'); values.push(name); }
            if (sku !== undefined) { updateFields.push('sku = ?'); values.push(sku); }
            if (barcode !== undefined) { updateFields.push('barcode = ?'); values.push(barcode); }
            if (description !== undefined) { updateFields.push('description = ?'); values.push(description); }
            if (category_id !== undefined) { updateFields.push('category_id = ?'); values.push(category_id); }
            if (product_type_id !== undefined) { updateFields.push('product_type_id = ?'); values.push(product_type_id); }
            if (product_unit_id !== undefined) { updateFields.push('product_unit_id = ?'); values.push(product_unit_id); }
            if (supplier_id !== undefined) { updateFields.push('supplier_id = ?'); values.push(supplier_id); }
            if (purchase_price !== undefined) { updateFields.push('purchase_price = ?'); values.push(purchase_price); }
            if (selling_price !== undefined) { updateFields.push('selling_price = ?'); values.push(selling_price); }
            if (tax_rate !== undefined) { updateFields.push('tax_rate = ?'); values.push(tax_rate); }
            if (min_stock_level !== undefined) { updateFields.push('min_stock_level = ?'); values.push(min_stock_level); }
            if (current_stock !== undefined) { updateFields.push('current_stock = ?'); values.push(current_stock); }
            
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            const stmt = db.prepare(`UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`);
            const result = stmt.run(...values);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM products WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const stmt = db.prepare(`
                SELECT p.*, 
                    c.name as category_name,
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    s.name as supplier_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                ORDER BY p.name ASC
            `);
            return stmt.all();
        } catch (error) {
            throw error;
        }
    }

    static async getLowStock() {
        try {
            const stmt = db.prepare(`
                SELECT p.*, 
                    c.name as category_name,
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    s.name as supplier_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.current_stock <= p.min_stock_level
                ORDER BY p.current_stock ASC
            `);
            return stmt.all();
        } catch (error) {
            throw error;
        }
    }

    static async getPopularProducts(limit = 10, period = null) {
        try {
            let dateFilter = '';
            if (period) {
                const date = new Date();
                date.setDate(date.getDate() - period);
                dateFilter = `AND sales.created_at >= '${date.toISOString().split('T')[0]}'`;
            }

            const stmt = db.prepare(`
                SELECT p.*, 
                    c.name as category_name,
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    s.name as supplier_name,
                    COALESCE(SUM(si.quantity), 0) as total_sold
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN sale_items si ON p.id = si.product_id
                LEFT JOIN sales ON si.sale_id = sales.id
                WHERE 1=1 ${dateFilter}
                GROUP BY p.id
                ORDER BY total_sold DESC
                LIMIT ?
            `);
            return stmt.all(limit);
        } catch (error) {
            throw error;
        }
    }

    static async getByCategory(categoryId) {
        try {
            const stmt = db.prepare(`
                SELECT p.*, 
                    c.name as category_name,
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    s.name as supplier_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.category_id = ?
                ORDER BY p.name ASC
            `);
            return stmt.all(categoryId);
        } catch (error) {
            throw error;
        }
    }

    static async getBySupplier(supplierId) {
        try {
            const stmt = db.prepare(`
                SELECT p.*, 
                    c.name as category_name,
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    s.name as supplier_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.supplier_id = ?
                ORDER BY p.name ASC
            `);
            return stmt.all(supplierId);
        } catch (error) {
            throw error;
        }
    }

    static async search(query) {
        try {
            const stmt = db.prepare(`
                SELECT p.*, 
                    c.name as category_name,
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    s.name as supplier_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ? OR p.description LIKE ?
                ORDER BY p.name ASC
            `);
            return stmt.all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
        } catch (error) {
            throw error;
        }
    }

    static async getProductStock(id) {
        try {
            const stmt = db.prepare(`
                SELECT 
                    p.id,
                    p.name,
                    p.sku,
                    p.current_stock,
                    p.min_stock_level,
                    COALESCE(SUM(si.quantity), 0) as total_sold,
                    COALESCE(SUM(CASE WHEN s.created_at >= date('now', '-30 days') THEN si.quantity ELSE 0 END), 0) as sold_last_30_days
                FROM products p
                LEFT JOIN sale_items si ON p.id = si.product_id
                LEFT JOIN sales s ON si.sale_id = s.id
                WHERE p.id = ?
                GROUP BY p.id, p.name, p.sku, p.current_stock, p.min_stock_level
            `);
            return stmt.get(id);
        } catch (error) {
            throw error;
        }
    }

    static async updateStock(id, quantity, operation = 'add') {
        try {
            let sql;
            if (operation === 'add') {
                sql = 'UPDATE products SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            } else if (operation === 'subtract') {
                sql = 'UPDATE products SET current_stock = current_stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            } else if (operation === 'set') {
                sql = 'UPDATE products SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            } else {
                throw new Error('Invalid operation. Use "add", "subtract", or "set"');
            }

            const stmt = db.prepare(sql);
            const result = stmt.run(quantity, id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Product;