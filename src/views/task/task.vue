<template>
    <div class="page-content">
        <div class="page-info">
          <nav aria-label="breadcrumb" class="breadcrumb-nav">
              <ol class="breadcrumb">
                  <li class="breadcrumb-item"><a href="#" class="breadcrumb-link">Apps</a></li>
                  <li class="breadcrumb-item active" aria-current="page">{{ t('sidebar.dashboard') }}</li>
              </ol>
          </nav>
        </div>
        <div class="main-content">
            <div class="row grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="w-full">
                    <div class="card">
                        <div class="card-body">
                            <div class="todo-sidebar">
                                <div class="todo-new-task">
                                    <div class="flex items-center justify-center">
                                        <button 
                                            class="flex items-center justify-center w-5 px-4 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-blue-500 rounded-lg shrink-0 sm:w-auto gap-x-2 hover:bg-blue-600 dark:hover:bg-blue-500 dark:bg-blue-600" 
                                            @click="isOpen = true"
                                            >
                                            {{ t('task.create_task') }}
                                        </button>
                                    </div>
                                    <div v-if="isOpen" class="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" @click.self="isOpen = false">
                                        <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                                            <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
                    
                                            <div class="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl dark:bg-gray-900 sm:my-8 sm:w-full sm:max-w-sm sm:p-6 sm:align-middle">
                                                <div class="absolute top-0 right-0 pt-4 pr-4">
                                                    <button type="button" @click="isOpen = false" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                                                        <span class="sr-only">Close</span>
                                                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <h3 class="text-lg font-medium leading-6 text-gray-800 capitalize dark:text-white" id="modal-title">
                                                    {{ t('task.create_task') }}
                                                </h3>
                    
                                                <form @submit.prevent="addTask" class="mt-4">
                                                    <label for="title" class="text-sm text-gray-700 dark:text-gray-200"> {{ t('task.title') }} </label>
                                                    <input type="text" v-model="newTask.title" id="title" :placeholder="t('task.title')" class="block w-full px-4 py-3 mt-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-md focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-300" required />
                    
                                                    <label for="description" class="text-sm text-gray-700 dark:text-gray-200 mt-3"> {{ t('task.description') }} </label>
                                                    <textarea v-model="newTask.description" id="description" :placeholder="t('task.description')" class="block w-full px-4 py-3 mt-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-md focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-300" required></textarea>
                    
                                                    <label for="priority" class="text-sm text-gray-700 dark:text-gray-200 mt-3"> {{ t('task.priority') }} </label>
                                                    <select v-model="newTask.priority" id="priority" class="block w-full px-4 py-3 mt-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-md focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-300">
                                                        <option value="medium">{{ t('task.medium') }}</option>
                                                        <option value="urgent">{{ t('task.urgent') }}</option>
                                                        <option value="not urgent">{{ t('task.not_urgent') }}</option>
                                                    </select>
                    
                                                    <label for="status" class="text-sm text-gray-700 dark:text-gray-200 mt-3"> {{ t('task.status') }} </label>
                                                    <select v-model="newTask.status" id="status" class="block w-full px-4 py-3 mt-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-md focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-300">
                                                        <option value="pending">{{ t('task.pending') }}</option>
                                                        <option value="completed">{{ t('task.completed') }}</option>
                                                    </select>
                    
                                                    <div class="mt-4 sm:flex sm:items-center sm:-mx-2">
                                                        <button type="button" @click="isOpen = false" class="w-full px-4 py-2 text-sm font-medium tracking-wide text-gray-700 capitalize transition-colors duration-300 transform border border-gray-200 rounded-md sm:w-1/2 sm:mx-2 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-40">
                                                            {{ t('task.cancel') }}
                                                        </button>
                    
                                                        <button type="submit" class="w-full px-4 py-2 mt-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-md sm:mt-0 sm:w-1/2 sm:mx-2 hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40">
                                                            {{ t('task.add_task') }}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="todo-menu flex items-center justify-center">
                                    <ul class="list-none">
                                      <!-- Active Item -->
                                      <li class="active">
                                        <a
                                          href="#"
                                          @click.prevent
                                          class="flex items-center px-5 py-2 text-[#4347d9] bg-transparent hover:bg-gray-200 rounded-md transition duration-150 ease-in-out"
                                        >
                                        <span class="material-icons-outlined text-current">
                                            reorder
                                        </span>
                                          <span>{{ t('task.all') }}</span>
                                        </a>
                                      </li>
                                  
                                      <!-- Completed Item -->
                                      <li>
                                        <a
                                          href="#"
                                          @click.prevent
                                          class="flex items-center px-4 py-2 text-gray-500 bg-transparent hover:bg-gray-200 rounded-md transition duration-150 ease-in-out"
                                        >
                                        <span class="material-icons-outlined text-current">
                                            done
                                        </span>
                                          <span>{{ t('task.completed') }}</span>
                                        </a>
                                      </li>
                                  
                                      <!-- Deleted Item -->
                                      <li>
                                        <a
                                          href="#"
                                          @click.prevent
                                          class="flex items-center px-4 py-2 text-gray-500 bg-transparent hover:bg-gray-200 rounded-md transition duration-150 ease-in-out"
                                        >
                                        <span class="material-icons-outlined text-current">
                                            delete
                                        </span>
                                          <span>{{ t('task.deleted') }}</span>
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                <div class="divider"></div>
                                  <div class="flex items-center justify-center p-4 rounded-lg shadow-sm">
                                    <form class="w-full max-w-md">
                                        <div class="flex items-center">
                                        <!-- Input Field -->
                                        <input
                                            type="text"
                                            id="todo-search"
                                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-200"
                                            :placeholder="t('task.search_task')"
                                        />

                                        <!-- Search Button -->
                                        <button
                                            type="submit"
                                            class="px-4 py-2 bg-blue-500 text-white font-semibold ml-2 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                                        >
                                            <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            >
                                            <path
                                                fill-rule="evenodd"
                                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                                clip-rule="evenodd"
                                            />
                                            </svg>
                                        </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-full md:col-span-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="todo-list">
                                <ul class="list-unstyled">
                                    <template v-if="todos.length > 0">
                                        <li v-for="todo in todos" :key="todo.id" class="flex justify-between text-left">
                                            <a href="#" 
                                               class="custom-checkbox" 
                                               :class="{ 'done': todo.status === 'completed' }"
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    class="custom-control-input" 
                                                    :id="'task' + todo.id"
                                                    :checked="todo.status === 'completed'"
                                                    @change="updateStatus(todo.id, todo.status === 'completed' ? 'pending' : 'completed')"
                                                >
                                                <label class="custom-control-label" :for="'task' + todo.id"></label> 
                                                {{ todo.title }}
                                            </a>
                                        <div>
                                            <span class="material-icons-outlined" @click="editTodo(todo.id)">
                                                edit
                                            </span>
                                            <span class="material-icons-outlined" @click="deleteTodo(todo.id)">
                                                delete
                                            </span>
                                        </div>
                                    </li>
                                    </template>
                                    <template v-else>
                                        <div class="flex items-center mt-6 text-center border rounded-lg h-96 dark:border-gray-700">
                                            <div class="flex flex-col w-full max-w-sm px-4 mx-auto">
                                                <div class="p-3 mx-auto text-blue-500 bg-blue-100 rounded-full dark:bg-gray-800">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                                    </svg>
                                                </div>
                                                <h1 class="mt-3 text-lg text-gray-800 dark:text-white">No task found</h1>
                                                <p class="mt-2 text-gray-500 dark:text-gray-400">Your search "Stripe" did not match any task. Please try again or create add a new task.</p>
                                                <div class="flex items-center mt-4 sm:mx-auto gap-x-3">
                                                    <button class="w-1/2 px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg sm:w-auto dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700">
                                                        {{ t('task.clear_search') }}
                                                    </button>
                                                    <button @click="isOpen = true" class="flex items-center justify-center w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-blue-500 rounded-lg shrink-0 sm:w-auto gap-x-2 hover:bg-blue-600 dark:hover:bg-blue-500 dark:bg-blue-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>{{ t('task.add_task') }}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>  
</template>
<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTodoStore } from '@/stores/todo.store';
import { useAuthStore } from '@/stores/auth.store';
export default {
    setup() {
        const { t } = useI18n();
        const todoStore = useTodoStore();
        const isOpen = ref(false);
        const userStore = useAuthStore();

        const newTask = ref({
            title: '',
            description: '',
            priority: 'medium',
            status: 'pending',
            created_by: userStore.user.id
        });

        const updateStatus = async (id, newStatus) => {
            try {
                console.log('Updating status:', id, newStatus);
                await todoStore.updateTodo(id, { status: newStatus });
                await todoStore.fetchTodos(); // Refresh the todos after update
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }

        // Use computed to make todos reactive to store changes
        const todos = computed(() => todoStore.todos);

        const addTask = async () => {
            console.log("newTask", newTask.value);
            await todoStore.addTodo(newTask.value);
            // Reset form
            newTask.value = {
                title: '',
                description: '',
                priority: 'medium',
                status: 'pending',
                created_by: userStore.user.id
            };
            todoStore.fetchTodos();
            // Close modal
            isOpen.value = false;
        };

        const editTodo = async (id) => {
            // Implement edit functionality
            await todoStore.updateTodo(id);
            todoStore.fetchTodos();
            console.log('Edit todo:', id);
        };

        const deleteTodo = async (id) => {
            await todoStore.deleteTodo(id);
            todoStore.fetchTodos();
        };

        // Fetch todos when component is mounted
        onMounted(() => {
            todoStore.fetchTodos();
        });
        
        return { 
            t, 
            todos, 
            newTask, 
            addTask,
            editTodo,
            deleteTodo,
            updateStatus,
            isOpen
        };
    }
}
</script>
<style>
    .todo-list{
        margin:-25px;
        border-radius:10px;
        position:relative;
        overflow:hidden;
        align-items: start;
    }

    .todo-list ul{
        margin-bottom:0
    }

    .todo-list ul li a{
        display:block;
        border-bottom:1px solid #e8e8e8;
        width:100%;
        padding:16px 25px 16px 48px;
        color:#7d7d83;
        -webkit-transition:all .2s ease-in-out;
        -moz-transition:all .2s ease-in-out;
        -o-transition:all .2s ease-in-out;
        transition:all .2s ease-in-out
    }

    .todo-list ul li a .custom-control-label{
        margin-right:10px
    }

    .todo-list ul li:first-child a{
        border-top-left-radius:10px;
        border-top-right-radius:10px
    }

    .todo-list ul li:last-child a{
        border-bottom-left-radius:10px;
        border-bottom-right-radius:10px;
        border-bottom:0
    }

    .todo-list ul li a.done,
    .todo-list ul li a.done:hover{
        text-decoration:line-through!important
    }

</style>