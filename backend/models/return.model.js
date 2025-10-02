const db = require('../config/database');

class Return {
    static async create(returnData) {
        const {
            sale_id, customer_id, user_id, total_amount,
            discount_amount, tax_amount, final_amount,
            reason, items
        } = returnData;

        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // Generate unique return number
                const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

                db.run(
                    `INSERT INTO returns (
                        return_number, sale_id, customer_id, user_id, total_amount,
                        discount_amount, tax_amount, final_amount,
                        reason, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [returnNumber, sale_id, customer_id, user_id, total_amount, discount_amount, tax_amount, final_amount, reason, 'completed'],
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        const returnId = this.lastID;
                        let completed = 0;
                        const total = items.length;

                        items.forEach(item => {
                            db.run(
                                `INSERT INTO return_items (
                                    return_id, sale_item_id, product_id,
                                    quantity, unit_price, tax_rate,
                                    tax_amount, total_amount, discount_amount
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [returnId, item.sale_item_id, item.product_id, item.quantity, item.unit_price, item.tax_rate || 0, item.tax_amount, item.total_amount, item.discount_amount || 0],
                                (err) => {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        reject(err);
                                        return;
                                    }

                                    // Update product stock
                                    db.run(
                                        'UPDATE products SET current_stock = current_stock + ? WHERE id = ?',
                                        [item.quantity, item.product_id],
                                        (err) => {
                                            if (err) {
                                                db.run('ROLLBACK');
                                                reject(err);
                                                return;
                                            }

                                            // Update sale amount (reduce by the returned item amount)
                                            db.run(
                                                `UPDATE sales SET 
                                                    total_amount = total_amount - ?,
                                                    final_amount = final_amount - ?,
                                                    updated_at = CURRENT_TIMESTAMP
                                                WHERE id = ?`,
                                                [item.total_amount, item.total_amount, sale_id],
                                                (err) => {
                                                    if (err) {
                                                        db.run('ROLLBACK');
                                                        reject(err);
                                                        return;
                                                    }

                                                    completed++;
                                                    if (completed === total) {
                                                        db.run('COMMIT');
                                                        resolve(returnId);
                                                    }
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        });
                    }
                );
            });
        });
    }
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT r.*, 
                    c.name as customer_name,
                    u.name as user_name,
                    s.invoice_number as sale_invoice_number
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sales s ON r.sale_id = s.id
                WHERE r.id = ?`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    static async getItems(returnId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT ri.*, 
                    p.name as product_name,
                    p.sku,
                    pu.symbol as unit_symbol
                FROM return_items ri
                LEFT JOIN products p ON ri.product_id = p.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                WHERE ri.return_id = ?
                ORDER BY ri.id ASC`,
                [returnId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT r.*, 
                    c.name as customer_name,
                    u.name as user_name,
                    s.invoice_number as sale_invoice_number,
                    (SELECT COUNT(*) FROM return_items WHERE return_id = r.id) as item_count
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sales s ON r.sale_id = s.id
                ORDER BY r.created_at DESC`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getReturnsByDateRange(startDate, endDate) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT r.*, 
                    c.name as customer_name,
                    u.name as user_name,
                    s.invoice_number as sale_invoice_number
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sales s ON r.sale_id = s.id
                WHERE DATE(r.created_at) BETWEEN ? AND ?
                ORDER BY r.created_at DESC`,
                [startDate, endDate],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getReturnsByCustomer(customerId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT r.*, 
                    u.name as user_name,
                    s.invoice_number as sale_invoice_number
                FROM returns r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sales s ON r.sale_id = s.id
                WHERE r.customer_id = ?
                ORDER BY r.created_at DESC`,
                [customerId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getReturnsBySale(saleId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT r.*, 
                    c.name as customer_name,
                    u.name as user_name
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.sale_id = ?
                ORDER BY r.created_at DESC`,
                [saleId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async searchReturns(searchParams) {
        const { 
            customer_name, 
            sale_invoice, 
            reason, 
            start_date, 
            end_date, 
            return_number,
            status 
        } = searchParams;

        return new Promise((resolve, reject) => {
            let query = `
                SELECT r.*, 
                    c.name as customer_name,
                    u.name as user_name,
                    s.invoice_number as sale_invoice_number,
                    (SELECT COUNT(*) FROM return_items WHERE return_id = r.id) as item_count
                FROM returns r
                LEFT JOIN customers c ON r.customer_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN sales s ON r.sale_id = s.id
                WHERE 1=1
            `;
            
            const params = [];

            if (customer_name) {
                query += ` AND c.name LIKE ?`;
                params.push(`%${customer_name}%`);
            }

            if (sale_invoice) {
                query += ` AND s.invoice_number LIKE ?`;
                params.push(`%${sale_invoice}%`);
            }

            if (reason) {
                query += ` AND r.reason LIKE ?`;
                params.push(`%${reason}%`);
            }

            if (return_number) {
                query += ` AND r.return_number LIKE ?`;
                params.push(`%${return_number}%`);
            }

            if (status) {
                query += ` AND r.status = ?`;
                params.push(status);
            }

            if (start_date) {
                query += ` AND DATE(r.created_at) >= ?`;
                params.push(start_date);
            }

            if (end_date) {
                query += ` AND DATE(r.created_at) <= ?`;
                params.push(end_date);
            }

            query += ` ORDER BY r.created_at DESC`;

            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // First, get the return items to restore stock
                db.all(
                    'SELECT * FROM return_items WHERE return_id = ?',
                    [id],
                    (err, items) => {
                        if (err) {
                            db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        // Restore stock for each item
                        let completed = 0;
                        const total = items.length;

                        if (total === 0) {
                            // No items to restore, just delete the return
                            db.run(
                                'DELETE FROM returns WHERE id = ?',
                                [id],
                                function(err) {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        reject(err);
                                        return;
                                    }
                                    db.run('COMMIT');
                                    resolve(this.changes);
                                }
                            );
                            return;
                        }

                        items.forEach(item => {
                            db.run(
                                'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
                                [item.quantity, item.product_id],
                                (err) => {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        reject(err);
                                        return;
                                    }

                                    // Restore sale amount (add back the returned item amount)
                                    db.run(
                                        `UPDATE sales SET 
                                            total_amount = total_amount + ?,
                                            final_amount = final_amount + ?,
                                            updated_at = CURRENT_TIMESTAMP
                                        WHERE id = (SELECT sale_id FROM returns WHERE id = ?)`,
                                        [item.total_amount, item.total_amount, id],
                                        (err) => {
                                            if (err) {
                                                db.run('ROLLBACK');
                                                reject(err);
                                                return;
                                            }

                                            completed++;
                                            if (completed === total) {
                                                // Delete return items
                                                db.run(
                                                    'DELETE FROM return_items WHERE return_id = ?',
                                                    [id],
                                                    (err) => {
                                                        if (err) {
                                                            db.run('ROLLBACK');
                                                            reject(err);
                                                            return;
                                                        }

                                                        // Delete the return
                                                        db.run(
                                                            'DELETE FROM returns WHERE id = ?',
                                                            [id],
                                                            function(err) {
                                                                if (err) {
                                                                    db.run('ROLLBACK');
                                                                    reject(err);
                                                                    return;
                                                                }
                                                                db.run('COMMIT');
                                                                resolve(this.changes);
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        }
                                    );
                                }
                            );
                        });
                    }
                );
            });
        });
    }
}

module.exports = Return; 