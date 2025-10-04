<!-- src/components/analytics/KPICards.vue -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Revenue Card -->
    <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-green-100 text-sm font-medium">Total Revenue</p>
          <p class="text-3xl font-bold">{{ formatCurrency(kpis.totalRevenue) }}</p>
          <div class="flex items-center mt-2">
            <span :class="revenueGrowth >= 0 ? 'text-green-100' : 'text-red-100'" class="text-sm">
              {{ getGrowthIndicator(revenueGrowth) }}
            </span>
            <span class="text-green-100 text-xs ml-2">{{ getTimeRangeLabel() }}</span>
          </div>
        </div>
        <div class="bg-green-400 rounded-full p-3">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Sales Card -->
    <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-blue-100 text-sm font-medium">Total Sales</p>
          <p class="text-3xl font-bold">{{ kpis.totalSales }}</p>
          <div class="flex items-center mt-2">
            <span :class="salesGrowth >= 0 ? 'text-blue-100' : 'text-red-100'" class="text-sm">
              {{ getGrowthIndicator(salesGrowth) }}
            </span>
            <span class="text-blue-100 text-xs ml-2">{{ getTimeRangeLabel() }}</span>
          </div>
        </div>
        <div class="bg-blue-400 rounded-full p-3">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Customers Card -->
    <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-purple-100 text-sm font-medium">Active Customers</p>
          <p class="text-3xl font-bold">{{ kpis.totalCustomers }}</p>
          <div class="flex items-center mt-2">
            <span class="text-purple-100 text-sm">{{ getNewCustomersText() }}</span>
            <span class="text-purple-100 text-xs ml-2">{{ getTimeRangeLabel() }}</span>
          </div>
        </div>
        <div class="bg-purple-400 rounded-full p-3">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Average Order Value Card -->
    <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-orange-100 text-sm font-medium">Avg Order Value</p>
          <p class="text-3xl font-bold">{{ formatCurrency(kpis.averageOrderValue) }}</p>
          <div class="flex items-center mt-2">
            <span :class="avgOrderGrowth >= 0 ? 'text-orange-100' : 'text-red-100'" class="text-sm">
              {{ getGrowthIndicator(avgOrderGrowth) }}
            </span>
            <span class="text-orange-100 text-xs ml-2">{{ getTimeRangeLabel() }}</span>
          </div>
        </div>
        <div class="bg-orange-400 rounded-full p-3">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Inventory Card -->
    <div class="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white lg:col-span-2">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-teal-100 text-sm font-medium">Inventory Value</p>
          <p class="text-2xl font-bold">{{ formatCurrency(kpis.inventoryValue) }}</p>
          <p class="text-teal-100 text-xs mt-1">{{ kpis.totalProducts }} Items</p>
        </div>
        <div>
          <p class="text-teal-100 text-sm font-medium">Stock Status</p>
          <div class="flex flex-col mt-1">
            <span class="text-green-200 text-xs">✓ In Stock: {{ getInStockCount() }}</span>
            <span class="text-yellow-200 text-xs">⚠ Low Stock: {{ kpis.lowStockItems }}</span>
            <span class="text-red-200 text-xs">✗ Out: {{ kpis.outOfStockItems }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics Card -->
    <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white lg:col-span-2">
      <h4 class="text-white font-semibold mb-4">Performance Metrics</h4>
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold">{{ salesPerCustomer }}</div>
          <div class="text-indigo-100 text-xs">Sales per Customer</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold">{{ inventoryTurnover }}</div>
          <div class="text-indigo-100 text-xs">Inventory Turnover</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold">{{ topCategory }}</div>
          <div class="text-indigo-100 text-xs">Top Category</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  kpis: {
    type: Object,
    required: true
  },
  previousData: {
    type: Object,
    required: false,
    default: () => ({})
  },
  timeRange: {
    type: String,
    default: 'week'
  }
})

// Computed properties
const revenueGrowth = computed(() => {
  const current = props.kpis.totalRevenue || 0
  const previous = props.previousData.totalRevenue || 0
  return previous > 0 ? ((current - previous) / previous) * 100 : 0
})

const salesGrowth = computed(() => {
  const current = props.kpis.totalSales || 0
  const previous = props.previousData.totalSales || 0
  return previous > 0 ? ((current - previous) / previous) * 100 : 0
})

const avgOrderGrowth = computed(() => {
  const current = props.kpis.averageOrderValue || 0
  const previous = props.previousData.averageOrderValue || 0
  return previous > 0 ? ((current - previous) / previous) * 100 : 0
})

const salesPerCustomer = computed(() => {
  const customers = props.kpis.totalCustomers || 0
  const sales = props.kpis.totalSales || 0
  
  if (customers === 0) return 0
  return (sales / customers).toFixed(1)
})

const inventoryTurnover = computed(() => {
  const revenue = props.kpis.totalRevenue || 0
  const inventory = props.kpis.inventoryValue || 1
  
  // Inventory turnover should be: how many times inventory is sold per period
  // A more meaningful calculation: (Revenue - Returns) / Inventory
  // For now, let's use a simpler approach: Revenue / Inventory
  // This represents how many times the inventory value is "turned over" in sales
  const turnover = revenue / inventory
  
  // Cap at reasonable values to avoid confusion
  return Math.min(turnover, 10).toFixed(1)
})

const getInStockCount = () => {
  const total = props.kpis.totalProducts || 0
  const low = props.kpis.lowStockItems || 0
  const out = props.kpis.outOfStockItems || 0
  return Math.max(0, total - low - out)
}

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0)
}

const getGrowthIndicator = (growth) => {
  if (growth > 0) return `↗️ +${growth.toFixed(1)}%`
  if (growth < 0) return `↘️ ${growth.toFixed(1)}%`
  return '➡️ 0%'
}

const getNewCustomersText = () => {
  const newCustomers = props.kpis.newCustomers || 0
  return newCustomers > 0 ? `+${newCustomers} new` : 'Stable'
}

const getTimeRangeLabel = () => {
  const labels = {
    week: '7D',
    month: '30D',
    quarter: '3M',
    year: '1Y'
  }
  return labels[props.timeRange] || '7D'
}

// Top category calculation (simplified)
const topCategory = computed(() => {
  // This would be calculated from real category data
  // For now, return a placeholder since we don't have category data passed
  return props.kpis.topCategory || 'N/A'
})
</script>

<style scoped>
/* Gradient backgrounds and subtle animations */
@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.grid > div {
  animation: slideIn 0.5s ease-out;
}

.grid > div:nth-child(1) { animation-delay: 0.1s; }
.grid > div:nth-child(2) { animation-delay: 0.2s; }
.grid > div:nth-child(3) { animation-delay: 0.3s; }
.grid > div:nth-child(4) { animation-delay: 0.4s; }
.grid > div:nth-child(5) { animation-delay: 0.5s; }
.grid > div:nth-child(6) { animation-delay: 0.6s; }

/* Hover effects */
.grid > div:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-out;
}
</style>
