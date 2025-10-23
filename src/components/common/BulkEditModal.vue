<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          Bulk Edit Products
        </h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span class="material-icons-outlined">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-sm text-blue-800">
              Editing {{ selectedCount }} products. Leave fields empty to keep current values.
            </span>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              v-model="formData.category_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Keep current category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Product Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <select
              v-model="formData.product_type_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Keep current product type</option>
              <option v-for="type in productTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>

          <!-- Product Unit -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Product Unit
            </label>
            <select
              v-model="formData.product_unit_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Keep current product unit</option>
              <option v-for="unit in productUnits" :key="unit.id" :value="unit.id">
                {{ unit.name }} ({{ unit.symbol }})
              </option>
            </select>
          </div>

          <!-- Supplier -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Supplier
            </label>
            <select
              v-model="formData.supplier_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Keep current supplier</option>
              <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.name }}
              </option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              v-model="formData.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Keep current status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <!-- Tax Rate -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tax Rate (%)
            </label>
            <input
              v-model="formData.tax_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Keep current tax rate"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <!-- Stock Levels -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Min Stock Level
              </label>
              <input
                v-model="formData.min_stock_level"
                type="number"
                min="0"
                placeholder="Keep current"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Max Stock Level
              </label>
              <input
                v-model="formData.max_stock_level"
                type="number"
                min="0"
                placeholder="Keep current"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>

          <!-- Price Operations -->
          <div class="border-t pt-6">
            <h4 class="text-md font-medium text-gray-900 mb-4">Price Operations</h4>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Price Field
                </label>
                <select
                  v-model="formData.priceField"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select price field</option>
                  <option value="purchase_price">Purchase Price</option>
                  <option value="selling_price">Selling Price</option>
                </select>
              </div>

              <div v-if="formData.priceField">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Operation
                </label>
                <select
                  v-model="formData.priceOperation"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="set">Set to specific value</option>
                  <option value="increase">Increase by percentage</option>
                  <option value="decrease">Decrease by percentage</option>
                </select>
              </div>

              <div v-if="formData.priceOperation">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ formData.priceOperation === 'set' ? 'New Price ($)' : 'Percentage (%)' }}
                </label>
                <input
                  v-model="formData.priceValue"
                  type="number"
                  step="0.01"
                  min="0"
                  :placeholder="formData.priceOperation === 'set' ? 'Enter new price' : 'Enter percentage'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
        <button
          @click="closeModal"
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <span v-if="isSubmitting" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating...
          </span>
          <span v-else>
            Update Products
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useCategoryStore } from '@/stores/category.store'
import { useSupplierStore } from '@/stores/supplier.store'
import { useProductTypeStore } from '@/stores/productType.store'
import { useProductUnitStore } from '@/stores/productUnit.store'
import { bulkOperations } from '@/utils/bulkOperations'
import { useToast } from '@/utils/toastManager'
import { useErrorHandler } from '@/utils/errorHandler'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  selectedCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'success'])

const categoryStore = useCategoryStore()
const supplierStore = useSupplierStore()
const productTypeStore = useProductTypeStore()
const productUnitStore = useProductUnitStore()
const { success, error } = useToast()
const { handleNetworkError, handleDatabaseError } = useErrorHandler()

const isSubmitting = ref(false)

const formData = reactive({
  category_id: '',
  product_type_id: '',
  product_unit_id: '',
  supplier_id: '',
  status: '',
  tax_rate: '',
  min_stock_level: '',
  max_stock_level: '',
  priceField: '',
  priceOperation: '',
  priceValue: ''
})

onMounted(async () => {
  try {
    // Load all related data
    await Promise.all([
      categoryStore.fetchCategories(),
      supplierStore.fetchSuppliers(),
      productTypeStore.fetchProductTypes(),
      productUnitStore.fetchProductUnits()
    ])
  } catch (err) {
    handleNetworkError(err, { component: 'BulkEditModal', action: 'Load data' })
  }
})

const closeModal = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // Prepare data for bulk update
    const updateData = {}
    
    // Only include fields that have values
    if (formData.category_id) updateData.category_id = parseInt(formData.category_id)
    if (formData.product_type_id) updateData.product_type_id = parseInt(formData.product_type_id)
    if (formData.product_unit_id) updateData.product_unit_id = parseInt(formData.product_unit_id)
    if (formData.supplier_id) updateData.supplier_id = parseInt(formData.supplier_id)
    if (formData.status) updateData.status = formData.status
    if (formData.tax_rate) updateData.tax_rate = parseFloat(formData.tax_rate)
    if (formData.min_stock_level) updateData.min_stock_level = parseInt(formData.min_stock_level)
    if (formData.max_stock_level) updateData.max_stock_level = parseInt(formData.max_stock_level)
    
    // Handle price operations
    if (formData.priceField && formData.priceOperation && formData.priceValue) {
      updateData.priceField = formData.priceField
      updateData.priceOperation = formData.priceOperation
      updateData.priceValue = parseFloat(formData.priceValue)
    }
    
    // Execute bulk operation
    await bulkOperations.executeOperation('bulk-edit', props.selectedIds, updateData)
    
    success(`Successfully updated ${props.selectedCount} products`)
    emit('success', { message: `Successfully updated ${props.selectedCount} products` })
    closeModal()
    
  } catch (err) {
    console.error('Bulk edit error:', err)
    handleDatabaseError(err, 'bulk product update', { 
      component: 'BulkEditModal', 
      action: 'Bulk update',
      selectedCount: props.selectedCount 
    })
  } finally {
    isSubmitting.value = false
  }
}

// Computed properties for dropdowns
const categories = computed(() => categoryStore.getCategories)
const suppliers = computed(() => supplierStore.getSuppliers)
const productTypes = computed(() => productTypeStore.getProductTypes)
const productUnits = computed(() => productUnitStore.getProductUnits)
</script>

<style scoped>
/* Theme-aware styling */
[data-theme="dark"] .bg-white {
  background-color: var(--color-surface);
}

[data-theme="dark"] .text-gray-900 {
  color: var(--color-text);
}

[data-theme="dark"] .text-gray-700 {
  color: var(--color-text-secondary);
}

[data-theme="dark"] .border-gray-200,
[data-theme="dark"] .border-gray-300 {
  border-color: var(--color-border);
}

[data-theme="dark"] .bg-gray-100 {
  background-color: var(--color-background);
}

[data-theme="dark"] .text-gray-400 {
  color: var(--color-text-secondary);
}
</style>
