const Todo = require('../models/todo.model'); // Import the Todo model

// Get all todos
exports.getTodos = async (req, res) => {
    try {
        const todos = await Todo.getAll();
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching todos', error: error.message });
    }
};

// Get a single todo by ID
exports.getTodo = async (req, res) => {
    try {
        const todo = await Todo.getById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.status(200).json(todo);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching todo', error: error.message });
    }
};

// Create a new todo
exports.createTodo = async (req, res) => {
    const { title, description, priority, status, due_date, assigned_to, created_by } = req.body;

    const newTodo = {
        title,
        description,
        priority,
        status,
        due_date,
        assigned_to,
        created_by
    };

    try {
        const todoId = await Todo.create(newTodo);
        res.status(201).json({ id: todoId, ...newTodo });
    } catch (error) {
        res.status(400).json({ message: 'Error creating todo', error: error.message });
    }
};

// Update an existing todo
exports.updateTodo = async (req, res) => {
    const { title, description, priority, status, due_date, assigned_to } = req.body;

    const updatedTodo = {
        title,
        description,
        priority,
        status,
        due_date,
        assigned_to
    };

    try {
        await Todo.update(req.params.id, updatedTodo);
        res.status(200).json({ message: 'Todo updated successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error updating todo', error: error.message });
    }
};

// Delete a todo
exports.deleteTodo = async (req, res) => {
    try {
        await Todo.delete(req.params.id);
        res.status(204).send(); // No content
    } catch (error) {
        res.status(500).json({ message: 'Error deleting todo', error: error.message });
    }
};

// Optional: Get statistics about todos
exports.getTodoStats = async (req, res) => {
    try {
        const totalTodos = await Todo.countDocuments();
        const completedTodos = await Todo.countDocuments({ status: 'completed' });
        const pendingTodos = await Todo.countDocuments({ status: 'pending' });

        res.status(200).json({
            total: totalTodos,
            completed: completedTodos,
            pending: pendingTodos
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching todo stats', error: error.message });
    }
}; 