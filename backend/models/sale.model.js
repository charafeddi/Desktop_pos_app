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

                // Generate invoice number
                const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                // Use static column mapping for better performance
                const columnNames = ['date', 'customer_id', 'user_id', 'total_amount', 'discount_amount', 'tax_amount', 'final_amount', 'payment_method', 'invoice_number'];
                
                // Build INSERT statement based on available columns
                let insertColumns = [];
                let insertValues = [];
                let placeholders = [];
                
                // Add columns that exist
                if (columnNames.includes('sale_number')) {
                    insertColumns.push('sale_number');
                    insertValues.push(invoiceNumber); // Use invoice number as sale number
                    placeholders.push('?');
                }
                if (columnNames.includes('invoice_number')) {
                    insertColumns.push('invoice_number');
                    insertValues.push(invoiceNumber);
                    placeholders.push('?');
                }
                if (columnNames.includes('customer_id')) {
                    insertColumns.push('customer_id');
                    insertValues.push(customer_id);
                    placeholders.push('?');
                }
                if (columnNames.includes('user_id')) {
                    insertColumns.push('user_id');
                    insertValues.push(user_id);
                    placeholders.push('?');
                }
                if (columnNames.includes('subtotal')) {
                    insertColumns.push('subtotal');
                    insertValues.push(total_amount); // Use total_amount as subtotal
                    placeholders.push('?');
                }
                if (columnNames.includes('total_amount')) {
                    insertColumns.push('total_amount');
                    insertValues.push(total_amount);
                    placeholders.push('?');
                }
                if (columnNames.includes('discount_amount')) {
                    insertColumns.push('discount_amount');
                    insertValues.push(discount_amount);
                    placeholders.push('?');
                }
                if (columnNames.includes('tax_amount')) {
                    insertColumns.push('tax_amount');
                    insertValues.push(tax_amount);
                    placeholders.push('?');
                }
                if (columnNames.includes('final_amount')) {
                    insertColumns.push('final_amount');
                    insertValues.push(final_amount);
                    placeholders.push('?');
                }
                if (columnNames.includes('payment_method')) {
                    insertColumns.push('payment_method');
                    insertValues.push(payment_method);
                    placeholders.push('?');
                }
                if (columnNames.includes('payment_status')) {
                    insertColumns.push('payment_status');
                    insertValues.push('completed'); // Default payment status
                    placeholders.push('?');
                }
                if (columnNames.includes('sale_status')) {
                    insertColumns.push('sale_status');
                    insertValues.push('completed'); // Default sale status
                    placeholders.push('?');
                }
                
                const insertSQL = `INSERT INTO sales (${insertColumns.join(', ')}) VALUES (${placeholders.join(', ')})`;
                console.log('Insert SQL:', insertSQL);
                console.log('Insert values:', insertValues);
                
                db.run(insertSQL, insertValues, function(err) {
                    if (err) {
                        console.error('Insert error:', err);
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                    }
                    processSaleItems(this.lastID);
                });
                
                function processSaleItems(saleId) {
                    let completed = 0;
                    const total = items.length;

                    if (total === 0) {
                        db.run('COMMIT');
                        resolve(saleId);
                        return;
                    }

                    // Check which columns exist in the sale_items table
                    db.all("PRAGMA table_info(sale_items)", (err, columns) => {
                        if (err) {
                            db.run('ROLLBACK');
                            reject(err);
                            return;
                        }
                        
                        const columnNames = columns.map(col => col.name);
                        console.log('Available columns in sale_items table:', columnNames);

                        items.forEach(item => {
                            // Build dynamic INSERT statement for sale_items
                            let insertColumns = [];
                            let insertValues = [];
                            let placeholders = [];
                            
                            // Add columns that exist
                            if (columnNames.includes('sale_id')) {
                                insertColumns.push('sale_id');
                                insertValues.push(saleId);
                                placeholders.push('?');
                            }
                            if (columnNames.includes('product_id')) {
                                insertColumns.push('product_id');
                                insertValues.push(item.product_id);
                                placeholders.push('?');
                            }
                            if (columnNames.includes('quantity')) {
                                insertColumns.push('quantity');
                                insertValues.push(item.quantity);
                                placeholders.push('?');
                            }
                            if (columnNames.includes('unit_price')) {
                                insertColumns.push('unit_price');
                                insertValues.push(item.unit_price);
                                placeholders.push('?');
                            }
                            if (columnNames.includes('tax_rate')) {
                                insertColumns.push('tax_rate');
                                insertValues.push(item.tax_rate || 10); // Default 10% tax rate
                                placeholders.push('?');
                            }
                            if (columnNames.includes('discount_amount')) {
                                insertColumns.push('discount_amount');
                                insertValues.push(item.discount_amount || 0);
                                placeholders.push('?');
                            }
                            if (columnNames.includes('tax_amount')) {
                                insertColumns.push('tax_amount');
                                insertValues.push(item.tax_amount || 0);
                                placeholders.push('?');
                            }
                            if (columnNames.includes('total_amount')) {
                                insertColumns.push('total_amount');
                                insertValues.push(item.total_amount);
                                placeholders.push('?');
                            }
                            
                            const insertSQL = `INSERT INTO sale_items (${insertColumns.join(', ')}) VALUES (${placeholders.join(', ')})`;
                            console.log('Sale item insert SQL:', insertSQL);
                            console.log('Sale item values:', insertValues);
                            
                            db.run(insertSQL, insertValues, (err) => {
                                if (err) {
                                    console.error('Sale item insert error:', err);
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
                                            console.error('Stock update error:', err);
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
                            });
                        });
                    });
                }
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

    static async update(id, saleData) {
        return new Promise((resolve, reject) => {
            const {
                customer_id, user_id, total_amount,
                discount_amount, tax_amount, final_amount,
                payment_method, payment_status, sale_status, notes
            } = saleData;

            // Build dynamic UPDATE statement based on provided fields
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
            console.log('Update SQL:', updateSQL);
            console.log('Update values:', updateValues);

            db.run(updateSQL, updateValues, function(err) {
                if (err) {
                    console.error('Update error:', err);
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // First, get the sale items to restore stock
                db.all(
                    'SELECT product_id, quantity FROM sale_items WHERE sale_id = ?',
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
                            // No items to restore, just delete the sale
                            db.run('DELETE FROM sales WHERE id = ?', [id], (err) => {
                                if (err) {
                                    db.run('ROLLBACK');
                                    reject(err);
                                    return;
                                }
                                db.run('COMMIT');
                                resolve(true);
                            });
                            return;
                        }

                        items.forEach(item => {
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
                                        // All stock restored, now delete sale items and sale
                                        db.run('DELETE FROM sale_items WHERE sale_id = ?', [id], (err) => {
                                            if (err) {
                                                db.run('ROLLBACK');
                                                reject(err);
                                                return;
                                            }

                                            db.run('DELETE FROM sales WHERE id = ?', [id], (err) => {
                                                if (err) {
                                                    db.run('ROLLBACK');
                                                    reject(err);
                                                    return;
                                                }
                                                db.run('COMMIT');
                                                resolve(true);
                                            });
                                        });
                                    }
                                }
                            );
                        });
                    }
                );
            });
        });
    }
}

module.exports = Sale;