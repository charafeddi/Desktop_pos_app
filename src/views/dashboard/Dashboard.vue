<template>
<div class="page-content">
  <div class="page-info flex justify-between items-center p-4 bg-transparent">
    <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <ol class="breadcrumb flex items-center list-none m-0 p-0 gap-2">
            <li class="breadcrumb-item flex items-center" style="color: var(--color-text-secondary)">
                <a href="#" class="breadcrumb-link" style="color: var(--color-primary);" onmouseover="this.style.color='var(--color-primary-hover)'" onmouseout="this.style.color='var(--color-primary)'">Apps</a>
            </li>
            <li class="breadcrumb-item active" style="color: var(--color-text-secondary)" aria-current="page">{{ t('sidebar.dashboard') }}</li>
        </ol>
    </nav>
    <div class="page-options flex items-center">
          <router-link to="/pos" class="btn btn-primary rounded-lg px-4 py-2" style="background-color: var(--color-primary); color: var(--color-text-inverse);" onmouseover="this.style.backgroundColor='var(--color-primary-hover)'" onmouseout="this.style.backgroundColor='var(--color-primary)'">
              {{ t('dashboard.addSale') }}
          </router-link>
    </div>
  </div>
  <div class="main-content">
    <!-- Loading State -->
    <LoadingSpinner 
      v-if="loading || isLoadingData || isLoadingAnalytics || isLoadingSales || isLoadingProducts || isLoadingCustomers || isLoadingReturns || isRefreshing"
      :message="getLoadingMessage()"
      :fullscreen="true"
      :overlay="true"
    />

    <!-- Error State -->
    <div v-else-if="hasError" class="flex flex-col items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium mb-2" style="color: var(--color-text)">Failed to Load Dashboard</h3>
        <p class="mb-4" style="color: var(--color-text-secondary)">{{ errorMessage }}</p>
        <div class="flex gap-3">
          <button 
            @click="handleRetry" 
            :disabled="retryCount >= maxRetries"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ retryCount >= maxRetries ? 'Max Retries Reached' : `Retry (${retryCount}/${maxRetries})` }}
          </button>
          <button 
            @click="refreshDashboard" 
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- KPI Cards -->
      <div class="row stats-row grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="w-full">
            <div class="card card-transparent stats-card rounded-lg" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2" style="color: var(--color-text)">
                          {{ formatCurrency(dashboardData.todayRevenue) }}
                          <span :class="dashboardData.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'" class="stats-change">
                            {{ dashboardData.revenueChange >= 0 ? '+' : '' }}{{ dashboardData.revenueChange.toFixed(1) }}%
                          </span>
                        </h5>
                        <p class="stats-text" style="color: var(--color-text-secondary)">{{ t('dashboard.today_revenue') }}</p>
                    </div>
                    <div :class="dashboardData.revenueChange >= 0 ? 'change-success' : 'change-danger'" class="stats-icon flex items-center justify-center w-12 h-12 rounded-full">
                        <span class="material-icons">{{ dashboardData.revenueChange >= 0 ? 'trending_up' : 'trending_down' }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="card card-transparent stats-card rounded-lg" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2" style="color: var(--color-text)">
                          {{ dashboardData.totalCustomers }}
                          <span :class="dashboardData.customerChange >= 0 ? 'text-green-500' : 'text-red-500'" class="stats-change">
                            {{ dashboardData.customerChange >= 0 ? '+' : '' }}{{ dashboardData.customerChange.toFixed(1) }}%
                          </span>
                        </h5>
                        <p class="stats-text" style="color: var(--color-text-secondary)">{{ t('dashboard.total_customers') }}</p>
                    </div>
                    <div :class="dashboardData.customerChange >= 0 ? 'change-success' : 'change-danger'" class="stats-icon flex items-center justify-center w-12 h-12 rounded-full">
                        <span class="material-icons">{{ dashboardData.customerChange >= 0 ? 'trending_up' : 'trending_down' }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="card card-transparent stats-card rounded-lg" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2" style="color: var(--color-text)">
                          {{ dashboardData.totalSales }}
                          <span :class="dashboardData.salesChange >= 0 ? 'text-green-500' : 'text-red-500'" class="stats-change">
                            {{ dashboardData.salesChange >= 0 ? '+' : '' }}{{ dashboardData.salesChange.toFixed(1) }}%
                          </span>
                        </h5>
                        <p class="stats-text" style="color: var(--color-text-secondary)">{{ t('dashboard.total_orders') }}</p>
                    </div>
                    <div :class="dashboardData.salesChange >= 0 ? 'change-success' : 'change-danger'" class="stats-icon flex items-center justify-center w-12 h-12 rounded-full">
                        <span class="material-icons">{{ dashboardData.salesChange >= 0 ? 'trending_up' : 'trending_down' }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="card card-transparent stats-card rounded-lg" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2" style="color: var(--color-text)">
                          {{ formatCurrency(dashboardData.averageOrderValue) }}
                          <span :class="dashboardData.aovChange >= 0 ? 'text-green-500' : 'text-red-500'" class="stats-change">
                            {{ dashboardData.aovChange >= 0 ? '+' : '' }}{{ dashboardData.aovChange.toFixed(1) }}%
                          </span>
                        </h5>
                        <p class="stats-text" style="color: var(--color-text-secondary)">{{ t('dashboard.average_order_value') }}</p>
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
            <div class="card card-transparent stats-card rounded-lg" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2" style="color: var(--color-text)">{{ dashboardData.totalProducts }}</h5>
                        <p class="stats-text" style="color: var(--color-text-secondary)">{{ t('dashboard.total_products') }}</p>
                    </div>
                    <div class="stats-icon change-info flex items-center justify-center w-12 h-12 rounded-full" style="background-color: var(--color-info)">
                        <span class="material-icons">inventory</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="card card-transparent stats-card rounded-lg" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2" style="color: var(--color-text)">{{ dashboardData.lowStockItems }}</h5>
                        <p class="stats-text" style="color: var(--color-text-secondary)">{{ t('dashboard.low_stock_items') }}</p>
                    </div>
                    <div class="stats-icon change-warning flex items-center justify-center w-12 h-12 rounded-full" style="background-color: var(--color-warning)">
                        <span class="material-icons">warning</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="card card-transparent stats-card rounded-lg" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2" style="color: var(--color-text)">{{ dashboardData.outOfStockItems }}</h5>
                        <p class="stats-text" style="color: var(--color-text-secondary)">{{ t('dashboard.out_of_stock_items') }}</p>
                    </div>
                    <div class="stats-icon change-danger flex items-center justify-center w-12 h-12 rounded-full" style="background-color: var(--color-error)">
                        <span class="material-icons">error</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="card card-transparent stats-card rounded-lg" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
                <div class="card-body flex items-center justify-between p-6">
                    <div class="stats-info flex-1">
                        <h5 class="card-title text-2xl font-semibold mb-2" style="color: var(--color-text)">{{ formatCurrency(dashboardData.inventoryValue) }}</h5>
                        <p class="stats-text" style="color: var(--color-text-secondary)">{{ t('dashboard.inventory_value') }}</p>
                    </div>
                    <div class="stats-icon change-success flex items-center justify-center w-12 h-12 rounded-full" style="background-color: var(--color-success)">
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
          <div class="card rounded-lg" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
            <div class="card-body p-6">
              <h5 class="card-title text-lg font-semibold mb-4" style="color: var(--color-text)">{{ t('dashboard.recent_activity') }}</h5>
              <div v-if="recentActivity.length === 0" class="text-center py-8" style="color: var(--color-text-secondary)">
                {{ t('dashboard.no_recent_activity') }}
              </div>
              <div v-else class="space-y-4">
                <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center justify-between p-4 rounded-lg" style="background-color: var(--color-background); border: 1px solid var(--color-border)">
                  <div class="flex items-center space-x-3">
                    <div :class="getActivityIconClass(activity.type)" class="flex items-center justify-center w-8 h-8 rounded-full">
                      <span class="material-icons text-sm">{{ getActivityIcon(activity.type) }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium" style="color: var(--color-text)">{{ activity.description }}</p>
                      <p class="text-xs" style="color: var(--color-text-secondary)">{{ formatTimeAgo(activity.created_at) }}</p>
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
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useToast } from '@/utils/toastManager'
import { useErrorHandler } from '@/utils/errorHandler'
import { formatCurrency } from '@/utils/currency'

// Composables
const { t } = useI18n()
const router = useRouter()
const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()
const { handleNetworkError, handleDatabaseError, handleValidationError, handleBusinessLogicError } = useErrorHandler()

// Stores
const authStore = useAuthStore()
const analyticsStore = useAnalyticsStore()
const salesStore = useSalesStore()
const productStore = useProductStore()
const customerStore = useCustomerStore()
const returnsStore = useReturnsStore()

// Reactive Variables
const loading = ref(true)

// Loading states
const isLoadingData = ref(false)
const isLoadingAnalytics = ref(false)
const isLoadingSales = ref(false)
const isLoadingProducts = ref(false)
const isLoadingCustomers = ref(false)
const isLoadingReturns = ref(false)
const isRefreshing = ref(false)

// Error states
const hasError = ref(false)
const errorMessage = ref('')
const retryCount = ref(0)
const maxRetries = 3

// Dashboard Data
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

// Recent Activity
const recentActivity = ref([])

// Computed Properties
const kpis = computed(() => analyticsStore.getKPIs)
const sales = computed(() => salesStore.getSales)
const products = computed(() => productStore.getProducts)
const customers = computed(() => customerStore.getCustomers)
const returns = computed(() => returnsStore.getReturns)

// Helper methods
const getLoadingMessage = () => {
  if (isLoadingData.value) return 'Loading dashboard data...'
  if (isLoadingAnalytics.value) return 'Loading analytics...'
  if (isLoadingSales.value) return 'Loading sales data...'
  if (isLoadingProducts.value) return 'Loading products...'
  if (isLoadingCustomers.value) return 'Loading customers...'
  if (isLoadingReturns.value) return 'Loading returns...'
  if (isRefreshing.value) return 'Refreshing dashboard...'
  return 'Loading...'
}

const resetErrorState = () => {
  hasError.value = false
  errorMessage.value = ''
  retryCount.value = 0
}

const handleRetry = async () => {
  if (retryCount.value < maxRetries) {
    retryCount.value++
    await loadDashboardData()
  } else {
    showError('Max Retries Reached', 'Unable to load dashboard data after multiple attempts. Please check your connection.')
  }
}

// Methods
// Using centralized formatCurrency from currency.ts

// Format time ago
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

// Get activity icon
const getActivityIcon = (type) => {
  switch (type) {
    case 'sale': return 'shopping_cart'
    case 'return': return 'assignment_return'
    case 'product': return 'inventory'
    case 'customer': return 'person'
    default: return 'info'
  }
}

// Get activity icon class
const getActivityIconClass = (type) => {
  switch (type) {
    case 'sale': return 'bg-green-500'
    case 'return': return 'bg-red-500'
    case 'product': return 'bg-blue-500'
    case 'customer': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

// Calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// Load Dashboard Data
const loadDashboardData = async () => {
  try {
    isLoadingData.value = true
    resetErrorState()
    
    showInfo('Loading Dashboard', 'Fetching your dashboard data...')
    
    // Load all data in parallel with individual error handling
    const promises = [
      loadAnalyticsData(),
      loadSalesData(),
      loadProductsData(),
      loadCustomersData(),
      loadReturnsData()
    ]
    
    await Promise.allSettled(promises)
    
    // Calculate dashboard metrics
    await calculateDashboardMetrics()
    
    // Generate recent activity
    generateRecentActivity()
    
    showSuccess('Dashboard Loaded', 'Your dashboard data has been loaded successfully')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Dashboard Updated', 'Latest data loaded')
    }
    
  } catch (error) {
    handleNetworkError(error, 'Load Dashboard')
    showError('Load Failed', 'Failed to load dashboard data')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while loading dashboard data'
  } finally {
    isLoadingData.value = false
    loading.value = false
  }
}

// Individual data loading methods with error handling
const loadAnalyticsData = async () => {
  try {
    isLoadingAnalytics.value = true
    await analyticsStore.fetchAnalyticsData()
  } catch (error) {
    handleNetworkError(error, 'Load Analytics')
    showWarning('Analytics Warning', 'Some analytics data may not be available')
  } finally {
    isLoadingAnalytics.value = false
  }
}

const loadSalesData = async () => {
  try {
    isLoadingSales.value = true
    await salesStore.fetchSales()
  } catch (error) {
    handleNetworkError(error, 'Load Sales')
    showWarning('Sales Warning', 'Some sales data may not be available')
  } finally {
    isLoadingSales.value = false
  }
}

const loadProductsData = async () => {
  try {
    isLoadingProducts.value = true
    await productStore.getAllProducts()
    console.log('Dashboard: Products loaded, count:', productStore.getProducts.length)
    
    // Also load products about to finish
    await productStore.getProductsAboutToFinish()
    console.log('Dashboard: Products about to finish loaded, count:', productStore.getProductAboutTofinish.length)
  } catch (error) {
    handleNetworkError(error, 'Load Products')
    showWarning('Products Warning', 'Some product data may not be available')
  } finally {
    isLoadingProducts.value = false
  }
}

const loadCustomersData = async () => {
  try {
    isLoadingCustomers.value = true
    await customerStore.fetchCustomers()
  } catch (error) {
    handleNetworkError(error, 'Load Customers')
    showWarning('Customers Warning', 'Some customer data may not be available')
  } finally {
    isLoadingCustomers.value = false
  }
}

const loadReturnsData = async () => {
  try {
    isLoadingReturns.value = true
    await returnsStore.fetchReturns()
  } catch (error) {
    handleNetworkError(error, 'Load Returns')
    showWarning('Returns Warning', 'Some returns data may not be available')
  } finally {
    isLoadingReturns.value = false
  }
}

// Calculate dashboard metrics with error handling
const calculateDashboardMetrics = async () => {
  try {
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
    const lowStockItems = kpis.lowStockItems || 0
    const outOfStockItems = kpis.outOfStockItems || 0
    const inventoryValue = kpis.inventoryValue || 0

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
  } catch (error) {
    handleBusinessLogicError(error, 'Calculate Metrics')
    showWarning('Calculation Warning', 'Some metrics may not be accurate')
  }
}

// Refresh dashboard data
const refreshDashboard = async () => {
  try {
    isRefreshing.value = true
    showInfo('Refreshing Dashboard', 'Updating dashboard data...')
    
    await loadDashboardData()
    
    showSuccess('Dashboard Refreshed', 'Dashboard data has been updated')
  } catch (error) {
    handleNetworkError(error, 'Refresh Dashboard')
    showError('Refresh Failed', 'Failed to refresh dashboard data')
  } finally {
    isRefreshing.value = false
  }
}

// Generate recent activity from sales and returns
const generateRecentActivity = () => {
  try {
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
  } catch (error) {
    handleBusinessLogicError(error, 'Generate Activity')
    showWarning('Activity Warning', 'Recent activity may not be complete')
  }
}

// Lifecycle Hooks
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
/* Dashboard Theme Styles */
.stats-card {
  transition: all 0.3s ease-in-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Activity Icon Classes */
.change-success {
  background-color: var(--color-success) !important;
  color: white;
}

.change-danger {
  background-color: var(--color-error) !important;
  color: white;
}

.change-warning {
  background-color: var(--color-warning) !important;
  color: white;
}

.change-info {
  background-color: var(--color-info) !important;
  color: white;
}

/* Activity Type Icons */
.activity-icon-sale {
  background-color: var(--color-success);
  color: white;
}

.activity-icon-return {
  background-color: var(--color-error);
  color: white;
}

.activity-icon-product {
  background-color: var(--color-info);
  color: white;
}

.activity-icon-customer {
  background-color: var(--color-primary);
  color: white;
}

/* Theme-specific adjustments */
[data-theme="light"] .stats-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .stats-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

[data-theme="dark"] .stats-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .stats-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

/* Breadcrumb styling */
.breadcrumb-link {
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

/* Button styling */
.btn-primary {
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Loading spinner */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .row.grid {
    grid-template-columns: 1fr;
  }
  
  .md\\:col-span-2 {
    grid-column: span 1;
  }
}
</style>


