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

                db.run(
                    `INSERT INTO returns (
                        sale_id, customer_id, user_id, total_amount,
                        discount_amount, tax_amount, final_amount,
                        reason
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [sale_id, customer_id, user_id, total_amount, discount_amount, tax_amount, final_amount, reason],
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
                                    quantity, unit_price, discount_amount,
                                    tax_amount, total_amount
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [returnId, item.sale_item_id, item.product_id, item.quantity, item.unit_price, item.discount_amount, item.tax_amount, item.total_amount],
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

                                            completed++;
                                            if (completed === total) {
                                                db.run('COMMIT');
                                                resolve(returnId);
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
}

module.exports = Return; 