const db = require('../config/database');

class Supplier {
    static async create(supplierData) {
        const {
            name, contact_person, email, phone,
            address, city, country, postal_code
        } = supplierData;

        try {
            const stmt = db.prepare(`
                INSERT INTO suppliers (
                    name, contact_person, email, phone,
                    address, city, country, postal_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(name, contact_person, email, phone, address, city, country, postal_code);
            return result.lastInsertRowid;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const stmt = db.prepare('SELECT * FROM suppliers WHERE id = ?');
            return stmt.get(id);
        } catch (error) {
            throw error;
        }
    }

    static async update(id, supplierData) {
        const {
            name, contact_person, email, phone,
            address, city, country, postal_code
        } = supplierData;

        try {
            const stmt = db.prepare(`
                UPDATE suppliers 
                SET name = ?, contact_person = ?, email = ?, phone = ?,
                    address = ?, city = ?, country = ?, postal_code = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            const result = stmt.run(name, contact_person, email, phone, address, city, country, postal_code, id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM suppliers WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const stmt = db.prepare(`
                SELECT s.*, 
                    (SELECT COUNT(*) FROM products WHERE supplier_id = s.id) as product_count,
                    (SELECT COALESCE(SUM(purchase_price), 0) FROM products WHERE supplier_id = s.id) as total_amount_count
                FROM suppliers s
                ORDER BY s.name ASC
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
                    pt.name as product_type_name,
                    pu.name as product_unit_name,
                    pu.symbol as product_unit_symbol,
                    i.quantity as current_stock
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_types pt ON p.product_type_id = pt.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE p.supplier_id = ?
                ORDER BY p.name ASC
            `);
            return stmt.all(id);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Supplier;