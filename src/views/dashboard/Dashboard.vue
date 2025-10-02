<template>
<div class="page-content">
  <div class="page-info flex justify-between items-center p-4 bg-transparent">
    <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <ol class="breadcrumb flex items-center list-none m-0 p-0 gap-2">
            <li class="breadcrumb-item flex items-center text-gray-400">
                <a href="#" class="breadcrumb-link text-blue-600 hover:text-blue-700">Apps</a>
            </li>
            <li class="breadcrumb-item active text-gray-400" aria-current="page">{{ t('sidebar.dashboard') }}</li>
        </ol>
    </nav>
    <div class="page-options flex items-center">
          <router-link to="/pos" class="btn btn-primary bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800">
              {{ t('dashboard.addSale') }}
          </router-link>
    </div>
  </div>
  <div class="main-content">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- KPI Cards -->
      <div class="row stats-row grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="w-full">
            <div class="card card-transparent stats-card bg-gray-800 rounded-lg">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2">
                          {{ formatCurrency(dashboardData.todayRevenue) }}
                          <span :class="dashboardData.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'" class="stats-change">
                            {{ dashboardData.revenueChange >= 0 ? '+' : '' }}{{ dashboardData.revenueChange.toFixed(1) }}%
                          </span>
                        </h5>
                        <p class="stats-text text-gray-400">{{ t('dashboard.today_revenue') }}</p>
                    </div>
                    <div :class="dashboardData.revenueChange >= 0 ? 'change-success' : 'change-danger'" class="stats-icon flex items-center justify-center w-12 h-12 rounded-full">
                        <span class="material-icons">{{ dashboardData.revenueChange >= 0 ? 'trending_up' : 'trending_down' }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="card card-transparent stats-card bg-gray-800 rounded-lg">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2">
                          {{ dashboardData.totalCustomers }}
                          <span :class="dashboardData.customerChange >= 0 ? 'text-green-500' : 'text-red-500'" class="stats-change">
                            {{ dashboardData.customerChange >= 0 ? '+' : '' }}{{ dashboardData.customerChange.toFixed(1) }}%
                          </span>
                        </h5>
                        <p class="stats-text text-gray-400">{{ t('dashboard.total_customers') }}</p>
                    </div>
                    <div :class="dashboardData.customerChange >= 0 ? 'change-success' : 'change-danger'" class="stats-icon flex items-center justify-center w-12 h-12 rounded-full">
                        <span class="material-icons">{{ dashboardData.customerChange >= 0 ? 'trending_up' : 'trending_down' }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="card card-transparent stats-card bg-gray-800 rounded-lg">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2">
                          {{ dashboardData.totalSales }}
                          <span :class="dashboardData.salesChange >= 0 ? 'text-green-500' : 'text-red-500'" class="stats-change">
                            {{ dashboardData.salesChange >= 0 ? '+' : '' }}{{ dashboardData.salesChange.toFixed(1) }}%
                          </span>
                        </h5>
                        <p class="stats-text text-gray-400">{{ t('dashboard.total_orders') }}</p>
                    </div>
                    <div :class="dashboardData.salesChange >= 0 ? 'change-success' : 'change-danger'" class="stats-icon flex items-center justify-center w-12 h-12 rounded-full">
                        <span class="material-icons">{{ dashboardData.salesChange >= 0 ? 'trending_up' : 'trending_down' }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="card card-transparent stats-card bg-gray-800 rounded-lg">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2">
                          {{ formatCurrency(dashboardData.averageOrderValue) }}
                          <span :class="dashboardData.aovChange >= 0 ? 'text-green-500' : 'text-red-500'" class="stats-change">
                            {{ dashboardData.aovChange >= 0 ? '+' : '' }}{{ dashboardData.aovChange.toFixed(1) }}%
                          </span>
                        </h5>
                        <p class="stats-text text-gray-400">{{ t('dashboard.average_order_value') }}</p>
                    </div>
                    <div :class="dashboardData.aovChange >= 0 ? 'change-success' : 'change-danger'" class="stats-icon flex items-center justify-center w-12 h-12 rounded-full">
                        <span class="material-icons">{{ dashboardData.aovChange >= 0 ? 'trending_up' : 'trending_down' }}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <!-- Secondary Metrics -->
      <div class="row stats-row grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="w-full">
            <div class="card card-transparent stats-card bg-gray-800 rounded-lg">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2">{{ dashboardData.totalProducts }}</h5>
                        <p class="stats-text text-gray-400">{{ t('dashboard.total_products') }}</p>
                    </div>
                    <div class="stats-icon change-info flex items-center justify-center w-12 h-12 rounded-full bg-blue-400">
                        <span class="material-icons">inventory</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="card card-transparent stats-card bg-gray-800 rounded-lg">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2">{{ dashboardData.lowStockItems }}</h5>
                        <p class="stats-text text-gray-400">{{ t('dashboard.low_stock_items') }}</p>
                    </div>
                    <div class="stats-icon change-warning flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400">
                        <span class="material-icons">warning</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="card card-transparent stats-card bg-gray-800 rounded-lg">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2">{{ dashboardData.outOfStockItems }}</h5>
                        <p class="stats-text text-gray-400">{{ t('dashboard.out_of_stock_items') }}</p>
                    </div>
                    <div class="stats-icon change-danger flex items-center justify-center w-12 h-12 rounded-full bg-red-400">
                        <span class="material-icons">error</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="card card-transparent stats-card bg-gray-800 rounded-lg">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2">{{ formatCurrency(dashboardData.inventoryValue) }}</h5>
                        <p class="stats-text text-gray-400">{{ t('dashboard.inventory_value') }}</p>
                    </div>
                    <div class="stats-icon change-success flex items-center justify-center w-12 h-12 rounded-full bg-green-400">
                        <span class="material-icons">account_balance_wallet</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <!-- Charts and Components -->
      <div class="row grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <PopularProducts />
        </div>
        <div class="md:col-span-2 ml-4">
          <SalesChart />
        </div>
        <div>
          <ProductFinishedAboutTo />
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="row mt-8">
        <div class="w-full">
          <div class="card bg-gray-800 rounded-lg">
            <div class="card-body p-6">
              <h5 class="card-title text-lg font-semibold mb-4">{{ t('dashboard.recent_activity') }}</h5>
              <div v-if="recentActivity.length === 0" class="text-center py-8 text-gray-500">
                {{ t('dashboard.no_recent_activity') }}
              </div>
              <div v-else class="space-y-4">
                <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div :class="getActivityIconClass(activity.type)" class="flex items-center justify-center w-8 h-8 rounded-full">
                      <span class="material-icons text-sm">{{ getActivityIcon(activity.type) }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium">{{ activity.description }}</p>
                      <p class="text-xs text-gray-400">{{ formatTimeAgo(activity.created_at) }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p :class="activity.type === 'sale' ? 'text-green-400' : 'text-red-400'" class="text-sm font-medium">
                      {{ activity.type === 'sale' ? '+' : '-' }}{{ formatCurrency(activity.amount) }}
                    </p>
                  </div>
                </div>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useAnalyticsStore } from '@/stores/analytics.store'
import { useSalesStore } from '@/stores/sales.store'
import { useProductStore } from '@/stores/product.store'
import { useCustomerStore } from '@/stores/customers.store'
import { useReturnsStore } from '@/stores/returns.store'
import { useI18n } from 'vue-i18n'
import PopularProducts from '@/components/product/popularProduct.vue'
import SalesChart from '@/components/charts/SalesChart.vue'
import ProductFinishedAboutTo from '@/components/product/productFinishedAboutTo.vue'

const { t } = useI18n()

const router = useRouter()
const authStore = useAuthStore()
const analyticsStore = useAnalyticsStore()
const salesStore = useSalesStore()
const productStore = useProductStore()
const customerStore = useCustomerStore()
const returnsStore = useReturnsStore()

// Loading state
const loading = ref(true)

// Dashboard data
const dashboardData = ref({
  todayRevenue: 0,
  totalCustomers: 0,
  totalSales: 0,
  averageOrderValue: 0,
  totalProducts: 0,
  lowStockItems: 0,
  outOfStockItems: 0,
  inventoryValue: 0,
  revenueChange: 0,
  customerChange: 0,
  salesChange: 0,
  aovChange: 0
})

// Recent activity
const recentActivity = ref([])

// Computed properties from stores
const kpis = computed(() => analyticsStore.getKPIs)
const sales = computed(() => salesStore.getSales)
const products = computed(() => productStore.getProducts)
const customers = computed(() => customerStore.getCustomers)
const returns = computed(() => returnsStore.getReturns)

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0)
}

// Format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

// Get activity icon
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'sale': return 'shopping_cart'
    case 'return': return 'assignment_return'
    case 'product': return 'inventory'
    case 'customer': return 'person'
    default: return 'info'
  }
}

// Get activity icon class
const getActivityIconClass = (type: string) => {
  switch (type) {
    case 'sale': return 'bg-green-500'
    case 'return': return 'bg-red-500'
    case 'product': return 'bg-blue-500'
    case 'customer': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

// Calculate percentage change
const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// Load dashboard data
const loadDashboardData = async () => {
  try {
    loading.value = true
    
    // Load all data in parallel
    await Promise.all([
      analyticsStore.fetchAnalyticsData(),
      salesStore.fetchSales(),
      productStore.getAllProducts(),
      customerStore.fetchCustomers(),
      returnsStore.fetchReturns()
    ])

    // Calculate today's revenue
    const today = new Date().toISOString().split('T')[0]
    const todaySales = sales.value.filter(sale => 
      sale.created_at && sale.created_at.startsWith(today)
    )
    const todayRevenue = todaySales.reduce((sum, sale) => 
      sum + (sale.final_amount || sale.total_amount || 0), 0
    )

    // Calculate yesterday's revenue for comparison
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const yesterdaySales = sales.value.filter(sale => 
      sale.created_at && sale.created_at.startsWith(yesterdayStr)
    )
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => 
      sum + (sale.final_amount || sale.total_amount || 0), 0
    )

    // Calculate metrics
    const totalRevenue = sales.value.reduce((sum, sale) => 
      sum + (sale.final_amount || sale.total_amount || 0), 0
    )
    const averageOrderValue = sales.value.length > 0 ? totalRevenue / sales.value.length : 0

    // Use analytics data for consistent stock calculations
    const kpis = analyticsStore.getKPIs
    const lowStockItems = kpis.lowStockItems
    const outOfStockItems = kpis.outOfStockItems
    const inventoryValue = kpis.inventoryValue

    // Update dashboard data
    dashboardData.value = {
      todayRevenue,
      totalCustomers: customers.value.length,
      totalSales: sales.value.length,
      averageOrderValue,
      totalProducts: products.value.length,
      lowStockItems,
      outOfStockItems,
      inventoryValue,
      revenueChange: calculatePercentageChange(todayRevenue, yesterdayRevenue),
      customerChange: 0, // TODO: Calculate customer growth
      salesChange: 0, // TODO: Calculate sales growth
      aovChange: 0 // TODO: Calculate AOV growth
    }

    // Generate recent activity
    generateRecentActivity()

  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

// Generate recent activity from sales and returns
const generateRecentActivity = () => {
  const activities = []
  
  // Add recent sales
  sales.value.slice(0, 5).forEach(sale => {
    activities.push({
      id: `sale-${sale.id}`,
      type: 'sale',
      description: `Sale #${sale.id} - ${sale.customer_name || 'Walk-in Customer'}`,
      amount: sale.final_amount || sale.total_amount || 0,
      created_at: sale.created_at
    })
  })

  // Add recent returns
  returns.value.slice(0, 3).forEach(returnItem => {
    activities.push({
      id: `return-${returnItem.id}`,
      type: 'return',
      description: `Return #${returnItem.id} - ${returnItem.customer_name || 'Unknown Customer'}`,
      amount: returnItem.final_amount || 0,
      created_at: returnItem.created_at
    })
  })

  // Sort by date and take the most recent 10
  recentActivity.value = activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
}

// Load data on mount
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
/* You can keep any additional styles here if needed */

</style>


