const db = require('../config/database');

class Invoice {
    async create(invoiceData) {
        try {
            const stmt = db.prepare(`
                INSERT INTO invoices (client_id, total_amount, status, created_at)
                VALUES (?, ?, ?, ?)
            `);
            const result = stmt.run(invoiceData.client_id, invoiceData.total_amount, invoiceData.status, new Date());
            return result.lastInsertRowid;
        } catch (error) {
            throw error;
        }
    }

    async getAll() {
        try {
            const stmt = db.prepare('SELECT * FROM invoices');
            return stmt.all();
        } catch (error) {
            throw error;
        }
    }

    async getById(id) {
        try {
            const stmt = db.prepare('SELECT * FROM invoices WHERE id = ?');
            return stmt.get(id);
        } catch (error) {
            throw error;
        }
    }

    async update(id, invoiceData) {
        try {
            const stmt = db.prepare(`
                UPDATE invoices SET
                    client_id = ?,
                    total_amount = ?,
                    status = ?
                WHERE id = ?
            `);
            const result = stmt.run(invoiceData.client_id, invoiceData.total_amount, invoiceData.status, id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM invoices WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new Invoice();