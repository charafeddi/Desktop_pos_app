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