<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/product.store'
import { useCategoryStore } from '@/stores/category.store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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

const products = computed(() => productStore.getProducts)
const categories = computed(() => {
  const cats = ['all', ...new Set(products.value.map(p => p.category_id))]
  return cats
})

const sortedAndFilteredInventory = computed(() => {
  return products.value
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          item.barcode.includes(searchQuery.value)
      const matchesCategory = selectedCategory.value === 'all' || item.category_id.toString() === selectedCategory.value
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const aValue = a[sortBy.value]
      const bValue = b[sortBy.value]
      const modifier = sortOrder.value === 'asc' ? 1 : -1
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier
      }
      return (Number(aValue) - Number(bValue)) * modifier
    })
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
    loading.value = true
    await productStore.updateProduct(productId, { current_stock: newQuantity })
    await productStore.getAllProducts() // Refresh the list
  } catch (error) {
    console.error('Error updating stock:', error)
    alert('Error updating stock. Please try again.')
  } finally {
    loading.value = false
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

async function applyStockAdjustment() {
  if (!selectedProduct.value || stockAdjustment.value <= 0) {
    alert('Please enter a valid adjustment amount')
    return
  }

  try {
    loading.value = true
    const currentStock = selectedProduct.value.current_stock
    const adjustment = adjustmentType.value === 'add' 
      ? stockAdjustment.value 
      : -stockAdjustment.value
    
    const newStock = Math.max(0, currentStock + adjustment)
    
    await productStore.updateProduct(selectedProduct.value.id, { 
      current_stock: newStock 
    })
    
    await productStore.getAllProducts() // Refresh the list
    closeStockModal()
    
    alert(`Stock updated successfully. New quantity: ${newStock}`)
  } catch (error) {
    console.error('Error adjusting stock:', error)
    alert('Error adjusting stock. Please try again.')
  } finally {
    loading.value = false
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
    loading.value = true
    await productStore.getAllProducts()
    await categoryStore.fetchCategories()
  } catch (error) {
    console.error('Error loading inventory data:', error)
  } finally {
    loading.value = false
  }
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

      <!-- Search and Filters -->
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, SKU, or barcode..."
          class="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
        
        <select
          v-model="selectedCategory"
          class="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">{{ t('Inventory.all_categories') }}</option>
          <option v-for="categoryId in categories" :key="categoryId" :value="categoryId">
            {{ getCategoryName(categoryId) }}
          </option>
        </select>

        <select
          v-model="sortBy"
          class="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="name">{{ t('Inventory.name') }}</option>
          <option value="current_stock">{{ t('Inventory.stock') }}</option>
          <option value="selling_price">{{ t('Inventory.price') }}</option>
          <option value="sku">{{ t('Inventory.sku') }}</option>
        </select>

        <select
          v-model="sortOrder"
          class="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="asc">{{ t('Inventory.ascending') }}</option>
          <option value="desc">{{ t('Inventory.descending') }}</option>
        </select>
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
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('Inventory.no_products_found') }}</h3>
        <p class="text-gray-500">Start by adding some products to your inventory.</p>
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
            @click="applyStockAdjustment"
            :disabled="loading || stockAdjustment <= 0"
            class="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? t('Inventory.updating') : t('Inventory.apply_adjustment') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 