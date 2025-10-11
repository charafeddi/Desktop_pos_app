const db = require('../config/database');

class ProductType {
    static async create(productTypeData) {
        const { name, description } = productTypeData;

        try {
            const stmt = db.prepare('INSERT INTO product_types (name, description) VALUES (?, ?)');
            const result = stmt.run(name, description);
            return result.lastInsertRowid;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const stmt = db.prepare('SELECT * FROM product_types WHERE id = ?');
            return stmt.get(id);
        } catch (error) {
            throw error;
        }
    }

    static async update(id, productTypeData) {
        const { name, description } = productTypeData;

        try {
            const stmt = db.prepare(`
                UPDATE product_types 
                SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `);
            const result = stmt.run(name, description, id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM product_types WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const stmt = db.prepare(`
                SELECT pt.*, 
                    (SELECT COUNT(*) FROM products WHERE product_type_id = pt.id) as product_count
                FROM product_types pt
                ORDER BY pt.name ASC
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
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    i.quantity as current_stock
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE p.product_type_id = ?
                ORDER BY p.name ASC
            `);
            return stmt.all(id);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ProductType;