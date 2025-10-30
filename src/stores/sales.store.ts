import { defineStore } from 'pinia'
import { electronAPI } from '@/utils/electronAPI'

interface SaleItem {
    id?: number
    product_id: number
    quantity: number
    unit_price: number
    tax_rate?: number
    discount_amount?: number
    tax_amount?: number
    total_amount: number
}

interface Sale {
    id?: number
    customer_id?: number
    user_id?: number
    total_amount: number
    discount_amount?: number
    tax_amount?: number
    final_amount: number
    payment_method: string
    items: SaleItem[]
    created_at?: string
    updated_at?: string
    customer_name?: string
    user_name?: string
    item_count?: number
}

interface SaleState {
    sales: Sale[]
    currentSale: Sale | null
    loading: boolean
    error: string | null
    // Performance optimization properties
    lastFetchTime: number | null
    cacheExpiry: number
    salesByDateCache: Map<string, Sale[]>
    salesByCustomerCache: Map<number, Sale[]>
}

export const useSalesStore = defineStore('sales', {
    state: (): SaleState => ({
        sales: [],
        currentSale: null,
        loading: false,
        error: null,
        // Performance optimization properties
        lastFetchTime: null,
        cacheExpiry: 120000, // 2 minutes cache expiry
        salesByDateCache: new Map(),
        salesByCustomerCache: new Map()
    }),
    getters: {
        getSales: (state) => state.sales,
        getCurrentSale: (state) => state.currentSale,
        getSalesByDate: (state) => (date: string) => {
            // Check cache first
            if (state.salesByDateCache.has(date)) {
                return state.salesByDateCache.get(date)!
            }
            
            // Compute result
            const sales = state.sales.filter(sale => 
                sale.created_at && sale.created_at.startsWith(date)
            )
            
            // Cache the result
            state.salesByDateCache.set(date, sales)
            return sales
        },
        getTotalSalesAmount: (state) => {
            return state.sales.reduce((total, sale) => total + sale.final_amount, 0)
        },
        getSalesCount: (state) => state.sales.length,
    },
    actions: {
        async fetchSales(forceRefresh = false) {
            // Check if we should refresh based on cache
            const now = Date.now()
            const shouldRefresh = forceRefresh || 
                                !this.lastFetchTime || 
                                (now - this.lastFetchTime) > this.cacheExpiry
            
            if (!shouldRefresh) {
                return
            }

            this.loading = true
            this.error = null
            try {
                console.log('Fetching sales...')
                const sales = await electronAPI.sales.getAll()
                console.log('Sales fetched:', sales)
                this.sales = sales
                this.lastFetchTime = now
                
                // Clear caches when sales are updated
                this.clearSalesCache()
            } catch (error: any) {
                console.error('Error fetching sales:', error)
                this.error = error?.message || 'Failed to fetch sales'
            } finally {
                this.loading = false
            }
        },

        async createSale(saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) {
            this.loading = true
            this.error = null
            try {
                console.log('Creating sale with data:', saleData)
                
                // Transform the sale data to match backend expectations
                const transformedData = {
                    customer_id: saleData.customer_id || null,
                    user_id: saleData.user_id || 1, // Default user ID, should be from auth
                    total_amount: saleData.total_amount,
                    discount_amount: saleData.discount_amount || 0,
                    tax_amount: saleData.tax_amount || 0,
                    final_amount: saleData.final_amount,
                    payment_method: saleData.payment_method,
                    items: saleData.items.map(item => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        discount_amount: item.discount_amount || 0,
                        tax_amount: item.tax_amount || 0,
                        total_amount: item.total_amount
                    }))
                }

                const newSale = await window.electronAPI.sales.create(transformedData)
                console.log('Sale created successfully:', newSale)
                
                // Refresh sales list
                await this.fetchSales()
                
                return newSale
            } catch (error: any) {
                console.error('Error creating sale:', error)
                this.error = error?.message || 'Failed to create sale'
                throw error
            } finally {
                this.loading = false
            }
        },

        async getSaleById(id: number) {
            this.loading = true
            this.error = null
            try {
                console.log('Fetching sale by ID:', id)
                const sale = await window.electronAPI.sales.getById(id)
                console.log('Sale data from backend:', sale)
                this.currentSale = sale
                
                // Fetch sale items if not included
                if (sale && !sale.items) {
                    try {
                        console.log('Fetching sale items for sale ID:', id)
                        const items = await window.electronAPI.sales.getItems(id)
                        console.log('Sale items from backend:', items)
                        sale.items = items
                    } catch (itemError) {
                        console.warn('Could not fetch sale items:', itemError)
                        sale.items = []
                    }
                }
                
                console.log('Final sale data with items:', sale)
                return sale
            } catch (error: any) {
                console.error('Error fetching sale:', error)
                this.error = error?.message || 'Failed to fetch sale'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateSale(id: number, saleData: Partial<Sale>) {
            this.loading = true
            this.error = null
            try {
                const result = await window.electronAPI.sales.update(id, saleData)
                const index = this.sales.findIndex(s => s.id === id)
                if (index !== -1) {
                    this.sales[index] = { ...this.sales[index], ...saleData }
                }
                return result
            } catch (error: any) {
                console.error('Error updating sale:', error)
                this.error = error?.message || 'Failed to update sale'
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteSale(id: number) {
            this.loading = true
            this.error = null
            try {
                await window.electronAPI.sales.delete(id)
                this.sales = this.sales.filter(s => s.id !== id)
            } catch (error: any) {
                console.error('Error deleting sale:', error)
                this.error = error?.message || 'Failed to delete sale'
                throw error
            } finally {
                this.loading = false
            }
        },

        // Helper method to calculate sale totals
        calculateSaleTotals(items: SaleItem[], discountPercentage: number = 0) {
            const subtotal = items.reduce((total, item) => {
                const itemTotal = item.unit_price * item.quantity
                return total + itemTotal
            }, 0)

            const discountAmount = subtotal * (discountPercentage / 100)
            const taxAmount = (subtotal - discountAmount) * 0.1 // Assuming 10% tax rate
            const finalAmount = subtotal - discountAmount + taxAmount

            return {
                subtotal,
                discountAmount,
                taxAmount,
                finalAmount
            }
        },

        // Helper method to transform cart items to sale items
        transformCartToSaleItems(cartItems: any[]): SaleItem[] {
            return cartItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.customPrice || item.selling_price,
                tax_rate: item.tax_rate || 10, // Default 10% tax rate
                discount_amount: item.discount ? (item.customPrice || item.selling_price) * item.quantity * (item.discount / 100) : 0,
                tax_amount: (item.customPrice || item.selling_price) * item.quantity * ((item.tax_rate || 10) / 100),
                total_amount: (item.customPrice || item.selling_price) * item.quantity
            }))
        },

        /**
         * Clear sales caches to force fresh computation
         */
        clearSalesCache(): void {
            this.salesByDateCache.clear()
            this.salesByCustomerCache.clear()
        },

        /**
         * Clear all caches and force refresh
         */
        clearAllCaches(): void {
            this.clearSalesCache()
            this.lastFetchTime = null
        }
    }
})

export default useSalesStore
