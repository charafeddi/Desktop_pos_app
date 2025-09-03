const db = require('../config/database');

class Product {
    static async create(productData) {
        const {
            name, sku, barcode, description,
            category_id, product_type_id, product_unit_id,
            supplier_id, purchase_price, selling_price,
            tax_rate, min_stock_level, current_stock
        } = productData;

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO products (
                    name, sku, barcode, description,
                    category_id, product_type_id, product_unit_id,
                    supplier_id, purchase_price, selling_price,
                    tax_rate, min_stock_level, current_stock
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, sku, barcode, description, category_id, product_type_id, product_unit_id, supplier_id, purchase_price, selling_price, tax_rate, min_stock_level, current_stock],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT p.*, 
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
                WHERE p.id = ?`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    static async findBySku(sku) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM products WHERE sku = ?', [sku], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async findByBarcode(barcode) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM products WHERE barcode = ?', [barcode], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async update(id, productData) {
        const {
            name, sku, barcode, description,
            category_id, product_type_id, product_unit_id,
            supplier_id, purchase_price, selling_price,
            tax_rate, min_stock_level, current_stock
        } = productData;

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE products 
                SET name = ?, sku = ?, barcode = ?, description = ?,
                    category_id = ?, product_type_id = ?, product_unit_id = ?,
                    supplier_id = ?, purchase_price = ?, selling_price = ?,
                    tax_rate = ?, min_stock_level = ?, current_stock = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [name, sku, barcode, description, category_id, product_type_id, product_unit_id, supplier_id, purchase_price, selling_price, tax_rate, min_stock_level, current_stock, id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT p.*, 
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
                ORDER BY p.name ASC`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getLowStock() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT p.*, 
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
                ORDER BY p.current_stock ASC`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getPopularProducts(limit = 10, period = null) {
        return new Promise((resolve, reject) => {
            let dateFilter = '';
            let params = [];
            
            // Add date filtering if period is specified
            if (period) {
                switch (period.toLowerCase()) {
                    case 'today':
                        dateFilter = 'AND DATE(s.created_at) = DATE("now")';
                        break;
                    case 'week':
                        dateFilter = 'AND s.created_at >= datetime("now", "-7 days")';
                        break;
                    case 'month':
                        dateFilter = 'AND s.created_at >= datetime("now", "-30 days")';
                        break;
                    case 'year':
                        dateFilter = 'AND s.created_at >= datetime("now", "-365 days")';
                        break;
                    default:
                        // No filter
                        break;
                }
            }

            const sql = `
                SELECT p.*, 
                    c.name as category_name,
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    sup.name as supplier_name,
                    COALESCE(SUM(si.quantity), 0) as total_sold,
                    COALESCE(COUNT(si.id), 0) as sale_count,
                    COALESCE(SUM(si.total_amount), 0) as total_revenue
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN suppliers sup ON p.supplier_id = sup.id
                LEFT JOIN sale_items si ON p.id = si.product_id
                LEFT JOIN sales s ON si.sale_id = s.id
                WHERE p.id IS NOT NULL ${dateFilter}
                GROUP BY p.id
                ORDER BY total_sold DESC, total_revenue DESC
                LIMIT ?
            `;

            db.all(sql, [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getByCategory(categoryId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT p.*, 
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    s.name as supplier_name
                FROM products p
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.category_id = ?
                ORDER BY p.name ASC`,
                [categoryId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getBySupplier(supplierId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT p.*, 
                    c.name as category_name,
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                WHERE p.supplier_id = ?
                ORDER BY p.name ASC`,
                [supplierId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async search(query) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT p.*, 
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
                WHERE p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?
                ORDER BY p.name ASC`,
                [`%${query}%`, `%${query}%`, `%${query}%`],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getProductStock(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT p.id, p.name, p.sku, p.current_stock, p.min_stock_level, p.max_stock_level,
                    pu.name as unit_name, pu.symbol as unit_symbol,
                    c.name as category_name,
                    s.name as supplier_name,
                    CASE 
                        WHEN p.current_stock <= p.min_stock_level THEN 'low'
                        WHEN p.current_stock = 0 THEN 'out'
                        ELSE 'normal'
                    END as stock_status,
                    (p.current_stock - p.min_stock_level) as stock_above_min,
                    (p.max_stock_level - p.current_stock) as stock_below_max
                FROM products p
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.id = ?`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    static async updateStock(id, quantity, operation = 'add') {
        return new Promise((resolve, reject) => {
            const sql = operation === 'add' 
                ? 'UPDATE products SET current_stock = current_stock + ? WHERE id = ?'
                : 'UPDATE products SET current_stock = current_stock - ? WHERE id = ?';
            
            db.run(sql, [quantity, id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

module.exports = Product; 