const db = require('../config/database'); // Import the existing database connection

class Invoice {
    async create(invoiceData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO invoices (client_id, total_amount, status, created_at)
                VALUES (?, ?, ?, ?)
            `;
            const params = [invoiceData.client_id, invoiceData.total_amount, invoiceData.status, new Date()];
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    async getAll() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM invoices`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async getById(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM invoices WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async update(id, invoiceData) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE invoices SET
                    client_id = ?,
                total_amount = ?,
                status = ?
            WHERE id = ?
        `;
            const params = [invoiceData.client_id, invoiceData.total_amount, invoiceData.status, id];
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    async delete(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM invoices WHERE id = ?`;
            db.run(sql, [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

// Export an instance of the Invoice class
module.exports = new Invoice(); 