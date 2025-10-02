<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSalesStore } from '@/stores/sales.store'
import { useCustomerStore } from '@/stores/Customers.store'
import { useReturnsStore } from '@/stores/returns.store'
import { useI18n } from 'vue-i18n'
import { exportSales } from '@/utils/exportUtils'

const { t } = useI18n()
const router = useRouter()

const salesStore = useSalesStore()
const customerStore = useCustomerStore()
const returnsStore = useReturnsStore()

const sales = computed(() => salesStore.getSales)
const customers = computed(() => customerStore.getCustomers)
const loading = computed(() => salesStore.loading)

// State for dropdown menus
const activeDropdown = ref(null)
const selectedSale = ref(null)
const showSaleDetailsModal = ref(false)
const returnedSales = ref(new Set())
const showExportDropdown = ref(false)

// Load data on mount
onMounted(async () => {
  await salesStore.fetchSales()
  await customerStore.fetchCustomers()
  await loadReturnedSales()
})

// Load returned sales to track which sales have been returned
const loadReturnedSales = async () => {
  try {
    await returnsStore.fetchReturns()
    const returns = returnsStore.getReturns
    const returnedSaleIds = new Set(returns.map(returnItem => returnItem.sale_id))
    returnedSales.value = returnedSaleIds
  } catch (error) {
    console.error('Error loading returned sales:', error)
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

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

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
      return 'bg-green-100 text-green-800'
    case 'card':
      return 'bg-blue-100 text-blue-800'
    case 'mobile':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get sale status color
function getSaleStatusColor(status, saleId) {
  if (isSaleReturned(saleId)) {
    return 'bg-orange-100 text-orange-800'
  }
  
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
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
    console.log('Fetching sale details for ID:', saleId)
    selectedSale.value = await salesStore.getSaleById(saleId)
    console.log('Selected sale data:', selectedSale.value)
    showSaleDetailsModal.value = true
    closeDropdown()
  } catch (error) {
    console.error('Error fetching sale details:', error)
    alert('Error loading sale details')
  }
}

// Print receipt
function printReceipt(sale) {
  // TODO: Implement print functionality
  console.log('Print receipt for sale:', sale.id)
  closeDropdown()
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
  if (confirm(`Are you sure you want to delete sale #${sale.sale_number || sale.id}? This action cannot be undone.`)) {
    try {
      await salesStore.deleteSale(sale.id)
      closeDropdown()
    } catch (error) {
      console.error('Error deleting sale:', error)
      alert('Error deleting sale')
    }
  }
}

// Export sales
async function exportSalesData(format) {
  try {
    console.log('Export button clicked, format:', format)
    console.log('Sales data:', sales.value)
    console.log('Customers data:', customers.value)
    
    const success = await exportSales(sales.value, customers.value, format)
    console.log('Export result:', success)
    
    if (success) {
      alert(`Sales data exported successfully as ${format.toUpperCase()}`)
    } else {
      alert('Failed to export sales data')
    }
  } catch (error) {
    console.error('Export error:', error)
    console.error('Export error stack:', error.stack)
    alert(`Error exporting sales data: ${error.message}`)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="shadow-sm border-b">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">Sales History</h1>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/pos"
              class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
              Add Sale
            </router-link>

            <div class="relative">
              <button
                @click="showExportDropdown = !showExportDropdown"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                Export Sales
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Export Dropdown -->
              <div
                v-if="showExportDropdown"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
              >
                <div class="py-1">
                  <button
                    @click="exportSalesData('csv'); showExportDropdown = false"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Export as CSV
                  </button>
                  <button
                    @click="exportSalesData('pdf'); showExportDropdown = false"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    Export as PDF
                  </button>
                </div>
              </div>
            </div>
            <div class="text-sm text-gray-600">
              Total Sales: {{ sales.length }}
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

      <div v-else-if="sales.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
        <p class="text-gray-500">Start making sales to see them here.</p>
      </div>

      <div v-else class="rounded-lg shadow overflow-hidden relative">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 relative">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale #
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="sale in sales" :key="sale.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ sale.sale_number || sale.invoice_number || `#${sale.id}` }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ getCustomerName(sale.customer_id) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ formatDate(sale.created_at) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ sale.item_count || 'N/A' }} items
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
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
                      class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                      </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <div
                      v-if="activeDropdown === sale.id"
                      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                    >
                      <div class="py-1">
                        <button
                          @click="viewSaleDetails(sale.id)"
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          View Details
                        </button>
                        <button
                          @click="printReceipt(sale)"
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                          </svg>
                          Print Receipt
                        </button>
                        <button
                          v-if="!isSaleReturned(sale.id)"
                          @click="refundSale(sale)"
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                          </svg>
                          Refund Sale
                        </button>
                        <div
                          v-else
                          class="flex items-center w-full px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                        >
                          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                          </svg>
                          Already Returned
                        </div>
                        <hr class="my-1">
                        <button
                          @click="deleteSale(sale)"
                          class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Delete Sale
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
      <div class="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
      
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-900">
            Sale Details - {{ selectedSale?.sale_number || selectedSale?.invoice_number || `#${selectedSale?.id}` }}
          </h3>
          <button
            @click="showSaleDetailsModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

    

        <div v-if="selectedSale" class="space-y-6">
          <!-- Sale Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Sale Information</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Sale Number:</span>
                  <span class="font-medium text-gray-900">{{ selectedSale.sale_number || selectedSale.invoice_number || `#${selectedSale.id}` }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Date:</span>
                  <span class="font-medium text-gray-900">{{ formatDate(selectedSale.created_at) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Customer:</span>
                  <span class="font-medium text-gray-900">{{ getCustomerName(selectedSale.customer_id) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Payment Method:</span>
                  <span class="font-medium text-gray-900">{{ selectedSale.payment_method }}</span>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Financial Summary</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="font-medium text-gray-900">{{ formatCurrency(selectedSale.total_amount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Tax:</span>
                  <span class="font-medium text-gray-900">{{ formatCurrency(selectedSale.tax_amount || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Discount:</span>
                  <span class="font-medium text-gray-900">{{ formatCurrency(selectedSale.discount_amount || 0) }}</span>
                </div>
                <div class="flex justify-between border-t pt-2">
                  <span class="text-gray-900 font-medium">Total:</span>
                  <span class="font-bold text-lg text-gray-900">{{ formatCurrency(selectedSale.final_amount || selectedSale.total_amount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sale Items -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-3">Sale Items</h4>
            <div v-if="selectedSale.items && selectedSale.items.length > 0" class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b">
                    <th class="text-left py-2 text-sm font-medium text-gray-600">Product</th>
                    <th class="text-left py-2 text-sm font-medium text-gray-600">Quantity</th>
                    <th class="text-left py-2 text-sm font-medium text-gray-600">Unit Price</th>
                    <th class="text-left py-2 text-sm font-medium text-gray-600">Tax Rate</th>
                    <th class="text-left py-2 text-sm font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedSale.items" :key="item.id" class="border-b">
                    <td class="py-2 text-sm text-gray-900">{{ item.product_name || `Product #${item.product_id}` }}</td>
                    <td class="py-2 text-sm text-gray-900">{{ item.quantity }}</td>
                    <td class="py-2 text-sm text-gray-900">{{ formatCurrency(item.unit_price) }}</td>
                    <td class="py-2 text-sm text-gray-900">{{ item.tax_rate || 0 }}%</td>
                    <td class="py-2 text-sm font-medium text-gray-900">{{ formatCurrency(item.total_amount) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <p>No items found for this sale</p>
              <p class="text-sm mt-2">Items: {{ selectedSale.items ? selectedSale.items.length : 'Not loaded' }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-500">Loading sale details...</p>
        </div>
      </div>
    </div>

    <!-- Click outside to close dropdown -->
    <div v-if="activeDropdown" class="fixed inset-0 z-40" @click="closeDropdown"></div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
