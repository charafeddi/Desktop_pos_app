<template>
  <div class="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p class="text-gray-600 mt-2">Advanced insights and reporting for your business</p>
        </div>
        <div class="relative">
          <button
            @click="showExportDropdown = !showExportDropdown"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export Report
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <!-- Export Dropdown -->
          <div
            v-if="showExportDropdown"
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
          >
            <div class="py-1">
              <button
                @click="exportAnalyticsData('pdf'); showExportDropdown = false"
                class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <span class="text-red-400">⚠️</span>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Analytics Error</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Enhanced Analytics Components -->
      <div v-else class="space-y-8">
        <!-- Enhanced KPI Cards -->
        <KPICards :kpis="kpis" :time-range="'week'" />
        
        <!-- Real-Time Metrics -->
        <RealTimeMetrics :analytics-data="analyticsData" />
        
        <!-- Advanced Charts -->
        <AdvancedCharts :analytics-data="analyticsData" />
        
        <!-- Analytics Summary (Features Showcase) -->
        <AnalyticsSummary />
        
        <!-- Original KPI Cards (Hidden by default, can be toggled) -->
        <div v-if="showOriginalKPIs" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
                  <span class="text-2xl">📊</span>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ kpis.totalSales }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <span class="text-2xl">👥</span>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ kpis.totalCustomers }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Selling Products -->
        <div v-if="!loading && !error" class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Top Selling Products</h3>
            <div v-if="topSellingProducts.length === 0" class="text-center py-8 text-gray-500">
              No sales data available for top products
            </div>
            <div v-else class="space-y-3">
              <div v-for="product in topSellingProducts.slice(0, 5)" :key="product.id" 
                   class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                  <div class="text-xs text-gray-500">{{ product.category }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold text-blue-600">${{ product.total_revenue?.toFixed(2) || '0.00' }}</div>
                  <div class="text-xs text-gray-500">{{ product.total_sales }} sales</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Customer Segments -->
        <div v-if="!loading && !error" class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Customer Segments</h3>
            <div v-if="customerSegments.length === 0" class="text-center py-8 text-gray-500">
              No customer data available
            </div>
            <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        
        <!-- Toggle Button for Original KPIs -->
        <div class="text-center mt-6">
          <button @click="showOriginalKPIs = !showOriginalKPIs" 
                  class="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700">
            {{ showOriginalKPIs ? 'Hide' : 'Show' }} Original KPI Cards
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useAnalyticsStore } from '@/stores/analytics.store'
  import { useI18n} from 'vue-i18n'
  import { exportAnalytics } from '@/utils/exportUtils'
  import KPICards from '@/components/analytics/KPICards.vue'
  import RealTimeMetrics from '@/components/analytics/RealTimeMetrics.vue'
  import AdvancedCharts from '@/components/analytics/AdvancedCharts.vue'
  import AnalyticsSummary from '@/components/analytics/AnalyticsSummary.vue'
  const {t} = useI18n()
  
  const analyticsStore = useAnalyticsStore()
  
  const timeRange = ref('week')
  const selectedMetric = ref('sales')
  const showExportDropdown = ref(false)
  const showOriginalKPIs = ref(false)
  
  // Computed properties from store
  const kpis = computed(() => analyticsStore.getKPIs)
  const topSellingProducts = computed(() => analyticsStore.getTopProducts)
  const customerSegments = computed(() => analyticsStore.getCustomerSegments)
  const salesChartData = computed(() => analyticsStore.getSalesChartData)
  const revenueTrendData = computed(() => analyticsStore.getRevenueTrendData)
  const productPerformanceData = computed(() => analyticsStore.getProductPerformanceData)
  const customerAnalyticsData = computed(() => analyticsStore.getCustomerAnalyticsData)
  const inventoryInsightsData = computed(() => analyticsStore.getInventoryInsightsData)
  const loading = computed(() => analyticsStore.getLoading)
  const error = computed(() => analyticsStore.getError)
  
  // Combined analytics data for enhanced components
  const analyticsData = computed(() => ({
    kpis: analyticsStore.getKPIs,
    topProducts: analyticsStore.getTopProducts,
    customerSegments: analyticsStore.getCustomerSegments,
    salesChartData: analyticsStore.getSalesChartData,
    revenueTrendData: analyticsStore.getRevenueTrendData,
    productPerformanceData: analyticsStore.getProductPerformanceData,
    customerAnalyticsData: analyticsStore.getCustomerAnalyticsData,
    inventoryInsightsData: analyticsStore.getInventoryInsightsData,
    totalProducts: analyticsStore.getKPIs.totalProducts,
    lowStockItems: analyticsStore.getKPIs.lowStockItems,
    outOfStockItems: analyticsStore.getKPIs.outOfStockItems,
    inventoryValue: analyticsStore.getKPIs.inventoryValue,
    totalRevenue: analyticsStore.getKPIs.totalRevenue,
    totalSales: analyticsStore.getKPIs.totalSales,
    totalCustomers: analyticsStore.getKPIs.totalCustomers,
    // Mock real-time data (would come from real-time APIs)
    todayRevenue: analyticsStore.getKPIs.totalRevenue * 0.3, // Simulate today's portion
    hourlySales: Math.floor(Math.random() * 10) + 1,
    activeCustomersToday: Math.floor(analyticsStore.getKPIs.totalCustomers * 0.1),
    newCustomersToday: Math.floor(Math.random() * 5),
    topProductToday: analyticsStore.getTopProducts[0] || { name: 'N/A', sales: 0 },
    lastSaleTime: new Date(Date.now() - Math.random() * 3600000)
  }))
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Export analytics
  const exportAnalyticsData = async (format) => {
    try {
      await exportAnalytics(format, {
        kpis: analyticsData.value.kpis,
        topProducts: analyticsData.value.topProducts,
        customerSegments: analyticsData.value.customerSegments,
        salesChartData: analyticsData.value.salesChartData,
        revenueTrendData: analyticsData.value.revenueTrendData,
        productPerformanceData: analyticsData.value.productPerformanceData,
        customerAnalyticsData: analyticsData.value.customerAnalyticsData,
        inventoryInsightsData: analyticsData.value.inventoryInsightsData
      })
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  onMounted(() => {
    analyticsStore.fetchAnalyticsData()
  })
</script>

<style scoped>
/* Custom styles */
</style>
