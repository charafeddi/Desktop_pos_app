const db = require('../config/database');

class Customer {
    static async create(customerData) {
        const {
            name, email, phone, address,
            city, country, postal_code, tax_number, is_active = 1
        } = customerData;

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO customers (
                    name, email, phone, address,
                    city, country, postal_code, tax_number, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, email, phone, address, city, country, postal_code, tax_number, is_active],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM customers WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async update(id, customerData) {
        const {
            name, email, phone, address,
            city, country, postal_code, tax_number, is_active
        } = customerData;

        return new Promise((resolve, reject) => {
            const updateFields = [];
            const values = [];
            
            if (name !== undefined) { updateFields.push('name = ?'); values.push(name); }
            if (email !== undefined) { updateFields.push('email = ?'); values.push(email); }
            if (phone !== undefined) { updateFields.push('phone = ?'); values.push(phone); }
            if (address !== undefined) { updateFields.push('address = ?'); values.push(address); }
            if (city !== undefined) { updateFields.push('city = ?'); values.push(city); }
            if (country !== undefined) { updateFields.push('country = ?'); values.push(country); }
            if (postal_code !== undefined) { updateFields.push('postal_code = ?'); values.push(postal_code); }
            if (tax_number !== undefined) { updateFields.push('tax_number = ?'); values.push(tax_number); }
            if (is_active !== undefined) { updateFields.push('is_active = ?'); values.push(is_active); }
            
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            db.run(
                `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`,
                values,
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM customers WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT c.*, 
                    (SELECT COUNT(*) FROM sales WHERE customer_id = c.id) as sale_count,
                    (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE customer_id = c.id) as total_amount_count
                FROM customers c
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

    static async toggleStatus(id) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE customers 
                SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }
}

module.exports = Customer; 