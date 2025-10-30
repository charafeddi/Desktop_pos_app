<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSalesStore } from '@/stores/sales.store'
import { useCustomerStore } from '@/stores/Customers.store'
import { useReturnsStore } from '@/stores/returns.store'
import { useI18n } from 'vue-i18n'
import { exportSales } from '@/utils/exportUtils'
import ReceiptPreview from '@/components/printer/ReceiptPreview.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useToast } from '@/utils/toastManager'
import { useErrorHandler } from '@/utils/errorHandler'
import { formatCurrency } from '@/utils/currency'

const { t } = useI18n()
const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()
const { handleNetworkError, handleDatabaseError, handleValidationError, handleBusinessLogicError } = useErrorHandler()
const router = useRouter()

const salesStore = useSalesStore()
const customerStore = useCustomerStore()
const returnsStore = useReturnsStore()

const sales = computed(() => salesStore.getSales)
const customers = computed(() => customerStore.getCustomers)
const loading = computed(() => salesStore.loading)

// Unique values for filter dropdowns
const uniqueCustomers = computed(() => {
  const customerMap = new Map()
  sales.value.forEach(sale => {
    if (sale.customer_id) {
      const customer = customers.value.find(c => c.id === sale.customer_id)
      if (customer) {
        customerMap.set(customer.id, {
          id: customer.id,
          name: customer.name
        })
      }
    }
  })
  return Array.from(customerMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (customerFilter.value) count++
  if (paymentMethodFilter.value) count++
  if (statusFilter.value) count++
  if (amountRangeFilter.value) count++
  if (dateRangeFilter.value) count++
  return count
})

// Advanced search and filter implementation
const filteredSales = computed(() => {
  if (!Array.isArray(sales.value) || sales.value.length === 0) {
    return []
  }
  
  let filtered = [...sales.value]
  
  // Text search - search in sale number, invoice number, customer name, payment method
  if (searchQuery.value && searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(sale => {
      const saleNumber = (sale.sale_number || sale.invoice_number || `#${sale.id}`).toLowerCase()
      const customerName = getCustomerName(sale.customer_id).toLowerCase()
      const paymentMethod = (sale.payment_method || '').toLowerCase()
      const status = getSaleStatusText(sale.sale_status, sale.id).toLowerCase()
      const amount = (sale.final_amount || sale.total_amount || 0).toString()
      
      return saleNumber.includes(query) ||
             customerName.includes(query) ||
             paymentMethod.includes(query) ||
             status.includes(query) ||
             amount.includes(query)
    })
  }
  
  // Customer filter
  if (customerFilter.value && customerFilter.value !== '') {
    filtered = filtered.filter(sale => 
      sale.customer_id && sale.customer_id.toString() === customerFilter.value
    )
  }
  
  // Payment method filter
  if (paymentMethodFilter.value && paymentMethodFilter.value !== '') {
    filtered = filtered.filter(sale => 
      sale.payment_method === paymentMethodFilter.value
    )
  }
  
  // Status filter
  if (statusFilter.value && statusFilter.value !== '') {
    filtered = filtered.filter(sale => {
      const status = getSaleStatusText(sale.sale_status, sale.id)
      return status === statusFilter.value
    })
  }
  
  // Amount range filter
  if (amountRangeFilter.value && amountRangeFilter.value !== '') {
    filtered = filtered.filter(sale => {
      const amount = Number(sale.final_amount || sale.total_amount) || 0
      
      switch (amountRangeFilter.value) {
        case 'low':
          return amount < 50
        case 'medium':
          return amount >= 50 && amount < 200
        case 'high':
          return amount >= 200 && amount < 500
        case 'premium':
          return amount >= 500
        default:
          return true
      }
    })
  }
  
  // Date range filter
  if (dateRangeFilter.value && dateRangeFilter.value !== '') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    filtered = filtered.filter(sale => {
      const saleDate = new Date(sale.created_at)
      
      switch (dateRangeFilter.value) {
        case 'today':
          return saleDate >= today
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return saleDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return saleDate >= monthAgo
        case 'quarter':
          const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
          return saleDate >= quarterAgo
        case 'year':
          const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
          return saleDate >= yearAgo
        default:
          return true
      }
    })
  }
  
  // Sort sales
  if (sortBy.value && sortBy.value !== '') {
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy.value) {
        case 'date':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'customer':
          aValue = getCustomerName(a.customer_id).toLowerCase()
          bValue = getCustomerName(b.customer_id).toLowerCase()
          break
        case 'amount':
          aValue = Number(a.final_amount || a.total_amount) || 0
          bValue = Number(b.final_amount || b.total_amount) || 0
          break
        case 'payment':
          aValue = (a.payment_method || '').toLowerCase()
          bValue = (b.payment_method || '').toLowerCase()
          break
        case 'status':
          aValue = getSaleStatusText(a.sale_status, a.id).toLowerCase()
          bValue = getSaleStatusText(b.sale_status, b.id).toLowerCase()
          break
        default:
          return 0
      }
      
      if (sortOrder.value === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })
  }
  
  return filtered
})

// State for dropdown menus
const activeDropdown = ref(null)
const selectedSale = ref(null)
const showSaleDetailsModal = ref(false)
const returnedSales = ref(new Set())
const showExportDropdown = ref(false)

// Receipt preview state
const showReceiptPreview = ref(false)
const currentReceiptText = ref('')
const currentSaleData = ref(null)
const currentCustomer = ref(null)
const currentCashier = ref(null)

// Loading states
const isLoading = ref(false)
const isDeletingSale = ref(false)
const isExporting = ref(false)
const isLoadingReturns = ref(false)
const isPrintingReceipt = ref(false)
const isPreviewingReceipt = ref(false)

// Confirmation dialog state
const showDeleteConfirm = ref(false)
const saleToDelete = ref(null)

// Search and filter variables
const searchQuery = ref('')
const customerFilter = ref('')
const paymentMethodFilter = ref('')
const statusFilter = ref('')
const amountRangeFilter = ref('')
const dateRangeFilter = ref('')
const sortBy = ref('date')
const sortOrder = ref('desc')
const showAdvancedFilters = ref(false)

// Helper methods
const getLoadingMessage = () => {
  if (isLoading.value) return 'Loading sales...'
  if (isDeletingSale.value) return 'Deleting sale...'
  if (isExporting.value) return 'Exporting data...'
  if (isLoadingReturns.value) return 'Loading returns...'
  if (isPrintingReceipt.value) return 'Printing receipt...'
  if (isPreviewingReceipt.value) return 'Generating preview...'
  return 'Processing...'
}

const confirmDelete = async () => {
  if (saleToDelete.value) {
    await deleteSale(saleToDelete.value)
  }
  showDeleteConfirm.value = false
  saleToDelete.value = null
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  saleToDelete.value = null
}

// Show delete confirmation
const showDeleteConfirmation = (sale) => {
  saleToDelete.value = sale
  showDeleteConfirm.value = true
}

// Clear all filters method
const clearAllFilters = () => {
  searchQuery.value = ''
  customerFilter.value = ''
  paymentMethodFilter.value = ''
  statusFilter.value = ''
  amountRangeFilter.value = ''
  dateRangeFilter.value = ''
  sortBy.value = 'date'
  sortOrder.value = 'desc'
  showAdvancedFilters.value = false
  
  showInfo('Filters Cleared', 'All search and filter options have been reset')
}

// Handle search input key events
const handleSearchKeydown = (event) => {
  if (event.key === 'Enter') {
    // Focus on first result or show advanced filters
    if (filteredSales.value.length === 0) {
      showAdvancedFilters.value = true
    }
  } else if (event.key === 'Escape') {
    searchQuery.value = ''
    showAdvancedFilters.value = false
  }
}

// Load data on mount
onMounted(async () => {
  try {
    isLoading.value = true
    showInfo('Loading Sales', 'Fetching sales data...')
    
    await salesStore.fetchSales()
    await customerStore.fetchCustomers()
    await loadReturnedSales()
    
    showSuccess('Sales Loaded', 'Sales data loaded successfully')
    
  } catch (error) {
    handleNetworkError(error, 'Sales Data Loading')
    showError('Loading Failed', 'Failed to load sales data. Please refresh the page.')
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  // Cleanup if needed
})

// Load returned sales to track which sales have been returned
const loadReturnedSales = async () => {
  try {
    isLoadingReturns.value = true
    showInfo('Loading Returns', 'Fetching return data...')
    
    await returnsStore.fetchReturns()
    const returns = returnsStore.getReturns
    const returnedSaleIds = new Set(returns.map(returnItem => returnItem.sale_id))
    returnedSales.value = returnedSaleIds
    
    showSuccess('Returns Loaded', `Found ${returns.length} returns`)
    
  } catch (error) {
    handleNetworkError(error, 'Returns Loading')
    showError('Loading Failed', 'Failed to load return data. Some features may not work correctly.')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Returns Loading Failed', 'Could not load return data')
    }
  } finally {
    isLoadingReturns.value = false
  }
}

// Check if a sale has been returned
const isSaleReturned = (saleId) => {
  return returnedSales.value.has(saleId)
}

// Toggle dropdown menu
function toggleDropdown(saleId) {
  activeDropdown.value = activeDropdown.value === saleId ? null : saleId
}

// Close dropdown when clicking outside
function closeDropdown() {
  activeDropdown.value = null
}

// Get customer name by ID
function getCustomerName(customerId) {
  if (!customerId) return 'Walk-in Customer'
  const customer = customers.value.find(c => c.id === customerId)
  return customer ? customer.name : 'Unknown Customer'
}

// Using centralized formatCurrency from currency.ts

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get payment method badge color
function getPaymentMethodColor(method) {
  switch (method.toLowerCase()) {
    case 'cash':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
    case 'card':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
    case 'mobile':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
}

// Get sale status color
function getSaleStatusColor(status, saleId) {
  if (isSaleReturned(saleId)) {
    return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
  }
  
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
    case 'cancelled':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
}

// Get sale status text
function getSaleStatusText(status, saleId) {
  if (isSaleReturned(saleId)) {
    return 'Returned'
  }
  return status || 'completed'
}

// View sale details
async function viewSaleDetails(saleId) {
  try {
    showInfo('Loading Sale Details', 'Fetching sale information...')
    
    selectedSale.value = await salesStore.getSaleById(saleId)
    showSaleDetailsModal.value = true
    closeDropdown()
    
    showSuccess('Sale Details Loaded', 'Sale details loaded successfully')
    
  } catch (error) {
    handleNetworkError(error, 'Sale Details Loading')
    showError('Loading Failed', 'Failed to load sale details. Please try again.')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Sale Details Loading Failed', 'Could not load sale details')
    }
  }
}

// Print receipt
async function printReceipt(sale) {
  try {
    isPrintingReceipt.value = true
    showInfo('Printing Receipt', 'Generating receipt for printing...')
    
    // Fetch sale details and items
    const saleDetails = await window.electronAPI.sales.getById(sale.id)
    const saleItems = await window.electronAPI.sales.getItems(sale.id)
    
    if (!saleDetails) {
      handleBusinessLogicError(new Error('Sale not found'), 'Receipt Printing')
      showError('Sale Not Found', 'Sale details could not be found')
      return
    }
    
    // Fetch customer details if exists
    let customer = null
    if (saleDetails.customer_id) {
      customer = await window.electronAPI.customers.getByID(saleDetails.customer_id)
    }
    
    // Generate receipt content using our receipt utility
    const { createReceiptFromSale } = await import('@/utils/receiptUtils')
    
    // Prepare sale data for receipt generation
    const saleData = {
      ...saleDetails,
      items: saleItems.map(item => ({
        product_name: item.product_name || 'Unknown Product',
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount || 0,
        tax_rate: item.tax_rate || 0
      })),
      company_name: 'My POS Store',
      company_address: '123 Main St, City, Country',
      company_phone: '123-456-7890',
      tax_rate: 10
    }
    
    // Create receipt instance using the factory function
    const receipt = createReceiptFromSale(saleData, customer, { name: 'Current User' })
    
    // Generate receipt text
    const receiptText = receipt.generateTextReceipt()
    
    // Print the receipt
    const printResult = await window.electronAPI.print.printReceipt(receiptText, '')
    
    if (printResult.success) {
      showSuccess('Receipt Printed', 'Receipt has been sent to printer successfully')
      
      // Add notification
      if (window.addNotification) {
        window.addNotification('success', 'Receipt Printed', 'Receipt sent to printer')
      }
    } else {
      handleBusinessLogicError(new Error(printResult.message || 'Print failed'), 'Receipt Printing')
      showError('Print Failed', printResult.message || 'Failed to print receipt')
    }
    
  } catch (error) {
    handleNetworkError(error, 'Receipt Printing')
    showError('Print Error', 'An error occurred while printing the receipt. Please try again.')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Print Failed', 'Could not print receipt')
    }
  } finally {
    isPrintingReceipt.value = false
    closeDropdown()
  }
}

// Preview receipt
async function previewReceipt(sale) {
  try {
    isPreviewingReceipt.value = true
    showInfo('Generating Preview', 'Creating receipt preview...')
    
    // Fetch sale details and items
    const saleDetails = await window.electronAPI.sales.getById(sale.id)
    const saleItems = await window.electronAPI.sales.getItems(sale.id)
    
    if (!saleDetails) {
      handleBusinessLogicError(new Error('Sale not found'), 'Receipt Preview')
      showError('Sale Not Found', 'Sale details could not be found')
      return
    }
    
    // Fetch customer details if exists
    let customer = null
    if (saleDetails.customer_id) {
      customer = await window.electronAPI.customers.getByID(saleDetails.customer_id)
    }
    
    // Generate receipt content using our receipt utility
    const { createReceiptFromSale } = await import('@/utils/receiptUtils')
    
    // Prepare sale data for receipt generation
    const saleData = {
      ...saleDetails,
      items: saleItems.map(item => ({
        product_name: item.product_name || 'Unknown Product',
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount || 0,
        tax_rate: item.tax_rate || 0
      })),
      company_name: 'My POS Store',
      company_address: '123 Main St, City, Country',
      company_phone: '123-456-7890',
      tax_rate: 10
    }
    
    // Create receipt instance using the factory function
    const receipt = createReceiptFromSale(saleData, customer, { name: 'Current User' })
    
    // Generate receipt text
    const receiptText = receipt.generateTextReceipt()
    
    // Show receipt preview
    showReceiptPreview.value = true
    currentReceiptText.value = receiptText
    currentSaleData.value = {
      ...saleDetails,
      items: saleItems.map(item => ({
        product_id: item.product_id,
        name: item.product_name || 'Unknown Product',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: item.total_amount,
        tax_rate: item.tax_rate || 0,
        discount_amount: item.discount_amount || 0
      }))
    }
    currentCustomer.value = customer
    currentCashier.value = { name: 'Current User' }
    
    showSuccess('Preview Generated', 'Receipt preview generated successfully')
    
  } catch (error) {
    handleNetworkError(error, 'Receipt Preview')
    showError('Preview Error', 'An error occurred while generating the preview. Please try again.')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Preview Failed', 'Could not generate receipt preview')
    }
  } finally {
    isPreviewingReceipt.value = false
    closeDropdown()
  }
}

// Refund sale
function refundSale(sale) {
  if (isSaleReturned(sale.id)) {
    alert('This sale has already been returned.')
    closeDropdown()
    return
  }
  
  if (confirm(`Are you sure you want to refund sale #${sale.sale_number || sale.id}?`)) {
    // Navigate to returns page with the selected sale
    router.push({
      name: 'Returns',
      query: { saleId: sale.id }
    })
    closeDropdown()
  }
}

// Delete sale
async function deleteSale(sale) {
  try {
    isDeletingSale.value = true
    
    const saleName = sale.sale_number || `Sale #${sale.id}`
    
    showInfo('Deleting Sale', `Removing ${saleName}...`)
    
    await salesStore.deleteSale(sale.id)
    
    showSuccess('Sale Deleted', `${saleName} has been deleted successfully`)
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Sale Deleted', `${saleName} has been removed`)
    }
    
  } catch (error) {
    if (error.message?.includes('foreign key') || error.message?.includes('constraint')) {
      handleDatabaseError(error, 'Sale Deletion')
      showError('Cannot Delete Sale', 'This sale has associated records and cannot be deleted')
    } else {
      handleNetworkError(error, 'Sale Deletion')
      showError('Delete Failed', 'Failed to delete sale. Please try again.')
    }
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Delete Failed', 'Could not delete sale')
    }
  } finally {
    isDeletingSale.value = false
    closeDropdown()
  }
}

// Export sales
async function exportSalesData(format) {
  try {
    isExporting.value = true
    showInfo('Exporting Data', `Preparing ${format.toUpperCase()} export...`)
    
    if (!sales.value || sales.value.length === 0) {
      handleBusinessLogicError(new Error('No sales to export'), 'Sales Export')
      showWarning('No Data', 'There are no sales to export')
      return
    }
    
    const success = await exportSales(sales.value, customers.value, format)
    
    if (success) {
      showSuccess('Export Complete', `Sales exported successfully as ${format.toUpperCase()}`)
      
      // Add notification
      if (window.addNotification) {
        window.addNotification('success', 'Export Complete', `${sales.value.length} sales exported as ${format.toUpperCase()}`)
      }
    } else {
      handleBusinessLogicError(new Error('Export operation failed'), 'Sales Export')
      showError('Export Failed', 'Failed to export sales data')
    }
    
  } catch (error) {
    handleNetworkError(error, 'Sales Export')
    showError('Export Error', 'An error occurred while exporting data. Please try again.')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Export Failed', 'Could not export sales')
    }
  } finally {
    isExporting.value = false
    showExportDropdown.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ t('sales.sales_history') }}</h1>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/pos"
              class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
              {{ t('sales.add_sale') }}
            </router-link>

            <div class="relative">
              <button
                @click="showExportDropdown = !showExportDropdown"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                {{ t('sales.export_sales') }}
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Export Dropdown -->
            <div
              v-if="showExportDropdown"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700"
            >
              <div class="py-1">
                <button
                  @click="exportSalesData('csv'); showExportDropdown = false"
                  class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  {{ t('sales.export_as_csv') }}
                </button>
                <button
                  @click="exportSalesData('pdf'); showExportDropdown = false"
                  class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  {{ t('sales.export_as_pdf') }}
                </button>
              </div>
            </div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('sales.total_sales') }}: {{ sales.length }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div class="flex flex-col gap-4">
        <!-- Main Search Bar -->
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Search Sales</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                @keydown="handleSearchKeydown"
                type="text"
                placeholder="Search by sale number, customer, payment method, status, or amount..."
                class="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <button 
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              >
                <span class="material-icons-outlined text-sm">clear</span>
              </button>
            </div>
          </div>
          
          <!-- Filter Controls -->
          <div class="flex gap-2 items-end">
            <button 
              @click="showAdvancedFilters = !showAdvancedFilters"
              class="btn btn-secondary rounded-lg px-4 py-3 hover:bg-gray-500 flex items-center"
            >
              <span class="material-icons-outlined">tune</span>
              Filters
              <span v-if="activeFiltersCount > 0" class="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {{ activeFiltersCount }}
              </span>
            </button>
            <button 
              @click="clearAllFilters"
              class="btn btn-secondary rounded-lg px-4 py-3 hover:bg-gray-500 flex items-center"
            >
              <span class="material-icons-outlined">clear_all</span>
              Clear
            </button>
          </div>
        </div>
        
        <!-- Advanced Filters Panel -->
        <div v-if="showAdvancedFilters" class="border-t pt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Customer Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
              <select v-model="customerFilter" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Customers</option>
                <option v-for="customer in uniqueCustomers" :key="customer.id" :value="customer.id">{{ customer.name }}</option>
              </select>
            </div>
            
            <!-- Payment Method Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select v-model="paymentMethodFilter" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Payment Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="credit">Credit</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select v-model="statusFilter" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="returned">Returned</option>
                <option value="refunded">Refunded</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <!-- Amount Range Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Range</label>
              <select v-model="amountRangeFilter" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Amounts</option>
                <option value="low">Under $50</option>
                <option value="medium">$50 - $200</option>
                <option value="high">$200 - $500</option>
                <option value="premium">Over $500</option>
              </select>
            </div>
            
            <!-- Date Range Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
              <select v-model="dateRangeFilter" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          
          <!-- Sort Options -->
          <div class="mt-4 flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div class="flex gap-2">
                <select v-model="sortBy" class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="date">Date</option>
                  <option value="customer">Customer</option>
                  <option value="amount">Amount</option>
                  <option value="payment">Payment Method</option>
                  <option value="status">Status</option>
                </select>
                <button 
                  @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
                  class="btn btn-secondary rounded-lg px-4 py-2 hover:bg-gray-500 flex items-center"
                >
                  <span class="material-icons-outlined">
                    {{ sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </span>
                  {{ sortOrder === 'asc' ? 'Ascending' : 'Descending' }}
                </button>
              </div>
            </div>
            
            <!-- Results Count -->
            <div class="flex items-end">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ filteredSales.length }} of {{ sales.length }} sales
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales List -->
    <div class="p-6">
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="filteredSales.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {{ activeFiltersCount > 0 ? 'No sales match your search criteria' : t('sales.no_sales_found') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ activeFiltersCount > 0 ? 'Try adjusting your filters or search terms' : t('sales.start_making_sales_to_see_them_here') }}
        </p>
      </div>

      <div v-else class="rounded-lg shadow overflow-hidden relative">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 relative">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('sales.sale_number') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('sales.customer') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('sales.date') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('sales.items') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('sales.total') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('sales.payment') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('sales.status') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('sales.actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="sale in filteredSales" :key="sale.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ sale.sale_number || sale.invoice_number || `#${sale.id}` }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-gray-100">
                    {{ getCustomerName(sale.customer_id) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-gray-100">
                    {{ formatDate(sale.created_at) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-gray-100">
                    {{ sale.item_count || 'N/A' }} items
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ formatCurrency(sale.final_amount || sale.total_amount) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getPaymentMethodColor(sale.payment_method)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ sale.payment_method }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getSaleStatusColor(sale.sale_status, sale.id)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getSaleStatusText(sale.sale_status, sale.id) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <div class="relative z-50">
                    <button
                      @click="toggleDropdown(sale.id)"
                      class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                      </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <div
                      v-if="activeDropdown === sale.id"
                      class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700"
                    >
                      <div class="py-1">
                        <button
                          @click="viewSaleDetails(sale.id)"
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          {{ t('sales.view_details') }}
                        </button>
                        <button
                          @click="printReceipt(sale)"
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                          </svg>
                          {{ t('sales.print_receipt') }}
                        </button>
                        <button
                          @click="previewReceipt(sale)"
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          Preview Receipt
                        </button>
                        <button
                          v-if="!isSaleReturned(sale.id)"
                          @click="refundSale(sale)"
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                          </svg>
                          {{ t('sales.refund_sale') }}
                        </button>
                        <div
                          v-else
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        >
                          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                          </svg>
                          {{ t('sales.already_returned') }}
                        </div>
                        <hr class="my-1 border-gray-200 dark:border-gray-700">
                        <button
                          @click="showDeleteConfirmation(sale)"
                          class="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          {{ t('sales.delete_sale') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Sale Details Modal -->
    <div v-if="showSaleDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showSaleDetailsModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-xl" @click.stop>
      
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Sale Details - {{ selectedSale?.sale_number || selectedSale?.invoice_number || `#${selectedSale?.id}` }}
          </h3>
          <button
            @click="showSaleDetailsModal = false"
            class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

    

        <div v-if="selectedSale" class="space-y-6">
          <!-- Sale Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">Sale Information</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Sale Number:</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ selectedSale.sale_number || selectedSale.invoice_number || `#${selectedSale.id}` }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Date:</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatDate(selectedSale.created_at) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Customer:</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ getCustomerName(selectedSale.customer_id) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ selectedSale.payment_method }}</span>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">{{ t('sales.financial_summary') }} </h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ t('sales.subtotal') }}:</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(selectedSale.total_amount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ t('sales.tax') }}:</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(selectedSale.tax_amount || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ t('sales.discount') }}:</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(selectedSale.discount_amount || 0) }}</span>
                </div>
                <div class="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2">
                  <span class="text-gray-900 dark:text-gray-100 font-medium">{{ t('sales.total') }}:</span>
                  <span class="font-bold text-lg text-gray-900 dark:text-gray-100">{{ formatCurrency(selectedSale.final_amount || selectedSale.total_amount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sale Items -->
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">{{ t('sales.sale_items') }}</h4>
            <div v-if="selectedSale.items && selectedSale.items.length > 0" class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-300 dark:border-gray-600">
                    <th class="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Product</th>
                    <th class="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Quantity</th>
                    <th class="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Unit Price</th>
                    <th class="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Tax Rate</th>
                    <th class="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedSale.items" :key="item.id" class="border-b border-gray-200 dark:border-gray-700">
                    <td class="py-2 text-sm text-gray-900 dark:text-gray-100">{{ item.product_name || `Product #${item.product_id}` }}</td>
                    <td class="py-2 text-sm text-gray-900 dark:text-gray-100">{{ item.quantity }}</td>
                    <td class="py-2 text-sm text-gray-900 dark:text-gray-100">{{ formatCurrency(item.unit_price) }}</td>
                    <td class="py-2 text-sm text-gray-900 dark:text-gray-100">{{ item.tax_rate || 0 }}%</td>
                    <td class="py-2 text-sm font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(item.total_amount) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <p>No items found for this sale</p>
              <p class="text-sm mt-2">Items: {{ selectedSale.items ? selectedSale.items.length : 'Not loaded' }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-500 dark:text-gray-400">Loading sale details...</p>
        </div>
      </div>
    </div>

    <!-- Click outside to close dropdown -->
    <div v-if="activeDropdown" class="fixed inset-0 z-40" @click="closeDropdown"></div>

    <!-- Receipt Preview Modal -->
    <ReceiptPreview
      v-if="showReceiptPreview"
      :receipt-text="currentReceiptText"
      :sale-data="currentSaleData"
      :customer="currentCustomer"
      :cashier="currentCashier"
      @close="showReceiptPreview = false"
    />
    
    <!-- Loading Spinner -->
    <LoadingSpinner 
      v-if="isLoading || isDeletingSale || isExporting || isLoadingReturns || isPrintingReceipt || isPreviewingReceipt"
      :message="getLoadingMessage()"
      :fullscreen="true"
    />
    
    <!-- Confirmation Dialog for Delete -->
    <ConfirmationDialog
      :is-open="showDeleteConfirm"
      :title="'Delete Sale'"
      :message="`Are you sure you want to delete ${saleToDelete?.sale_number || `Sale #${saleToDelete?.id || 'this sale'}`}? This action cannot be undone.`"
      :type="'error'"
      :confirm-text="'Delete'"
      :cancel-text="'Cancel'"
      :is-loading="isDeletingSale"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.btn {
  @apply transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600;
}
</style>
