import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface SalesData {
  daily: Record<string, number>
  weekly: Record<string, number>
  monthly: Record<string, number>
  yearly: Record<string, number>
}

interface ProductAnalytics {
  id: string
  name: string
  totalSales: number
  revenue: number
  stockTurnover: number
}

export const useAnalyticsStore = defineStore('analytics', () => {
  const salesData = ref<SalesData>({
    daily: {},
    weekly: {},
    monthly: {},
    yearly: {}
  })
  
  const productAnalytics = ref<ProductAnalytics[]>([])
  const customerMetrics = ref({
    totalCustomers: 0,
    repeatCustomers: 0,
    averageTransactionValue: 0
  })

  const topProducts = computed(() => {
    return [...productAnalytics.value]
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5)
  })

  const revenueGrowth = computed(() => {
    // Calculate revenue growth logic here
    return 0
  })

  function updateSalesData(period: keyof SalesData, data: Record<string, number>) {
    salesData.value[period] = data
  }

  function updateProductAnalytics(products: ProductAnalytics[]) {
    productAnalytics.value = products
  }

  return {
    salesData,
    productAnalytics,
    customerMetrics,
    topProducts,
    revenueGrowth,
    updateSalesData,
    updateProductAnalytics
  }
}) 