const db = require('../config/database');

class ProductUnit {
    static async create(productUnitData) {
        const { name, symbol, description } = productUnitData;

        try {
            const stmt = db.prepare('INSERT INTO product_units (name, symbol, description) VALUES (?, ?, ?)');
            const result = stmt.run(name, symbol, description);
            return result.lastInsertRowid;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const stmt = db.prepare('SELECT * FROM product_units WHERE id = ?');
            return stmt.get(id);
        } catch (error) {
            throw error;
        }
    }

    static async update(id, productUnitData) {
        const { name, symbol, description } = productUnitData;

        try {
            const stmt = db.prepare(`
                UPDATE product_units 
                SET name = ?, symbol = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `);
            const result = stmt.run(name, symbol, description, id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM product_units WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const stmt = db.prepare(`
                SELECT pu.*, 
                    (SELECT COUNT(*) FROM products WHERE product_unit_id = pu.id) as product_count
                FROM product_units pu
                ORDER BY pu.name ASC
            `);
            return stmt.all();
        } catch (error) {
            throw error;
        }
    }

    static async getProducts(id) {
        try {
            const stmt = db.prepare(`
                SELECT p.*, 
                    c.name as category_name,
                    s.name as supplier_name,
                    pt.name as product_type_name,
                    i.quantity as current_stock
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE p.product_unit_id = ?
                ORDER BY p.name ASC
            `);
            return stmt.all(id);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ProductUnit;