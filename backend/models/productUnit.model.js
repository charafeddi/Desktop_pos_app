const db = require('../config/database');

class ProductUnit {
    static async create(productUnitData) {
        const { name, symbol, description } = productUnitData;

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO product_units (name, symbol, description) VALUES (?, ?, ?)',
                [name, symbol, description],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM product_units WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async update(id, productUnitData) {
        const { name, symbol, description } = productUnitData;

        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE product_units SET name = ?, symbol = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [name, symbol, description, id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM product_units WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT pu.*, 
                    (SELECT COUNT(*) FROM products WHERE product_unit_id = pu.id) as product_count
                FROM product_units pu
                ORDER BY pu.name ASC`,
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
                    pt.name as product_type_name,
                    i.quantity as current_stock
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE p.product_unit_id = ?
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

module.exports = ProductUnit; 