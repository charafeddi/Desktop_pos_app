<template>
  <div class="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">{{ t('Returns.title') }}</h1>
        <div class="flex items-center gap-4">
          <div class="relative">
            <button
              @click="showExportDropdown = !showExportDropdown"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export
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
                  @click="exportReturnsData('csv'); showExportDropdown = false"
                  class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Export as CSV
                </button>
                <button
                  @click="exportReturnsData('pdf'); showExportDropdown = false"
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
          <button 
            @click="openCreateReturnModal"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {{ t('Returns.create_return') }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <span class="text-red-400">⚠️</span>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">{{ t('Returns.error_loading_returns') }}</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex flex-col gap-4">
          <!-- Main Search Bar -->
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <div class="relative">
                <input 
                  type="text" 
                  v-model="searchQuery"
                  @keydown="handleSearchKeydown"
                  placeholder="Search returns by ID, customer name, invoice number, reason, or amount..."
                  class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                <span class="material-icons-outlined absolute left-3 top-3 text-gray-400">
                  search
                </span>
                <button 
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <span class="material-icons-outlined text-sm">clear</span>
                </button>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                @click="showAdvancedFilters = !showAdvancedFilters"
                class="btn btn-secondary rounded-lg px-4 py-2 hover:bg-gray-500 flex items-center"
              >
                <span class="material-icons-outlined">tune</span>
                Advanced Filters
                <span v-if="activeFiltersCount > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {{ activeFiltersCount }}
                </span>
              </button>
              <button 
                @click="clearAllFilters"
                class="btn btn-secondary rounded-lg px-4 py-2 hover:bg-gray-500 flex items-center"
              >
                <span class="material-icons-outlined">clear_all</span>
                Clear All
              </button>
            </div>
          </div>
          
          <!-- Advanced Filters Panel -->
          <div v-if="showAdvancedFilters" class="border-t pt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Customer Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select v-model="customerFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">All Customers</option>
                  <option v-for="customer in uniqueCustomers" :key="customer" :value="customer">{{ customer }}</option>
                </select>
              </div>
              
              <!-- Amount Range Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
                <select v-model="amountRangeFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">All Amounts</option>
                  <option value="low">Under $50</option>
                  <option value="medium">$50 - $200</option>
                  <option value="high">$200 - $500</option>
                  <option value="premium">Over $500</option>
                </select>
              </div>
              
              <!-- Date Range Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select v-model="dateRangeFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              
              <!-- Reason Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Return Reason</label>
                <select v-model="reasonFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">All Reasons</option>
                  <option value="defective">Defective Product</option>
                  <option value="wrong_item">Wrong Item</option>
                  <option value="customer_change">Customer Changed Mind</option>
                  <option value="damaged_shipping">Damaged in Shipping</option>
                  <option value="quality_issue">Quality Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <!-- Sort Options -->
            <div class="mt-4 flex flex-col md:flex-row gap-4">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <div class="flex gap-2">
                  <select v-model="sortBy" class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="id">Return ID</option>
                    <option value="customer">Customer</option>
                    <option value="amount">Amount</option>
                    <option value="date">Date</option>
                    <option value="reason">Reason</option>
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
                <div class="text-sm text-gray-600">
                  {{ filteredReturns.length }} of {{ returns.length }} returns
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- Returns List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            {{ t('Returns.returns_history') }}
          </h3>
          
          <div v-if="filteredReturns.length === 0" class="text-center py-8 text-gray-500">
            {{ searchQuery || activeFiltersCount > 0 ? 'No returns match your search criteria' : t('Returns.no_returns_found') }}
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('Returns.return_id') }}
                  </th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('Returns.customer') }}
                  </th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('Returns.sale_invoice') }}
                  </th>
                  <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('Returns.amount') }}
                  </th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('Returns.reason') }}
                  </th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('Returns.date') }}
                  </th>
                  <th class="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('Returns.actions') }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="returnItem in filteredReturns" :key="returnItem.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{{ returnItem.id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ returnItem.customer_name || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ returnItem.sale_invoice_number || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {{ formatCurrency(returnItem.final_amount) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ returnItem.reason || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(returnItem.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      @click="viewReturn(returnItem.id)"
                      class="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      {{ t('Returns.view') }}
                    </button>
                    <button
                      @click="showDeleteConfirmation(returnItem.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      {{ t('Returns.delete') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Create Return Modal -->
      <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">
                {{ t('Returns.create_new_return') }}
              </h3>
              <button @click="closeCreateReturnModal" class="text-gray-400 hover:text-gray-600">
                <span class="sr-only">Close</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="createReturn" class="space-y-4">
              <!-- Sale Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Returns.select_sale') }}
                </label>
                <select 
                  v-model="newReturn.sale_id" 
                  @change="onSaleChange"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">{{ t('Returns.choose_sale') }}</option>
                  <option v-for="sale in availableSales" :key="sale.id" :value="sale.id">
                    #{{ sale.id }} - {{ sale.customer_name }} - {{ formatCurrency(sale.final_amount) }}
                  </option>
                </select>
                <div v-if="availableSales.length === 0" class="mt-2 text-sm text-gray-500">
                  No sales available for return. All sales have already been returned.
                </div>
              </div>

              <!-- Sale Items -->
              <div v-if="selectedSaleItems.length > 0">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Returns.select_items_to_return') }}
                </label>
                <div class="space-y-2 max-h-60 overflow-y-auto">
                  <div v-for="item in selectedSaleItems" :key="item.id" class="border rounded p-3">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <h4 class="font-medium">{{ item.product_name }}</h4>
                        <p class="text-sm text-gray-500">
                          {{ t('Returns.available_quantity') }}: {{ item.quantity }}
                        </p>
                        <p class="text-sm text-gray-500">
                          {{ t('Returns.unit_price') }}: {{ formatCurrency(item.unit_price) }}
                        </p>
                      </div>
                      <div class="flex items-center space-x-2">
                        <input
                          v-model.number="item.return_quantity"
                          type="number"
                          min="0"
                          :max="item.quantity"
                          class="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          @change="updateReturnTotals"
                        />
                        <span class="text-sm text-gray-500">
                          {{ formatCurrency((item.return_quantity || 0) * item.unit_price) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Return Reason -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Returns.return_reason') }}
                </label>
                <textarea
                  v-model="newReturn.reason"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  :placeholder="t('Returns.reason_placeholder')"
                  required
                ></textarea>
              </div>

              <!-- Return Totals -->
              <div v-if="returnTotals.finalAmount > 0" class="bg-gray-50 p-4 rounded-md">
                <h4 class="font-medium text-gray-900 mb-2">{{ t('Returns.return_summary') }}</h4>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span>{{ t('Returns.subtotal') }}:</span>
                    <span>{{ formatCurrency(returnTotals.subtotal) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ t('Returns.discount') }}:</span>
                    <span>-{{ formatCurrency(returnTotals.totalDiscount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ t('Returns.tax') }}:</span>
                    <span>{{ formatCurrency(returnTotals.totalTax) }}</span>
                  </div>
                  <div class="flex justify-between font-medium text-lg border-t pt-2">
                    <span>{{ t('Returns.total_refund') }}:</span>
                    <span class="text-red-600">{{ formatCurrency(returnTotals.finalAmount) }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closeCreateReturnModal"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {{ t('Returns.cancel') }}
                </button>
                <button
                  type="submit"
                  :disabled="returnTotals.finalAmount <= 0"
                  class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ t('Returns.process_return') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Return Details Modal -->
      <div v-if="showDetailsModal && selectedReturn" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">
                {{ t('Returns.return_details') }} #{{ selectedReturn.id }}
              </h3>
              <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
                <span class="sr-only">Close</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <!-- Return Info -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('Returns.customer') }}</label>
                  <p class="text-sm text-gray-900">{{ selectedReturn.customer_name || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('Returns.sale_invoice') }}</label>
                  <p class="text-sm text-gray-900">{{ selectedReturn.sale_invoice_number || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('Returns.date') }}</label>
                  <p class="text-sm text-gray-900">{{ formatDate(selectedReturn.created_at) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('Returns.total_amount') }}</label>
                  <p class="text-sm text-gray-900 font-medium">{{ formatCurrency(selectedReturn.final_amount) }}</p>
                </div>
              </div>

              <!-- Return Reason -->
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ t('Returns.reason') }}</label>
                <p class="text-sm text-gray-900">{{ selectedReturn.reason || 'N/A' }}</p>
              </div>

              <!-- Return Items -->
              <div v-if="returnItems.length > 0">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Returns.returned_items') }}</label>
                <div class="space-y-2">
                  <div v-for="item in returnItems" :key="item.id" class="border rounded p-3">
                    <div class="flex justify-between items-center">
                      <div>
                        <h4 class="font-medium">{{ item.product_name }}</h4>
                        <p class="text-sm text-gray-500">{{ t('Returns.quantity') }}: {{ item.quantity }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-sm text-gray-500">{{ t('Returns.unit_price') }}: {{ formatCurrency(item.unit_price) }}</p>
                        <p class="font-medium">{{ formatCurrency(item.total_amount) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end pt-4">
              <button
                @click="closeDetailsModal"
                class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                {{ t('Returns.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Loading Spinner -->
      <LoadingSpinner 
        v-if="isLoading || isCreatingReturn || isDeletingReturn || isExporting || isLoadingSales"
        :message="getLoadingMessage()"
        :fullscreen="true"
      />
      
      <!-- Confirmation Dialog for Delete -->
      <ConfirmationDialog
        :is-open="showDeleteConfirm"
        :title="'Delete Return'"
        :message="`Are you sure you want to delete Return #${returnToDelete || 'this return'}? This action cannot be undone.`"
        :type="'error'"
        :confirm-text="'Delete'"
        :cancel-text="'Cancel'"
        :is-loading="isDeletingReturn"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useReturnsStore } from '@/stores/returns.store'
import { useSalesStore } from '@/stores/sales.store'
import { useI18n } from 'vue-i18n'
import { exportReturns } from '@/utils/exportUtils'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useToast } from '@/utils/toastManager'
import { useErrorHandler } from '@/utils/errorHandler'

// Composables
const { t } = useI18n()
const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()
const { handleNetworkError, handleDatabaseError, handleValidationError, handleBusinessLogicError } = useErrorHandler()
const route = useRoute()

// Stores
const returnsStore = useReturnsStore()
const salesStore = useSalesStore()

// Reactive Variables
const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const availableSales = ref([])
const selectedSaleItems = ref([])
const showExportDropdown = ref(false)

// Advanced filter variables
const searchQuery = ref('')
const customerFilter = ref('')
const amountRangeFilter = ref('')
const dateRangeFilter = ref('')
const reasonFilter = ref('')
const sortBy = ref('date')
const sortOrder = ref('desc')
const showAdvancedFilters = ref(false)

// Loading states
const isLoading = ref(false)
const isCreatingReturn = ref(false)
const isDeletingReturn = ref(false)
const isExporting = ref(false)
const isLoadingSales = ref(false)

// Confirmation dialog state
const showDeleteConfirm = ref(false)
const returnToDelete = ref(null)

// Helper methods
const getLoadingMessage = () => {
  if (isLoading.value) return 'Loading returns...'
  if (isCreatingReturn.value) return 'Creating return...'
  if (isDeletingReturn.value) return 'Deleting return...'
  if (isExporting.value) return 'Exporting data...'
  if (isLoadingSales.value) return 'Loading sales...'
  return 'Processing...'
}

const confirmDelete = async () => {
  if (returnToDelete.value) {
    await deleteReturn(returnToDelete.value)
  }
  showDeleteConfirm.value = false
  returnToDelete.value = null
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  returnToDelete.value = null
}

// Show delete confirmation
const showDeleteConfirmation = (returnId) => {
  returnToDelete.value = returnId
  showDeleteConfirm.value = true
}


// New return form data
const newReturn = ref({
  sale_id: '',
  customer_id: null,
  user_id: 1, // TODO: Get from auth store
  total_amount: 0,
  discount_amount: 0,
  tax_amount: 0,
  final_amount: 0,
  reason: '',
  items: []
})

// Computed Properties
const returns = computed(() => returnsStore.getReturns)
const returnItems = computed(() => returnsStore.getReturnItems)
const selectedReturn = computed(() => returnsStore.getSelectedReturn)
const loading = computed(() => returnsStore.getLoading)
const error = computed(() => returnsStore.getError)

// Unique values for filter dropdowns
const uniqueCustomers = computed(() => {
  const customers = returns.value
    .map(r => r.customer_name)
    .filter(Boolean)
    .filter((customer, index, arr) => arr.indexOf(customer) === index)
  return customers.sort()
})

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (customerFilter.value) count++
  if (amountRangeFilter.value) count++
  if (dateRangeFilter.value) count++
  if (reasonFilter.value) count++
  return count
})

// Advanced search and filter implementation
const filteredReturns = computed(() => {
  if (!Array.isArray(returns.value) || returns.value.length === 0) {
    return []
  }
  
  let filtered = [...returns.value]
  
  // Text search - search in ID, customer name, invoice number, reason, amount
  if (searchQuery.value && searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(returnItem => {
      const id = returnItem.id.toString()
      const customerName = (returnItem.customer_name || '').toLowerCase()
      const invoiceNumber = (returnItem.sale_invoice_number || '').toLowerCase()
      const reason = (returnItem.reason || '').toLowerCase()
      const amount = returnItem.final_amount.toString()
      
      return id.includes(query) ||
             customerName.includes(query) ||
             invoiceNumber.includes(query) ||
             reason.includes(query) ||
             amount.includes(query)
    })
  }
  
  // Customer filter
  if (customerFilter.value && customerFilter.value !== '') {
    filtered = filtered.filter(returnItem => 
      returnItem.customer_name === customerFilter.value
    )
  }
  
  // Amount range filter
  if (amountRangeFilter.value && amountRangeFilter.value !== '') {
    filtered = filtered.filter(returnItem => {
      const amount = Number(returnItem.final_amount) || 0
      
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
    
    filtered = filtered.filter(returnItem => {
      const returnDate = new Date(returnItem.created_at)
      
      switch (dateRangeFilter.value) {
        case 'today':
          return returnDate >= today
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return returnDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return returnDate >= monthAgo
        case 'quarter':
          const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
          return returnDate >= quarterAgo
        case 'year':
          const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
          return returnDate >= yearAgo
        default:
          return true
      }
    })
  }
  
  // Reason filter
  if (reasonFilter.value && reasonFilter.value !== '') {
    filtered = filtered.filter(returnItem => {
      const reason = (returnItem.reason || '').toLowerCase()
      
      switch (reasonFilter.value) {
        case 'defective':
          return reason.includes('defective') || reason.includes('broken')
        case 'wrong_item':
          return reason.includes('wrong') || reason.includes('incorrect')
        case 'customer_change':
          return reason.includes('change') || reason.includes('mind')
        case 'damaged_shipping':
          return reason.includes('damaged') || reason.includes('shipping')
        case 'quality_issue':
          return reason.includes('quality') || reason.includes('poor')
        case 'other':
          return !reason.includes('defective') && 
                 !reason.includes('wrong') && 
                 !reason.includes('change') && 
                 !reason.includes('damaged') && 
                 !reason.includes('quality')
        default:
          return true
      }
    })
  }
  
  // Sort returns
  if (sortBy.value && sortBy.value !== '') {
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy.value) {
        case 'id':
          aValue = a.id
          bValue = b.id
          break
        case 'customer':
          aValue = (a.customer_name || '').toLowerCase()
          bValue = (b.customer_name || '').toLowerCase()
          break
        case 'amount':
          aValue = Number(a.final_amount) || 0
          bValue = Number(b.final_amount) || 0
          break
        case 'date':
          aValue = new Date(a.created_at || 0)
          bValue = new Date(b.created_at || 0)
          break
        case 'reason':
          aValue = (a.reason || '').toLowerCase()
          bValue = (b.reason || '').toLowerCase()
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

// Return totals
const returnTotals = computed(() => {
  const items = selectedSaleItems.value.filter(item => item.return_quantity > 0)
  return returnsStore.calculateReturnTotals(items.map(item => ({
    sale_item_id: item.id,
    product_id: item.product_id,
    quantity: item.return_quantity,
    unit_price: item.unit_price,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: item.return_quantity * item.unit_price
  })))
})

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Clear all filters method
const clearAllFilters = () => {
  searchQuery.value = ''
  customerFilter.value = ''
  amountRangeFilter.value = ''
  dateRangeFilter.value = ''
  reasonFilter.value = ''
  sortBy.value = 'date'
  sortOrder.value = 'desc'
  showAdvancedFilters.value = false
  
  showInfo('Filters Cleared', 'All search and filter options have been reset')
}

// Handle search input key events
const handleSearchKeydown = (event) => {
  if (event.key === 'Enter') {
    // Focus on first result or show advanced filters
    if (filteredReturns.value.length === 0) {
      showAdvancedFilters.value = true
    }
  } else if (event.key === 'Escape') {
    searchQuery.value = ''
    showAdvancedFilters.value = false
  }
}

const openCreateReturnModal = async () => {
  showCreateModal.value = true
  // Load sales if not already loaded
  if (availableSales.value.length === 0) {
    await loadAvailableSales()
  }
}

const closeCreateReturnModal = () => {
  showCreateModal.value = false
  resetNewReturn()
}

const openDetailsModal = () => {
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
}

const loadAvailableSales = async () => {
  try {
    isLoadingSales.value = true
    showInfo('Loading Sales', 'Fetching available sales...')
    
    await salesStore.fetchSales()
    await returnsStore.fetchReturns()
    
    // Get all sales
    const allSales = salesStore.getSales || []
    
    // Get returned sale IDs
    const returns = returnsStore.getReturns || []
    const returnedSaleIds = new Set(returns.map(returnItem => returnItem.sale_id))
    
    // Filter out sales that have already been returned
    availableSales.value = allSales.filter(sale => !returnedSaleIds.has(sale.id))
    
    showSuccess('Sales Loaded', `Found ${availableSales.value.length} available sales for return`)
    
  } catch (error) {
    handleNetworkError(error, 'Sales Loading')
    showError('Loading Failed', 'Failed to load available sales. Please try again.')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Sales Loading Failed', 'Could not load available sales')
    }
  } finally {
    isLoadingSales.value = false
  }
}

const onSaleChange = async () => {
  if (newReturn.value.sale_id) {
    try {
      const sale = availableSales.value.find(s => s.id === newReturn.value.sale_id)
      if (sale) {
        newReturn.value.customer_id = sale.customer_id
        
        showInfo('Loading Sale Items', 'Fetching sale items...')
        
        // Load sale items
        const saleWithItems = await salesStore.getSaleById(sale.id)
        selectedSaleItems.value = (saleWithItems?.items || []).map(item => ({
          ...item,
          return_quantity: 0
        }))
        
        showSuccess('Sale Items Loaded', `Loaded ${selectedSaleItems.value.length} items from sale #${sale.id}`)
        
      } else {
        handleBusinessLogicError(new Error('Sale not found'), 'Sale Selection')
        showError('Sale Not Found', 'Selected sale could not be found')
      }
    } catch (error) {
      handleNetworkError(error, 'Sale Items Loading')
      showError('Loading Failed', 'Failed to load sale items. Please try again.')
      
      // Add notification
      if (window.addNotification) {
        window.addNotification('error', 'Sale Items Loading Failed', 'Could not load sale items')
      }
    }
  } else {
    selectedSaleItems.value = []
  }
}

const updateReturnTotals = () => {
  const items = selectedSaleItems.value.filter(item => item.return_quantity > 0)
  const totals = returnsStore.calculateReturnTotals(items.map(item => ({
    sale_item_id: item.id,
    product_id: item.product_id,
    quantity: item.return_quantity,
    unit_price: item.unit_price,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: item.return_quantity * item.unit_price
  })))
  
  newReturn.value.total_amount = totals.subtotal
  newReturn.value.discount_amount = totals.totalDiscount
  newReturn.value.tax_amount = totals.totalTax
  newReturn.value.final_amount = totals.finalAmount
}

const createReturn = async () => {
  try {
    isCreatingReturn.value = true
    
    // Validate required fields
    if (!newReturn.value.sale_id) {
      handleValidationError(new Error('Sale selection is required'), 'Return Creation')
      showError('Validation Error', 'Please select a sale to return')
      return
    }
    
    if (!newReturn.value.reason || !newReturn.value.reason.trim()) {
      handleValidationError(new Error('Return reason is required'), 'Return Creation')
      showError('Validation Error', 'Please provide a reason for the return')
      return
    }
    
    const items = selectedSaleItems.value
      .filter(item => item.return_quantity > 0)
      .map(item => ({
        sale_item_id: item.id,
        product_id: item.product_id,
        quantity: item.return_quantity,
        unit_price: item.unit_price,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: item.return_quantity * item.unit_price
      }))

    if (items.length === 0) {
      handleValidationError(new Error('No items selected for return'), 'Return Creation')
      showError('Validation Error', 'Please select at least one item to return')
      return
    }

    const returnData = {
      ...newReturn.value,
      items
    }

    // Validate return data
    const validation = returnsStore.validateReturnData(returnData)
    if (!validation.isValid) {
      handleValidationError(new Error(validation.errors.join(', ')), 'Return Creation')
      showError('Validation Error', validation.errors.join('\n'))
      return
    }

    showInfo('Creating Return', 'Processing return request...')

    await returnsStore.createReturn(returnData)
    closeCreateReturnModal()
    
    showSuccess('Return Created', 'Return has been processed successfully')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Return Created', `Return #${returnData.id || 'new'} processed successfully`)
    }
    
  } catch (error) {
    if (error.message?.includes('validation') || error.message?.includes('required')) {
      handleValidationError(error, 'Return Creation')
      showError('Validation Error', error.message)
    } else if (error.message?.includes('constraint') || error.message?.includes('foreign key')) {
      handleDatabaseError(error, 'Return Creation')
      showError('Database Error', 'Failed to create return due to database constraints')
    } else {
      handleNetworkError(error, 'Return Creation')
      showError('Creation Failed', 'Failed to create return. Please try again.')
    }
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Return Creation Failed', 'Could not process return')
    }
  } finally {
    isCreatingReturn.value = false
  }
}

const viewReturn = async (returnId) => {
  try {
    showInfo('Loading Return Details', 'Fetching return information...')
    
    await returnsStore.fetchReturnById(returnId)
    await returnsStore.fetchReturnItems(returnId)
    
    openDetailsModal()
    
    showSuccess('Return Details Loaded', 'Return details loaded successfully')
    
  } catch (error) {
    handleNetworkError(error, 'Return Details Loading')
    showError('Loading Failed', 'Failed to load return details. Please try again.')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Return Details Loading Failed', 'Could not load return details')
    }
  }
}

const deleteReturn = async (returnId) => {
  try {
    isDeletingReturn.value = true
    
    const returnItem = returns.value.find(r => r.id === returnId)
    const returnName = returnItem ? `Return #${returnItem.id}` : 'Return'
    
    showInfo('Deleting Return', `Removing ${returnName}...`)
    
    await returnsStore.deleteReturn(returnId)
    
    showSuccess('Return Deleted', `${returnName} has been deleted successfully`)
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Return Deleted', `${returnName} has been removed`)
    }
    
  } catch (error) {
    if (error.message?.includes('foreign key') || error.message?.includes('constraint')) {
      handleDatabaseError(error, 'Return Deletion')
      showError('Cannot Delete Return', 'This return has associated records and cannot be deleted')
    } else {
      handleNetworkError(error, 'Return Deletion')
      showError('Delete Failed', 'Failed to delete return. Please try again.')
    }
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Delete Failed', 'Could not delete return')
    }
  } finally {
    isDeletingReturn.value = false
  }
}

const resetNewReturn = () => {
  newReturn.value = {
    sale_id: '',
    customer_id: null,
    user_id: 1,
    total_amount: 0,
    discount_amount: 0,
    tax_amount: 0,
    final_amount: 0,
    reason: '',
    items: []
  }
  selectedSaleItems.value = []
}


// Export returns
const exportReturnsData = async (format) => {
  try {
    isExporting.value = true
    showInfo('Exporting Data', `Preparing ${format.toUpperCase()} export...`)
    
    if (!returns.value || returns.value.length === 0) {
      handleBusinessLogicError(new Error('No returns to export'), 'Returns Export')
      showWarning('No Data', 'There are no returns to export')
      return
    }
    
    const success = await exportReturns(returns.value, format)
    
    if (success) {
      showSuccess('Export Complete', `Returns exported successfully as ${format.toUpperCase()}`)
      
      // Add notification
      if (window.addNotification) {
        window.addNotification('success', 'Export Complete', `${returns.value.length} returns exported as ${format.toUpperCase()}`)
      }
    } else {
      handleBusinessLogicError(new Error('Export operation failed'), 'Returns Export')
      showError('Export Failed', 'Failed to export returns data')
    }
    
  } catch (error) {
    handleNetworkError(error, 'Returns Export')
    showError('Export Error', 'An error occurred while exporting data. Please try again.')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('error', 'Export Failed', 'Could not export returns')
    }
  } finally {
    isExporting.value = false
    showExportDropdown.value = false
  }
}

// Watch for route changes to handle saleId parameter
watch(() => route.query.saleId, async (saleId) => {
  if (saleId) {
    // Load sales first
    await loadAvailableSales()
    // Set the selected sale
    newReturn.value.sale_id = parseInt(saleId)
    // Load sale items
    await onSaleChange()
    // Open the create return modal
    showCreateModal.value = true
  }
}, { immediate: true })

// Lifecycle Hooks
onMounted(async () => {
  try {
    isLoading.value = true
    showInfo('Loading Returns', 'Fetching returns data...')
    
    await returnsStore.fetchReturns()
    
    showSuccess('Returns Loaded', 'Returns data loaded successfully')
    
    // Check if there's a saleId in the query parameters
    if (route.query.saleId) {
      await loadAvailableSales()
      newReturn.value.sale_id = parseInt(route.query.saleId)
      await onSaleChange()
      showCreateModal.value = true
    }
    
  } catch (error) {
    handleNetworkError(error, 'Returns Data Loading')
    showError('Loading Failed', 'Failed to load returns data. Please refresh the page.')
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style scoped>
.btn {
  @apply transition-colors duration-200;
}

.btn-primary {
  @apply bg-red-600 text-white hover:bg-red-700;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

/* Dark theme support */
:deep(.bg-gray-100) {
  @apply bg-gray-800/30;
}

:deep(.text-gray-700) {
  @apply text-gray-300;
}

:deep(.text-gray-600) {
  @apply text-gray-400;
}

:deep(.border-gray-200) {
  @apply border-gray-600;
}

:deep(.border-gray-300) {
  @apply border-gray-500;
}

/* Dark theme adjustments */
:deep(.bg-red-50) {
  @apply bg-red-900/30;
}

:deep(.text-red-800) {
  @apply text-red-200;
}

:deep(.text-red-700) {
  @apply text-red-300;
}

:deep(.border-red-200) {
  @apply border-red-600;
}
</style>
