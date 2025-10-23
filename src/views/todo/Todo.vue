<template>
  <div class="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold" style="color: var(--color-text) !important;">{{ t('todo.title') }}</h1>
        <p class="mt-2 text-sm" style="color: var(--color-text-secondary) !important;">Manage your tasks and stay organized</p>
      </div>

      <!-- Controls -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <!-- Search and Filter -->
        <div class="flex flex-col sm:flex-row gap-4 flex-1">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('todo.searchTodos')"
              class="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style="border-color: var(--color-border) !important; background-color: var(--color-surface) !important; color: var(--color-text) !important;"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-text-secondary) !important;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          <select
            v-model="statusFilter"
            class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style="border-color: var(--color-border) !important; background-color: var(--color-surface) !important; color: var(--color-text) !important;"
          >
            <option value="">{{ t('todo.all') }}</option>
            <option value="pending">{{ t('todo.pending') }}</option>
            <option value="completed">{{ t('todo.completed') }}</option>
            <option value="inProgress">{{ t('todo.inProgress') }}</option>
          </select>
        </div>

        <!-- Add Todo Button -->
        <button
          @click="openAddModal"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          {{ t('todo.addTodo') }}
        </button>
      </div>

      <!-- Todo List -->
      <div class="shadow rounded-lg" style="background-color: var(--color-surface) !important;">
        <div v-if="filteredTodos.length === 0" class="p-8 text-center">
          <div class="mb-4" style="color: var(--color-text-secondary) !important;">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium mb-2" style="color: var(--color-text) !important;">{{ t('todo.noTodos') }}</h3>
          <p class="mb-4" style="color: var(--color-text-secondary) !important;">Get started by adding your first todo item</p>
          <button
            @click="openAddModal"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {{ t('todo.addNewTodo') }}
          </button>
        </div>

        <div v-else class="divide-y" style="border-color: var(--color-border) !important;">
          <div
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="p-6 transition-colors"
            style="border-color: var(--color-border) !important;"
            :style="{ 'background-color': 'var(--color-surface)' }"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 
                    class="text-lg font-medium"
                    :class="{ 'line-through': todo.status === 'completed' }"
                    :style="{ 
                      'color': todo.status === 'completed' ? 'var(--color-text-secondary)' : 'var(--color-text)',
                      'text-decoration': todo.status === 'completed' ? 'line-through' : 'none'
                    }"
                  >
                    {{ todo.title }}
                  </h3>
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getPriorityClass(todo.priority)"
                  >
                    {{ t(`todo.${todo.priority}`) }}
                  </span>
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusClass(todo.status)"
                  >
                    {{ t(`todo.${todo.status}`) }}
                  </span>
                </div>
                
                <p v-if="todo.description" class="mb-3" style="color: var(--color-text-secondary) !important;">
                  {{ todo.description }}
                </p>
                
                <div class="flex items-center gap-4 text-sm" style="color: var(--color-text-secondary) !important;">
                  <span v-if="todo.due_date">
                    <i class="fas fa-calendar mr-1"></i>
                    {{ formatDate(todo.due_date) }}
                  </span>
                  <span>
                    <i class="fas fa-clock mr-1"></i>
                    {{ formatDate(todo.created_at) }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 ml-4">
                <button
                  @click="toggleStatus(todo)"
                  class="p-2 transition-colors"
                  style="color: var(--color-text-secondary) !important;"
                  :style="{ 'color': 'var(--color-text-secondary)' }"
                  :title="todo.status === 'completed' ? t('todo.markPending') : t('todo.markComplete')"
                >
                  <svg v-if="todo.status === 'completed'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
                
                <button
                  @click="openEditModal(todo)"
                  class="p-2 transition-colors"
                  style="color: var(--color-text-secondary) !important;"
                  :title="t('todo.editTodo')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                
              <button
                @click="deleteTodo(todo)"
                class="p-2 transition-colors"
                style="color: var(--color-text-secondary) !important;"
                :title="t('todo.deleteTodo')"
              >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <LoadingSpinner 
        v-if="isLoading || isSaving || isDeleting || isTogglingStatus"
        :message="getLoadingMessage()"
        :fullscreen="true"
        :overlay="true"
      />

      <!-- Confirmation Dialog -->
      <ConfirmationDialog
        :isOpen="showDeleteConfirm"
        :title="t('todo.confirmDelete')"
        :message="deleteConfirmMessage"
        type="danger"
        :confirmText="t('todo.delete')"
        :cancelText="t('todo.cancel')"
        :isLoading="isDeleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
      />
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ isEditing ? t('todo.editTodoItem') : t('todo.addNewTodo') }}
          </h3>
          
          <form @submit.prevent="saveTodo">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('todo.todoTitle') }} *
                </label>
                <input
                  v-model="todoForm.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('todo.description') }}
                </label>
                <textarea
                  v-model="todoForm.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('todo.priority') }}
                  </label>
                  <select
                    v-model="todoForm.priority"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">{{ t('todo.low') }}</option>
                    <option value="medium">{{ t('todo.medium') }}</option>
                    <option value="high">{{ t('todo.high') }}</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('todo.status') }}
                  </label>
                  <select
                    v-model="todoForm.status"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="pending">{{ t('todo.pending') }}</option>
                    <option value="inProgress">{{ t('todo.inProgress') }}</option>
                    <option value="completed">{{ t('todo.completed') }}</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('todo.dueDate') }}
                </label>
                <input
                  v-model="todoForm.due_date"
                  type="datetime-local"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
              </div>
            </div>
            
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {{ t('todo.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isSaving"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg v-if="isSaving" class="w-4 h-4 inline mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                {{ t('todo.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTodoStore } from '@/stores/todo.store'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { useI18n } from 'vue-i18n'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useToast } from '@/utils/toastManager'
import { useErrorHandler } from '@/utils/errorHandler'

const { t } = useI18n()
const todoStore = useTodoStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// Error handling and toast composables
const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()
const { handleNetworkError, handleDatabaseError, handleValidationError, handleBusinessLogicError } = useErrorHandler()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const loading = ref(false)

// Loading states
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const isTogglingStatus = ref(false)

// Confirmation dialog state
const showDeleteConfirm = ref(false)
const todoToDelete = ref(null)

// Todo form
const todoForm = ref({
  id: null,
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  due_date: ''
})

// Computed properties
const filteredTodos = computed(() => {
  let todos = todoStore.allTodos

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    todos = todos.filter(todo => 
      todo.title.toLowerCase().includes(query) ||
      todo.description.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (statusFilter.value) {
    todos = todos.filter(todo => todo.status === statusFilter.value)
  }

  // Sort by priority and creation date
  return todos.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

const deleteConfirmMessage = computed(() => {
  if (!todoToDelete.value) return ''
  return `Are you sure you want to delete "${todoToDelete.value.title}"? This action cannot be undone.`
})

// Helper methods
const getLoadingMessage = () => {
  if (isLoading.value) return 'Loading todos...'
  if (isSaving.value) return 'Saving todo...'
  if (isDeleting.value) return 'Deleting todo...'
  if (isTogglingStatus.value) return 'Updating status...'
  return 'Processing...'
}

const confirmDelete = async () => {
  try {
    isDeleting.value = true
    showInfo('Deleting Todo', 'Removing todo item...')
    
    await todoStore.deleteTodo(todoToDelete.value.id)
    
    showSuccess('Todo Deleted', 'Todo item has been successfully removed')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Todo Deleted', 'Todo item removed')
    }
  } catch (error) {
    handleDatabaseError(error, 'Delete Todo')
    showError('Delete Failed', 'An error occurred while deleting the todo')
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
    todoToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  todoToDelete.value = null
}

const showDeleteConfirmation = (todo) => {
  todoToDelete.value = todo
  showDeleteConfirm.value = true
}

// Methods
const openAddModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const openEditModal = (todo) => {
  isEditing.value = true
  todoForm.value = {
    id: todo.id,
    title: todo.title,
    description: todo.description || '',
    priority: todo.priority,
    status: todo.status,
    due_date: todo.due_date ? formatDateForInput(todo.due_date) : ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  todoForm.value = {
    id: null,
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: ''
  }
}

const saveTodo = async () => {
  try {
    // Validation
    if (!todoForm.value.title.trim()) {
      handleValidationError(new Error('Todo title is required'), 'Save Todo')
      showError('Validation Error', 'Todo title is required')
      return
    }

    if (todoForm.value.title.length > 255) {
      handleValidationError(new Error('Todo title is too long'), 'Save Todo')
      showError('Validation Error', 'Todo title must be less than 255 characters')
      return
    }

    isSaving.value = true
    showInfo('Saving Todo', isEditing.value ? 'Updating todo item...' : 'Creating new todo...')

    const todoData = {
      title: todoForm.value.title.trim(),
      description: todoForm.value.description?.trim() || '',
      priority: todoForm.value.priority,
      status: todoForm.value.status,
      due_date: todoForm.value.due_date || null,
      created_by: authStore.user?.id
    }

    if (isEditing.value) {
      await todoStore.updateTodo({ ...todoData, id: todoForm.value.id })
      showSuccess('Todo Updated', 'Todo item has been successfully updated')
      
      // Add notification
      if (window.addNotification) {
        window.addNotification('success', 'Todo Updated', 'Todo item updated')
      }
    } else {
      await todoStore.addTodo(todoData)
      showSuccess('Todo Created', 'New todo item has been successfully created')
      
      // Add notification
      if (window.addNotification) {
        window.addNotification('success', 'Todo Created', 'New todo item added')
      }
    }
    
    closeModal()
  } catch (error) {
    if (error.message?.includes('UNIQUE constraint')) {
      handleDatabaseError(error, 'Save Todo')
      showError('Duplicate Todo', 'A todo with this title already exists')
    } else if (error.message?.includes('validation')) {
      handleValidationError(error, 'Save Todo')
      showError('Validation Error', error.message)
    } else {
      handleNetworkError(error, 'Save Todo')
      showError('Save Failed', isEditing.value ? 'Failed to update todo' : 'Failed to create todo')
    }
  } finally {
    isSaving.value = false
  }
}

const toggleStatus = async (todo) => {
  try {
    isTogglingStatus.value = true
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed'
    
    showInfo('Updating Status', `Changing status to ${newStatus}...`)
    
    await todoStore.updateTodo({ ...todo, status: newStatus })
    
    showSuccess('Status Updated', `Todo status changed to ${newStatus}`)
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Status Updated', `Todo marked as ${newStatus}`)
    }
  } catch (error) {
    handleDatabaseError(error, 'Toggle Status')
    showError('Update Failed', 'Failed to update todo status')
  } finally {
    isTogglingStatus.value = false
  }
}

const deleteTodo = async (todo) => {
  showDeleteConfirmation(todo)
}

const getPriorityClass = (priority) => {
  const classes = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }
  return classes[priority] || classes.medium
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    inProgress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }
  return classes[status] || classes.pending
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const formatDateForInput = (dateString) => {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

// Lifecycle
onMounted(async () => {
  try {
    isLoading.value = true
    showInfo('Loading Todos', 'Fetching your todo items...')
    
    await Promise.all([
      todoStore.fetchTodos(),
      themeStore.loadTheme()
    ])
    
    showSuccess('Todos Loaded', 'Your todo items have been loaded successfully')
  } catch (error) {
    handleNetworkError(error, 'Load Todos')
    showError('Load Failed', 'Failed to load todo items')
  } finally {
    isLoading.value = false
  }
})

</script>

<style scoped>
.line-through {
  text-decoration: line-through;
}

/* Action button hover effects */
button:hover {
  background-color: var(--color-surface) !important;
}

/* Priority badge styles */
.priority-high {
  background-color: var(--color-error);
  color: white;
}

.priority-medium {
  background-color: var(--color-warning);
  color: white;
}

.priority-low {
  background-color: var(--color-info);
  color: white;
}

/* Status badge styles */
.status-pending {
  background-color: var(--color-warning);
  color: white;
}

.status-completed {
  background-color: var(--color-success);
  color: white;
}

.status-inProgress {
  background-color: var(--color-info);
  color: white;
}
</style>
