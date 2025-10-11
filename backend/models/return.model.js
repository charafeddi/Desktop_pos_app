const db = require('../config/database');

class Return {
    static async create(returnData) {
        const {
            sale_id, customer_id, user_id, total_amount,
            discount_amount, tax_amount, final_amount,
            reason, items
        } = returnData;

        try {
            // Generate unique return number
            const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            // Insert return record
            const returnStmt = db.prepare(`
                INSERT INTO returns (
                    return_number, sale_id, customer_id, user_id, total_amount,
                    discount_amount, tax_amount, final_amount,
                    reason, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            const returnResult = returnStmt.run(
                returnNumber, sale_id, customer_id, user_id, total_amount,
                discount_amount, tax_amount, final_amount, reason, 'completed'
            );
            
            const returnId = returnResult.lastInsertRowid;
            console.log('Created return with ID:', returnId);

            // Insert return items
            if (items && items.length > 0) {
                const itemStmt = db.prepare(`
                    INSERT INTO return_items (
                        return_id, sale_item_id, product_id,
                        quantity, unit_price, tax_rate,
                        tax_amount, total_amount, discount_amount
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const item of items) {
                    itemStmt.run(
                        returnId,
                        item.sale_item_id,
                        item.product_id,
                        item.quantity,
                        item.unit_price,
                        item.tax_rate || 0,
                        item.tax_amount,
                        item.total_amount,
                        item.discount_amount || 0
                    );
                }
            }

            return returnId;
        } catch (error) {
            console.error('Error creating return:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const stmt = db.prepare(`
                SELECT r.*, 
                    c.name as customer_name, 
                    u.name as user_name,
                    s.invoice_number as sale_invoice_number
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sales s ON r.sale_id = s.id
                WHERE r.id = ?
            `);
            return stmt.get(id);
        } catch (error) {
            throw error;
        }
    }

    static async getItems(returnId) {
        try {
            const stmt = db.prepare(`
                SELECT ri.*, p.name as product_name, p.sku
                FROM return_items ri
                LEFT JOIN products p ON ri.product_id = p.id
                WHERE ri.return_id = ?
            `);
            return stmt.all(returnId);
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const stmt = db.prepare(`
                SELECT r.*, 
                    c.name as customer_name, 
                    u.name as user_name,
                    s.invoice_number as sale_invoice_number
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sales s ON r.sale_id = s.id
                ORDER BY r.created_at DESC
            `);
            return stmt.all();
        } catch (error) {
            throw error;
        }
    }

    static async getDailyReturns(date) {
        try {
            const stmt = db.prepare(`
                SELECT r.*, 
                    c.name as customer_name, 
                    u.name as user_name,
                    s.invoice_number as sale_invoice_number
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sales s ON r.sale_id = s.id
                WHERE DATE(r.created_at) = ?
                ORDER BY r.created_at DESC
            `);
            return stmt.all(date);
        } catch (error) {
            throw error;
        }
    }

    static async getReturnsByDateRange(startDate, endDate) {
        try {
            const stmt = db.prepare(`
                SELECT r.*, 
                    c.name as customer_name, 
                    u.name as user_name,
                    s.invoice_number as sale_invoice_number
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sales s ON r.sale_id = s.id
                WHERE DATE(r.created_at) BETWEEN ? AND ?
                ORDER BY r.created_at DESC
            `);
            return stmt.all(startDate, endDate);
        } catch (error) {
            throw error;
        }
    }

    static async getReturnsByCustomer(customerId) {
        try {
            const stmt = db.prepare(`
                SELECT r.*, 
                    c.name as customer_name, 
                    u.name as user_name,
                    s.invoice_number as sale_invoice_number
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sales s ON r.sale_id = s.id
                WHERE r.customer_id = ?
                ORDER BY r.created_at DESC
            `);
            return stmt.all(customerId);
        } catch (error) {
            throw error;
        }
    }

    static async getReturnsByUser(userId) {
        try {
            const stmt = db.prepare(`
                SELECT r.*, 
                    c.name as customer_name, 
                    u.name as user_name,
                    s.invoice_number as sale_invoice_number
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sales s ON r.sale_id = s.id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC
            `);
            return stmt.all(userId);
        } catch (error) {
            throw error;
        }
    }

    static async update(id, returnData) {
        const {
            total_amount, discount_amount, tax_amount, final_amount,
            reason, status
        } = returnData;

        try {
            const updateFields = [];
            const values = [];

            if (total_amount !== undefined) { updateFields.push('total_amount = ?'); values.push(total_amount); }
            if (discount_amount !== undefined) { updateFields.push('discount_amount = ?'); values.push(discount_amount); }
            if (tax_amount !== undefined) { updateFields.push('tax_amount = ?'); values.push(tax_amount); }
            if (final_amount !== undefined) { updateFields.push('final_amount = ?'); values.push(final_amount); }
            if (reason !== undefined) { updateFields.push('reason = ?'); values.push(reason); }
            if (status !== undefined) { updateFields.push('status = ?'); values.push(status); }

            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            const stmt = db.prepare(`UPDATE returns SET ${updateFields.join(', ')} WHERE id = ?`);
            const result = stmt.run(...values);
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            // Delete return items first
            const deleteItemsStmt = db.prepare('DELETE FROM return_items WHERE return_id = ?');
            deleteItemsStmt.run(id);

            // Delete return
            const deleteReturnStmt = db.prepare('DELETE FROM returns WHERE id = ?');
            const result = deleteReturnStmt.run(id);
            
            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Return;