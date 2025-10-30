import { defineStore } from 'pinia'
import { electronAPI } from '@/utils/electronAPI'

/**
 * Return Item Interface
 * Represents an item being returned
 * 
 * @interface ReturnItem
 * @property {number} sale_item_id - ID of the original sale item
 * @property {number} product_id - ID of the product being returned
 * @property {number} quantity - Quantity being returned
 * @property {number} unit_price - Unit price of the item
 * @property {number} discount_amount - Discount amount applied
 * @property {number} tax_amount - Tax amount
 * @property {number} total_amount - Total amount for this item
 */
interface ReturnItem {
  sale_item_id: number
  product_id: number
  quantity: number
  unit_price: number
  discount_amount: number
  tax_amount: number
  total_amount: number
}

/**
 * Return Data Interface
 * Represents a return transaction
 * 
 * @interface ReturnData
 * @property {number} sale_id - ID of the original sale
 * @property {number} customer_id - ID of the customer
 * @property {number} user_id - ID of the user processing the return
 * @property {number} total_amount - Total return amount
 * @property {number} discount_amount - Total discount amount
 * @property {number} tax_amount - Total tax amount
 * @property {number} final_amount - Final return amount
 * @property {string} reason - Reason for the return
 * @property {ReturnItem[]} items - Items being returned
 */
interface ReturnData {
  sale_id: number
  customer_id: number
  user_id: number
  total_amount: number
  discount_amount: number
  tax_amount: number
  final_amount: number
  reason: string
  items: ReturnItem[]
}

/**
 * Return State Interface
 * Represents the state of the returns store
 * 
 * @interface ReturnState
 * @property {any[]} returns - List of returns
 * @property {any[]} returnItems - List of return items
 * @property {any} selectedReturn - Currently selected return
 * @property {any} selectedSale - Currently selected sale for return
 * @property {any[]} saleItems - Items from the selected sale
 * @property {boolean} loading - Loading state
 * @property {string | null} error - Error message
 */
interface ReturnState {
  returns: any[]
  returnItems: any[]
  selectedReturn: any
  selectedSale: any
  saleItems: any[]
  loading: boolean
  error: string | null
}

/**
 * Returns Store
 * 
 * This store manages all return/refund functionality including:
 * - Creating new returns
 * - Viewing return history
 * - Processing refunds
 * - Managing return items
 * 
 * The store handles the complete return workflow from selecting
 * items to return to processing the refund and updating inventory.
 */
export const useReturnsStore = defineStore('returns', {
  /**
   * Initial state of the returns store
   */
  state: (): ReturnState => ({
    returns: [],
    returnItems: [],
    selectedReturn: null,
    selectedSale: null,
    saleItems: [],
    loading: false,
    error: null
  }),

  /**
   * Getters - Computed properties that return state data
   */
  getters: {
    getReturns: (state) => state.returns,
    getReturnItems: (state) => state.returnItems,
    getSelectedReturn: (state) => state.selectedReturn,
    getSelectedSale: (state) => state.selectedSale,
    getSaleItems: (state) => state.saleItems,
    getLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    /**
     * Get returns count
     */
    getReturnsCount: (state) => state.returns.length,
    
    /**
     * Get total return amount
     */
    getTotalReturnAmount: (state) => 
      state.returns.reduce((sum, returnItem) => sum + (returnItem.final_amount || 0), 0),
    
    /**
     * Get returns by date range
     */
    getReturnsByDateRange: (state) => (startDate: string, endDate: string) => {
      return state.returns.filter(returnItem => {
        const returnDate = new Date(returnItem.created_at)
        return returnDate >= new Date(startDate) && returnDate <= new Date(endDate)
      })
    }
  },

  /**
   * Actions - Methods that modify the store state
   */
  actions: {
    /**
     * Fetch all returns from the backend
     */
    async fetchReturns() {
      this.loading = true
      this.error = null
      
      try {
                const returns = await electronAPI.returns.getAll()
        this.returns = returns || []
      } catch (error) {
        console.error('Error fetching returns:', error)
        this.error = 'Failed to load returns'
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch return by ID
     * @param {number} id - Return ID
     */
    async fetchReturnById(id: number) {
      this.loading = true
      this.error = null
      
      try {
        const returnData = await window.electronAPI.returns.getById(id)
        this.selectedReturn = returnData
        return returnData
      } catch (error) {
        console.error('Error fetching return:', error)
        this.error = 'Failed to load return'
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch return items by return ID
     * @param {number} returnId - Return ID
     */
    async fetchReturnItems(returnId: number) {
      this.loading = true
      this.error = null
      
      try {
        const items = await window.electronAPI.returns.getItems(returnId)
        this.returnItems = items || []
        return items
      } catch (error) {
        console.error('Error fetching return items:', error)
        this.error = 'Failed to load return items'
        return []
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch returns by sale ID
     * @param {number} saleId - Sale ID
     */
    async fetchReturnsBySale(saleId: number) {
      this.loading = true
      this.error = null
      
      try {
        const returns = await window.electronAPI.returns.getBySale(saleId)
        return returns || []
      } catch (error) {
        console.error('Error fetching returns by sale:', error)
        this.error = 'Failed to load returns for sale'
        return []
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch returns by customer ID
     * @param {number} customerId - Customer ID
     */
    async fetchReturnsByCustomer(customerId: number) {
      this.loading = true
      this.error = null
      
      try {
        const returns = await window.electronAPI.returns.getByCustomer(customerId)
        return returns || []
      } catch (error) {
        console.error('Error fetching returns by customer:', error)
        this.error = 'Failed to load returns for customer'
        return []
      } finally {
        this.loading = false
      }
    },

    /**
     * Search returns with various criteria
     * @param {object} searchParams - Search parameters
     */
    async searchReturns(searchParams: any) {
      this.loading = true
      this.error = null
      
      try {
        const returns = await window.electronAPI.returns.search(searchParams)
        this.returns = returns || []
        return returns || []
      } catch (error) {
        console.error('Error searching returns:', error)
        this.error = 'Failed to search returns'
        return []
      } finally {
        this.loading = false
      }
    },

    /**
     * Create a new return
     * @param {ReturnData} returnData - Return data
     */
    async createReturn(returnData: ReturnData) {
      this.loading = true
      this.error = null
      
      try {
        const newReturn = await window.electronAPI.returns.create(returnData)
        
        // Refresh returns list
        await this.fetchReturns()
        
        return newReturn
      } catch (error) {
        console.error('Error creating return:', error)
        this.error = 'Failed to create return'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update an existing return
     * @param {number} id - Return ID
     * @param {Partial<ReturnData>} returnData - Updated return data
     */
    async updateReturn(id: number, returnData: Partial<ReturnData>) {
      this.loading = true
      this.error = null
      
      try {
        const updatedReturn = await window.electronAPI.returns.update(id, returnData)
        
        // Refresh returns list
        await this.fetchReturns()
        
        return updatedReturn
      } catch (error) {
        console.error('Error updating return:', error)
        this.error = 'Failed to update return'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete a return
     * @param {number} id - Return ID
     */
    async deleteReturn(id: number) {
      this.loading = true
      this.error = null
      
      try {
        await window.electronAPI.returns.delete(id)
        
        // Refresh returns list
        await this.fetchReturns()
        
        return true
      } catch (error) {
        console.error('Error deleting return:', error)
        this.error = 'Failed to delete return'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Set selected sale for return processing
     * @param {any} sale - Sale data
     */
    setSelectedSale(sale: any) {
      this.selectedSale = sale
    },

    /**
     * Set sale items for return processing
     * @param {any[]} items - Sale items
     */
    setSaleItems(items: any[]) {
      this.saleItems = items
    },

    /**
     * Clear selected data
     */
    clearSelection() {
      this.selectedReturn = null
      this.selectedSale = null
      this.saleItems = []
    },

    /**
     * Calculate return totals
     * @param {ReturnItem[]} items - Return items
     * @returns {object} Calculated totals
     */
    calculateReturnTotals(items: ReturnItem[]) {
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
      const totalDiscount = items.reduce((sum, item) => sum + (item.discount_amount || 0), 0)
      const totalTax = items.reduce((sum, item) => sum + (item.tax_amount || 0), 0)
      const finalAmount = subtotal - totalDiscount + totalTax

      return {
        subtotal,
        totalDiscount,
        totalTax,
        finalAmount
      }
    },

    /**
     * Validate return data
     * @param {ReturnData} returnData - Return data to validate
     * @returns {object} Validation result
     */
    validateReturnData(returnData: ReturnData) {
      const errors: string[] = []

      if (!returnData.sale_id) {
        errors.push('Sale ID is required')
      }

      if (!returnData.customer_id) {
        errors.push('Customer ID is required')
      }

      if (!returnData.user_id) {
        errors.push('User ID is required')
      }

      if (!returnData.items || returnData.items.length === 0) {
        errors.push('At least one item must be returned')
      }

      if (!returnData.reason || returnData.reason.trim() === '') {
        errors.push('Return reason is required')
      }

      // Validate each item
      returnData.items.forEach((item, index) => {
        if (!item.product_id) {
          errors.push(`Item ${index + 1}: Product ID is required`)
        }

        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`)
        }

        if (!item.unit_price || item.unit_price < 0) {
          errors.push(`Item ${index + 1}: Unit price must be valid`)
        }
      })

      return {
        isValid: errors.length === 0,
        errors
      }
    }
  }
})
