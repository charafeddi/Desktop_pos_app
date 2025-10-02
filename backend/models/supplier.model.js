const db = require('../config/database');

class Supplier {
    static async create(supplierData) {
        const {
            name, contact_person, email, phone,
            address, city, country, postal_code
        } = supplierData;

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO suppliers (
                    name, contact_person, email, phone,
                    address, city, country, postal_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, contact_person, email, phone, address, city, country, postal_code],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM suppliers WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async update(id, supplierData) {
        const {
            name, contact_person, email, phone,
            address, city, country, postal_code
        } = supplierData;

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE suppliers 
                SET name = ?, contact_person = ?, email = ?, phone = ?,
                    address = ?, city = ?, country = ?, postal_code = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [name, contact_person, email, phone, address, city, country, postal_code, id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM suppliers WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT s.*, 
                    (SELECT COUNT(*) FROM products WHERE supplier_id = s.id) as product_count,
                    (SELECT COALESCE(SUM(purchase_price), 0) FROM products WHERE supplier_id = s.id) as total_amount_count
                FROM suppliers s
                ORDER BY s.name ASC`,
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
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    i.quantity as current_stock
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE p.supplier_id = ?
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

module.exports = Supplier; 