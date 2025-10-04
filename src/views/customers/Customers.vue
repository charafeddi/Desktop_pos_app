<template>
    <div class="page-content">
        <!-- Header Section -->
        <div class="page-info flex justify-between items-center p-4 bg-transparent">
            <nav aria-label="breadcrumb" class="breadcrumb-nav">
                <ol class="breadcrumb flex items-center list-none m-0 p-0 gap-2">
                    <li class="breadcrumb-item flex items-center text-gray-400">
                        <a href="#" class="breadcrumb-link text-blue-600 hover:text-blue-700">Customers</a>
                    </li>
                    <li class="breadcrumb-item active text-gray-400" aria-current="page">Manage</li>
                </ol>
            </nav>
            <div class="page-options flex items-center gap-4">
                <div class="relative">
                    <button
                        @click="showExportDropdown = !showExportDropdown"
                        class="btn btn-secondary rounded-lg px-4 py-2 hover:bg-gray-500 flex items-center"
                    >
                        <span class="material-icons-outlined">download</span>
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
                                @click="exportCustomersData('csv'); showExportDropdown = false"
                                class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Export as CSV
                            </button>
                            <button
                                @click="exportCustomersData('pdf'); showExportDropdown = false"
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
                <button @click="showAddForm = true" class="btn btn-primary bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
                    <span class="material-icons-outlined">add_circle</span> 
                    {{ t('Customer.Add') }}
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <section class="container px-4 mx-auto">
                <!-- Stats Card -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{ t('Customer.total_customers') }}</p>
                                <h3 class="text-2xl font-bold">{{ customers.length }}</h3>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-blue-600 text-xl">
                                    people
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{ t('Customer.active') }}</p>
                                <h3 class="text-2xl font-bold">{{ customers.filter(c => c.is_active).length }}</h3>
                            </div>
                            <div class="bg-green-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-green-600 text-xl">
                                    check_circle
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{ t('Customer.inactive') }}</p>
                                <h3 class="text-2xl font-bold">{{ customers.filter(c => !c.is_active).length }}</h3>
                            </div>
                            <div class="bg-red-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-red-600 text-xl">
                                    cancel
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{ t('Customer.with_email') }}</p>
                                <h3 class="text-2xl font-bold">{{ customers.filter(c => !!c.email).length }}</h3>
                            </div>
                            <div class="bg-purple-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-purple-600 text-xl">
                                    mail
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Search Bar -->
                <div class="bg-transparent rounded-lg shadow p-4 mb-6">
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1">
                            <div class="relative">
                                <input 
                                    type="text" 
                                    v-model="searchQuery"
                                    :placeholder="t('Customer.search_customers')"
                                    class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                <span class="material-icons-outlined absolute left-3 top-3 text-gray-400">
                                    search
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Customers Table -->
                <div class="bg-transparent rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-700 border border-gray-500">
                        <thead class="bg-transparent border border-gray-500">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.name') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.email') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.phone') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.address') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.total_amount') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.number_of_sales') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.status') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.created_at') }}</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.actions') }}</th>
                            </tr>
                        </thead>
                        <tbody class="bg-gray-900 divide-y divide-gray-700">
                            <tr v-for="customer in filteredCustomers" :key="customer.id">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ customer.id }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-300">{{ customer.name }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ customer.email || '—' }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ customer.phone || '—' }}</div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-300">
                                        {{ [customer.address, customer.city, customer.country].filter(Boolean).join(', ') || '—' }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ formatCurrency(customer.total_amount_count) }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ customer.sale_count }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <span 
                                        @click="toggleCustomerStatus(customer.id)" 
                                        :class="getStatusClass(customer.is_active)"
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                        :title="customer.is_active ? 'Click to deactivate' : 'Click to activate'"
                                    >
                                        <span class="w-2 h-2 mr-1 rounded-full" :class="getStatusDotClass(customer.is_active)"></span>
                                        {{ customer.is_active ? t('Customer.active') : t('Customer.inactive') }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ formatDate(customer.created_at) }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button @click="editCustomer(customer)" class="text-blue-400 hover:text-blue-300 mr-3">
                                        <span class="material-icons-outlined">edit</span>
                                    </button>
                                    <button @click="deleteCustomer(customer.id)" class="text-red-400 hover:text-red-300">
                                        <span class="material-icons-outlined">delete</span>
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="filteredCustomers.length === 0">
                                <td colspan="10" class="px-6 py-4 text-center text-gray-400">No customers found</td>
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
                    <h3 class="text-lg font-semibold text-gray-900">{{ showEditForm ? t('Customer.Edit') : t('Customer.Add') }}</h3>
                    <button @click="closeForm" class="text-gray-400 hover:text-gray-600">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>

                <form @submit.prevent="handleSubmit">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.name') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.name" 
                                required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.name')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.email') }}</label>
                            <input 
                                type="email" 
                                v-model="formData.email" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="email@example.com"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.phone') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.phone" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.phone')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.tax_number') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.tax_number" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.tax_number')"
                            >
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.address') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.address" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.address')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.city') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.city" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.city')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.country') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.country" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.country')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.postal_code') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.postal_code" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.postal_code')"
                            >
                        </div>
                        <div class="md:col-span-2">
                            <label class="flex items-center">
                                <input 
                                    type="checkbox" 
                                    v-model="formData.is_active" 
                                    :true-value="1"
                                    :false-value="0"
                                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                >
                                <span class="ml-2 text-sm text-gray-700">{{ t('Customer.active') }}</span>
                            </label>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button" @click="closeForm" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                            {{ loading ? 'Saving...' : (showEditForm ? t('Customer.Update') : t('Customer.Create')) }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCustomerStore } from '../../stores/customers.store'
import { useI18n } from 'vue-i18n'
import { exportCustomers } from '@/utils/exportUtils'

// Composables
const { t } = useI18n()

// Stores
const customerStore = useCustomerStore()

// Reactive Variables
const searchQuery = ref('')
const showAddForm = ref(false)
const showEditForm = ref(false)
const selectedCustomer = ref(null)
const loading = ref(false)
const showExportDropdown = ref(false)

const formData = ref({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    tax_number: '',
    is_active: 1
})

// Computed Properties
const customers = computed(() => customerStore.getCustomers || [])
const lastUpdated = computed(() => {
    if (customers.value.length === 0) return 'Never'
    const latest = customers.value.reduce((latest, current) => 
        new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest
    )
    return formatDate(latest.updated_at)
})

const filteredCustomers = computed(() => {
    if (!searchQuery.value) return customers.value
    const query = searchQuery.value.toLowerCase()
    return customers.value.filter(c =>
        (c.name && c.name.toLowerCase().includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.phone && c.phone.toLowerCase().includes(query)) ||
        (c.city && c.city.toLowerCase().includes(query)) ||
        (c.country && c.country.toLowerCase().includes(query))
    )
})

// Methods
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
}

const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

const closeForm = () => {
    showAddForm.value = false
    showEditForm.value = false
    selectedCustomer.value = null
    formData.value = { 
        name: '', email: '', phone: '', address: '', 
        city: '', country: '', postal_code: '', tax_number: '', is_active: 1
    }
}

const editCustomer = (customer) => {
    selectedCustomer.value = customer
    formData.value = {
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        country: customer.country || '',
        postal_code: customer.postal_code || '',
        tax_number: customer.tax_number || '',
        is_active: customer.is_active !== undefined ? customer.is_active : 1
    }
    showEditForm.value = true
}

const handleSubmit = async () => {
    loading.value = true
    try {
        const cleanData = {
            name: String(formData.value.name || '').trim(),
            email: String(formData.value.email || '').trim(),
            phone: String(formData.value.phone || '').trim(),
            address: String(formData.value.address || '').trim(),
            city: String(formData.value.city || '').trim(),
            country: String(formData.value.country || '').trim(),
            postal_code: String(formData.value.postal_code || '').trim(),
            tax_number: String(formData.value.tax_number || '').trim(),
            is_active: Number(formData.value.is_active || 1),
        }

        if (showEditForm.value && selectedCustomer.value) {
            await customerStore.update(selectedCustomer.value.id, cleanData)
        } else {
            await customerStore.create(cleanData)
        }
        // Ensure latest data is visible immediately
        await customerStore.fetchCustomers()
        closeForm()
    } catch (error) {
        console.error('Error saving customer:', error)
        alert('Error saving customer. Please try again.')
    } finally {
        loading.value = false
    }
}

const deleteCustomer = async (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
        try {
            await customerStore.delete(id)
            await customerStore.fetchCustomers()
        } catch (error) {
            console.error('Error deleting customer:', error)
            alert('Error deleting customer. Please try again.')
        }
    }
}

// Export customers
const exportCustomersData = async (format) => {
    try {
        const success = await exportCustomers(customers.value, format)
        if (success) {
            alert(`Customers data exported successfully as ${format.toUpperCase()}`)
        } else {
            alert('Failed to export customers data')
        }
    } catch (error) {
        console.error('Export error:', error)
        alert('Error exporting customers data')
    }
}

// Toggle customer status
const toggleCustomerStatus = async (id) => {
    try {
        await customerStore.toggleStatus(id)
    } catch (error) {
        console.error('Error toggling customer status:', error)
        alert('Error toggling customer status. Please try again.')
    }
}

// Status styling helpers
const getStatusClass = (isActive) => {
    return isActive 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
}

const getStatusDotClass = (isActive) => {
    return isActive ? 'bg-green-400' : 'bg-red-400'
}

// Lifecycle Hooks
onMounted(() => {
    customerStore.fetchCustomers()
})
</script>

<style scoped>
.btn {
    @apply transition-colors duration-200;
}

.btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
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
