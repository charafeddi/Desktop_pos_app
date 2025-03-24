const db = require('../config/database');

class Customer {
    static async create(customerData) {
        const {
            name, email, phone, address,
            city, country, postal_code, tax_number
        } = customerData;

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO client (
                    name, email, phone, address,
                    city, country, postal_code, tax_number
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, email, phone, address, city, country, postal_code, tax_number],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM client WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async update(id, customerData) {
        const {
            name, email, phone, address,
            city, country, postal_code, tax_number
        } = customerData;

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE client 
                SET name = ?, email = ?, phone = ?, address = ?,
                    city = ?, country = ?, postal_code = ?, tax_number = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [name, email, phone, address, city, country, postal_code, tax_number, id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM client WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT c.*, 
                    (SELECT COUNT(*) FROM sales WHERE customer_id = c.id) as sale_count
                FROM client c
                ORDER BY c.name ASC`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getSales(id) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT s.*, u.name as user_name
                FROM sales s
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.customer_id = ?
                ORDER BY s.created_at DESC`,
                [id],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getReturns(id) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT r.*, u.name as user_name
                FROM returns r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.customer_id = ?
                ORDER BY r.created_at DESC`,
                [id],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
}

module.exports = Customer; 