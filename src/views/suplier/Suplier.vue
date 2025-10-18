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

                <!-- Search Bar -->
                <div class="bg-transparent rounded-lg shadow p-4 mb-6">
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1">
                            <div class="relative">
                                <input 
                                    type="text" 
                                    v-model="searchQuery"
                                    :placeholder="t('Supplier.search_suppliers')"
                                    class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                <span class="material-icons-outlined absolute left-3 top-3 text-gray-400">
                                    search
                                </span>
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
                                    <button @click="deleteSupplier(supplier.id)" class="text-red-400 hover:text-red-300">
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
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupplierStore } from '../../stores/supplier.store'
import { useI18n } from 'vue-i18n'
const supplierStore = useSupplierStore()
const { t } = useI18n()
// Reactive data
const searchQuery = ref('')
const showAddForm = ref(false)
const showEditForm = ref(false)
const selectedSupplier = ref(null)
const loading = ref(false)

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

const filteredSuppliers = computed(() => {
    if (!searchQuery.value) return suppliers.value
    const query = searchQuery.value.toLowerCase()
    return suppliers.value.filter(s =>
        (s.name && s.name.toLowerCase().includes(query)) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(query)) ||
        (s.email && s.email.toLowerCase().includes(query)) ||
        (s.phone && s.phone.toLowerCase().includes(query)) ||
        (s.city && s.city.toLowerCase().includes(query)) ||
        (s.country && s.country.toLowerCase().includes(query))
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
    if (confirm('Are you sure you want to delete this supplier?')) {
        try {
            await supplierStore.delete(id)
            await supplierStore.fetchSuppliers()
        } catch (error) {
            console.error('Error deleting supplier:', error)
            alert('Error deleting supplier. Please try again.')
        }
    }
}

// Load data on mount
onMounted(() => {
    supplierStore.fetchSuppliers()
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
