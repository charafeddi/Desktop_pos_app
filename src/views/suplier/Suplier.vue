<template>
    <div class="page-content">
        <!-- Header Section -->
        <div class="page-info flex justify-between items-center p-4 bg-transparent">
            <nav aria-label="breadcrumb" class="breadcrumb-nav">
                <ol class="breadcrumb flex items-center list-none m-0 p-0 gap-2">
                    <li class="breadcrumb-item flex items-center text-gray-400">
                        <a href="#" class="breadcrumb-link text-blue-600 hover:text-blue-700">Suppliers</a>
                    </li>
                    <li class="breadcrumb-item active text-gray-400" aria-current="page">Manage</li>
                </ol>
            </nav>
            <div class="page-options flex items-center gap-4">
                <button @click="showAddForm = true" class="btn btn-primary bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
                    <span class="material-icons-outlined">add_circle</span> 
                    {{ t('Supplier.Add') }}
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <section class="container px-4 mx-auto">
                <!-- Stats Card -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{ t('Supplier.total_suppliers') }}</p>
                                <h3 class="text-2xl font-bold">{{ suppliers.length }}</h3>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-blue-600 text-xl">
                                    local_shipping
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{ t('Supplier.with_email') }}</p>
                                <h3 class="text-2xl font-bold">{{ suppliers.filter(s => !!s.email).length }}</h3>
                            </div>
                            <div class="bg-green-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-green-600 text-xl">
                                    mail
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{t('Supplier.last_updated')}}</p>
                                <h3 class="text-lg font-bold">{{lastUpdated}}</h3>
                            </div>
                            <div class="bg-purple-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-purple-600 text-xl">
                                    update
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Search and Filter Bar -->
                <div class="bg-transparent rounded-lg shadow p-4 mb-6">
                    <div class="flex flex-col gap-4">
                        <!-- Main Search Bar -->
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex-1">
                                <div class="relative">
                                    <input 
                                        type="text" 
                                        v-model="searchQuery"
                                        @keydown="handleSearchKeydown"
                                        placeholder="Search suppliers by name, contact person, email, phone, city, country, or address..."
                                        class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    <span v-if="activeFiltersCount > 0" class="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
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
                                <!-- Country Filter -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <select v-model="countryFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">All Countries</option>
                                        <option v-for="country in uniqueCountries" :key="country" :value="country">{{ country }}</option>
                                    </select>
                                </div>
                                
                                <!-- City Filter -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <select v-model="cityFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">All Cities</option>
                                        <option v-for="city in uniqueCities" :key="city" :value="city">{{ city }}</option>
                                    </select>
                                </div>
                                
                                <!-- Contact Type Filter -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Contact Type</label>
                                    <select v-model="contactTypeFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">All Contact Types</option>
                                        <option value="with_email">With Email</option>
                                        <option value="with_phone">With Phone</option>
                                        <option value="with_both">With Both</option>
                                        <option value="incomplete">Incomplete Contact</option>
                                    </select>
                                </div>
                                
                                <!-- Business Volume Filter -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Business Volume</label>
                                    <select v-model="volumeFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">All Volumes</option>
                                        <option value="high">High Volume ($1000+)</option>
                                        <option value="medium">Medium Volume ($100-$1000)</option>
                                        <option value="low">Low Volume (Under $100)</option>
                                        <option value="none">No Business</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Sort Options -->
                            <div class="mt-4 flex flex-col md:flex-row gap-4">
                                <div class="flex-1">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                    <div class="flex gap-2">
                                        <select v-model="sortBy" class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="name">Name</option>
                                            <option value="total_amount">Business Volume</option>
                                            <option value="product_count">Product Count</option>
                                            <option value="created_at">Date Created</option>
                                            <option value="updated_at">Last Updated</option>
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
                                        {{ filteredSuppliers.length }} of {{ suppliers.length }} suppliers
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Suppliers Table -->
                <div class="bg-transparent rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-700 border border-gray-500">
                        <thead class="bg-transparent border border-gray-500">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Supplier.name') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Supplier.contact_person') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Supplier.email') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Supplier.phone') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Supplier.address') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Supplier.total_amount') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Supplier.number_of_products') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Supplier.created_at') }}</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Supplier.actions') }}</th>
                            </tr>
                        </thead>
                        <tbody class="bg-gray-900 divide-y divide-gray-700">
                            <tr v-for="supplier in filteredSuppliers" :key="supplier.id">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ supplier.id }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-300">{{ supplier.name }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ supplier.contact_person || '—' }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ supplier.email || '—' }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ supplier.phone || '—' }}</div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-300">
                                        {{ [supplier.address, supplier.city, supplier.country].filter(Boolean).join(', ') || '—' }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ formatCurrency(supplier.total_amount_count) }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ supplier.product_count }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ formatDate(supplier.created_at) }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button @click="editSupplier(supplier)" class="text-blue-400 hover:text-blue-300 mr-3">
                                        <span class="material-icons-outlined">edit</span>
                                    </button>
                                    <button @click="showDeleteConfirmation(supplier)" class="text-red-400 hover:text-red-300">
                                        <span class="material-icons-outlined">delete</span>
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="filteredSuppliers.length === 0">
                                <td colspan="8" class="px-6 py-4 text-center text-gray-400">No suppliers found</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <!-- Add/Edit Modal -->
        <div v-if="showAddForm || showEditForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-xl mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">{{ showEditForm ? 'Edit Supplier' : 'Add Supplier' }}</h3>
                    <button @click="closeForm" class="text-gray-400 hover:text-gray-600">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>

                <form @submit.prevent="handleSubmit">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input 
                                type="text" 
                                v-model="formData.name" 
                                required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Supplier.name')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                            <input 
                                type="text" 
                                v-model="formData.contact_person" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Supplier.contact_person')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input 
                                type="email" 
                                v-model="formData.email" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Supplier.email')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Supplier.phone') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.phone" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Supplier.phone')"
                            >
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Supplier.address') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.address" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Supplier.address')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Supplier.city') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.city" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Supplier.city')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Supplier.country') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.country" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Supplier.country')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Supplier.postal_code') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.postal_code" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Supplier.postal_code')"
                            >
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button" @click="closeForm" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                            {{ loading ? 'Saving...' : (showEditForm ? 'Update' : 'Create') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Confirmation Dialog for Delete -->
        <ConfirmationDialog
            :is-visible="showDeleteConfirm"
            :title="'Delete Supplier'"
            :message="`Are you sure you want to delete ${supplierToDelete?.name || 'this supplier'}? This action cannot be undone.`"
            :type="'error'"
            :confirm-text="'Delete'"
            :cancel-text="'Cancel'"
            :loading="isDeleting"
            @confirm="confirmDelete"
            @cancel="cancelDelete"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupplierStore } from '../../stores/supplier.store'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/utils/toastManager'
import { useErrorHandler } from '@/utils/errorHandler'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { formatCurrency } from '@/utils/currency'
const supplierStore = useSupplierStore()
const { t } = useI18n()
const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()
const { handleNetworkError, handleDatabaseError, handleValidationError } = useErrorHandler()
// Reactive data
const searchQuery = ref('')
const showAddForm = ref(false)
const showEditForm = ref(false)
const selectedSupplier = ref(null)
const loading = ref(false)

// Delete confirmation
const showDeleteConfirm = ref(false)
const supplierToDelete = ref(null)
const isDeleting = ref(false)

// Advanced filter variables
const countryFilter = ref('')
const cityFilter = ref('')
const contactTypeFilter = ref('')
const volumeFilter = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')
const showAdvancedFilters = ref(false)

const formData = ref({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: ''
})

// Computed properties
const suppliers = computed(() => supplierStore.getSuppliers || [])
const lastUpdated = computed(() => {
    if (suppliers.value.length === 0) return 'Never'
    const latest = suppliers.value.reduce((latest, current) => 
        new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest
    )
    return formatDate(latest.updated_at)
})

// Unique values for filter dropdowns
const uniqueCountries = computed(() => {
    const countries = suppliers.value
        .map(s => s.country)
        .filter(Boolean)
        .filter((country, index, arr) => arr.indexOf(country) === index)
    return countries.sort()
})

const uniqueCities = computed(() => {
    const cities = suppliers.value
        .map(s => s.city)
        .filter(Boolean)
        .filter((city, index, arr) => arr.indexOf(city) === index)
    return cities.sort()
})

// Active filters count
const activeFiltersCount = computed(() => {
    let count = 0
    if (countryFilter.value) count++
    if (cityFilter.value) count++
    if (contactTypeFilter.value) count++
    if (volumeFilter.value) count++
    return count
})

// Advanced search and filter implementation
const filteredSuppliers = computed(() => {
    if (!Array.isArray(suppliers.value) || suppliers.value.length === 0) {
        return []
    }
    
    let filtered = [...suppliers.value]
    
    // Text search - search in name, contact person, email, phone, city, country, address
    if (searchQuery.value && searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        filtered = filtered.filter(supplier => {
            const name = (supplier.name || '').toLowerCase()
            const contactPerson = (supplier.contact_person || '').toLowerCase()
            const email = (supplier.email || '').toLowerCase()
            const phone = (supplier.phone || '').toLowerCase()
            const city = (supplier.city || '').toLowerCase()
            const country = (supplier.country || '').toLowerCase()
            const address = (supplier.address || '').toLowerCase()
            
            return name.includes(query) ||
                   contactPerson.includes(query) ||
                   email.includes(query) ||
                   phone.includes(query) ||
                   city.includes(query) ||
                   country.includes(query) ||
                   address.includes(query)
        })
    }
    
    // Country filter
    if (countryFilter.value && countryFilter.value !== '') {
        filtered = filtered.filter(supplier => 
            supplier.country === countryFilter.value
        )
    }
    
    // City filter
    if (cityFilter.value && cityFilter.value !== '') {
        filtered = filtered.filter(supplier => 
            supplier.city === cityFilter.value
        )
    }
    
    // Contact type filter
    if (contactTypeFilter.value && contactTypeFilter.value !== '') {
        filtered = filtered.filter(supplier => {
            const hasEmail = !!supplier.email
            const hasPhone = !!supplier.phone
            
            switch (contactTypeFilter.value) {
                case 'with_email':
                    return hasEmail
                case 'with_phone':
                    return hasPhone
                case 'with_both':
                    return hasEmail && hasPhone
                case 'incomplete':
                    return !hasEmail && !hasPhone
                default:
                    return true
            }
        })
    }
    
    // Business volume filter
    if (volumeFilter.value && volumeFilter.value !== '') {
        filtered = filtered.filter(supplier => {
            const amount = Number(supplier.total_amount_count) || 0
            
            switch (volumeFilter.value) {
                case 'high':
                    return amount >= 1000
                case 'medium':
                    return amount >= 100 && amount < 1000
                case 'low':
                    return amount > 0 && amount < 100
                case 'none':
                    return amount === 0
                default:
                    return true
            }
        })
    }
    
    // Sort suppliers
    if (sortBy.value && sortBy.value !== '') {
        filtered.sort((a, b) => {
            let aValue, bValue
            
            switch (sortBy.value) {
                case 'name':
                    aValue = (a.name || '').toLowerCase()
                    bValue = (b.name || '').toLowerCase()
                    break
                case 'total_amount':
                    aValue = Number(a.total_amount_count) || 0
                    bValue = Number(b.total_amount_count) || 0
                    break
                case 'product_count':
                    aValue = Number(a.product_count) || 0
                    bValue = Number(b.product_count) || 0
                    break
                case 'created_at':
                    aValue = new Date(a.created_at || 0)
                    bValue = new Date(b.created_at || 0)
                    break
                case 'updated_at':
                    aValue = new Date(a.updated_at || 0)
                    bValue = new Date(b.updated_at || 0)
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

// Methods
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
}

// Using centralized formatCurrency from currency.ts

// Clear all filters method
const clearAllFilters = () => {
    searchQuery.value = ''
    countryFilter.value = ''
    cityFilter.value = ''
    contactTypeFilter.value = ''
    volumeFilter.value = ''
    sortBy.value = 'name'
    sortOrder.value = 'asc'
    showAdvancedFilters.value = false
    
    showInfo('Filters Cleared', 'All search and filter options have been reset')
}

// Handle search input key events
const handleSearchKeydown = (event) => {
    if (event.key === 'Enter') {
        // Focus on first result or show advanced filters
        if (filteredSuppliers.value.length === 0) {
            showAdvancedFilters.value = true
        }
    } else if (event.key === 'Escape') {
        searchQuery.value = ''
        showAdvancedFilters.value = false
    }
}

const closeForm = () => {
    showAddForm.value = false
    showEditForm.value = false
    selectedSupplier.value = null
    formData.value = { 
        name: '', contact_person: '', email: '', phone: '', 
        address: '', city: '', country: '', postal_code: '' 
    }
}

const editSupplier = (supplier) => {
    selectedSupplier.value = supplier
    formData.value = {
        name: supplier.name || '',
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        country: supplier.country || '',
        postal_code: supplier.postal_code || ''
    }
    showEditForm.value = true
}

const handleSubmit = async () => {
    loading.value = true
    try {
        const cleanData = {
            name: String(formData.value.name || '').trim(),
            contact_person: String(formData.value.contact_person || '').trim(),
            email: String(formData.value.email || '').trim(),
            phone: String(formData.value.phone || '').trim(),
            address: String(formData.value.address || '').trim(),
            city: String(formData.value.city || '').trim(),
            country: String(formData.value.country || '').trim(),
            postal_code: String(formData.value.postal_code || '').trim(),
        }

        if (showEditForm.value && selectedSupplier.value) {
            await supplierStore.update(selectedSupplier.value.id, cleanData)
        } else {
            await supplierStore.create(cleanData)
        }
        // Ensure latest data is visible immediately
        await supplierStore.fetchSuppliers()
        closeForm()
    } catch (error) {
        console.error('Error saving supplier:', error)
        alert('Error saving supplier. Please try again.')
    } finally {
        loading.value = false
    }
}

const deleteSupplier = async (id) => {
    try {
        isDeleting.value = true
        
        // Find the supplier to get its name for the notification
        const supplier = suppliers.value.find(s => s.id === id)
        const supplierName = supplier?.name || 'Supplier'
        
        showInfo('Deleting Supplier', `Removing ${supplierName}...`)
        
        // Call the API to delete the supplier
        await supplierStore.delete(id)
        
        // Refresh suppliers from the store
        await supplierStore.fetchSuppliers()
        
        showSuccess('Supplier Deleted', `${supplierName} has been deleted successfully`)
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('success', 'Supplier Deleted', `${supplierName} has been removed`)
        }
        
    } catch (error) {
        handleDatabaseError(error, 'Supplier Deletion')
        showError('Delete Failed', 'Failed to delete supplier. Please try again.')
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('error', 'Delete Failed', 'Could not delete supplier')
        }
    } finally {
        isDeleting.value = false
    }
}

// Show delete confirmation
const showDeleteConfirmation = (supplier) => {
    supplierToDelete.value = supplier
    showDeleteConfirm.value = true
}

// Confirm delete
const confirmDelete = async () => {
    if (supplierToDelete.value?.id) {
        await deleteSupplier(supplierToDelete.value.id)
    }
    showDeleteConfirm.value = false
    supplierToDelete.value = null
}

// Cancel delete
const cancelDelete = () => {
    showDeleteConfirm.value = false
    supplierToDelete.value = null
}

// Load data on mount
onMounted(async () => {
    try {
        loading.value = true
        showInfo('Loading Suppliers', 'Fetching supplier data...')
        await supplierStore.fetchSuppliers()
        showSuccess('Suppliers Loaded', 'Supplier data loaded successfully')
    } catch (error) {
        handleNetworkError(error, 'Supplier Data Loading')
        showError('Loading Failed', 'Failed to load supplier data. Please refresh the page.')
    } finally {
        loading.value = false
    }
})
</script>
<style scoped>
.btn {
    @apply transition-colors duration-200;
}

.btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
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
:deep(.bg-blue-100) {
    @apply bg-blue-900/30;
}

:deep(.text-blue-600) {
    @apply text-blue-400;
}

:deep(.bg-green-100) {
    @apply bg-green-900/30;
}

:deep(.text-green-600) {
    @apply text-green-400;
}

:deep(.bg-purple-100) {
    @apply bg-purple-900/30;
}

:deep(.text-purple-600) {
    @apply text-purple-400;
}
</style>
