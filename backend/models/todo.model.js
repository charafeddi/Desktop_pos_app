const db = require('../config/database'); // Import the existing database connection

// Define the Todo model
class Todo {
    async create(todo) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO todos (
                    title, description, priority, status, 
                    due_date, assigned_to, created_by,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;
            const params = [
                todo.title,
                todo.description,
                todo.priority,
                todo.status,
                todo.due_date,
                todo.assigned_to,
                todo.created_by
            ];
            
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                
                // Get the created todo with timestamps
                const todoId = this.lastID;
                db.get(
                    'SELECT * FROM todos WHERE id = ?',
                    [todoId],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });
        });
    }

    async getAll() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM todos ORDER BY created_at DESC`;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('Error fetching todos:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getById(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM todos WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error('Error fetching todo by ID:', err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async update(id, todo) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE todos SET
                    title = ?,
                    description = ?,
                    priority = ?,
                    status = ?,
                    due_date = ?,
                    assigned_to = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            const params = [todo.title, todo.description, todo.priority, todo.status, todo.due_date, todo.assigned_to, id];
            
            db.run(sql, params, function(err) {
                if (err) {
                    console.error('Error updating todo:', err);
                    reject(err);
                    return;
                }
                
                // Get the updated todo
                db.get(
                    'SELECT * FROM todos WHERE id = ?',
                    [id],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });
        });
    }

    async delete(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM todos WHERE id = ?`;
            db.run(sql, [id], function(err) {
                if (err) {
                    console.error('Error deleting todo:', err);
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }
}

// Export the Todo model
module.exports = new Todo(); // Export an instance of the Todo class 