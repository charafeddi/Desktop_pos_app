const db = require('../config/database');

class Category {
    static async create(categoryData) {
        const { name, description, parent_id } = categoryData;

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)`,
                [name, description, parent_id],
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
                `SELECT c.*, 
                    (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
                FROM categories c
                WHERE c.id = ?`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    static async getById(id) {
        return this.findById(id);
    }

    static async update(id, categoryData) {
        const { name, description } = categoryData;

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE categories 
                SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [name, description, id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT c.*, 
                    (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
                FROM categories c
                ORDER BY c.name ASC`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getProducts(categoryId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT p.*, 
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    s.name as supplier_name
                FROM products p
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.category_id = ?
                ORDER BY p.name ASC`,
                [categoryId],
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
                `SELECT c.*, 
                    (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
                FROM categories c
                WHERE c.name LIKE ? OR c.description LIKE ?
                ORDER BY c.name ASC`,
                [`%${query}%`, `%${query}%`],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
}

module.exports = Category; 