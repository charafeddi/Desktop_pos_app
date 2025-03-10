<script setup lang="ts">
import { ref, computed } from 'vue'

interface InventoryItem {
  id: string
  name: string
  sku: string
  quantity: number
  minStock: number
  price: number
  category: string
  lastUpdated: string
}

const inventory = ref<InventoryItem[]>([
  {
    id: '1',
    name: 'Product A',
    sku: 'SKU001',
    quantity: 50,
    minStock: 10,
    price: 19.99,
    category: 'Category 1',
    lastUpdated: '2024-03-07'
  },
  // Add more items...
])

const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('name')
const sortOrder = ref('asc')

const categories = computed(() => {
  const cats = ['all', ...new Set(inventory.value.map(item => item.category))]
  return cats
})

const sortedAndFilteredInventory = computed(() => {
  return inventory.value
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchesCategory = selectedCategory.value === 'all' || item.category === selectedCategory.value
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const aValue = a[sortBy.value as keyof InventoryItem]
      const bValue = b[sortBy.value as keyof InventoryItem]
      const modifier = sortOrder.value === 'asc' ? 1 : -1
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier
      }
      return ((aValue as number) - (bValue as number)) * modifier
    })
})

const lowStockItems = computed(() => {
  return inventory.value.filter(item => item.quantity <= item.minStock)
})

function updateQuantity(id: string, newQuantity: number) {
  const item = inventory.value.find(item => item.id === id)
  if (item) {
    item.quantity = Math.max(0, newQuantity)
    item.lastUpdated = new Date().toISOString().split('T')[0]
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Add New Item
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or SKU..."
          class="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
        
        <select
          v-model="selectedCategory"
          class="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>

        <select
          v-model="sortBy"
          class="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="name">Name</option>
          <option value="quantity">Quantity</option>
          <option value="price">Price</option>
          <option value="lastUpdated">Last Updated</option>
        </select>

        <select
          v-model="sortOrder"
          class="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <!-- Low Stock Alert -->
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

      <!-- Inventory Table -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th class="px-6 py-3 bg-gray-50"></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in sortedAndFilteredInventory" :key="item.id"
                :class="{ 'bg-red-50': item.quantity <= item.minStock }">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ item.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.sku }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="updateQuantity(item.id, item.quantity - 1)"
                    class="w-6 h-6 rounded bg-gray-200 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button
                    @click="updateQuantity(item.id, item.quantity + 1)"
                    class="w-6 h-6 rounded bg-gray-200 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {{ formatCurrency(item.price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.category }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.lastUpdated }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template> 