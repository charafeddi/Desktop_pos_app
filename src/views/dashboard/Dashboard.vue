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
    <div class="row stats-row grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="w-full">
          <div class="card card-transparent stats-card bg-gray-800 rounded-lg">
              <div class="card-body flex items-center justify-between p-6">
                  <div class="stats-info flex-1">
                      <h5 class="card-title text-2xl font-semibold mb-2">$3,089.67<span class="stats-change stats-change-danger text-red-500">-8%</span></h5>
                      <p class="stats-text text-gray-400">{{ t('dashboard.today_revenue') }}</p>
                  </div>
                  <div class="stats-icon change-danger flex items-center justify-center w-12 h-12 rounded-full bg-red-400">
                      <span class="material-icons">trending_down</span>
                  </div>
              </div>
          </div>
      </div>
      <div class="w-full">
          <div class="card card-transparent stats-card bg-gray-800 rounded-lg">
              <div class="card-body flex items-center justify-between p-6">
                  <div class="stats-info flex-1">
                      <h5 class="card-title text-2xl font-semibold mb-2">168,047<span class="stats-change stats-change-success text-green-500">+16%</span></h5>
                      <p class="stats-text text-gray-400">{{ t('dashboard.unique_visitors') }}</p>
                  </div>
                  <div class="stats-icon change-success flex items-center justify-center w-12 h-12 rounded-full bg-green-400">
                      <span class="material-icons">trending_up</span>
                  </div>
              </div>
          </div>
      </div>
      <div class="w-full">
          <div class="card card-transparent stats-card bg-gray-800 rounded-lg">
              <div class="card-body flex items-center justify-between p-6">
                  <div class="stats-info flex-1">
                      <h5 class="card-title text-2xl font-semibold mb-2">47,350<span class="stats-change stats-change-success text-green-500">+12%</span></h5>
                      <p class="stats-text text-gray-400">{{ t('dashboard.total_orders') }}</p>
                  </div>
                  <div class="stats-icon change-success flex items-center justify-center w-12 h-12 rounded-full bg-green-400">
                      <span class="material-icons">trending_up</span>
                  </div>
              </div>
          </div>
      </div>
    </div>

    <div class="row grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <PopularProducts />
      </div>
      <div class=" md:col-span-2 ml-4">
        <SalesChart />
      </div>
      <div>
        <ProductFinishedAboutTo />
      </div>
    </div>
  </div>
</div>  
</template> 


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useAnalyticsStore } from '@/stores/analytics.store'
import { useI18n } from 'vue-i18n'
import PopularProducts from '@/components/product/popularProduct.vue'
import SalesChart from '@/components/charts/SalesChart.vue'
import ProductFinishedAboutTo from '@/components/product/productFinishedAboutTo.vue'
const { t } = useI18n()

interface Stat {
  title: string
  value: string
  description: string
}

interface Transaction {
  id: number
  description: string
  date: string
  amount: string
  type: 'credit' | 'debit'
}

const router = useRouter()
const authStore = useAuthStore()
const analyticsStore = useAnalyticsStore()

const quickStats = ref({
  todaySales: 0,
  totalProducts: 0,
  activeCustomers: 0,
  pendingOrders: 0
})

const stats: Stat[] = [
  {
    title: 'Total Sales',
    value: '$23,456',
    description: 'Last 30 days'
  },
  {
    title: 'Orders',
    value: '156',
    description: 'Last 7 days'
  },
  {
    title: 'Average Order',
    value: '$148',
    description: 'Per transaction'
  },
  {
    title: 'Products',
    value: '1,893',
    description: 'In inventory'
  }
]

const recentTransactions: Transaction[] = [
  {
    id: 1,
    description: 'Sale #1234',
    date: '2 minutes ago',
    amount: '156.00',
    type: 'credit'
  },
  {
    id: 2,
    description: 'Refund #5678',
    date: '1 hour ago',
    amount: '49.99',
    type: 'debit'
  },
  {
    id: 3,
    description: 'Sale #1235',
    date: '3 hours ago',
    amount: '289.99',
    type: 'credit'
  }
]

onMounted(() => {
  quickStats.value = {
    todaySales: 1250,
    totalProducts: 45,
    activeCustomers: 12,
    pendingOrders: 3
  }
})

const navigationItems = [
  { name: 'POS', path: '/pos', icon: '🛒', role: ['admin', 'manager', 'cashier'] },
  { name: 'Analytics', path: '/analytics', icon: '📊', role: ['admin', 'manager'] },
  { name: 'Inventory', path: '/inventory', icon: '📦', role: ['admin', 'manager'] },
  { name: 'Settings', path: '/settings', icon: '⚙️', role: ['admin'] }
]

function canAccess(roles: string[]) {
  return roles.includes(authStore.user?.role || '')
}
</script>

<style scoped>
/* You can keep any additional styles here if needed */

</style>


