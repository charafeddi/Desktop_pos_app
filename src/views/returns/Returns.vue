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

      <!-- Search Section -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Search Returns
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input 
                v-model="searchParams.customer_name"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Search by customer name"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sale Invoice</label>
              <input 
                v-model="searchParams.sale_invoice"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Search by invoice number"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Return Number</label>
              <input 
                v-model="searchParams.return_number"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Search by return number"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                v-model="searchParams.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input 
                v-model="searchParams.reason"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Search by reason"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                v-model="searchParams.start_date"
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                v-model="searchParams.end_date"
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          
          <div class="flex gap-2">
            <button 
              @click="performSearch"
              :disabled="loading"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Search
            </button>
            <button 
              @click="clearSearch"
              :disabled="loading"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
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

      <!-- Returns List -->
      <div v-else class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            {{ t('Returns.returns_history') }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input 
                v-model="searchParams.customer_name"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Search by customer name"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sale Invoice</label>
              <input 
                v-model="searchParams.sale_invoice"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Search by invoice number"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Return Number</label>
              <input 
                v-model="searchParams.return_number"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Search by return number"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                v-model="searchParams.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input 
                v-model="searchParams.reason"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Search by reason"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                v-model="searchParams.start_date"
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                v-model="searchParams.end_date"
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          
          <div class="flex gap-2">
            <button 
              @click="performSearch"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Search
            </button>
            <button 
              @click="clearSearch"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Returns List -->
      <div v-else class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            {{ t('Returns.returns_history') }}
          </h3>
          
          <div v-if="returns.length === 0" class="text-center py-8 text-gray-500">
            {{ t('Returns.no_returns_found') }}
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
                <tr v-for="returnItem in returns" :key="returnItem.id">
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
                      @click="deleteReturn(returnItem.id)"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useReturnsStore } from '@/stores/returns.store'
import { useSalesStore } from '@/stores/sales.store'
import { useI18n } from 'vue-i18n'
import { exportReturns } from '@/utils/exportUtils'

const { t } = useI18n()
const route = useRoute()
const returnsStore = useReturnsStore()
const salesStore = useSalesStore()

// Reactive data
const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const availableSales = ref([])
const selectedSaleItems = ref([])
const showExportDropdown = ref(false)

// Search parameters
const searchParams = ref({
  customer_name: '',
  sale_invoice: '',
  reason: '',
  start_date: '',
  end_date: '',
  return_number: '',
  status: ''
})

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

// Computed properties
const returns = computed(() => returnsStore.getReturns)
const returnItems = computed(() => returnsStore.getReturnItems)
const selectedReturn = computed(() => returnsStore.getSelectedReturn)
const loading = computed(() => returnsStore.getLoading)
const error = computed(() => returnsStore.getError)

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
    await salesStore.fetchSales()
    await returnsStore.fetchReturns()
    
    // Get all sales
    const allSales = salesStore.getSales || []
    
    // Get returned sale IDs
    const returns = returnsStore.getReturns || []
    const returnedSaleIds = new Set(returns.map(returnItem => returnItem.sale_id))
    
    // Filter out sales that have already been returned
    availableSales.value = allSales.filter(sale => !returnedSaleIds.has(sale.id))
  } catch (error) {
    console.error('Error loading sales:', error)
  }
}

const onSaleChange = async () => {
  if (newReturn.value.sale_id) {
    try {
      const sale = availableSales.value.find(s => s.id === newReturn.value.sale_id)
      if (sale) {
        newReturn.value.customer_id = sale.customer_id
        
        // Load sale items
        const saleWithItems = await salesStore.getSaleById(sale.id)
        selectedSaleItems.value = (saleWithItems?.items || []).map(item => ({
          ...item,
          return_quantity: 0
        }))
      }
    } catch (error) {
      console.error('Error loading sale items:', error)
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

    const returnData = {
      ...newReturn.value,
      items
    }

    // Validate return data
    const validation = returnsStore.validateReturnData(returnData)
    if (!validation.isValid) {
      alert(validation.errors.join('\n'))
      return
    }

    await returnsStore.createReturn(returnData)
    closeCreateReturnModal()
  } catch (error) {
    console.error('Error creating return:', error)
    alert('Failed to create return')
  }
}

const viewReturn = async (returnId) => {
  try {
    await returnsStore.fetchReturnById(returnId)
    await returnsStore.fetchReturnItems(returnId)
    openDetailsModal()
  } catch (error) {
    console.error('Error viewing return:', error)
  }
}

const deleteReturn = async (returnId) => {
  if (confirm(t('Returns.confirm_delete'))) {
    try {
      await returnsStore.deleteReturn(returnId)
    } catch (error) {
      console.error('Error deleting return:', error)
      alert('Failed to delete return')
    }
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

// Search functions
const performSearch = async () => {
  try {
    // Filter out empty values
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams.value).filter(([_, value]) => value !== '')
    )
    
    await returnsStore.searchReturns(filteredParams)
  } catch (error) {
    console.error('Error searching returns:', error)
  }
}

const clearSearch = async () => {
  // Reset search parameters
  searchParams.value = {
    customer_name: '',
    sale_invoice: '',
    reason: '',
    start_date: '',
    end_date: '',
    return_number: '',
    status: ''
  }
  
  // Load all returns
  await returnsStore.fetchReturns()
}

// Export returns
const exportReturnsData = async (format) => {
  try {
    const success = await exportReturns(returns.value, format)
    if (success) {
      alert(`Returns data exported successfully as ${format.toUpperCase()}`)
    } else {
      alert('Failed to export returns data')
    }
  } catch (error) {
    console.error('Export error:', error)
    alert('Error exporting returns data')
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

// Lifecycle
onMounted(async () => {
  await returnsStore.fetchReturns()
  
  // Check if there's a saleId in the query parameters
  if (route.query.saleId) {
    await loadAvailableSales()
    newReturn.value.sale_id = parseInt(route.query.saleId)
    await onSaleChange()
    showCreateModal.value = true
  }
})
</script>
