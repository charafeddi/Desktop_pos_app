const db = require('../config/database');

class Customer {
    static async create(customerData) {
        const {
            name, email, phone, address,
            city, country, postal_code, tax_number, is_active = 1
        } = customerData;

        try {
            const stmt = db.prepare(`
                INSERT INTO customers (
                    name, email, phone, address,
                    city, country, postal_code, tax_number, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(name, email, phone, address, city, country, postal_code, tax_number, is_active);
            return result.lastInsertRowid;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const stmt = db.prepare('SELECT * FROM customers WHERE id = ?');
            return stmt.get(id);
        } catch (error) {
            throw error;
        }
    }

    static async update(id, customerData) {
        const {
            name, email, phone, address,
            city, country, postal_code, tax_number, is_active
        } = customerData;

        try {
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

            const stmt = db.prepare(`UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`);
            const result = stmt.run(...values);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const stmt = db.prepare(`
                SELECT c.*, 
                    (SELECT COUNT(*) FROM sales WHERE customer_id = c.id) as sale_count,
                    (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE customer_id = c.id) as total_amount_count
                FROM customers c
                ORDER BY c.name ASC
            `);
            return stmt.all();
        } catch (error) {
            throw error;
        }
    }

    static async getSales(id) {
        try {
            const stmt = db.prepare(`
                SELECT s.*, u.name as user_name
                FROM sales s
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.customer_id = ?
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
                SELECT r.*, u.name as user_name
                FROM returns r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.customer_id = ?
                ORDER BY r.created_at DESC
            `);
            return stmt.all(id);
        } catch (error) {
            throw error;
        }
    }

    static async toggleStatus(id) {
        try {
            const stmt = db.prepare(`
                UPDATE customers 
                SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            const result = stmt.run(id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Customer;