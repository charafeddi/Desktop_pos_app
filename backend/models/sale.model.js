const db = require('../config/database');

class Sale {
    static async create(saleData) {
        const {
            customer_id, user_id, total_amount,
            discount_amount, tax_amount, final_amount,
            payment_method, items
        } = saleData;

        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.run(
                    `INSERT INTO sales (
                        customer_id, user_id, total_amount,
                        discount_amount, tax_amount, final_amount,
                        payment_method
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [customer_id, user_id, total_amount, discount_amount, tax_amount, final_amount, payment_method],
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        const saleId = this.lastID;
                        let completed = 0;
                        const total = items.length;

                        items.forEach(item => {
                            db.run(
                                `INSERT INTO sale_items (
                                    sale_id, product_id, quantity,
                                    unit_price, discount_amount,
                                    tax_amount, total_amount
                                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [saleId, item.product_id, item.quantity, item.unit_price, item.discount_amount, item.tax_amount, item.total_amount],
                                (err) => {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        reject(err);
                                        return;
                                    }

                                    // Update product stock
                                    db.run(
                                        'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
                                        [item.quantity, item.product_id],
                                        (err) => {
                                            if (err) {
                                                db.run('ROLLBACK');
                                                reject(err);
                                                return;
                                            }

                                            completed++;
                                            if (completed === total) {
                                                db.run('COMMIT');
                                                resolve(saleId);
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

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT s.*, 
                    c.name as customer_name,
                    u.name as user_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.id = ?`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    static async getItems(saleId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT si.*, 
                    p.name as product_name,
                    p.sku,
                    pu.symbol as unit_symbol
                FROM sale_items si
                LEFT JOIN products p ON si.product_id = p.id
                LEFT JOIN product_units pu ON p.product_unit_id = pu.id
                WHERE si.sale_id = ?
                ORDER BY si.id ASC`,
                [saleId],
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
                `SELECT s.*, 
                    c.name as customer_name,
                    u.name as user_name,
                    (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as item_count
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                LEFT JOIN users u ON s.user_id = u.id
                ORDER BY s.created_at DESC`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getDailySales(date) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT s.*, 
                    c.name as customer_name,
                    u.name as user_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE DATE(s.created_at) = ?
                ORDER BY s.created_at DESC`,
                [date],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getSalesByDateRange(startDate, endDate) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT s.*, 
                    c.name as customer_name,
                    u.name as user_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE DATE(s.created_at) BETWEEN ? AND ?
                ORDER BY s.created_at DESC`,
                [startDate, endDate],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getSalesByCustomer(customerId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT s.*, 
                    u.name as user_name
                FROM sales s
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.customer_id = ?
                ORDER BY s.created_at DESC`,
                [customerId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getSalesByUser(userId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT s.*, 
                    c.name as customer_name
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                WHERE s.user_id = ?
                ORDER BY s.created_at DESC`,
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
}

module.exports = Sale; 