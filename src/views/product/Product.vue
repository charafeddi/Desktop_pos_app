<template>
    <div class="page-content">
        <!-- Header Section -->
        <div class="page-info flex justify-between items-center p-4 bg-transparent">
            <nav aria-label="breadcrumb" class="breadcrumb-nav">
                <ol class="breadcrumb flex items-center list-none m-0 p-0 gap-2">
                    <li class="breadcrumb-item flex items-center text-gray-400">
                        <a href="#" class="breadcrumb-link text-blue-600 hover:text-blue-700">Products</a>
                    </li>
                    <li class="breadcrumb-item active text-gray-400" aria-current="page">Product List</li>
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
                                @click="exportProductsData('csv'); showExportDropdown = false"
                                class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Export as CSV
                            </button>
                            <button
                                @click="exportProductsData('pdf'); showExportDropdown = false"
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
                    <span class="material-icons-outlined">
                        add_circle
                    </span> 
                    {{ t('product.add_product') }}
                </button>
            </div>
        </div>

        <!-- Bulk Selection Bar -->
        <BulkSelectionBar
            :selected-count="selectedProducts.length"
            :selected-ids="selectedProducts"
            @operation-executed="handleBulkOperation"
            @clear-selection="clearSelection"
        />

        <!-- Bulk Edit Modal -->
        <BulkEditModal
            :is-open="showBulkEditModal"
            :selected-ids="selectedProducts"
            :selected-count="selectedProducts.length"
            @close="showBulkEditModal = false"
            @success="handleBulkEditSuccess"
        />

        <!-- Main Content -->
        <div class="main-content">
            <section class="container px-4 mx-auto">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 ">
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{ t('product.total_products') }}</p>
                                <h3 class="text-2xl font-bold">{{ products.length }}</h3>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-blue-600 text-xl">
                                    inventory_2
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{t('product.low_stock')}}</p>
                                <h3 class="text-2xl font-bold">{{productsAboutToFinish.length}}</h3>
                            </div>
                            <div class="bg-red-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-red-600 text-xl">
                                    report_problem
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{t('product.categories')}}</p>
                                <h3 class="text-2xl font-bold">{{categories.length }}</h3>
                            </div>
                            <div class="bg-green-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-green-600 text-xl">
                                    style
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{ t('product.total_value') }}</p>
                                <h3 class="text-2xl font-bold">{{ totalInventoryValue }}</h3>
                            </div>
                            <div class="bg-purple-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-purple-600 text-xl">
                                    attach_money
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
                                        placeholder="Search products by name, SKU, barcode, description, category, or supplier..."
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
                                <!-- Category Filter -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select v-model="categoryFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">All Categories</option>
                                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                                    </select>
                                </div>
                                
                                <!-- Status Filter -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select v-model="statusFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="out_of_stock">Out of Stock</option>
                                    </select>
                                </div>
                                
                                <!-- Stock Level Filter -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Stock Level</label>
                                    <select v-model="stockFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">All Stock Levels</option>
                                        <option value="low_stock">Low Stock</option>
                                        <option value="out_of_stock">Out of Stock</option>
                                        <option value="in_stock">In Stock</option>
                                        <option value="overstocked">Overstocked</option>
                                    </select>
                                </div>
                                
                                <!-- Price Range Filter -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                                    <select v-model="priceRangeFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">All Prices</option>
                                        <option value="low">Under $10</option>
                                        <option value="medium">$10 - $50</option>
                                        <option value="high">$50 - $100</option>
                                        <option value="premium">Over $100</option>
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
                                            <option value="price">Price</option>
                                            <option value="stock">Stock</option>
                                            <option value="category">Category</option>
                                            <option value="created">Date Created</option>
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
                                        {{ filteredProducts.length }} of {{ products.length }} products
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Products Table -->
                <div class="bg-transparent rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-700 border border-gray-500">
                        <thead class="bg-transparent border border-gray-500">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    <div class="flex items-center">
                                        <input
                                            type="checkbox"
                                            :checked="isAllSelected"
                                            @change="toggleSelectAll"
                                            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                        >
                                        <span>Select</span>
                                    </div>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {{ t('product.product') }}
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {{ t('product.category') }}
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {{ t('product.stock') }}
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {{ t('product.price') }}
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {{ t('product.status') }}
                                </th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {{ t('product.actions') }}
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-gray-900 divide-y divide-gray-700">
                            <tr v-for="product in filteredProducts" :key="product.id">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        :checked="selectedProducts.includes(product.id)"
                                        @change="toggleProductSelection(product.id)"
                                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    >
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-10 w-10">
                                            <div v-if="product.image">
                                                <img class="h-10 w-10 rounded-full" :src="product.image" :alt="product.name">
                                            </div>
                                            <div v-else>
                                                <img class="h-10 w-10 rounded-full" src="/assets/img/product-no-image.png" alt="image">
                                            </div>
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-300">{{ product.name }}</div>
                                            <div class="text-sm text-gray-400">{{ product.sku }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ product.category_name }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ product.current_stock }}</div>
                                    <div class="text-sm text-gray-400">{{ t('product.min_stock') }}: {{ product.min_stock_level }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ t('product.price') }}: ${{ product.selling_price }}</div>
                                    <div class="text-sm text-gray-400">{{ t('product.cost') }}: ${{ product.purchase_price }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="getStatusClass(product.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                        {{ getStatusText(product.status) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button @click="editProduct(product)" class="text-blue-400 hover:text-blue-300 mr-3">
                                        <span class="material-icons-outlined">
                                            edit
                                        </span>
                                    </button>
                                    <button @click="deleteProduct(product.id)" class="text-red-400 hover:text-red-300">
                                        <span class="material-icons-outlined">
                                            delete
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between mt-4">
                    <div class="flex items-center">
                        <span class="text-sm text-gray-700">
                            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalItems }} results
                        </span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button 
                            @click="currentPage--" 
                            :disabled="currentPage === 1"
                            class="px-3 py-1 border rounded-md disabled:opacity-50"
                        >
                            {{ t('product.previous') }}
                        </button>
                        <button 
                            v-for="page in totalPages" 
                            :key="page"
                            @click="currentPage = page"
                            :class="currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'"
                            class="px-3 py-1 border rounded-md"
                        >
                            {{ page }}
                        </button>
                        <button 
                            @click="currentPage++" 
                            :disabled="currentPage === totalPages"
                            class="px-3 py-1 border rounded-md disabled:opacity-50"
                        >
                            {{ t('product.next') }}
                        </button>
                    </div>
                </div>
            </section>
        </div>

        <!-- Product Form Window -->
        <ProductFormWindow
            v-if="showAddForm || showEditForm"
            :is-editing="showEditForm"
            :product="selectedProduct"
            :categories="categories"
            @close="closeForm"
            @submit="handleFormSubmit"
        />
        
        <!-- Loading Spinner -->
        <LoadingSpinner 
            v-if="isLoading || isExporting || isDeleting"
            :message="getLoadingMessage()"
            :fullscreen="true"
        />
        
        <!-- Confirmation Dialog for Delete -->
        <ConfirmationDialog
            :is-open="showDeleteConfirm"
            :title="'Delete Product'"
            :message="`Are you sure you want to delete ${productToDelete?.name || 'this product'}? This action cannot be undone.`"
            :type="'error'"
            :confirm-text="'Delete'"
            :cancel-text="'Cancel'"
            :is-loading="isDeleting"
            @confirm="confirmDelete"
            @cancel="cancelDelete"
        />
    </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ProductFormWindow from './components/ProductFormWindow.vue'
import BulkSelectionBar from '@/components/common/BulkSelectionBar.vue'
import BulkEditModal from '@/components/common/BulkEditModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useI18n } from 'vue-i18n'
import { useCategoryStore } from '../../stores/category.store'
import { useProductStore } from '../../stores/product.store'
import { exportProducts } from '@/utils/exportUtils'
import { useToast } from '@/utils/toastManager'
import { useErrorHandler } from '@/utils/errorHandler'

// Composables
const { t } = useI18n()
const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()
const { handleNetworkError, handleDatabaseError, handleValidationError, handleBusinessLogicError } = useErrorHandler()

// Stores
const ProductStore = useProductStore()
const categoryStore = useCategoryStore()

// Loading states
const isLoading = ref(false)
const isExporting = ref(false)
const isDeleting = ref(false)

// Lifecycle Hooks
onMounted(async () => {
    try {
        isLoading.value = true
        showInfo('Loading Products', 'Fetching product data...')
        
        // Load data with error handling
        await Promise.all([
            ProductStore.getAllProducts?.(),
            ProductStore.getProductsAboutToFinish?.(),
            categoryStore.fetchCategories?.()
        ])
        
        showSuccess('Products Loaded', 'Product data loaded successfully')
        
        // Add keyboard shortcut event listeners
        window.addEventListener('add-product', handleAddProductShortcut)
        window.addEventListener('focus-search', handleFocusSearch)
        window.addEventListener('export-data', handleExportData)
        
    } catch (error) {
        handleNetworkError(error, 'Product Data Loading')
        showError('Loading Failed', 'Failed to load product data. Please refresh the page.')
    } finally {
        isLoading.value = false
    }
})

onUnmounted(() => {
    // Remove keyboard shortcut event listeners
    window.removeEventListener('add-product', handleAddProductShortcut)
    window.removeEventListener('focus-search', handleFocusSearch)
    window.removeEventListener('export-data', handleExportData)
})

// Keyboard shortcut handlers
const handleAddProductShortcut = () => {
    // Trigger the add product modal
    const addButton = document.querySelector('[data-action="add-product"]')
    if (addButton) {
        addButton.click()
    }
}

const handleFocusSearch = () => {
    // Focus on the search input
    const searchInput = document.querySelector('input[type="text"]')
    if (searchInput) {
        searchInput.focus()
        searchInput.select()
    }
}

const handleExportData = () => {
    // Trigger export dropdown
    showExportDropdown.value = true
}
// Computed Properties
const products = computed(() => Array.isArray(ProductStore.getProducts) ? ProductStore.getProducts : [])
const productsAboutToFinish = computed(() => Array.isArray(ProductStore.getProductAboutTofinish) ? ProductStore.getProductAboutTofinish : [])
const categories = computed(() => Array.isArray(categoryStore.getCategories) ? categoryStore.getCategories : [])

// Advanced search and filter implementation
const filteredProducts = computed(() => {
    if (!Array.isArray(products.value) || products.value.length === 0) {
        return []
    }
    
    let filtered = [...products.value]
    
    // Text search - search in name, SKU, barcode, and description
    if (searchQuery.value && searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        filtered = filtered.filter(product => {
            const name = (product.name || '').toLowerCase()
            const sku = (product.sku || '').toLowerCase()
            const barcode = (product.barcode || '').toLowerCase()
            const description = (product.description || '').toLowerCase()
            const categoryName = (product.category_name || '').toLowerCase()
            const supplierName = (product.supplier_name || '').toLowerCase()
            
            return name.includes(query) ||
                   sku.includes(query) ||
                   barcode.includes(query) ||
                   description.includes(query) ||
                   categoryName.includes(query) ||
                   supplierName.includes(query)
        })
    }
    
    // Category filter
    if (categoryFilter.value && categoryFilter.value !== '') {
        filtered = filtered.filter(product => 
            product.category_id === parseInt(categoryFilter.value)
        )
    }
    
    // Status filter
    if (statusFilter.value && statusFilter.value !== '') {
        filtered = filtered.filter(product => {
            if (statusFilter.value === 'out_of_stock') {
                return product.current_stock <= 0
            }
            return product.status === statusFilter.value
        })
    }
    
    // Stock level filter
    if (stockFilter.value && stockFilter.value !== '') {
        filtered = filtered.filter(product => {
            const stock = product.current_stock || 0
            const minStock = product.min_stock_level || 0
            
            switch (stockFilter.value) {
                case 'low_stock':
                    return stock <= minStock && stock > 0
                case 'out_of_stock':
                    return stock <= 0
                case 'in_stock':
                    return stock > minStock
                case 'overstocked':
                    return stock > (minStock * 2)
                default:
                    return true
            }
        })
    }
    
    // Price range filter
    if (priceRangeFilter.value && priceRangeFilter.value !== '') {
        filtered = filtered.filter(product => {
            const price = product.selling_price || 0
            
            switch (priceRangeFilter.value) {
                case 'low':
                    return price < 10
                case 'medium':
                    return price >= 10 && price < 50
                case 'high':
                    return price >= 50 && price < 100
                case 'premium':
                    return price >= 100
                default:
                    return true
            }
        })
    }
    
    // Sort products
    if (sortBy.value && sortBy.value !== '') {
        filtered.sort((a, b) => {
            let aValue, bValue
            
            switch (sortBy.value) {
                case 'name':
                    aValue = (a.name || '').toLowerCase()
                    bValue = (b.name || '').toLowerCase()
                    break
                case 'price':
                    aValue = a.selling_price || 0
                    bValue = b.selling_price || 0
                    break
                case 'stock':
                    aValue = a.current_stock || 0
                    bValue = b.current_stock || 0
                    break
                case 'category':
                    aValue = (a.category_name || '').toLowerCase()
                    bValue = (b.category_name || '').toLowerCase()
                    break
                case 'created':
                    aValue = new Date(a.created_at || 0)
                    bValue = new Date(b.created_at || 0)
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

// Selection state
const isAllSelected = computed(() => {
    return filteredProducts.value.length > 0 && 
           filteredProducts.value.every(product => selectedProducts.value.includes(product.id))
})

const isPartiallySelected = computed(() => {
    return selectedProducts.value.length > 0 && !isAllSelected.value
})

// Search suggestions based on current products
const searchSuggestions = computed(() => {
    if (!searchQuery.value || searchQuery.value.length < 2) {
        return []
    }
    
    const query = searchQuery.value.toLowerCase()
    const suggestions = new Set()
    
    products.value.forEach(product => {
        // Add product names
        if (product.name && product.name.toLowerCase().includes(query)) {
            suggestions.add(product.name)
        }
        
        // Add SKUs
        if (product.sku && product.sku.toLowerCase().includes(query)) {
            suggestions.add(product.sku)
        }
        
        // Add categories
        if (product.category_name && product.category_name.toLowerCase().includes(query)) {
            suggestions.add(product.category_name)
        }
        
        // Add suppliers
        if (product.supplier_name && product.supplier_name.toLowerCase().includes(query)) {
            suggestions.add(product.supplier_name)
        }
    })
    
    return Array.from(suggestions).slice(0, 5) // Limit to 5 suggestions
})

// Active filters count
const activeFiltersCount = computed(() => {
    let count = 0
    if (categoryFilter.value) count++
    if (statusFilter.value) count++
    if (stockFilter.value) count++
    if (priceRangeFilter.value) count++
    return count
})

// Calculate total inventory value (stock * price)
const totalInventoryValue = computed(() => {
    if (!Array.isArray(products.value) || products.value.length === 0) {
        return '$0.00'
    }
    
    const total = products.value.reduce((sum, product) => {
        const stock = Number(product.current_stock) || 0
        const price = Number(product.selling_price) || 0
        return sum + (stock * price)
    }, 0)
    
    return total.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    })
})

// Reactive Variables
const showForm = ref(false)
const editingProduct = ref(null)
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const stockFilter = ref('')
const priceRangeFilter = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = 10
const showAdvancedFilters = ref(false)

const totalItems = computed(() => Array.isArray(filteredProducts.value) ? filteredProducts.value.length : 0)
const totalPages = computed(() => Math.max(1, Math.ceil((totalItems.value || 0) / itemsPerPage)))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalItems.value))

// Status helper functions
const getStatusClass = (status) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800'
        case 'inactive':
            return 'bg-red-100 text-red-800'
        case 'out_of_stock':
            return 'bg-yellow-100 text-yellow-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

const getStatusText = (status) => {
    switch (status) {
        case 'active':
            return 'Active'
        case 'inactive':
            return 'Inactive'
        case 'out_of_stock':
            return 'Out of Stock'
        default:
            return 'Unknown'
    }
}

// Form state
const showAddForm = ref(false)
const showEditForm = ref(false)
const selectedProduct = ref(null)
const showExportDropdown = ref(false)

// Bulk operations
const selectedProducts = ref([])
const showBulkEditModal = ref(false)

// Delete confirmation
const showDeleteConfirm = ref(false)
const productToDelete = ref(null)
    
// Helper methods
const getLoadingMessage = () => {
    if (isLoading.value) return 'Loading products...'
    if (isExporting.value) return 'Exporting data...'
    if (isDeleting.value) return 'Deleting product...'
    return 'Processing...'
}

const confirmDelete = async () => {
    if (productToDelete.value?.id) {
        await deleteProduct(productToDelete.value.id)
    }
    showDeleteConfirm.value = false
    productToDelete.value = null
}

const cancelDelete = () => {
    showDeleteConfirm.value = false
    productToDelete.value = null
}

// Clear all filters method
const clearAllFilters = () => {
    searchQuery.value = ''
    categoryFilter.value = ''
    statusFilter.value = ''
    stockFilter.value = ''
    priceRangeFilter.value = ''
    sortBy.value = 'name'
    sortOrder.value = 'asc'
    currentPage.value = 1
    showAdvancedFilters.value = false
    
    showInfo('Filters Cleared', 'All search and filter options have been reset')
}

// Apply search suggestion
const applySuggestion = (suggestion) => {
    searchQuery.value = suggestion
    showAdvancedFilters.value = false
}

// Handle search input key events
const handleSearchKeydown = (event) => {
    if (event.key === 'Enter') {
        // Focus on first result or show advanced filters
        if (filteredProducts.value.length === 0) {
            showAdvancedFilters.value = true
        }
    } else if (event.key === 'Escape') {
        searchQuery.value = ''
        showAdvancedFilters.value = false
    }
}

// Bulk operations methods
const handleBulkOperation = (operation) => {
    if (operation.operation === 'bulk-edit') {
        showBulkEditModal.value = true
    }
}

const handleBulkEditSuccess = async (result) => {
    try {
        showInfo('Updating Products', 'Refreshing product data...')
        
        // Refresh products after bulk edit
        await ProductStore.getAllProducts?.(true)
        clearSelection()
        
        showSuccess('Bulk Edit Complete', result.message || 'Products updated successfully')
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('success', 'Bulk Edit Complete', `${selectedProducts.value.length} products updated`)
        }
        
    } catch (error) {
        handleNetworkError(error, 'Bulk Edit Refresh')
        showError('Refresh Failed', 'Products were updated but failed to refresh the list')
    }
}

const clearSelection = () => {
    selectedProducts.value = []
}

const toggleProductSelection = (productId) => {
    const index = selectedProducts.value.indexOf(productId)
    if (index > -1) {
        selectedProducts.value.splice(index, 1)
    } else {
        selectedProducts.value.push(productId)
    }
}

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedProducts.value = []
    } else {
        selectedProducts.value = filteredProducts.value.map(p => p.id)
    }
}

const handleFormSubmit = async (formData) => {
    try {
        isLoading.value = true
        
        // Validate form data
        if (!formData.name || !formData.name.trim()) {
            handleValidationError(new Error('Product name is required'), 'Product Form')
            showError('Validation Error', 'Product name is required')
            return
        }
        
        if (!formData.selling_price || formData.selling_price <= 0) {
            handleValidationError(new Error('Valid selling price is required'), 'Product Form')
            showError('Validation Error', 'Please enter a valid selling price')
            return
        }
        
        if (showEditForm.value && selectedProduct.value?.id) {
            // Update existing product
            showInfo('Updating Product', 'Saving product changes...')
            await window.electronAPI?.products.update(selectedProduct.value.id, formData)
            showSuccess('Product Updated', 'Product has been updated successfully')
            
            // Add notification
            if (window.addNotification) {
                window.addNotification('success', 'Product Updated', `${formData.name} has been updated`)
            }
        } else {
            // Create new product
            showInfo('Creating Product', 'Adding new product...')
            await window.electronAPI?.products.create(formData)
            showSuccess('Product Created', 'New product has been created successfully')
            
            // Add notification
            if (window.addNotification) {
                window.addNotification('success', 'Product Created', `${formData.name} has been added`)
            }
        }
        
        // Force refresh products from DB to ensure persistence
        await ProductStore.forceRefreshProducts?.()
        
    } catch (error) {
        if (error.message?.includes('UNIQUE constraint')) {
            handleDatabaseError(error, 'Product Form')
            showError('Duplicate Product', 'A product with this name or SKU already exists')
        } else if (error.message?.includes('validation')) {
            handleValidationError(error, 'Product Form')
            showError('Validation Error', error.message)
        } else {
            handleNetworkError(error, 'Product Form')
            showError('Save Failed', 'Failed to save product. Please try again.')
        }
    } finally {
        isLoading.value = false
        closeForm()
    }
}

// Edit product method
const editProduct = (product) => {
    selectedProduct.value = { ...product }
    showEditForm.value = true
}

// Delete product method
const deleteProduct = async (productId) => {
    try {
        isDeleting.value = true
        
        // Find the product to get its name for the notification
        const product = products.value.find(p => p.id === productId)
        const productName = product?.name || 'Product'
        
        showInfo('Deleting Product', `Removing ${productName}...`)
        
        // Call the API to delete the product
        await window.electronAPI?.products.delete(productId)
        
        // Remove from local state
        products.value = products.value.filter(p => p.id !== productId)
        
        showSuccess('Product Deleted', `${productName} has been deleted successfully`)
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('success', 'Product Deleted', `${productName} has been removed`)
        }
        
    } catch (error) {
        handleDatabaseError(error, 'Product Deletion')
        showError('Delete Failed', 'Failed to delete product. Please try again.')
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('error', 'Delete Failed', 'Could not delete product')
        }
    } finally {
        isDeleting.value = false
    }
}

// Show delete confirmation
const showDeleteConfirmation = (product) => {
    productToDelete.value = product
    showDeleteConfirm.value = true
}

// Export products
const exportProductsData = async (format) => {
    try {
        isExporting.value = true
        showInfo('Exporting Data', `Preparing ${format.toUpperCase()} export...`)
        
        if (!products.value || products.value.length === 0) {
            handleBusinessLogicError(new Error('No products to export'), 'Product Export')
            showWarning('No Data', 'There are no products to export')
            return
        }
        
        const success = await exportProducts(products.value, format)
        
        if (success) {
            showSuccess('Export Complete', `Products exported successfully as ${format.toUpperCase()}`)
            
            // Add notification
            if (window.addNotification) {
                window.addNotification('success', 'Export Complete', `${products.value.length} products exported as ${format.toUpperCase()}`)
            }
        } else {
            handleBusinessLogicError(new Error('Export operation failed'), 'Product Export')
            showError('Export Failed', 'Failed to export products data')
        }
        
    } catch (error) {
        handleNetworkError(error, 'Product Export')
        showError('Export Error', 'An error occurred while exporting data. Please try again.')
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('error', 'Export Failed', 'Could not export products')
        }
    } finally {
        isExporting.value = false
        showExportDropdown.value = false
    }
}

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

/* Update status classes for dark theme */
:deep(.bg-green-100) {
    @apply bg-green-900/30;
}

:deep(.text-green-800) {
    @apply text-green-400;
}

:deep(.bg-gray-100) {
    @apply bg-gray-800/30;
}

:deep(.text-gray-800) {
    @apply text-gray-400;
}

:deep(.bg-red-100) {
    @apply bg-red-900/30;
}

:deep(.text-red-800) {
    @apply text-red-400;
}
</style>