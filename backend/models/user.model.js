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

        try {
            const stmt = db.prepare(`
                INSERT INTO users (
                    name, email, password, mobile_phone,
                    role
                ) VALUES (?, ?, ?, ?, ?)
            `);
            const result = stmt.run(name, email, hashedPassword, mobile_phone, role);
            return result.lastInsertRowid;
        } catch (error) {
            throw error;
        }
    }
    static async findById(id) {
        try {
            const stmt = db.prepare(`
                SELECT id, name, email, mobile_phone, role, created_at, updated_at
                FROM users
                WHERE id = ?
            `);
            return stmt.get(id);
        } catch (error) {
            throw error;
        }
    }
    static async findByEmail(email) {
        try {
            const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
            return stmt.get(email);
        } catch (error) {
            throw error;
        }
    }

    static async findByMobilePhone(mobilePhone) {
        try {
            const stmt = db.prepare(`SELECT * FROM users WHERE mobile_phone = ?`);
            return stmt.get(mobilePhone);
        } catch (error) {
            throw error;
        }
    }
    static async update(id, userData) {
        const {
            name, email, mobile_phone,
            role, is_active
        } = userData;

        try {
            const stmt = db.prepare(`
                UPDATE users 
                SET name = ?, email = ?, mobile_phone = ?,
                    role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            const result = stmt.run(name, email, mobile_phone, role, is_active, id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }
    static async updatePassword(id, newPassword) {
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        try {
            const stmt = db.prepare(`
                UPDATE users 
                SET password = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            const result = stmt.run(hashedPassword, id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }
    static async delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM users WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const stmt = db.prepare(`
                SELECT id, name, email, mobile_phone, role, is_active, created_at, updated_at
                FROM users
                ORDER BY name ASC
            `);
            return stmt.all();
        } catch (error) {
            throw error;
        }
    }

    static async getSales(id) {
        try {
            const stmt = db.prepare(`
                SELECT s.*, 
                    c.name as customer_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                WHERE s.user_id = ?
                ORDER BY s.created_at DESC
            `);
            return stmt.all(id);
        } catch (error) {
            throw error;
        }
    }

    static async getReturns(id) {
        try {
            const stmt = db.prepare(`
                SELECT r.*, 
                    c.name as customer_name,
                    s.invoice_number as sale_invoice_number
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN sales s ON r.sale_id = s.id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC
            `);
            return stmt.all(id);
        } catch (error) {
            throw error;
        }
    }

    static async search(query) {
        try {
            const stmt = db.prepare(`
                SELECT id, name, email, mobile_phone, role, is_active, created_at, updated_at
                FROM users
                WHERE name LIKE ? OR email LIKE ? OR mobile_phone LIKE ?
                ORDER BY name ASC
            `);
            return stmt.all(`%${query}%`, `%${query}%`, `%${query}%`);
        } catch (error) {
            throw error;
        }
    }

    static async verifyPassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
}

module.exports = User; 