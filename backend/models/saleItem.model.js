const db = require('../config/database'); // Import the existing database connection

class SaleItem {
    async create(saleItemData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO sale_items (sale_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `;
            const params = [saleItemData.sale_id, saleItemData.product_id, saleItemData.quantity, saleItemData.price];
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    async getAll() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM sale_items`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async getById(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM sale_items WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async update(id, saleItemData) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE sale_items SET
                    sale_id = ?,
                    product_id = ?,
                    quantity = ?,
                    price = ?
            WHERE id = ?
        `;
            const params = [saleItemData.sale_id, saleItemData.product_id, saleItemData.quantity, saleItemData.price, id];
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    async delete(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM sale_items WHERE id = ?`;
            db.run(sql, [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

// Export an instance of the SaleItem class
module.exports = new SaleItem(); 