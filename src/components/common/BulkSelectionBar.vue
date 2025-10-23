<template>
  <div class="bulk-selection-bar" v-if="selectedCount > 0">
    <div class="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-sm font-medium text-blue-800">
            {{ selectedCount }} product{{ selectedCount > 1 ? 's' : '' }} selected
          </span>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Bulk Actions Dropdown -->
        <div class="relative">
          <button
            @click="showActionsDropdown = !showActionsDropdown"
            class="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <span class="material-icons-outlined text-sm mr-1">more_vert</span>
            Actions
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <!-- Actions Dropdown -->
          <div
            v-if="showActionsDropdown"
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
          >
            <div class="py-1">
              <button
                v-for="operation in availableOperations"
                :key="operation.id"
                @click="handleOperationClick(operation)"
                class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span class="material-icons-outlined text-sm mr-3">{{ operation.icon }}</span>
                {{ operation.name }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Clear Selection -->
        <button
          @click="clearSelection"
          class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { bulkOperations } from '@/utils/bulkOperations'

const props = defineProps({
  selectedCount: {
    type: Number,
    default: 0
  },
  selectedIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['operation-executed', 'clear-selection'])

const showActionsDropdown = ref(false)
const availableOperations = ref([])

onMounted(() => {
  // Initialize bulk operations
  bulkOperations.initialize()
  availableOperations.value = bulkOperations.getAllOperations()
  
  // Close dropdown when clicking outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event) => {
  if (!event.target.closest('.bulk-selection-bar')) {
    showActionsDropdown.value = false
  }
}

const handleOperationClick = async (operation) => {
  showActionsDropdown.value = false
  
  try {
    if (operation.id === 'bulk-edit') {
      // Open bulk edit modal
      emit('operation-executed', { operation: 'bulk-edit', data: null })
    } else if (operation.id === 'bulk-delete') {
      // Show confirmation dialog
      const confirmed = confirm(`Are you sure you want to delete ${props.selectedCount} products? This action cannot be undone.`)
      if (confirmed) {
        await bulkOperations.executeOperation(operation.id, props.selectedIds)
        emit('operation-executed', { operation: 'bulk-delete', data: null })
      }
    } else if (operation.id === 'bulk-status') {
      // Open status change modal
      emit('operation-executed', { operation: 'bulk-status', data: null })
    } else if (operation.id === 'bulk-export') {
      await bulkOperations.executeOperation(operation.id, props.selectedIds)
      emit('operation-executed', { operation: 'bulk-export', data: null })
    }
  } catch (error) {
    console.error('Bulk operation error:', error)
    alert(`Error: ${error.message}`)
  }
}

const clearSelection = () => {
  emit('clear-selection')
}
</script>

<style scoped>
.bulk-selection-bar {
  position: sticky;
  top: 0;
  z-index: 40;
  margin-bottom: 1rem;
}

/* Theme-aware styling */
[data-theme="dark"] .bulk-selection-bar {
  background-color: var(--color-surface);
  border-color: var(--color-border);
}

[data-theme="dark"] .bulk-selection-bar .bg-blue-50 {
  background-color: var(--color-background);
}

[data-theme="dark"] .bulk-selection-bar .text-blue-800 {
  color: var(--color-text);
}

[data-theme="dark"] .bulk-selection-bar .border-blue-200 {
  border-color: var(--color-border);
}
</style>
