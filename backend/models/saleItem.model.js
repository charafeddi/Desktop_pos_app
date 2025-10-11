const db = require('../config/database');

class SaleItem {
    async create(saleItemData) {
        try {
            const stmt = db.prepare(`
                INSERT INTO sale_items (sale_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `);
            const result = stmt.run(saleItemData.sale_id, saleItemData.product_id, saleItemData.quantity, saleItemData.price);
            return result.lastInsertRowid;
        } catch (error) {
            throw error;
        }
    }

    async getAll() {
        try {
            const stmt = db.prepare('SELECT * FROM sale_items');
            return stmt.all();
        } catch (error) {
            throw error;
        }
    }

    async getById(id) {
        try {
            const stmt = db.prepare('SELECT * FROM sale_items WHERE id = ?');
            return stmt.get(id);
        } catch (error) {
            throw error;
        }
    }

    async update(id, saleItemData) {
        try {
            const stmt = db.prepare(`
                UPDATE sale_items SET
                    sale_id = ?,
                    product_id = ?,
                    quantity = ?,
                    price = ?
                WHERE id = ?
            `);
            const result = stmt.run(saleItemData.sale_id, saleItemData.product_id, saleItemData.quantity, saleItemData.price, id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM sale_items WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new SaleItem();