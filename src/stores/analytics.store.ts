import { defineStore } from 'pinia'
import { electronAPI } from '@/utils/electronAPI'

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
  topCategory: string
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
  returns?: number
  return_rate?: number
}

/**
 * Most Returned Product Interface
 * Represents a product with its return data
 * 
 * @interface MostReturnedProduct
 * @property {number} id - Unique product identifier
 * @property {string} name - Product name
 * @property {number} returns - Number of times this product was returned
 * @property {number} quantity_returned - Total quantity of this product returned
 * @property {number} return_rate - Percentage of sales that were returned
 */
interface MostReturnedProduct {
  id: number
  name: string
  returns: number
  quantity_returned: number
  return_rate: number
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
  mostReturnedProducts: MostReturnedProduct[]
  customerSegments: CustomerSegment[]
  salesChartData: SalesChartData[]
  revenueTrendData: RevenueTrendData[]
  productPerformanceData: ProductPerformanceData[]
  customerAnalyticsData: CustomerAnalyticsData[]
  inventoryInsightsData: InventoryInsightsData[]
  topCategory: string
  loading: boolean
  error: string | null
  // Performance optimization properties
  lastFetchTime: number | null
  dataCache: {
    salesData: any[] | null
    productsData: any[] | null
    customersData: any[] | null
    returnsData: any[] | null
    timestamp: number | null
  }
  cacheExpiry: number
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
      outOfStockItems: 0,    // Products with no stock
      topCategory: 'No Sales' // Top selling category
    },
    topProducts: [],          // Best-selling products
    mostReturnedProducts: [], // Most returned products
    customerSegments: [],     // Customer categories
    salesChartData: [],       // Daily sales data
    revenueTrendData: [],     // Revenue trend analysis
    productPerformanceData: [], // Product performance metrics
    customerAnalyticsData: [], // Customer behavior analytics
    inventoryInsightsData: [], // Inventory insights
    topCategory: 'No Sales',  // Top selling category
    loading: false,           // Loading state
    error: null,              // Error message
    // Performance optimization properties
    lastFetchTime: null,
    dataCache: {
      salesData: null,
      productsData: null,
      customersData: null,
      returnsData: null,
      timestamp: null
    },
    cacheExpiry: 300000 // 5 minutes cache expiry
  }),

  /**
   * Getters - Computed properties that return state data
   * These provide easy access to the store's state
   */
  getters: {
    getKPIs: (state) => state.kpis,
    getTopProducts: (state) => state.topProducts,
    getMostReturnedProducts: (state) => state.mostReturnedProducts,
    getCustomerSegments: (state) => state.customerSegments,
    getSalesChartData: (state) => state.salesChartData,
    getRevenueTrendData: (state) => state.revenueTrendData,
    getProductPerformanceData: (state) => state.productPerformanceData,
    getCustomerAnalyticsData: (state) => state.customerAnalyticsData,
    getInventoryInsightsData: (state) => state.inventoryInsightsData,
    getTopCategory: (state) => state.topCategory,
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
    async fetchAnalyticsData(forceRefresh = false) {
      // Check cache validity
      const now = Date.now()
      const cacheValid = this.dataCache.timestamp && 
                       (now - this.dataCache.timestamp) < this.cacheExpiry
      
      // Skip loading if we have valid cached data and no force refresh
      if (!forceRefresh && cacheValid) {
        return
      }

      this.loading = true
      this.error = null
      
      try {
        // Fetch all analytics data in parallel for better performance
        const [salesData, productsData, customersData, returnsData] = await Promise.all([
          this.fetchSalesData(),
          this.fetchProductsData(),
          this.fetchCustomersData(),
          this.fetchReturnsData()
        ])

        // Cache the fetched data
        this.dataCache.salesData = salesData
        this.dataCache.productsData = productsData
        this.dataCache.customersData = customersData
        this.dataCache.returnsData = returnsData
        this.dataCache.timestamp = now

        // Calculate all analytics metrics
        this.calculateKPIs(salesData, productsData, customersData)
        this.calculateTopProducts(productsData)
        this.calculateMostReturnedProducts(returnsData, productsData)
        this.calculateCustomerSegments(customersData, salesData)
        this.generateSalesChartData(salesData)
        
        // Calculate advanced analytics
        this.generateRevenueTrendData(salesData)
        this.generateProductPerformanceData(productsData)
        this.generateCustomerAnalyticsData(customersData, salesData)
        this.generateInventoryInsightsData(productsData)
        
        // Calculate top category
        this.topCategory = this.calculateTopCategory(productsData, salesData)

        // Update last fetch time
        this.lastFetchTime = now

      } catch (error) {
        console.error('Error fetching analytics data:', error)
        this.error = 'Failed to load analytics data'
      } finally {
        this.loading = false
      }
    },

    /**
     * Clear analytics cache
     */
    clearAnalyticsCache(): void {
      this.dataCache = {
        salesData: null,
        productsData: null,
        customersData: null,
        returnsData: null,
        timestamp: null
      }
      this.lastFetchTime = null
    },

    /**
     * Fetch sales data from the backend
     * @returns {Promise<any[]>} Array of sales records
     */
    async fetchSalesData() {
      try {
        const sales = await electronAPI.sales.getAll()
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
        // Use getAll to get all products for inventory calculation
        console.log('=== FETCHING PRODUCTS DATA ===')
        const products = await electronAPI.products.getAll()
        console.log('Raw products data from backend:', products)
        console.log('Number of products:', products?.length || 0)
        if (products && products.length > 0) {
          console.log('Sample product fields:', Object.keys(products[0]))
          console.log('Sample product data:', products[0])
        }
        console.log('================================')
        return products || []
      } catch (error) {
        console.error('Error fetching products data:', error)
        return []
      }
    },

    /**
     * Fetch returns data from the backend
     * @returns {Promise<any[]>} Array of return records
     */
    async fetchReturnsData() {
      try {
        console.log('=== FETCHING RETURNS DATA ===')
        const returns = await electronAPI.returns.getAll()
        console.log('Raw returns data from backend:', returns)
        console.log('Number of returns:', returns?.length || 0)
        console.log('================================')
        return returns || []
      } catch (error) {
        console.error('Error fetching returns data:', error)
        return []
      }
    },

    /**
     * Calculate most returned products
     * 
     * @param {any[]} returns - Array of return records
     * @param {any[]} products - Array of product records
     */
    calculateMostReturnedProducts(returns: any[], products: any[]) {
      console.log('Calculating most returned products from:', returns.length, 'returns')
      
      // Group returns by product
      const productReturns: { [key: number]: { returns: number, quantity_returned: number, sales: number } } = {}
      
      returns.forEach(returnItem => {
        if (returnItem.items && Array.isArray(returnItem.items)) {
          returnItem.items.forEach((item: any) => {
            const productId = item.product_id
            if (!productReturns[productId]) {
              productReturns[productId] = { returns: 0, quantity_returned: 0, sales: 0 }
            }
            productReturns[productId].returns += 1
            productReturns[productId].quantity_returned += item.quantity || 0
          })
        }
      })
      
      // Get sales data for each product
      products.forEach(product => {
        if (productReturns[product.id]) {
          productReturns[product.id].sales = product.sales || product.total_sold || 0
        }
      })
      
      // Calculate most returned products
      const mostReturned = Object.entries(productReturns)
        .map(([productId, data]) => {
          const product = products.find(p => p.id === parseInt(productId))
          if (!product) return null
          
          const returnRate = data.sales > 0 ? (data.quantity_returned / data.sales) * 100 : 0
          
          return {
            id: product.id,
            name: product.name || 'Unknown Product',
            returns: data.returns,
            quantity_returned: data.quantity_returned,
            return_rate: Math.round(returnRate * 100) / 100 // Round to 2 decimal places
          }
        })
        .filter(item => item !== null)
        .sort((a, b) => b!.returns - a!.returns)
        .slice(0, 5) // Top 5 most returned products
      
      console.log('Most returned products calculated:', mostReturned)
      this.mostReturnedProducts = mostReturned as MostReturnedProduct[]
    },

    /**
     * Fetch customers data from the backend
     * @returns {Promise<any[]>} Array of customer records
     */
    async fetchCustomersData() {
      try {
        const customers = await electronAPI.customers.getAll()
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
      // This is the total cost value of all products currently in stock
      
      const inventoryValue = products.reduce((sum: number, product: any) => {
        const stock = product.current_stock || 0
        // Use purchase_price if available, otherwise fall back to selling_price
        const price = product.purchase_price || 0
        const itemValue = stock * price
        return sum + itemValue
      }, 0)
        
        // Additional debugging - check if we have any products with stock
        const productsWithStock = products.filter(p => (p.current_stock || 0) > 0)
        console.log('Products with stock > 0:', productsWithStock.length)
        productsWithStock.forEach(p => {
          console.log(`- ${p.name}: stock=${p.current_stock}, purchase_price=${p.purchase_price}, selling_price=${p.selling_price}`)
        })
      
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
        outOfStockItems,
        topCategory: this.topCategory
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
     * Calculate top category by sales volume
     * 
     * @param {any[]} products - Array of product records
     * @param {any[]} sales - Array of sales records
     */
    calculateTopCategory(products: any[], sales: any[]) {
      // Group products by category and calculate total sales
      const categorySales: { [key: string]: number } = {}
      const categoryCounts: { [key: string]: number } = {}
      
      products.forEach(product => {
        const category = product.category_name || product.category_id || 'Uncategorized'
        
        // Count products per category
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
        
        // Count sales per category (if product has sales data)
        const productSales = product.sales || product.total_sold || 0
        categorySales[category] = (categorySales[category] || 0) + productSales
      })
      
      // Find the category with the highest sales, or if no sales, highest product count
      const totalSales = Object.values(categorySales).reduce((sum, val) => sum + val, 0)
      
      if (totalSales > 0) {
        // Use sales data if available
        const topCategory = Object.entries(categorySales)
          .sort(([,a], [,b]) => b - a)[0]
        return topCategory ? topCategory[0] : 'No Sales'
      } else {
        // Fall back to category with most products
        const topCategory = Object.entries(categoryCounts)
          .sort(([,a], [,b]) => b - a)[0]
        return topCategory ? topCategory[0] : 'No Products'
      }
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