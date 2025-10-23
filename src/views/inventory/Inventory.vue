<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProductStore } from '@/stores/product.store'
import { useCategoryStore } from '@/stores/category.store'
import { useI18n } from 'vue-i18n'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useToast } from '@/utils/toastManager'
import { useErrorHandler } from '@/utils/errorHandler'

const { t } = useI18n()
const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()
const { handleNetworkError, handleDatabaseError, handleValidationError, handleBusinessLogicError } = useErrorHandler()
const productStore = useProductStore()
const categoryStore = useCategoryStore()

const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('name')
const sortOrder = ref('asc')
const loading = ref(false)
const showStockModal = ref(false)
const selectedProduct = ref(null)
const stockAdjustment = ref(0)
const adjustmentType = ref('add') // 'add' or 'subtract'
const adjustmentReason = ref('')

// Advanced filter variables
const categoryFilter = ref('')
const stockLevelFilter = ref('')
const priceRangeFilter = ref('')
const supplierFilter = ref('')
const showAdvancedFilters = ref(false)

// Loading states
const isLoading = ref(false)
const isUpdatingStock = ref(false)
const isAdjustingStock = ref(false)

// Confirmation dialog state
const showAdjustmentConfirm = ref(false)
const adjustmentData = ref(null)

// Helper methods
const getLoadingMessage = () => {
  if (isLoading.value) return 'Loading inventory...'
  if (isUpdatingStock.value) return 'Updating stock...'
  if (isAdjustingStock.value) return 'Adjusting stock...'
  return 'Processing...'
}

const confirmAdjustment = async () => {
  if (adjustmentData.value) {
    await applyStockAdjustment(adjustmentData.value)
  }
  showAdjustmentConfirm.value = false
  adjustmentData.value = null
}

const cancelAdjustment = () => {
  showAdjustmentConfirm.value = false
  adjustmentData.value = null
}

// Show adjustment confirmation
const showAdjustmentConfirmation = () => {
  if (!selectedProduct.value || stockAdjustment.value <= 0) {
    handleValidationError(new Error('Invalid adjustment parameters'), 'Stock Adjustment')
    showError('Validation Error', 'Please enter a valid adjustment amount')
    return
  }
  
  if (!adjustmentReason.value || !adjustmentReason.value.trim()) {
    handleValidationError(new Error('Adjustment reason is required'), 'Stock Adjustment')
    showError('Validation Error', 'Please provide a reason for the stock adjustment')
    return
  }
  
  adjustmentData.value = {
    product: selectedProduct.value,
    amount: stockAdjustment.value,
    type: adjustmentType.value,
    reason: adjustmentReason.value
  }
  showAdjustmentConfirm.value = true
}

// Clear all filters method
const clearAllFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  stockLevelFilter.value = ''
  priceRangeFilter.value = ''
  supplierFilter.value = ''
  sortBy.value = 'name'
  sortOrder.value = 'asc'
  showAdvancedFilters.value = false
  
  showInfo('Filters Cleared', 'All search and filter options have been reset')
}

// Handle search input key events
const handleSearchKeydown = (event) => {
  if (event.key === 'Enter') {
    // Focus on first result or show advanced filters
    if (sortedAndFilteredInventory.value.length === 0) {
      showAdvancedFilters.value = true
    }
  } else if (event.key === 'Escape') {
    searchQuery.value = ''
    showAdvancedFilters.value = false
  }
}

const products = computed(() => productStore.getProducts)
const categories = computed(() => {
  const cats = ['all', ...new Set(products.value.map(p => p.category_id))]
  return cats
})

// Unique values for filter dropdowns
const uniqueCategories = computed(() => {
  const categoryMap = new Map()
  products.value.forEach(product => {
    if (product.category_id && product.category_name) {
      categoryMap.set(product.category_id, {
        id: product.category_id,
        name: product.category_name
      })
    }
  })
  return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const uniqueSuppliers = computed(() => {
  const supplierMap = new Map()
  products.value.forEach(product => {
    if (product.supplier_id && product.supplier_name) {
      supplierMap.set(product.supplier_id, {
        id: product.supplier_id,
        name: product.supplier_name
      })
    }
  })
  return Array.from(supplierMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (categoryFilter.value) count++
  if (stockLevelFilter.value) count++
  if (priceRangeFilter.value) count++
  if (supplierFilter.value) count++
  return count
})

// Advanced search and filter implementation
const sortedAndFilteredInventory = computed(() => {
  if (!Array.isArray(products.value) || products.value.length === 0) {
    return []
  }
  
  let filtered = [...products.value]
  
  // Text search - search in name, SKU, barcode, description, category name, supplier name
  if (searchQuery.value && searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(product => {
      const name = (product.name || '').toLowerCase()
      const sku = (product.sku || '').toLowerCase()
      const barcode = (product.barcode || '').toLowerCase()
      const description = (product.description || '').toLowerCase()
      const categoryName = (product.category_name || '').toLowerCase()
      const supplierName = (product.supplier_name || '').toLowerCase()
      
      return name.includes(query) ||
             sku.includes(query) ||
             barcode.includes(query) ||
             description.includes(query) ||
             categoryName.includes(query) ||
             supplierName.includes(query)
    })
  }
  
  // Category filter
  if (categoryFilter.value && categoryFilter.value !== '') {
    filtered = filtered.filter(product => 
      product.category_id.toString() === categoryFilter.value
    )
  }
  
  // Stock level filter
  if (stockLevelFilter.value && stockLevelFilter.value !== '') {
    filtered = filtered.filter(product => {
      const stock = Number(product.current_stock) || 0
      const minStock = Number(product.min_stock_level) || 0
      const maxStock = Number(product.max_stock_level) || 0
      
      switch (stockLevelFilter.value) {
        case 'in_stock':
          return stock > minStock
        case 'low_stock':
          return stock > 0 && stock <= minStock
        case 'out_of_stock':
          return stock === 0
        case 'overstocked':
          return maxStock > 0 && stock > maxStock
        default:
          return true
      }
    })
  }
  
  // Price range filter
  if (priceRangeFilter.value && priceRangeFilter.value !== '') {
    filtered = filtered.filter(product => {
      const price = Number(product.selling_price) || 0
      
      switch (priceRangeFilter.value) {
        case 'low':
          return price < 10
        case 'medium':
          return price >= 10 && price < 50
        case 'high':
          return price >= 50 && price < 100
        case 'premium':
          return price >= 100
        default:
          return true
      }
    })
  }
  
  // Supplier filter
  if (supplierFilter.value && supplierFilter.value !== '') {
    filtered = filtered.filter(product => 
      product.supplier_id.toString() === supplierFilter.value
    )
  }
  
  // Sort products
  if (sortBy.value && sortBy.value !== '') {
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy.value) {
        case 'name':
          aValue = (a.name || '').toLowerCase()
          bValue = (b.name || '').toLowerCase()
          break
        case 'current_stock':
          aValue = Number(a.current_stock) || 0
          bValue = Number(b.current_stock) || 0
          break
        case 'selling_price':
          aValue = Number(a.selling_price) || 0
          bValue = Number(b.selling_price) || 0
          break
        case 'sku':
          aValue = (a.sku || '').toLowerCase()
          bValue = (b.sku || '').toLowerCase()
          break
        default:
          return 0
      }
      
      if (sortOrder.value === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })
  }
  
  return filtered
})

const lowStockItems = computed(() => {
  return products.value.filter(item => item.current_stock <= item.min_stock_level)
})

const outOfStockItems = computed(() => {
  return products.value.filter(item => item.current_stock === 0)
})

const totalInventoryValue = computed(() => {
  return products.value.reduce((total, item) => {
    return total + (item.current_stock * item.selling_price)
  }, 0)
})

async function updateStock(productId, newQuantity) {
  try {
    isUpdatingStock.value = true
    
    // Validate input
    if (!productId || newQuantity < 0) {
      handleValidationError(new Error('Invalid stock update parameters'), 'Stock Update')
      showError('Validation Error', 'Invalid stock quantity. Must be a positive number.')
      return
    }
    
    const product = products.value.find(p => p.id === productId)
    const productName = product?.name || 'Product'
    
    showInfo('Updating Stock', `Updating stock for ${productName}...`)
    
    await productStore.updateProduct(productId, { current_stock: newQuantity })
    await productStore.getAllProducts() // Refresh the list
    
    showSuccess('Stock Updated', `${productName} stock updated to ${newQuantity}`)
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Stock Updated', `${productName} stock set to ${newQuantity}`)
    }
    
  } catch (error) {
    if (error.message?.includes('validation') || error.message?.includes('required')) {
      handleValidationError(error, 'Stock Update')
      showError('Validation Error', error.message)
    } else if (error.message?.includes('constraint') || error.message?.includes('foreign key')) {
      handleDatabaseError(error, 'Stock Update')
      showError('Database Error', 'Failed to update stock due to database constraints')
    } else {
      handleNetworkError(error, 'Stock Update')
      showError('Update Failed', 'Failed to update stock. Please try again.')
    }
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Stock Update Failed', 'Could not update product stock')
    }
  } finally {
    isUpdatingStock.value = false
  }
}

function openStockModal(product) {
  selectedProduct.value = product
  stockAdjustment.value = 0
  adjustmentType.value = 'add'
  adjustmentReason.value = ''
  showStockModal.value = true
}

function closeStockModal() {
  showStockModal.value = false
  selectedProduct.value = null
  stockAdjustment.value = 0
  adjustmentReason.value = ''
}

async function applyStockAdjustment(data = null) {
  try {
    isAdjustingStock.value = true
    
    // Use provided data or current form data
    const adjustmentInfo = data || {
      product: selectedProduct.value,
      amount: stockAdjustment.value,
      type: adjustmentType.value,
      reason: adjustmentReason.value
    }
    
    // Validate input
    if (!adjustmentInfo.product || adjustmentInfo.amount <= 0) {
      handleValidationError(new Error('Invalid adjustment parameters'), 'Stock Adjustment')
      showError('Validation Error', 'Please enter a valid adjustment amount')
      return
    }
    
    if (!adjustmentInfo.reason || !adjustmentInfo.reason.trim()) {
      handleValidationError(new Error('Adjustment reason is required'), 'Stock Adjustment')
      showError('Validation Error', 'Please provide a reason for the stock adjustment')
      return
    }
    
    const currentStock = adjustmentInfo.product.current_stock
    const adjustment = adjustmentInfo.type === 'add' 
      ? adjustmentInfo.amount 
      : -adjustmentInfo.amount
    
    const newStock = Math.max(0, currentStock + adjustment)
    const productName = adjustmentInfo.product.name
    
    showInfo('Adjusting Stock', `Adjusting stock for ${productName}...`)
    
    await productStore.updateProduct(adjustmentInfo.product.id, { 
      current_stock: newStock 
    })
    
    await productStore.getAllProducts() // Refresh the list
    closeStockModal()
    
    showSuccess('Stock Adjusted', `${productName} stock adjusted. New quantity: ${newStock}`)
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Stock Adjusted', `${productName} stock updated to ${newStock}`)
    }
    
  } catch (error) {
    if (error.message?.includes('validation') || error.message?.includes('required')) {
      handleValidationError(error, 'Stock Adjustment')
      showError('Validation Error', error.message)
    } else if (error.message?.includes('constraint') || error.message?.includes('foreign key')) {
      handleDatabaseError(error, 'Stock Adjustment')
      showError('Database Error', 'Failed to adjust stock due to database constraints')
    } else {
      handleNetworkError(error, 'Stock Adjustment')
      showError('Adjustment Failed', 'Failed to adjust stock. Please try again.')
    }
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Stock Adjustment Failed', 'Could not adjust product stock')
    }
  } finally {
    isAdjustingStock.value = false
  }
}

function getCategoryName(categoryId) {
  const category = categoryStore.categories.find(c => c.id === categoryId)
  return category ? category.name : `Category ${categoryId}`
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

// Load data on mount
onMounted(async () => {
  try {
    isLoading.value = true
    showInfo('Loading Inventory', 'Fetching inventory data...')
    
    await productStore.getAllProducts()
    await categoryStore.fetchCategories()
    
    showSuccess('Inventory Loaded', 'Inventory data loaded successfully')
    
  } catch (error) {
    handleNetworkError(error, 'Inventory Data Loading')
    showError('Loading Failed', 'Failed to load inventory data. Please refresh the page.')
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>
<template>
  <div class="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">{{ t('Inventory.title') }}</h1>
        <div class="flex space-x-4">
          <router-link 
            to="/product" 
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {{ t('Inventory.add_product') }}
          </router-link>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 text-sm font-bold">{{ products.length }}</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ t('Inventory.total_products') }}</p>
              <p class="text-2xl font-semibold text-gray-900">{{ products.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span class="text-yellow-600 text-sm font-bold">{{ lowStockItems.length }}</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ t('Inventory.low_stock_items') }}</p>
              <p class="text-2xl font-semibold text-gray-900">{{ lowStockItems.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span class="text-red-600 text-sm font-bold">{{ outOfStockItems.length }}</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ t('Inventory.out_of_stock_items') }}</p>
              <p class="text-2xl font-semibold text-gray-900">{{ outOfStockItems.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-green-600 text-sm font-bold">$</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ t('Inventory.total_value') }}</p>
              <p class="text-2xl font-semibold text-gray-900">{{ formatCurrency(totalInventoryValue) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Search and Filters -->
      <div class="mb-6 bg-white rounded-lg shadow p-6">
        <!-- Search Bar -->
        <div class="mb-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products by name, SKU, barcode, description, category, or supplier..."
              class="w-full px-4 py-3 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              @keydown="handleSearchKeydown"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="flex flex-wrap items-center gap-4">
          <!-- Advanced Filters Toggle -->
          <button
            @click="showAdvancedFilters = !showAdvancedFilters"
            class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200 flex items-center gap-2"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
            </svg>
            Advanced Filters
            <span v-if="activeFiltersCount > 0" class="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
              {{ activeFiltersCount }}
            </span>
          </button>

          <!-- Clear All Filters -->
          <button
            v-if="activeFiltersCount > 0 || searchQuery"
            @click="clearAllFilters"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Clear All
          </button>

          <!-- Results Counter -->
          <div class="text-sm text-gray-600">
            Showing {{ sortedAndFilteredInventory.length }} of {{ products.length }} products
          </div>
        </div>

        <!-- Advanced Filters Panel -->
        <div v-if="showAdvancedFilters" class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Category Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                v-model="categoryFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                <option v-for="category in uniqueCategories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <!-- Stock Level Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stock Level</label>
              <select
                v-model="stockLevelFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Stock Levels</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="overstocked">Overstocked</option>
              </select>
            </div>

            <!-- Price Range Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                v-model="priceRangeFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Prices</option>
                <option value="low">Under $10</option>
                <option value="medium">$10 - $50</option>
                <option value="high">$50 - $100</option>
                <option value="premium">Over $100</option>
              </select>
            </div>

            <!-- Supplier Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
              <select
                v-model="supplierFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Suppliers</option>
                <option v-for="supplier in uniqueSuppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Sort Options -->
          <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                v-model="sortBy"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="name">Product Name</option>
                <option value="current_stock">Stock Quantity</option>
                <option value="selling_price">Price</option>
                <option value="sku">SKU</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
              <select
                v-model="sortOrder"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div v-if="lowStockItems.length > 0" class="mb-6">
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              ⚠️
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                {{ lowStockItems.length }} items are running low on stock
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="outOfStockItems.length > 0" class="mb-6">
        <div class="bg-red-50 border-l-4 border-red-400 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              🚫
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">
                {{ outOfStockItems.length }} items are out of stock
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Inventory Table -->
      <div v-else class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('Inventory.product') }}
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('Inventory.sku') }}
              </th>
              <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('Inventory.current_stock') }}
              </th>
              <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('Inventory.min_stock') }}
              </th>
              <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('Inventory.price') }}
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('Inventory.category') }}
              </th>
              <th class="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('Inventory.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in sortedAndFilteredInventory" :key="item.id"
                :class="{ 
                  'bg-red-50': item.current_stock === 0,
                  'bg-yellow-50': item.current_stock > 0 && item.current_stock <= item.min_stock_level 
                }">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ item.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.sku }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                <span :class="{
                  'text-red-600 font-bold': item.current_stock === 0,
                  'text-yellow-600 font-medium': item.current_stock > 0 && item.current_stock <= item.min_stock_level,
                  'text-green-600': item.current_stock > item.min_stock_level
                }">
                  {{ item.current_stock }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {{ item.min_stock_level }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {{ formatCurrency(item.selling_price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getCategoryName(item.category_id) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button 
                  @click="openStockModal(item)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  {{ t('Inventory.adjust_stock') }}
                </button>
                <router-link 
                  :to="`/product?edit=${item.id}`"
                  class="text-green-600 hover:text-green-900"
                >
                  {{ t('Inventory.edit') }}
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && sortedAndFilteredInventory.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ (searchQuery || activeFiltersCount > 0) ? 'No products match your search criteria' : t('Inventory.no_products_found') }}
        </h3>
        <p class="text-gray-500 mb-4">
          {{ (searchQuery || activeFiltersCount > 0) ? 'Try adjusting your search terms or filters' : 'Start by adding some products to your inventory.' }}
        </p>
        <button
          v-if="searchQuery || activeFiltersCount > 0"
          @click="clearAllFilters"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Stock Adjustment Modal -->
    <div v-if="showStockModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-96 max-w-md mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ t('Inventory.adjust_stock') }}</h3>
          <button @click="closeStockModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div v-if="selectedProduct" class="space-y-4">
          <div class="bg-gray-50 p-3 rounded-lg">
            <h4 class="font-medium text-gray-900">{{ selectedProduct.name }}</h4>
            <p class="text-sm text-gray-500">{{ t('Inventory.current_stock') }}: {{ selectedProduct.current_stock }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Inventory.adjustment_type') }}</label>
            <select
              v-model="adjustmentType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="add">{{ t('Inventory.add_stock') }}</option>
              <option value="subtract">Subtract Stock</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Inventory.amount') }}</label>
            <input
              v-model.number="stockAdjustment"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :placeholder="t('Inventory.enter_amount')"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Inventory.reason') }} ({{ t('Inventory.optional') }})</label>
            <input
              v-model="adjustmentReason"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :placeholder="t('Inventory.reason_for_adjustment')"
            >
          </div>

          <div v-if="stockAdjustment > 0" class="bg-blue-50 p-3 rounded-lg">
            <p class="text-sm text-blue-700">
              {{ t('Inventory.new_stock_will_be') }}: 
              <span class="font-medium">
                {{ adjustmentType === 'add' 
                  ? selectedProduct.current_stock + stockAdjustment 
                  : Math.max(0, selectedProduct.current_stock - stockAdjustment) }}
              </span>
            </p>
          </div>
        </div>

        <div class="flex space-x-3 mt-6">
          <button
            @click="closeStockModal"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {{ t('Inventory.cancel') }}
          </button>
          <button
            @click="showAdjustmentConfirmation"
            :disabled="loading || stockAdjustment <= 0"
            class="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? t('Inventory.updating') : t('Inventory.apply_adjustment') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading Spinner -->
    <LoadingSpinner 
      v-if="isLoading || isUpdatingStock || isAdjustingStock"
      :message="getLoadingMessage()"
      :fullscreen="true"
    />
    
    <!-- Confirmation Dialog for Stock Adjustment -->
    <ConfirmationDialog
      :is-open="showAdjustmentConfirm"
      :title="'Confirm Stock Adjustment'"
      :message="`Are you sure you want to ${adjustmentData?.type === 'add' ? 'add' : 'subtract'} ${adjustmentData?.amount || 0} units to ${adjustmentData?.product?.name || 'this product'}?`"
      :type="'warning'"
      :confirm-text="'Apply Adjustment'"
      :cancel-text="'Cancel'"
      :is-loading="isAdjustingStock"
      @confirm="confirmAdjustment"
      @cancel="cancelAdjustment"
    />
  </div>
</template>

<style scoped>
/* Custom styles for filter buttons */
.filter-button {
  @apply px-4 py-2 rounded-lg transition-colors duration-200;
}

.filter-button:hover {
  @apply shadow-sm;
}

/* Dark theme adjustments */
.dark .filter-button {
  @apply bg-gray-700 text-gray-200 border-gray-600;
}

.dark .filter-button:hover {
  @apply bg-gray-600;
}

/* Search input dark theme */
.dark input[type="text"] {
  @apply bg-gray-800 border-gray-600 text-gray-200;
}

.dark input[type="text"]:focus {
  @apply ring-indigo-500 border-indigo-500;
}

/* Select dropdown dark theme */
.dark select {
  @apply bg-gray-800 border-gray-600 text-gray-200;
}

.dark select:focus {
  @apply ring-indigo-500 border-indigo-500;
}

/* Filter panel dark theme */
.dark .bg-gray-50 {
  @apply bg-gray-800;
}

.dark .text-gray-700 {
  @apply text-gray-300;
}

/* Results counter dark theme */
.dark .text-gray-600 {
  @apply text-gray-400;
}
</style> 