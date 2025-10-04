<!-- src/components/analytics/AdvancedCharts.vue -->
<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap gap-4 items-center justify-between">
      <div class="flex gap-2">
        <select v-model="timeRange" @change="updateCharts" 
                class="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 3 Months</option>
          <option value="year">Last Year</option>
        </select>
        
        <select v-model="chartType" @change="updateCharts" 
                class="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="doughnut">Doughnut Chart</option>
        </select>
      </div>
      
      <div class="flex gap-2">
        <button @click="exportChart" 
                class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          Export Chart
        </button>
        <button @click="toggleFullscreen" 
                class="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
          {{ fullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
        </button>
      </div>
    </div>

    <!-- Chart Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" 
         :class="{ 'fixed inset-0 z-50 bg-white p-6': fullscreen }">
      
      <!-- Revenue Trend Chart -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Revenue Trend</h3>
          <span class="text-sm text-gray-500">{{ getTrendIndicator(revenueChartData) }}</span>
        </div>
        <div style="height: 300px;">
          <canvas ref="revenueChart"></canvas>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-xs text-gray-500">Total Revenue</div>
            <div class="font-semibold text-green-600">{{ formatCurrency(totalRevenue) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Avg Daily</div>
            <div class="font-semibold">{{ formatCurrency(averageRevenue) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Growth</div>
            <div class="font-semibold"
                 :class="revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ getGrowthText(revenueGrowth) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Sales Volume Chart -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Sales Volume</h3>
          <span class="text-sm text-gray-500">Transactions</span>
        </div>
        <div style="height: 300px;">
          <canvas ref="salesVolumeChart"></canvas>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-xs text-gray-500">Total Sales</div>
            <div class="font-semibold text-blue-600">{{ totalSales }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Avg Daily</div>
            <div class="font-semibold">{{ averageSales }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Conversion</div>
            <div class="font-semibold">{{ conversionRate }}%</div>
          </div>
        </div>
      </div>

      <!-- Top Products Chart -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Top Products</h3>
          <div class="flex gap-2">
            <button @click="toggleProductView = 'revenue'" 
                    :class="toggleProductView === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-200'"
                    class="px-2 py-1 text-xs rounded">Revenue</button>
            <button @click="toggleProductView = 'quantity'" 
                    :class="toggleProductView === 'quantity' ? 'bg-blue-600 text-white' : 'bg-gray-200'"
                    class="px-2 py-1 text-xs rounded">Quantity</button>
          </div>
        </div>
        <div style="height: 300px;">
          <canvas ref="topProductsChart"></canvas>
        </div>
        <div class="mt-4 text-center">
          <div class="text-xs text-gray-500">Top Product by {{ toggleProductView }}</div>
          <div class="font-semibold">
            {{ topProductName }} - {{ toggleProductView === 'revenue' ? formatCurrency(topProductValue) : topProductValue }}
          </div>
        </div>
      </div>

      <!-- Customer Analytics Chart -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Customer Analytics</h3>
          <span class="text-sm text-gray-500">{{ customerSegmentsData.length }} Segments</span>
        </div>
        <div style="height: 300px;">
          <canvas ref="customerChart"></canvas>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <div class="text-xs text-gray-500">Total Customers</div>
            <div class="font-semibold text-purple-600">{{ totalCustomers }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Avg Order Value</div>
            <div class="font-semibold">{{ formatCurrency(avgOrderValue) }}</div>
          </div>
        </div>
      </div>

      <!-- Inventory Insights Chart -->
      <div class="bg-white shadow rounded-lg p-6 lg:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Inventory Health</h3>
          <div class="flex gap-2">
            <span class="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">In Stock</span>
            <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded">Low Stock</span>
            <span class="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">Out of Stock</span>
          </div>
        </div>
        <div style="height: 250px;">
          <canvas ref="inventoryChart"></canvas>
        </div>
        <div class="mt-4 grid grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-xs text-gray-500">Total Items</div>
            <div class="font-semibold">{{ totalInventoryItems }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Low Stock</div>
            <div class="font-semibold text-yellow-600">{{ lowStockItems }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Out of Stock</div>
            <div class="font-semibold text-red-600">{{ outOfStockItems }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Inventory Value</div>
            <div class="font-semibold text-green-600">{{ formatCurrency(inventoryValue) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Legend & Details -->
    <div v-if="!fullscreen" class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-semibold mb-3">Chart Details</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div>
          <div class="font-medium">Time Range:</div>
          <div>{{ timeRangeLabels[timeRange] }}</div>
        </div>
        <div>
          <div class="font-medium">Chart Type:</div>
          <div>{{ chartType }}</div>
        </div>
        <div>
          <div class="font-medium">Last Updated:</div>
          <div>{{ lastUpdateTime }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import 'chartjs-adapter-date-fns'
// import { zoomPlugin } from 'chartjs-plugin-zoom'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Props
const props = defineProps({
  analyticsData: {
    type: Object,
    required: true
  }
})

// Reactive data
const timeRange = ref('week')
const chartType = ref('line')
const fullscreen = ref(false)
const toggleProductView = ref('revenue')
const lastUpdateTime = ref('')

// Chart references
const revenueChart = ref(null)
const salesVolumeChart = ref(null)
const topProductsChart = ref(null)
const customerChart = ref(null)
const inventoryChart = ref(null)

// Chart instances
let revenueChartInstance = null
let salesVolumeChartInstance = null
let topProductsChartInstance = null
let customerChartInstance = null
let inventoryChartInstance = null

// Time range labels
const timeRangeLabels = {
  week: 'Last 7 Days',
  month: 'Last 30 Days', 
  quarter: 'Last 3 Months',
  year: 'Last Year'
}

// Computed properties
const revenueChartData = computed(() => {
  return props.analyticsData.revenueTrendData || []
})

const totalRevenue = computed(() => {
  return revenueChartData.value.reduce((sum, item) => sum + (item.revenue || 0), 0)
})

const averageRevenue = computed(() => {
  return revenueChartData.value.length > 0 ? totalRevenue.value / revenueChartData.value.length : 0
})

const revenueGrowth = computed(() => {
  if (revenueChartData.value.length < 2) return 0
  const current = revenueChartData.value[revenueChartData.value.length - 1]?.revenue || 0
  const previous = revenueChartData.value[revenueChartData.value.length - 2]?.revenue || 0
  return previous > 0 ? ((current - previous) / previous) * 100 : 0
})

const totalSales = computed(() => {
  return props.analyticsData.sales || 0
})

const averageSales = computed(() => {
  const days = getDaysInRange(timeRange.value)
  return days > 0 ? totalSales.value / days : 0
})

const conversionRate = computed(() => {
  const customers = props.analyticsData.customers || 0
  const sales = totalSales.value
  // Cap at 100% to avoid confusing values like 200%
  return customers > 0 ? Math.min(Math.round((sales / customers) * 100), 100) : 0
})

const topProductsData = computed(() => {
  return props.analyticsData.topProducts || []
})

const topProductName = computed(() => {
  return topProductsData.value.length > 0 ? topProductsData.value[0].name : 'N/A'
})

const topProductValue = computed(() => {
  if (topProductsData.value.length === 0) return 'N/A'
  const product = topProductsData.value[0]
  return toggleProductView.value === 'revenue' ? product.revenue : product.sales
})

const customerSegmentsData = computed(() => {
  return props.analyticsData.customerSegments || []
})

const totalCustomers = computed(() => {
  return props.analyticsData.totalCustomers || 0
})

const avgOrderValue = computed(() => {
  const revenue = totalRevenue.value
  const sales = totalSales.value
  return sales > 0 ? revenue / sales : 0
})

const totalInventoryItems = computed(() => {
  return props.analyticsData.totalProducts || 0
})

const lowStockItems = computed(() => {
  return props.analyticsData.lowStockItems || 0
})

const outOfStockItems = computed(() => {
  return props.analyticsData.outOfStockItems || 0
})

const inventoryValue = computed(() => {
  return props.analyticsData.inventoryValue || 0
})

// Methods
const getDaysInRange = (range) => {
  const ranges = {
    week: 7,
    month: 30,
    quarter: 90,
    year: 365
  }
  return ranges[range] || 7
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0)
}

const getTrendIndicator = (data) => {
  if (data.length < 2) return 'No trend data'
  const current = data[data.length - 1]?.revenue || 0
  const previous = data[data.length - 2]?.revenue || 0
  if (current > previous) return '↗️ Trending Up'
  if (current < previous) return '↘️ Trending Down'
  return '➡️ Stable'
}

const getGrowthText = (growth) => {
  return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`
}

const createRevenueChart = () => {
  if (!revenueChart.value) return

  const ctx = revenueChart.value.getContext('2d')
  
  if (revenueChartInstance) {
    revenueChartInstance.destroy()
  }

  revenueChartInstance = new ChartJS(ctx, {
    type: chartType.value === 'line' ? 'line' : 'bar',
    data: {
      labels: revenueChartData.value.map(item => new Date(item.date || item.period).toLocaleDateString()),
      datasets: [{
        label: 'Revenue',
        data: revenueChartData.value.map(item => item.revenue),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: chartType.value === 'line',
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        // Zoom functionality removed temporarily due to import issues
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value)
            }
          }
        },
        x: {
          type: 'time',
          time: {
            displayFormats: {
              day: 'MMM DD'
            }
          }
        }
      }
    }
  })
}

const createSalesVolumeChart = () => {
  if (!salesVolumeChart.value) return

  const ctx = salesVolumeChart.value.getContext('2d')
  
  if (salesVolumeChartInstance) {
    salesVolumeChartInstance.destroy()
  }

  salesVolumeChartInstance = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels: revenueChartData.value.map(item => new Date(item.date || item.period).toLocaleDateString()),
      datasets: [{
        label: 'Sales Count',
        data: revenueChartData.value.map(item => item.sales || 0),
        backgroundColor: 'rgba(59, o, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        // Zoom functionality removed temporarily
      },
      scales: {
        y: { beginAtZero: true },
        x: {
          type: 'time',
          time: { displayFormats: { day: 'MMM DD' } }
        }
      }
    }
  })
}

const createTopProductsChart = () => {
  if (!topProductsChart.value) return

  const ctx = topProductsChart.value.getContext('2d')
  
  if (topProductsChartInstance) {
    topProductsChartInstance.destroy()
  }

  const data = toggleProductView.value === 'revenue' 
    ? topProductsData.value.slice(0, 5).map(p => p.revenue)
    : topProductsData.value.slice(0, 5).map(p => p.sales)

  topProductsChartInstance = new ChartJS(ctx, {
    type: chartType.value === 'doughnut' ? 'doughnut' : 'bar',
    data: {
      labels: topProductsData.value.slice(0, 5).map(p => p.name),
      datasets: [{
        data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: chartType.value === 'doughnut' ? 'right' : 'top' }
      }
    }
  })
}

const createCustomerChart = () => {
  if (!customerChart.value) return

  const ctx = customerChart.value.getContext('2d')
  
  if (customerChartInstance) {
    customerChartInstance.destroy()
  }

  customerChartInstance = new ChartJS(ctx, {
    type: 'doughnut',
    data: {
      labels: customerSegmentsData.value.map(s => s.segment),
      datasets: [{
        data: customerSegmentsData.value.map(s => s.count),
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(147, 51, 234)',
          'rgb(236, 72, 153)',
          'rgb(14, 165, 233)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'right',
          labels: { padding: 20 }
        }
      }
    }
  })
}

const createInventoryChart = () => {
  if (!inventoryChart.value) return

  const ctx = inventoryChart.value.getContext('2d')
  
  if (inventoryChartInstance) {
    inventoryChartInstance.destroy()
  }

  const inStock = totalInventoryItems.value - lowStockItems.value - outOfStockItems.value

  inventoryChartInstance = new ChartJS(ctx, {
    type: 'doughnut',
    data: {
      labels: ['In Stock', 'Low Stock', 'Out of Stock'],
      datasets: [{
        data: [inStock, lowStockItems.value, outOfStockItems.value],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: { padding: 20 }
        }
      }
    }
  })
}

const updateCharts = async () => {
  await nextTick()
  createRevenueChart()
  createSalesVolumeChart()
  createTopProductsChart()
  createCustomerChart()
  createInventoryChart()
  lastUpdateTime.value = new Date().toLocaleTimeString()
}

const exportChart = () => {
  // Export logic here
  console.log('Exporting chart...')
}

const toggleFullscreen = () => {
  fullscreen.value = !fullscreen.value
  nextTick(() => {
    updateCharts()
  })
}

// Watch for data changes
watch(() => props.analyticsData, () => {
  nextTick()
  updateCharts()
}, { deep: true })

watch(toggleProductView, async () => {
  await nextTick()
  createTopProductsChart()
})

// Initialize charts
onMounted(async () => {
  await nextTick()
  updateCharts()
})

// Cleanup on unmount
onUnmounted(() => {
  if (revenueChartInstance) revenueChartInstance.destroy()
  if (salesVolumeChartInstance) salesVolumeChartInstance.destroy()
  if (topProductsChartInstance) topProductsChartInstance.destroy()
  if (customerChartInstance) customerChartInstance.destroy()
  if (inventoryChartInstance) inventoryChartInstance.destroy()
})
</script>

<style scoped>
/* Chart container styles */
canvas {
  max-height: 300px;
}

/* Fullscreen mode styles */
.fixed.inset-0 {
  overflow-y: auto;
}
</style>
