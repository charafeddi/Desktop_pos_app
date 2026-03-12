const db = require('../config/database');

class Sale {
    static async create(saleData) {
        const {
            customer_id, user_id, total_amount,
            discount_amount, tax_amount, final_amount,
            payment_method, items
        } = saleData;

        try {
            // Generate sale number and invoice number
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            const saleNumber = `SALE-${timestamp}-${random}`;
            const invoiceNumber = `INV-${timestamp}-${random}`;
            
            // Get current local time
            const currentTime = new Date().toISOString();

            // Insert sale record
            const saleStmt = db.prepare(`
                INSERT INTO sales (
                    sale_number, invoice_number, customer_id, user_id, total_amount, 
                    discount_amount, tax_amount, final_amount, payment_method,
                    payment_status, sale_status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'completed', ?)
            `);
            
            const saleResult = saleStmt.run(
                saleNumber, invoiceNumber, customer_id, user_id, total_amount,
                discount_amount, tax_amount, final_amount, payment_method, currentTime
            );
            
            const saleId = saleResult.lastInsertRowid;

            // Insert sale items and update stock
            if (items && items.length > 0) {
                const itemStmt = db.prepare(`
                    INSERT INTO sale_items (
                        sale_id, product_id, quantity, unit_price, tax_rate,
                        discount_amount, tax_amount, total_amount, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                // Prepare stock update statement
                const stockUpdateStmt = db.prepare(`
                    UPDATE products 
                    SET current_stock = current_stock - ?, updated_at = ?
                    WHERE id = ?
                `);

                for (const item of items) {
                    // Insert sale item with all required fields
                    itemStmt.run(
                        saleId,
                        item.product_id,
                        item.quantity,
                        item.unit_price,
                        item.tax_rate || 0,  // Default to 0 if not provided
                        item.discount_amount || 0,  // Default to 0 if not provided
                        item.tax_amount || 0,  // Default to 0 if not provided
                        item.total_price || item.total_amount,
                        currentTime
                    );

                    // Update product stock
                    const stockResult = stockUpdateStmt.run(
                        item.quantity,
                        currentTime,
                        item.product_id
                    );

                    if (stockResult.changes === 0) {
                        console.warn(`Product with ID ${item.product_id} not found for stock update`);
                    } else {
                        console.log(`Updated stock for product ${item.product_id}: -${item.quantity}`);
                    }
                }
            }

            return { id: saleId, sale_number: saleNumber, invoice_number: invoiceNumber };
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const stmt = db.prepare(`
                SELECT s.*, c.name as customer_name, u.name as user_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.id = ?
            `);
            return stmt.get(id);
        } catch (error) {
            throw error;
        }
    }

    static async getItems(saleId) {
        try {
            const stmt = db.prepare(`
                SELECT si.*, p.name as product_name, p.sku
                FROM sale_items si
                LEFT JOIN products p ON si.product_id = p.id
                WHERE si.sale_id = ?
            `);
            return stmt.all(saleId);
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        try {
            const stmt = db.prepare(`
                SELECT s.*, c.name as customer_name, u.name as user_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                LEFT JOIN users u ON s.user_id = u.id
                ORDER BY s.created_at DESC
            `);
            return stmt.all();
        } catch (error) {
            throw error;
        }
    }

    static async getDailySales(date) {
        try {
            const stmt = db.prepare(`
                SELECT s.*, c.name as customer_name, u.name as user_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE DATE(s.created_at) = ?
                ORDER BY s.created_at DESC
            `);
            return stmt.all(date);
        } catch (error) {
            throw error;
        }
    }

    static async getSalesByDateRange(startDate, endDate) {
        try {
            const stmt = db.prepare(`
                SELECT s.*, c.name as customer_name, u.name as user_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE DATE(s.created_at) BETWEEN ? AND ?
                ORDER BY s.created_at DESC
            `);
            return stmt.all(startDate, endDate);
        } catch (error) {
            throw error;
        }
    }

    static async getSalesByCustomer(customerId) {
        try {
            const stmt = db.prepare(`
                SELECT s.*, c.name as customer_name, u.name as user_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.customer_id = ?
                ORDER BY s.created_at DESC
            `);
            return stmt.all(customerId);
        } catch (error) {
            throw error;
        }
    }

    static async getSalesByUser(userId) {
        try {
            const stmt = db.prepare(`
                SELECT s.*, c.name as customer_name, u.name as user_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.user_id = ?
                ORDER BY s.created_at DESC
            `);
            return stmt.all(userId);
        } catch (error) {
            throw error;
        }
    }

    // Get sales count by user
    static async getSalesCountByUser(userId) {
        try {
            const stmt = db.prepare('SELECT COUNT(*) as count FROM sales WHERE user_id = ?');
            const result = stmt.get(userId);
            return result.count;
        } catch (error) {
            throw error;
        }
    }

    // Get total revenue by user
    static async getTotalRevenueByUser(userId) {
        try {
            const stmt = db.prepare('SELECT SUM(total_amount) as total FROM sales WHERE user_id = ?');
            const result = stmt.get(userId);
            return result.total || 0;
        } catch (error) {
            throw error;
        }
    }

    // Get first sale by user
    static async getFirstSaleByUser(userId) {
        try {
            const stmt = db.prepare(`
                SELECT * FROM sales 
                WHERE user_id = ? 
                ORDER BY created_at ASC 
                LIMIT 1
            `);
            return stmt.get(userId);
        } catch (error) {
            throw error;
        }
    }

    // Get recent sales by user
    static async getRecentSalesByUser(userId, limit = 10) {
        try {
            const stmt = db.prepare(`
                SELECT s.*, 
                       c.name as customer_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                WHERE s.user_id = ?
                ORDER BY s.created_at DESC
                LIMIT ?
            `);
            return stmt.all(userId, limit);
        } catch (error) {
            throw error;
        }
    }

    static async update(id, saleData) {
        const {
            customer_id, user_id, total_amount, discount_amount,
            tax_amount, final_amount, payment_method, payment_status,
            sale_status, notes
        } = saleData;

        try {
            let updateFields = [];
            let updateValues = [];

            if (customer_id !== undefined) {
                updateFields.push('customer_id = ?');
                updateValues.push(customer_id);
            }
            if (user_id !== undefined) {
                updateFields.push('user_id = ?');
                updateValues.push(user_id);
            }
            if (total_amount !== undefined) {
                updateFields.push('total_amount = ?');
                updateValues.push(total_amount);
            }
            if (discount_amount !== undefined) {
                updateFields.push('discount_amount = ?');
                updateValues.push(discount_amount);
            }
            if (tax_amount !== undefined) {
                updateFields.push('tax_amount = ?');
                updateValues.push(tax_amount);
            }
            if (final_amount !== undefined) {
                updateFields.push('final_amount = ?');
                updateValues.push(final_amount);
            }
            if (payment_method !== undefined) {
                updateFields.push('payment_method = ?');
                updateValues.push(payment_method);
            }
            if (payment_status !== undefined) {
                updateFields.push('payment_status = ?');
                updateValues.push(payment_status);
            }
            if (sale_status !== undefined) {
                updateFields.push('sale_status = ?');
                updateValues.push(sale_status);
            }
            if (notes !== undefined) {
                updateFields.push('notes = ?');
                updateValues.push(notes);
            }

            // Always update the updated_at timestamp
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            updateValues.push(id);

            const updateSQL = `UPDATE sales SET ${updateFields.join(', ')} WHERE id = ?`;
            const stmt = db.prepare(updateSQL);
            const result = stmt.run(...updateValues);
            
            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        // Run the entire delete as a transaction so it's atomic
        const deleteTransaction = db.transaction((saleId) => {
            // 1. Get sale items to restore stock later
            const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleId);

            // 2. Delete return_items that belong to returns of this sale
            //    (FK: return_items.return_id → returns.id  AND  return_items.sale_item_id → sale_items.id)
            db.prepare(`
                DELETE FROM return_items
                WHERE return_id IN (SELECT id FROM returns WHERE sale_id = ?)
            `).run(saleId);

            // 3. Delete returns for this sale
            //    (FK: returns.sale_id → sales.id)
            db.prepare('DELETE FROM returns WHERE sale_id = ?').run(saleId);

            // 4. Restore stock — only for items that were NOT already returned
            //    to avoid double-restoring stock that was already put back by a return.
            if (items.length > 0) {
                const returnedQtyStmt = db.prepare(`
                    SELECT COALESCE(SUM(ri.quantity), 0) AS returned_qty
                    FROM return_items ri
                    JOIN returns r ON ri.return_id = r.id
                    WHERE r.sale_id = ? AND ri.product_id = ?
                `);
                const stockStmt = db.prepare(
                    'UPDATE products SET current_stock = current_stock + ? WHERE id = ?'
                );
                for (const item of items) {
                    // return_items were just deleted, so returned_qty will always be 0 here;
                    // this guard is kept for clarity and future safety.
                    const { returned_qty } = returnedQtyStmt.get(saleId, item.product_id);
                    const toRestore = item.quantity - returned_qty;
                    if (toRestore > 0) {
                        stockStmt.run(toRestore, item.product_id);
                    }
                }
            }

            // 5. Delete sale items
            db.prepare('DELETE FROM sale_items WHERE sale_id = ?').run(saleId);

            // 6. Delete the sale itself
            const result = db.prepare('DELETE FROM sales WHERE id = ?').run(saleId);
            return result.changes > 0;
        });

        return deleteTransaction(id);
    }
}

module.exports = Sale;