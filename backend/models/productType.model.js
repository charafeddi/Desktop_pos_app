const db = require('../config/database');

class ProductType {
    static async create(productTypeData) {
        const { name, description } = productTypeData;

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO product_types (name, description) VALUES (?, ?)',
                [name, description],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM product_types WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async update(id, productTypeData) {
        const { name, description } = productTypeData;

        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE product_types SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [name, description, id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM product_types WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT pt.*, 
                    (SELECT COUNT(*) FROM products WHERE product_type_id = pt.id) as product_count
                FROM product_types pt
                ORDER BY pt.name ASC`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getProducts(id) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT p.*, 
                    c.name as category_name,
                    s.name as supplier_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    i.quantity as current_stock
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE p.product_type_id = ?
                ORDER BY p.name ASC`,
                [id],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
}

module.exports = ProductType; 