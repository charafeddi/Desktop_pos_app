import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
const { ipcRenderer } = window.require('electron')

interface Todo {
    id: number
    title: string
    description: string
    priority: string
    status: string
    due_date: string | null
    assigned_to: string | null
    created_by: string | null
}

interface NewTodo {
    title: string
    description: string
    priority: string
    status: string
    due_date?: string | null
    assigned_to?: string | null
    created_by?: string | null
}

export const useTodoStore = defineStore('todo', {
    state: () => ({
        todos: ref<Todo[]>([]),
        loading: ref<boolean>(false),
        error: ref<string | null>(null)
    }),
    getters: {
        // Get all todos
        allTodos: (state) => state.todos,

        // Get completed todos
        completedTodos: (state) => state.todos.filter(todo => todo.status === 'completed'),

        // Get pending todos
        pendingTodos: (state) => state.todos.filter(todo => todo.status === 'pending'),

        // Get deleted todos
        deletedTodos: (state) => state.todos.filter(todo => todo.status === 'deleted'),

        // Get loading state
        isLoading: (state) => state.loading,

        // Get error message
        errorMessage: (state) => state.error,
    },
    actions: {
        async fetchTodos() {
            this.loading = true
            try {
                console.log("fetching todos");
                const fetchedTodos = await ipcRenderer.invoke('get-todos')
                this.todos = fetchedTodos;
            } catch (err) {
                if (err instanceof Error) {
                    this.error = err.message
                } else {
                    this.error = 'An unknown error occurred'
                }
            } finally {
                this.loading = false
            }
        },

        async getTodoById(id: number) {
            this.loading = true
            try {
                console.log("getting todo by id", id);
                const todo = await ipcRenderer.invoke('get-todo-by-id', id)
                return todo
            } catch (err) {
                if (err instanceof Error) {
                    this.error = err.message
                } else {
                    this.error = 'An unknown error occurred'
                }
            } finally {
                this.loading = false
            }
        },

        async addTodo(todoData: NewTodo) {
            this.loading = true
            try {
                console.log("Starting to add todo:", todoData);
                
                // Create a clean object with only the required properties
                const cleanTodoData = {
                    title: todoData.title,
                    description: todoData.description || '',
                    priority: todoData.priority || 'medium',
                    status: todoData.status || 'pending',
                    due_date: todoData.due_date || null,
                    assigned_to: todoData.assigned_to || null,
                    created_by: todoData.created_by || null
                };

                console.log("Sending cleaned todo data:", cleanTodoData);
                const addedTodo = await ipcRenderer.invoke('create-todo', cleanTodoData);
                console.log("Response from create-todo:", addedTodo);
                
                if (!addedTodo || !addedTodo.id) {
                    throw new Error('Failed to create todo: Invalid response from server');
                }
                
                this.todos.push(addedTodo);
                console.log("Updated todos array:", this.todos);
                
                // Fetch todos again to ensure we have the latest data
                await this.fetchTodos();
                return addedTodo;
            } catch (err) {
                console.error("Error in addTodo:", err);
                if (err instanceof Error) {
                    this.error = err.message;
                } else {
                    this.error = 'An unknown error occurred';
                }
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async updateTodo(updatedTodo: Todo) {
            this.loading = true
            try {
                // Create a clean object with only the properties we want to update
                const cleanTodoData = {
                    id: updatedTodo.id,
                    title: updatedTodo.title,
                    description: updatedTodo.description,
                    priority: updatedTodo.priority,
                    status: updatedTodo.status,
                    due_date: updatedTodo.due_date || null,
                    assigned_to: updatedTodo.assigned_to || null
                };

                console.log("updating todo", cleanTodoData);
                await ipcRenderer.invoke('update-todo', cleanTodoData)
                const index = this.todos.findIndex(todo => todo.id === updatedTodo.id)
                if (index !== -1) {
                    this.todos[index] = { ...this.todos[index], ...cleanTodoData }
                }
            } catch (err) {
                if (err instanceof Error) {
                    this.error = err.message
                } else {
                    this.error = 'An unknown error occurred'
                }
            } finally {
                this.loading = false
            }
        },

        async deleteTodo(todoId: number) {
            this.loading = true
            try {
                console.log("deleting todo", todoId);
                await ipcRenderer.invoke('delete-todo', todoId)
                this.todos = this.todos.filter(todo => todo.id !== todoId)
            } catch (err) {
                if (err instanceof Error) {
                    this.error = err.message
                } else {
                    this.error = 'An unknown error occurred'
                }
            } finally {
                this.loading = false
            }
        },
    }
})