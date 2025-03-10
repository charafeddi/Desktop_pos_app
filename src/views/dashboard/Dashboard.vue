<template>
<div class="page-content">
  <div class="page-info">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="#" class="breadcrumb-link">Apps</a></li>
            <li class="breadcrumb-item active" aria-current="page">Dashboard</li>
        </ol>
    </nav>
  </div>
  <div class="main-content">
    <div class="row stats-row">
      <div class="w-full lg:w-1/3 md:w-full">
          <div class="card card-transparent stats-card">
              <div class="card-body">
                  <div class="stats-info">
                      <h5 class="card-title">$3,089.67<span class="stats-change stats-change-danger">-8%</span></h5>
                      <p class="stats-text">{{ t('dashboard.today_revenue') }}</p>
                  </div>
                  <div class="stats-icon change-danger">
                      <span class="material-icons">trending_down</span>
                  </div>
              </div>
          </div>
      </div>
      <div class="w-full lg:w-1/3 md:w-full">
          <div class="card card-transparent stats-card">
              <div class="card-body">
                  <div class="stats-info">
                      <h5 class="card-title">168,047<span class="stats-change stats-change-success">+16%</span></h5>
                      <p class="stats-text">{{ t('dashboard.unique_visitors') }}</p>
                  </div>
                  <div class="stats-icon change-success">
                      <span class="material-icons">trending_up</span>
                  </div>
              </div>
          </div>
      </div>
      <div class="w-full lg:w-1/3 md:w-full">
          <div class="card card-transparent stats-card">
              <div class="card-body">
                  <div class="stats-info">
                      <h5 class="card-title">47,350<span class="stats-change stats-change-success">+12%</span></h5>
                      <p class="stats-text">{{ t('dashboard.total_orders') }}</p>
                  </div>
                  <div class="stats-icon change-success">
                      <span class="material-icons">trending_up</span>
                  </div>
              </div>
          </div>
      </div>
    </div>

    <div class="row mt-6">
      <div class="w-full lg:w-1/2 md:w-full">
        <PopularProducts />
      </div>
      <!-- You can add other components in the other half -->
      <div class="w-full lg:w-1/2 md:w-full">
        <SalesChart />
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
.page-content {
  padding: 20px;
}

.page-info {
  padding: 1rem 2rem;
  background: transparent;
}

.breadcrumb {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.5rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  color: #d7d7d7;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: "/";
  margin: 0 0.5rem;
  color: #6b7280;
}

.breadcrumb-link {
  color: #535bf2;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #4347d9;
}

.breadcrumb-item.active {
  color: #d7d7d7;
}

/* Stats Card Styles */
.stats-card {
  background: rgb(45, 45, 45);
  border-radius: 10px;
}

.card-transparent {
  background: rgb(45, 45, 45);
  backdrop-filter: blur(20px);
}

.card-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  position: relative;
  gap: 2rem;
}

/* Separator for first two cards */
.card-body:not(:last-child) {
  border-right: 1px solid rgba(158, 158, 158, 0.2); /* Change color here - currently using a light gray */
}

/* Stats Info Section */
.stats-info {
  flex: 1;
}

/* Card Title (Numbers) */
.stats-info .card-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Stats Change Indicators */
.stats-change {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.stats-change-success {
  color: #22c55e; /* Change this color for positive values */
  background-color: rgba(34, 197, 94, 0.1);
}

.stats-change-danger {
  color: #ef4444; /* Change this color for negative values */
  background-color: rgba(239, 68, 68, 0.1);
}

/* Stats Text */
.stats-text {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Stats Icon */
.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.change-success {
  color: #22c55e; /* Change this color for upward trend */
  background-color: rgba(34, 197, 94, 0.1);
}

.change-danger {
  color: #ef4444; /* Change this color for downward trend */
  background-color: rgba(239, 68, 68, 0.1);
}
</style>


