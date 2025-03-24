const { ipcMain } = require('electron');
const Todo = require('../models/todo.model');

function setupTodoHandlers() {

// Function to handle creating a todo
ipcMain.handle('create-todo', async (event, todoData) => {
    try {
        console.log("Received todo data:", todoData);
        const createdTodo = await Todo.create(todoData);
        console.log("Complete todo data:", createdTodo);
        
        if (!createdTodo) {
            throw new Error('Todo was created but could not be retrieved');
        }
        
        return createdTodo;
    } catch (error) {
        console.error("Error in create-todo handler:", error);
        throw error;
    }
});

// Function to handle fetching all todos
ipcMain.handle('get-todos', async () => {
    try {
        console.log("received request for get-todos");
        const todos = await Todo.getAll();
        return todos;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Function to handle fetching a single todo by ID
ipcMain.handle('get-todo-by-id', async (event, id) => {
    try {
        const todo = await Todo.getById(id);
        if (!todo) {
            throw new Error('Todo not found');
        }
        return todo;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Function to handle updating a todo
ipcMain.handle('update-todo', async (event, id, todoData) => {
    try {
        await Todo.update(id, todoData);
        return { message: 'Todo updated successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Function to handle deleting a todo
ipcMain.handle('delete-todo', async (event, id) => {
    try {
        await Todo.delete(id);
        return { message: 'Todo deleted successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Additional functions for update, delete, etc. 
}

module.exports = setupTodoHandlers; 