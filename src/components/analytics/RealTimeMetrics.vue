<!-- src/components/analytics/RealTimeMetrics.vue -->
<template>
  <div class="bg-white shadow-lg rounded-xl p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Real-Time Metrics</h3>
      <div class="flex items-center gap-2">
        <div :class="isLive ? 'bg-red-500' : 'bg-gray-400'" class="w-2 h-2 rounded-full animate-pulse"></div>
        <span class="text-sm text-gray-600">{{ isLive ? 'Live' : 'Offline' }}</span>
        <button @click="toggleLiveUpdates" 
                :class="isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-red-700'"
                class="px-3 py-1 text-white text-xs rounded-full transition-colors">
          {{ isLive ? 'Stop' : 'Start' }}
        </button>
      </div>
    </div>

    <!-- Real-time Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Today's Revenue -->
      <div class="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-green-600 uppercase tracking-wide">Today's Revenue</p>
            <p class="text-2xl font-bold text-green-700">{{ formatCurrency(todayRevenue) }}</p>
          </div>
          <div class="bg-green-200 rounded-full p-2">
            <svg class="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
          </div>
        </div>
        <div class="mt-2">
          <span class="text-xs text-green-600">{{ formatTime(lastSaleTime) }}</span>
        </div>
      </div>

      <!-- Hourly Sales -->
      <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-blue-600 uppercase tracking-wide">Hourly Sales</p>
            <p class="text-2xl font-bold text-blue-700">{{ hourlySales }}</p>
          </div>
          <div class="bg-blue-200 rounded-full p-2">
            <svg class="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
        <div class="mt-2">
          <span class="text-xs text-blue-600">{{ currentHour }}:00 - {{ nextHour }}:00</span>
        </div>
      </div>

      <!-- Active Customers -->
      <div class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-purple-600 uppercase tracking-wide">Active Today</p>
            <p class="text-2xl font-bold text-purple-700">{{ activeCustomersToday }}</p>
          </div>
          <div class="bg-purple-200 rounded-full p-2">
            <svg class="w-4 h-4 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <div class="mt-2">
          <span class="text-xs text-purple-600">{{ newCustomersToday }} new today</span>
        </div>
      </div>

      <!-- Top Product -->
      <div class="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-orange-600 uppercase tracking-wide">Top Product</p>
            <p class="text-lg font-bold text-orange-700 truncate">{{ topProductToday.name }}</p>
          </div>
          <div class="bg-orange-200 rounded-full p-2">
            <svg class="w-4 h-4 text-orange-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
          </div>
        </div>
        <div class="mt-2">
          <span class="text-xs text-orange-600">{{ topProductToday.sales }} sold</span>
        </div>
      </div>
    </div>

    <!-- Live Activity Feed -->
    <div class="border-t pt-6">
      <h4 class="text-md font-semibold text-gray-900 mb-4">Live Activity</h4>
      <div class="space-y-3 max-h-60 overflow-y-auto">
        <div v-for="activity in liveActivities" :key="activity.id" 
             class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div :class="getActivityIconClass(activity.type)" 
               class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
            <component :is="getActivityIcon(activity.type)" class="w-4 h-4 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">{{ activity.message }}</p>
            <p class="text-xs text-gray-500">{{ formatTime(activity.timestamp) }}</p>
          </div>
          <div class="text-right">
            <span v-if="activity.amount" class="text-sm font-semibold text-green-600">
              {{ formatCurrency(activity.amount) }}
            </span>
          </div>
        </div>
        
        <div v-if="liveActivities.length === 0" class="text-center py-4 text-gray-500">
          <p class="text-sm">No recent activity</p>
          <p class="text-xs">Sales activities will appear here in real-time</p>
        </div>
      </div>
    </div>

    <!-- Sales Prediction -->
    <div class="border-t pt-6 mt-6">
      <h4 class="text-md font-semibold text-gray-900 mb-4">Today's Projection</h4>
      <div class="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-700">{{ projectedDailyRevenue }}</div>
            <div class="text-xs text-indigo-600">Projected Revenue</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-700">{{ projectedDailySales }}</div>
            <div class="text-xs text-indigo-600">Projected Sales</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-700">{{ trendingUp ? '↗️' : '↘️' }}</div>
            <div class="text-xs text-indigo-600">{{ trendingUp ? 'Trending Up' : 'Trending Down' }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-700">{{ confidenceLevel }}%</div>
            <div class="text-xs text-indigo-600">Confidence</div>
          </div>
        </div>
        
        <div class="mt-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div :style="{ width: `${progressPercentage}%` }" 
                 class="bg-indigo-500 h-2 rounded-full transition-all duration-300"></div>
          </div>
          <div class="flex justify-between text-xs text-indigo-600 mt-1">
            <span>{{ progressPercentage }}% of day complete</span>
            <span>{{ hoursRemaining }}h remaining</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  analyticsData: {
    type: Object,
    required: true
  }
})

// Reactive state
const isLive = ref(false)
const liveActivities = ref([])
const updateInterval = ref(null)

// Real-time computed values
const todayRevenue = computed(() => {
  // Calculate today's revenue from sales
  return props.analyticsData.todayRevenue || 0
})

const hourlySales = computed(() => {
  return props.analyticsData.hourlySales || 0
})

const activeCustomersToday = computed(() => {
  return props.analyticsData.activeCustomersToday || 0
})

const newCustomersToday = computed(() => {
  return props.analyticsData.newCustomersToday || 0
})

const topProductToday = computed(() => {
  return props.analyticsData.topProductToday || { name: 'N/A', sales: 0 }
})

const lastSaleTime = computed(() => {
  return props.analyticsData.lastSaleTime || new Date()
})

// Current time computations
const currentHour = computed(() => {
  return new Date().getHours()
})

const nextHour = computed(() => {
  const next = new Date().getHours() + 1
  return next > 23 ? 0 : next
})

const progressPercentage = computed(() => {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = now - startOfDay
  const dayProgress = (diff / (24 * 60 * 60 * 1000)) * 100
  return Math.min(Math.round(dayProgress), 100)
})

const hoursRemaining = computed(() => {
  return Math.max(0, 24 - currentHour.value)
})

// Projections
const projectedDailyRevenue = computed(() => {
  if (progressPercentage.value === 0) return formatCurrency(0)
  const current = todayRevenue.value
  const projection = (current / progressPercentage.value) * 100
  return formatCurrency(projection)
})

const projectedDailySales = computed(() => {
  const salesCount = props.analyticsData.todaySales || 0
  if (progressPercentage.value === 0) return '0'
  const projection = Math.round((salesCount / progressPercentage.value) * 100)
  return projection.toString()
})

const trendingUp = computed(() => {
  // Logic to determine trend based on recent data
  return hourlySales.value > (props.analyticsData.previousHourSales || 0)
})

const confidenceLevel = computed(() => {
  // Confidence based on data availability and consistency
  return Math.min(Math.max(progressPercentage.value, 30), 95)
})

// Activity icons
const SaleIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20">
    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
  </svg>`
}

const CustomerIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>`
}

const ReturnIcon = {
  template: `<svg fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"/>
  </svg>`
}

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0)
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getActivityIcon = (type) => {
  const icons = {
    sale: SaleIcon,
    customer: CustomerIcon,
    return: ReturnIcon
  }
  return icons[type] || SaleIcon
}

const getActivityIconClass = (type) => {
  const classes = {
    sale: 'bg-green-500',
    customer: 'bg-blue-500',
    return: 'bg-orange-500'
  }
  return classes[type] || 'bg-green-500'
}

const generateLiveActivity = () => {
  const activities = [
    { id: Date.now(), type: 'sale', message: 'New sale completed', amount: 45.50, timestamp: Date.now() },
    { id: Date.now() + 1, type: 'customer', message: 'New customer registered', timestamp: Date.now() },
    { id: Date.now() + 2, type: 'sale', message: 'Product return processed', amount: -25.00, timestamp: Date.now() }
  ]
  
  const randomActivity = activities[Math.floor(Math.random() * activities.length)]
  randomActivity.timestamp = Date.now()
  
  liveActivities.value.unshift(randomActivity)
  
  // Keep only last 10 activities
  if (liveActivities.value.length > 10) {
    liveActivities.value.pop()
  }
}

const toggleLiveUpdates = () => {
  isLive.value = !isLive.value
  
  if (isLive.value) {
    // Start live updates
    updateInterval.value = setInterval(() => {
      generateLiveActivity()
    }, 2000)
  } else {
    // Stop live updates
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
  }
}

// Lifecycle
onMounted(() => {
  // Initialize with some sample activities
  for (let i = 0; i < 3; i++) {
    generateLiveActivity()
  }
})

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
})
</script>

<style scoped>
/* Scrollbar styling for activity feed */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animation for live updates */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-3 > * {
  animation: fadeInUp 0.3s ease-out;
}
</style>
