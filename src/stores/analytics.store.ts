import { defineStore } from 'pinia'

/**
 * KPI (Key Performance Indicators) Data Interface
 * 
 * KPIs are measurable values that demonstrate how effectively a business is achieving key objectives.
 * In a POS system, these metrics help track business performance and make data-driven decisions.
 * 
 * @interface KPIData
 * @property {number} totalRevenue - Total money earned from all sales (sum of all sale amounts)
 * @property {number} averageOrderValue - Average amount per sale (totalRevenue / totalSales)
 * @property {number} totalSales - Total number of sales transactions completed
 * @property {number} totalCustomers - Total number of registered customers
 * @property {number} inventoryValue - Total value of current stock (stock × selling price)
 * @property {number} lowStockItems - Number of products with stock below minimum threshold
 * @property {number} outOfStockItems - Number of products with zero stock
 */
interface KPIData {
  totalRevenue: number
  averageOrderValue: number
  totalSales: number
  totalCustomers: number
  inventoryValue: number
  lowStockItems: number
  outOfStockItems: number
}

/**
 * Top Product Interface
 * Represents a product with its sales performance data
 * 
 * @interface TopProduct
 * @property {number} id - Unique product identifier
 * @property {string} name - Product name
 * @property {number} sales - Number of times this product was sold
 * @property {number} revenue - Total money earned from this product (sales × price)
 * @property {number} quantity_sold - Total quantity of this product sold
 */
interface TopProduct {
  id: number
  name: string
  sales: number
  revenue: number
  quantity_sold: number
}

/**
 * Customer Segment Interface
 * Represents a group of customers based on their purchase behavior
 * 
 * @interface CustomerSegment
 * @property {string} segment - Customer category (New, Regular, VIP, Occasional)
 * @property {number} count - Number of customers in this segment
 * @property {number} percentage - Percentage of total customers in this segment
 */
interface CustomerSegment {
  segment: string
  count: number
  percentage: number
}

/**
 * Sales Chart Data Interface
 * Represents daily sales data for chart visualization
 * 
 * @interface SalesChartData
 * @property {string} date - Date in YYYY-MM-DD format
 * @property {number} sales - Number of sales on this date
 * @property {number} revenue - Total revenue on this date
 */
interface SalesChartData {
  date: string
  sales: number
  revenue: number
}

/**
 * Revenue Trend Data Interface
 * Represents revenue data for trend analysis
 * 
 * @interface RevenueTrendData
 * @property {string} period - Time period (day, week, month)
 * @property {number} revenue - Revenue for this period
 * @property {number} growth - Growth percentage from previous period
 */
interface RevenueTrendData {
  period: string
  revenue: number
  growth: number
}

/**
 * Product Performance Data Interface
 * Represents detailed product performance metrics
 * 
 * @interface ProductPerformanceData
 * @property {number} id - Product ID
 * @property {string} name - Product name
 * @property {number} sales - Number of sales
 * @property {number} revenue - Total revenue
 * @property {number} profit - Profit margin
 * @property {number} stock - Current stock
 * @property {string} category - Product category
 */
interface ProductPerformanceData {
  id: number
  name: string
  sales: number
  revenue: number
  profit: number
  stock: number
  category: string
}

/**
 * Customer Analytics Data Interface
 * Represents customer behavior analytics
 * 
 * @interface CustomerAnalyticsData
 * @property {string} segment - Customer segment
 * @property {number} count - Number of customers
 * @property {number} totalSpent - Total amount spent
 * @property {number} averageSpent - Average amount per customer
 * @property {number} repeatRate - Percentage of repeat customers
 */
interface CustomerAnalyticsData {
  segment: string
  count: number
  totalSpent: number
  averageSpent: number
  repeatRate: number
}

/**
 * Inventory Insights Data Interface
 * Represents inventory performance metrics
 * 
 * @interface InventoryInsightsData
 * @property {string} category - Product category
 * @property {number} totalValue - Total inventory value
 * @property {number} turnoverRate - Inventory turnover rate
 * @property {number} lowStockCount - Number of low stock items
 * @property {number} outOfStockCount - Number of out of stock items
 */
interface InventoryInsightsData {
  category: string
  totalValue: number
  turnoverRate: number
  lowStockCount: number
  outOfStockCount: number
}

/**
 * Analytics State Interface
 * Main state structure for the analytics store
 * 
 * @interface AnalyticsState
 * @property {KPIData} kpis - Key performance indicators
 * @property {TopProduct[]} topProducts - List of best-selling products
 * @property {CustomerSegment[]} customerSegments - Customer categorization data
 * @property {SalesChartData[]} salesChartData - Daily sales data for charts
 * @property {boolean} loading - Loading state indicator
 * @property {string | null} error - Error message if any
 */
interface AnalyticsState {
  kpis: KPIData
  topProducts: TopProduct[]
  customerSegments: CustomerSegment[]
  salesChartData: SalesChartData[]
  revenueTrendData: RevenueTrendData[]
  productPerformanceData: ProductPerformanceData[]
  customerAnalyticsData: CustomerAnalyticsData[]
  inventoryInsightsData: InventoryInsightsData[]
  loading: boolean
  error: string | null
}

/**
 * Analytics Store
 * 
 * This store manages all analytics data for the POS system including:
 * - Key Performance Indicators (KPIs)
 * - Top selling products
 * - Customer segmentation
 * - Sales trends and charts
 * 
 * The store fetches data from the backend and calculates various metrics
 * to provide insights into business performance.
 */
export const useAnalyticsStore = defineStore('analytics', {
  /**
   * Initial state of the analytics store
   * All values start at 0 or empty arrays
   */
  state: (): AnalyticsState => ({
    kpis: {
      totalRevenue: 0,        // Total money earned from all sales
      averageOrderValue: 0,   // Average amount per sale
      totalSales: 0,          // Total number of sales
      totalCustomers: 0,      // Total number of customers
      inventoryValue: 0,      // Total value of current stock
      lowStockItems: 0,       // Products with low stock
      outOfStockItems: 0      // Products with no stock
    },
    topProducts: [],          // Best-selling products
    customerSegments: [],     // Customer categories
    salesChartData: [],       // Daily sales data
    revenueTrendData: [],     // Revenue trend analysis
    productPerformanceData: [], // Product performance metrics
    customerAnalyticsData: [], // Customer behavior analytics
    inventoryInsightsData: [], // Inventory insights
    loading: false,           // Loading state
    error: null               // Error message
  }),

  /**
   * Getters - Computed properties that return state data
   * These provide easy access to the store's state
   */
  getters: {
    getKPIs: (state) => state.kpis,
    getTopProducts: (state) => state.topProducts,
    getCustomerSegments: (state) => state.customerSegments,
    getSalesChartData: (state) => state.salesChartData,
    getRevenueTrendData: (state) => state.revenueTrendData,
    getProductPerformanceData: (state) => state.productPerformanceData,
    getCustomerAnalyticsData: (state) => state.customerAnalyticsData,
    getInventoryInsightsData: (state) => state.inventoryInsightsData,
    getLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  /**
   * Actions - Methods that modify the store state
   * These handle data fetching, calculations, and state updates
   */
  actions: {
    /**
     * Main method to fetch and calculate all analytics data
     * KPIs : key Performance Indicators 
     * This method:
     * 1. Sets loading state to true
     * 2. Fetches sales, products, and customers data in parallel
     * 3. Calculates KPIs, top products, customer segments, and sales chart data
     * 4. Handles errors and sets loading state to false
     */
    async fetchAnalyticsData() {
      this.loading = true
      this.error = null
      
      try {
        // Fetch all analytics data in parallel for better performance
        const [salesData, productsData, customersData] = await Promise.all([
          this.fetchSalesData(),
          this.fetchProductsData(),
          this.fetchCustomersData()
        ])

        // Calculate all analytics metrics
        this.calculateKPIs(salesData, productsData, customersData)
        this.calculateTopProducts(productsData)
        this.calculateCustomerSegments(customersData, salesData)
        this.generateSalesChartData(salesData)
        
        // Calculate advanced analytics
        this.generateRevenueTrendData(salesData)
        this.generateProductPerformanceData(productsData)
        this.generateCustomerAnalyticsData(customersData, salesData)
        this.generateInventoryInsightsData(productsData)

      } catch (error) {
        console.error('Error fetching analytics data:', error)
        this.error = 'Failed to load analytics data'
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch sales data from the backend
     * @returns {Promise<any[]>} Array of sales records
     */
    async fetchSalesData() {
      try {
        const sales = await window.electronAPI.sales.getAll()
        console.log('Fetched sales data:', sales)
        return sales || []
      } catch (error) {
        console.error('Error fetching sales data:', error)
        return []
      }
    },

    /**
     * Fetch products data with sales information
     * Uses getPopularProduct to get products with sales data included
     * @returns {Promise<any[]>} Array of products with sales data
     */
    async fetchProductsData() {
      try {
        // Use getPopularProduct to get products with sales data
        const products = await window.electronAPI.products.getPopularProduct(50, 'all')
        console.log('Fetched products data:', products)
        return products || []
      } catch (error) {
        console.error('Error fetching products data:', error)
        return []
      }
    },

    /**
     * Fetch customers data from the backend
     * @returns {Promise<any[]>} Array of customer records
     */
    async fetchCustomersData() {
      try {
        const customers = await window.electronAPI.customers.getAll()
        return customers || []
      } catch (error) {
        console.error('Error fetching customers data:', error)
        return []
      }
    },

    /**
     * Calculate Key Performance Indicators (KPIs)
     * 
     * KPIs are important business metrics that help track performance:
     * - Total Revenue: Sum of all sale amounts
     * - Average Order Value: Total revenue divided by number of sales
     * - Total Sales: Count of all sales transactions
     * - Total Customers: Count of all registered customers
     * - Inventory Value: Total value of current stock
     * - Low Stock Items: Products with stock below minimum threshold
     * - Out of Stock Items: Products with zero stock
     * 
     * @param {any[]} sales - Array of sales records
     * @param {any[]} products - Array of product records
     * @param {any[]} customers - Array of customer records
     */
    calculateKPIs(sales: any[], products: any[], customers: any[]) {
      console.log('Calculating KPIs with:', { sales: sales.length, products: products.length, customers: customers.length })
      console.log('Sample sale data:', sales[0])
      
      // Calculate total revenue - check multiple possible field names
      // Different databases might use different field names for the sale amount
      const totalRevenue = sales.reduce((sum: number, sale: any) => {
        const amount = sale.final_amount || sale.total_amount || sale.amount || 0
        console.log('Sale amount:', amount, 'from sale:', sale)
        return sum + amount
      }, 0)
      
      // Calculate average order value (AOV)
      // This tells us how much customers spend on average per transaction
      const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0
      
      // Calculate inventory value
      // This is the total value of all products currently in stock
      const inventoryValue = products.reduce((sum: number, product: any) => 
        sum + ((product.current_stock || 0) * (product.selling_price || 0)), 0)
      
      // Calculate stock alerts
      // Low stock: products with stock above 0 but below minimum threshold
      const lowStockItems = products.filter((p: any) => (p.current_stock || 0) > 0 && (p.current_stock || 0) <= (p.min_stock_level || 0)).length
      // Out of stock: products with zero stock
      const outOfStockItems = products.filter((p: any) => (p.current_stock || 0) === 0).length

      console.log('Calculated KPIs:', { totalRevenue, averageOrderValue, totalSales: sales.length })

      // Update the store state with calculated KPIs
      this.kpis = {
        totalRevenue,
        averageOrderValue,
        totalSales: sales.length,
        totalCustomers: customers.length,
        inventoryValue,
        lowStockItems,
        outOfStockItems
      }
    },

    /**
     * Calculate top selling products
     * 
     * This method identifies the best-performing products by:
     * 1. Filtering products that have sales (quantity sold > 0)
     * 2. Sorting by sales volume in descending order
     * 3. Taking the top 5 products
     * 4. Calculating revenue for each product
     * 
     * @param {any[]} products - Array of product records with sales data
     */
    calculateTopProducts(products: any[]) {
      console.log('Calculating top products from:', products.length, 'products')
      console.log('Sample product data:', products[0])
      
      // Filter products with sales and sort by sales volume (descending)
      const topProducts = products
        .filter((p: any) => (p.sales || p.total_sold || 0) > 0) // Only products with sales
        .sort((a: any, b: any) => (b.sales || b.total_sold || 0) - (a.sales || a.total_sold || 0))
        .slice(0, 5) // Take top 5 products
        .map((product: any) => ({
          id: product.id,
          name: product.name || product.designation || 'Unknown Product',
          sales: product.sales || product.total_sold || 0,
          revenue: (product.sales || product.total_sold || 0) * (product.selling_price || product.prix_vente || 0),
          quantity_sold: product.sales || product.total_sold || 0
        }))

      console.log('Top products calculated:', topProducts)
      this.topProducts = topProducts
    },

    /**
     * Calculate customer segments based on purchase frequency
     * 
     * This method categorizes customers into segments based on how often they make purchases:
     * - New: Customers who have never made a purchase (0 purchases)
     * - Occasional: Customers with 1-4 purchases
     * - Regular: Customers with 5-9 purchases
     * - VIP: Customers with 10+ purchases
     * 
     * @param {any[]} customers - Array of customer records
     * @param {any[]} sales - Array of sales records
     */
    calculateCustomerSegments(customers: any[], sales: any[]) {
      // Group customers by purchase frequency
      // Count how many times each customer has made a purchase
      const customerSales: { [key: number]: number } = {}
      sales.forEach((sale: any) => {
        if (sale.customer_id) {
          customerSales[sale.customer_id] = (customerSales[sale.customer_id] || 0) + 1
        }
      })

      // Categorize customers based on purchase frequency
      const segments = {
        'New': 0,        // 0 purchases
        'Regular': 0,    // 5-9 purchases
        'VIP': 0,        // 10+ purchases
        'Occasional': 0  // 1-4 purchases
      }

      customers.forEach((customer: any) => {
        const purchaseCount = customerSales[customer.id] || 0
        if (purchaseCount === 0) {
          segments['New']++
        } else if (purchaseCount >= 10) {
          segments['VIP']++
        } else if (purchaseCount >= 5) {
          segments['Regular']++
        } else {
          segments['Occasional']++
        }
      })

      // Calculate percentages for each segment
      const totalCustomers = customers.length
      this.customerSegments = Object.entries(segments).map(([segment, count]) => ({
        segment,
        count,
        percentage: totalCustomers > 0 ? Math.round((count / totalCustomers) * 100) : 0
      }))
    },

    /**
     * Generate sales chart data for the last 7 days
     * 
     * This method creates data for visualizing sales trends over time:
     * 1. Creates an array of the last 7 days
     * 2. Groups sales by date
     * 3. Calculates daily sales count and revenue
     * 4. Returns data suitable for chart visualization
     * 
     * @param {any[]} sales - Array of sales records
     */
    generateSalesChartData(sales: any[]) {
      console.log('Generating sales chart data from:', sales.length, 'sales')
      
      // Generate array of the last 7 days in YYYY-MM-DD format
      const last7Days: string[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        last7Days.push(date.toISOString().split('T')[0])
      }

      // Group sales by date and calculate daily metrics
      const salesByDate: { [key: string]: { sales: number; revenue: number } } = {}
      sales.forEach((sale: any) => {
        const saleDate = sale.created_at ? sale.created_at.split('T')[0] : null
        console.log('Processing sale date:', saleDate, 'from sale:', sale)
        
        // Only include sales from the last 7 days
        if (saleDate && last7Days.includes(saleDate)) {
          if (!salesByDate[saleDate]) {
            salesByDate[saleDate] = { sales: 0, revenue: 0 }
          }
          salesByDate[saleDate].sales++
          salesByDate[saleDate].revenue += sale.final_amount || sale.total_amount || sale.amount || 0
        }
      })

      // Create chart data array with all 7 days (including days with no sales)
      this.salesChartData = last7Days.map(date => ({
        date,
        sales: salesByDate[date]?.sales || 0,
        revenue: salesByDate[date]?.revenue || 0
      }))
      
      console.log('Generated sales chart data:', this.salesChartData)
    },

    /**
     * Generate revenue trend data for advanced analytics
     * 
     * This method creates revenue trend data showing:
     * - Daily, weekly, and monthly revenue patterns
     * - Growth percentages between periods
     * - Trend analysis for business insights
     * 
     * @param {any[]} sales - Array of sales records
     */
    generateRevenueTrendData(sales: any[]) {
      console.log('Generating revenue trend data from:', sales.length, 'sales')
      
      // Group sales by different time periods
      const dailyRevenue: { [key: string]: number } = {}
      const weeklyRevenue: { [key: string]: number } = {}
      const monthlyRevenue: { [key: string]: number } = {}
      
      sales.forEach((sale: any) => {
        const saleDate = new Date(sale.created_at)
        const dayKey = saleDate.toISOString().split('T')[0]
        const weekKey = this.getWeekKey(saleDate)
        const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`
        
        const amount = sale.final_amount || sale.total_amount || sale.amount || 0
        
        dailyRevenue[dayKey] = (dailyRevenue[dayKey] || 0) + amount
        weeklyRevenue[weekKey] = (weeklyRevenue[weekKey] || 0) + amount
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + amount
      })
      
      // Create trend data with growth calculations
      this.revenueTrendData = [
        {
          period: 'Daily',
          revenue: Object.values(dailyRevenue).reduce((sum, val) => sum + val, 0),
          growth: this.calculateGrowthRate(Object.values(dailyRevenue))
        },
        {
          period: 'Weekly',
          revenue: Object.values(weeklyRevenue).reduce((sum, val) => sum + val, 0),
          growth: this.calculateGrowthRate(Object.values(weeklyRevenue))
        },
        {
          period: 'Monthly',
          revenue: Object.values(monthlyRevenue).reduce((sum, val) => sum + val, 0),
          growth: this.calculateGrowthRate(Object.values(monthlyRevenue))
        }
      ]
      
      console.log('Generated revenue trend data:', this.revenueTrendData)
    },

    /**
     * Generate product performance data for advanced analytics
     * 
     * This method creates detailed product performance metrics including:
     * - Sales volume and revenue per product
     * - Profit margins and stock levels
     * - Category performance analysis
     * 
     * @param {any[]} products - Array of product records
     */
    generateProductPerformanceData(products: any[]) {
      console.log('Generating product performance data from:', products.length, 'products')
      
      this.productPerformanceData = products
        .filter((product: any) => (product.sales || product.total_sold || 0) > 0)
        .map((product: any) => {
          const sales = product.sales || product.total_sold || 0
          const sellingPrice = product.selling_price || product.prix_vente || 0
          const purchasePrice = product.purchase_price || 0
          const revenue = sales * sellingPrice
          const profit = sales * (sellingPrice - purchasePrice)
          
          return {
            id: product.id,
            name: product.name || product.designation || 'Unknown Product',
            sales: sales,
            revenue: revenue,
            profit: profit,
            stock: product.current_stock || 0,
            category: product.category_name || 'Uncategorized'
          }
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10) // Top 10 products
      
      console.log('Generated product performance data:', this.productPerformanceData)
    },

    /**
     * Generate customer analytics data for advanced insights
     * 
     * This method creates detailed customer behavior analytics including:
     * - Spending patterns by segment
     * - Average spending per customer
     * - Repeat purchase rates
     * 
     * @param {any[]} customers - Array of customer records
     * @param {any[]} sales - Array of sales records
     */
    generateCustomerAnalyticsData(customers: any[], sales: any[]) {
      console.log('Generating customer analytics data from:', customers.length, 'customers')
      
      // Group sales by customer
      const customerSales: { [key: number]: any[] } = {}
      sales.forEach((sale: any) => {
        if (sale.customer_id) {
          if (!customerSales[sale.customer_id]) {
            customerSales[sale.customer_id] = []
          }
          customerSales[sale.customer_id].push(sale)
        }
      })
      
      // Calculate analytics for each segment
      const segments = ['New', 'Occasional', 'Regular', 'VIP']
      this.customerAnalyticsData = segments.map(segment => {
        const segmentCustomers = customers.filter((customer: any) => {
          const purchaseCount = customerSales[customer.id]?.length || 0
          if (segment === 'New') return purchaseCount === 0
          if (segment === 'Occasional') return purchaseCount >= 1 && purchaseCount <= 4
          if (segment === 'Regular') return purchaseCount >= 5 && purchaseCount <= 9
          if (segment === 'VIP') return purchaseCount >= 10
          return false
        })
        
        const totalSpent = segmentCustomers.reduce((sum, customer) => {
          const customerSalesData = customerSales[customer.id] || []
          return sum + customerSalesData.reduce((salesSum, sale) => 
            salesSum + (sale.final_amount || sale.total_amount || sale.amount || 0), 0)
        }, 0)
        
        const averageSpent = segmentCustomers.length > 0 ? totalSpent / segmentCustomers.length : 0
        const repeatRate = segment === 'New' ? 0 : 
          (segmentCustomers.filter(c => (customerSales[c.id]?.length || 0) > 1).length / segmentCustomers.length) * 100
        
        return {
          segment,
          count: segmentCustomers.length,
          totalSpent,
          averageSpent,
          repeatRate
        }
      })
      
      console.log('Generated customer analytics data:', this.customerAnalyticsData)
    },

    /**
     * Generate inventory insights data for advanced analytics
     * 
     * This method creates inventory performance insights including:
     * - Category-wise inventory value
     * - Turnover rates by category
     * - Stock alert analysis
     * 
     * @param {any[]} products - Array of product records
     */
    generateInventoryInsightsData(products: any[]) {
      console.log('Generating inventory insights data from:', products.length, 'products')
      
      // Group products by category
      const categoryData: { [key: string]: any[] } = {}
      products.forEach((product: any) => {
        const category = product.category_name || 'Uncategorized'
        if (!categoryData[category]) {
          categoryData[category] = []
        }
        categoryData[category].push(product)
      })
      
      this.inventoryInsightsData = Object.entries(categoryData).map(([category, categoryProducts]) => {
        const totalValue = categoryProducts.reduce((sum, product) => 
          sum + ((product.current_stock || 0) * (product.selling_price || product.prix_vente || 0)), 0)
        
        const lowStockCount = categoryProducts.filter((p: any) => 
          (p.current_stock || 0) > 0 && (p.current_stock || 0) <= (p.min_stock_level || 0)).length
        
        const outOfStockCount = categoryProducts.filter((p: any) => 
          (p.current_stock || 0) === 0).length
        
        // Calculate turnover rate (simplified)
        const totalSales = categoryProducts.reduce((sum, product) => 
          sum + (product.sales || product.total_sold || 0), 0)
        const averageStock = categoryProducts.reduce((sum, product) => 
          sum + (product.current_stock || 0), 0) / categoryProducts.length
        const turnoverRate = averageStock > 0 ? totalSales / averageStock : 0
        
        return {
          category,
          totalValue,
          turnoverRate,
          lowStockCount,
          outOfStockCount
        }
      }).sort((a, b) => b.totalValue - a.totalValue)
      
      console.log('Generated inventory insights data:', this.inventoryInsightsData)
    },

    /**
     * Helper method to get week key for grouping
     * @param {Date} date - Date to get week key for
     * @returns {string} Week key in YYYY-WW format
     */
    getWeekKey(date: Date): string {
      const year = date.getFullYear()
      const week = this.getWeekNumber(date)
      return `${year}-W${String(week).padStart(2, '0')}`
    },

    /**
     * Helper method to get week number
     * @param {Date} date - Date to get week number for
     * @returns {number} Week number
     */
    getWeekNumber(date: Date): number {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
    },

    /**
     * Helper method to calculate growth rate
     * @param {number[]} values - Array of values to calculate growth for
     * @returns {number} Growth rate percentage
     */
    calculateGrowthRate(values: number[]): number {
      if (values.length < 2) return 0
      const current = values[values.length - 1]
      const previous = values[values.length - 2]
      return previous > 0 ? ((current - previous) / previous) * 100 : 0
    }
  }
}) 