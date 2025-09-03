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
                <button class="btn btn-secondary  rounded-lg px-4 py-2 hover:bg-gray-500">
                    <span class="material-icons-outlined">filter_alt</span> 
                    {{ t('product.filter') }}
                </button>
                <button @click="showAddForm = true" class="btn btn-primary bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
                    <span class="material-icons-outlined">
                        add_circle
                    </span> 
                    {{ t('product.add_product') }}
                </button>
            </div>
        </div>

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
                                <p class="text-sm">{{ t('product.low_stock') }}</p>
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
                                <p class="text-sm">{{ t('product.categories') }}</p>
                                <h3 class="text-2xl font-bold"> {{categories.length }} </h3>
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
                                <h3 class="text-2xl font-bold">$45,678</h3>
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
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1">
                            <div class="relative">
                                <input 
                                    type="text" 
                                    v-model="searchQuery"
                                    placeholder="Search products..."
                                    class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                <span class="material-icons-outlined absolute left-3 top-3 text-gray-400">
                                    search
                                </span>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <select v-model="categoryFilter" class="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">All Categories</option>
                                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                            </select>
                            <select v-model="statusFilter" class="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Products Table -->
                <div class="bg-transparent rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-700 border border-gray-500">
                        <thead class="bg-transparent border border-gray-500">
                            <tr>
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
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-10 w-10">
                                            <img class="h-10 w-10 rounded-full" :src="product.image" :alt="product.name">
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-300">{{ product.name }}</div>
                                            <div class="text-sm text-gray-400">{{ product.sku }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ product.category }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ product.stock }}</div>
                                    <div class="text-sm text-gray-400">{{ t('product.min_stock') }}: {{ product.minStock }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ t('product.price') }}: ${{ product.price }}</div>
                                    <div class="text-sm text-gray-400">{{ t('product.cost') }}: ${{ product.cost }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="getStatusClass(product.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                        {{ product.status }}
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
    </div>
</template>
<script setup>
    import { ref, computed, onMounted } from 'vue';
    import ProductFormWindow from './components/ProductFormWindow.vue';
    import { useI18n } from 'vue-i18n';
    import { useCategoryStore } from '../../stores/category.store';
    import { useProductStore } from '../../stores/product.store';
    const { t } = useI18n();
    const ProductStore = useProductStore();
    const categoryStore = useCategoryStore();
    // Load products on mount and guard against undefined
    onMounted(() => {
        ProductStore.getAllProducts?.();
        ProductStore.getProductsAboutToFinish?.();
        categoryStore.fetchCategories?.();
    });
    const products = computed(() => Array.isArray(ProductStore.getProducts) ? ProductStore.getProducts : []);
    const productsAboutToFinish = computed(() => Array.isArray(ProductStore.getProductAboutTofinish) ? ProductStore.getProductAboutTofinish: []);


    const categories = computed(() => categoryStore.getCategories || []);
    
    // Filters
    const searchQuery = ref('');
    const categoryFilter = ref('');
    const statusFilter = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 10;
    
    // Computed properties
    const filteredProducts = computed(() => {
        const source = Array.isArray(products.value) ? products.value : [];
        let filtered = source;

        // Apply search filter
        if (searchQuery.value) {
            const q = String(searchQuery.value || '').toLowerCase();
            filtered = filtered.filter(product => {
                const name = typeof product?.name === 'string' ? product.name.toLowerCase() : '';
                const sku = typeof product?.sku === 'string' ? product.sku.toLowerCase() : '';
                return name.includes(q) || sku.includes(q);
            });
        }

        // Apply category filter
        if (categoryFilter.value) {
            filtered = filtered.filter(product => product?.category === categoryFilter.value);
        }

        // Apply status filter
        if (statusFilter.value) {
            filtered = filtered.filter(product => product?.status === statusFilter.value);
        }

        return Array.isArray(filtered) ? filtered : [];
    });
    
    const totalItems = computed(() => Array.isArray(filteredProducts.value) ? filteredProducts.value.length : 0);
    const totalPages = computed(() => Math.max(1, Math.ceil((totalItems.value || 0) / itemsPerPage)));
    const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
    const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalItems.value));
    
    // Methods
    const getStatusClass = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'out_of_stock':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    // Form state
    const showAddForm = ref(false);
    const showEditForm = ref(false);
    const selectedProduct = ref(null);
    
    // Form methods
    const closeForm = () => {
        showAddForm.value = false;
        showEditForm.value = false;
        selectedProduct.value = null;
    };
    
    const handleFormSubmit = (formData) => {
        if (showEditForm.value) {
            // Update existing product
            const index = products.value.findIndex(p => p.id === selectedProduct.value.id);
            if (index !== -1) {
                products.value[index] = { ...products.value[index], ...formData };
            }
        } else {
            // Add new product
            const newProduct = {
                id: products.value.length + 1,
                ...formData
            };
            products.value.push(newProduct);
        }
        closeForm();
    };
    
    // Edit product method
    const editProduct = (product) => {
        selectedProduct.value = { ...product };
        showEditForm.value = true;
    };
    
    // Delete product method
    const deleteProduct = (productId) => {
        if (confirm('Are you sure you want to delete this product?')) {
            products.value = products.value.filter(p => p.id !== productId);
        }
    };

    
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