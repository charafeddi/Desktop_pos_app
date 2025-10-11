const db = require('../config/database');

class Todo {
    async create(todo) {
        try {
            const stmt = db.prepare(`
                INSERT INTO todos (
                    title, description, priority, status, 
                    due_date, assigned_to, created_by,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `);
            
            const result = stmt.run(
                todo.title,
                todo.description,
                todo.priority,
                todo.status,
                todo.due_date,
                todo.assigned_to,
                todo.created_by
            );
            
            // Get the created todo with timestamps
            const getStmt = db.prepare('SELECT * FROM todos WHERE id = ?');
            return getStmt.get(result.lastInsertRowid);
        } catch (error) {
            throw error;
        }
    }

    async getAll() {
        try {
            const stmt = db.prepare('SELECT * FROM todos ORDER BY created_at DESC');
            return stmt.all();
        } catch (error) {
            console.error('Error fetching todos:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const stmt = db.prepare('SELECT * FROM todos WHERE id = ?');
            return stmt.get(id);
        } catch (error) {
            console.error('Error fetching todo by ID:', error);
            throw error;
        }
    }

    async update(id, todo) {
        try {
            const stmt = db.prepare(`
                UPDATE todos SET
                    title = ?,
                    description = ?,
                    priority = ?,
                    status = ?,
                    due_date = ?,
                    assigned_to = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            
            stmt.run(
                todo.title,
                todo.description,
                todo.priority,
                todo.status,
                todo.due_date,
                todo.assigned_to,
                id
            );
            
            // Get the updated todo
            const getStmt = db.prepare('SELECT * FROM todos WHERE id = ?');
            return getStmt.get(id);
        } catch (error) {
            console.error('Error updating todo:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (error) {
            console.error('Error deleting todo:', error);
            throw error;
        }
    }
}

module.exports = new Todo();