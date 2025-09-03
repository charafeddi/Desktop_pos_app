<template>
  <div class="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="text-2xl">💰</span>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ formatCurrency(kpis.totalRevenue) }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="text-2xl">🛍️</span>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Average Order Value</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ formatCurrency(kpis.averageOrderValue) }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="text-2xl">🔄</span>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Customer Retention</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ kpis.customerRetentionRate }}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="text-2xl">📦</span>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Inventory Turnover</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ kpis.inventoryTurnover }}x</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Selling Products Table -->
      <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Top Selling Products
          </h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="product in topSellingProducts" :key="product.name">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ product.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {{ product.sales }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {{ formatCurrency(product.revenue) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Customer Segments -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Customer Segments
          </h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="segment in customerSegments" :key="segment.segment" 
                 class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                    {{ segment.segment }}
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-xs font-semibold inline-block text-indigo-600">
                    {{ segment.count }} customers
                  </span>
                </div>
              </div>
              <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                <div :style="{ width: segment.percentage + '%' }" 
                     class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useAnalyticsStore } from '@/stores/analytics.store'
  
  const analyticsStore = useAnalyticsStore()
  
  const timeRange = ref('week')
  const selectedMetric = ref('sales')
  
  const metrics = {
    sales: {
      label: 'Sales Performance',
      data: [12000, 19000, 15000, 22000, 18000, 24000, 21000],
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    products: {
      label: 'Top Products',
      data: [150, 120, 90, 85, 75],
      categories: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
    },
    customers: {
      label: 'Customer Activity',
      data: [45, 38, 42, 50, 35, 40, 48],
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  }
  
  const kpis = ref({
    totalRevenue: 132450,
    averageOrderValue: 75.50,
    customerRetentionRate: 85,
    inventoryTurnover: 4.2
  })
  
  const topSellingProducts = ref([
    { name: 'Product A', sales: 1200, revenue: 24000 },
    { name: 'Product B', sales: 950, revenue: 19000 },
    { name: 'Product C', sales: 850, revenue: 17000 },
    { name: 'Product D', sales: 700, revenue: 14000 },
    { name: 'Product E', sales: 650, revenue: 13000 }
  ])
  
  const customerSegments = ref([
    { segment: 'Regular', count: 450, percentage: 45 },
    { segment: 'Occasional', count: 300, percentage: 30 },
    { segment: 'New', count: 150, percentage: 15 },
    { segment: 'VIP', count: 100, percentage: 10 }
  ])
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }
  </script>