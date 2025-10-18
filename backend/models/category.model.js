const db = require('../config/database');

class Category {
    static async create(categoryData) {
        const { name, description, parent_id } = categoryData;

        try {
            const stmt = db.prepare(`
                INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)
            `);
            const result = stmt.run(name, description, parent_id);
            return result.lastInsertRowid;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const stmt = db.prepare(`
                SELECT c.*, 
                    (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
                FROM categories c
                WHERE c.id = ?
            `);
            return stmt.get(id);
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        return this.findById(id);
    }

    static async update(id, categoryData) {
        const { name, description, parent_id } = categoryData;

        try {
            const stmt = db.prepare(`
                UPDATE categories 
                SET name = ?, description = ?, parent_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            const result = stmt.run(name, description, parent_id, id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
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
                    (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
                FROM categories c
                ORDER BY c.name ASC
            `);
            return stmt.all();
        } catch (error) {
            throw error;
        }
    }

    static async getProducts(categoryId) {
        try {
            const stmt = db.prepare(`
                SELECT p.*, 
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    s.name as supplier_name
                FROM products p
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.category_id = ?
                ORDER BY p.name ASC
            `);
            return stmt.all(categoryId);
        } catch (error) {
            throw error;
        }
    }

    static async search(query) {
        try {
            const stmt = db.prepare(`
                SELECT c.*, 
                    (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
                FROM categories c
                WHERE c.name LIKE ? OR c.description LIKE ?
                ORDER BY c.name ASC
            `);
            return stmt.all(`%${query}%`, `%${query}%`);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Category;