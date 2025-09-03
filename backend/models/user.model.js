const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const {
            name, email, password, mobile_phone,
            role
        } = userData;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (
                    name, email, password, mobile_phone,
                    role
                ) VALUES (?, ?, ?, ?, ?)`,
                [name, email, hashedPassword, mobile_phone, role],
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
                `SELECT id, name, email, mobile_phone, role, created_at, updated_at
                FROM users
                WHERE id = ?`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM users WHERE email = ?`,
                [email],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    static async findByMobilePhone(mobilePhone) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM users WHERE mobile_phone = ?`,
                [mobilePhone],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }
    static async update(id, userData) {
        const {
            name, email, mobile_phone,
            role, is_active
        } = userData;

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE users 
                SET name = ?, email = ?, mobile_phone = ?,
                    role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [name, email, mobile_phone, role, is_active, id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }
    static async updatePassword(id, newPassword) {
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE users 
                SET password = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [hashedPassword, id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }
    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT id, name, email, mobile_phone, role, is_active, created_at, updated_at
                FROM users
                ORDER BY name ASC`,
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
                `SELECT s.*, 
                    c.name as customer_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                WHERE s.user_id = ?
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
                `SELECT r.*, 
                    c.name as customer_name,
                    s.invoice_number as sale_invoice_number
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN sales s ON r.sale_id = s.id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC`,
                [id],
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
                `SELECT id, name, email, mobile_phone, role, is_active, created_at, updated_at
                FROM users
                WHERE name LIKE ? OR email LIKE ? OR mobile_phone LIKE ?
                ORDER BY name ASC`,
                [`%${query}%`, `%${query}%`, `%${query}%`],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async verifyPassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
}

module.exports = User; 