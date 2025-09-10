<template>
    <div class="page-content">
        <!-- Header Section -->
        <div class="page-info flex justify-between items-center p-4 bg-transparent">
            <nav aria-label="breadcrumb" class="breadcrumb-nav">
                <ol class="breadcrumb flex items-center list-none m-0 p-0 gap-2">
                    <li class="breadcrumb-item flex items-center text-gray-400">
                        <a href="#" class="breadcrumb-link text-blue-600 hover:text-blue-700">Products</a>
                    </li>
                    <li class="breadcrumb-item active text-gray-400" aria-current="page">Product Units</li>
                </ol>
            </nav>
            <div class="page-options flex items-center gap-4">
                <button @click="showAddForm = true" class="btn btn-primary bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
                    <span class="material-icons-outlined">add_circle</span> 
                    Add Product Unit
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
                                <p class="text-sm">Total Product Units</p>
                                <h3 class="text-2xl font-bold">{{ productUnits.length }}</h3>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-blue-600 text-xl">
                                    straighten
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">Active Units</p>
                                <h3 class="text-2xl font-bold">{{ productUnits.length }}</h3>
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
                                <p class="text-sm">Last Updated</p>
                                <h3 class="text-lg font-bold">{{ lastUpdated }}</h3>
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
                                    placeholder="Search product units..."
                                    class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                <span class="material-icons-outlined absolute left-3 top-3 text-gray-400">
                                    search
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Product Units Table -->
                <div class="bg-transparent rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-700 border border-gray-500">
                        <thead class="bg-transparent border border-gray-500">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    ID
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Name
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Symbol
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Description
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-gray-900 divide-y divide-gray-700">
                            <tr v-for="productUnit in filteredProductUnits" :key="productUnit.id">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {{ productUnit.id }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-300">{{ productUnit.name }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300 font-mono bg-gray-800 px-2 py-1 rounded">
                                        {{ productUnit.symbol }}
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-300">{{ productUnit.description || 'No description' }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {{ formatDate(productUnit.created_at) }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button @click="editProductUnit(productUnit)" class="text-blue-400 hover:text-blue-300 mr-3">
                                        <span class="material-icons-outlined">edit</span>
                                    </button>
                                    <button @click="deleteProductUnit(productUnit.id)" class="text-red-400 hover:text-red-300">
                                        <span class="material-icons-outlined">delete</span>
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="filteredProductUnits.length === 0">
                                <td colspan="6" class="px-6 py-4 text-center text-gray-400">
                                    No product units found
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <!-- Add/Edit Modal -->
        <div v-if="showAddForm || showEditForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">
                        {{ showEditForm ? 'Edit Product Unit' : 'Add Product Unit' }}
                    </h3>
                    <button @click="closeForm" class="text-gray-400 hover:text-gray-600">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                
                <form @submit.prevent="handleSubmit">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input 
                            type="text" 
                            v-model="formData.name"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter unit name (e.g., Kilogram, Liter)"
                        >
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
                        <input 
                            type="text" 
                            v-model="formData.symbol"
                            required
                            maxlength="10"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            placeholder="Enter unit symbol (e.g., kg, L, pcs)"
                        >
                        <p class="text-xs text-gray-500 mt-1">Short symbol for the unit (max 10 characters)</p>
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea 
                            v-model="formData.description"
                            rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter description (optional)"
                        ></textarea>
                    </div>
                    
                    <div class="flex justify-end gap-3">
                        <button 
                            type="button" 
                            @click="closeForm"
                            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            :disabled="loading"
                            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {{ loading ? 'Saving...' : (showEditForm ? 'Update' : 'Create') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductUnitStore } from '../../stores/productUnit.store';

const productUnitStore = useProductUnitStore();

// Reactive data
const searchQuery = ref('');
const showAddForm = ref(false);
const showEditForm = ref(false);
const selectedProductUnit = ref(null);
const loading = ref(false);

const formData = ref({
    name: '',
    symbol: '',
    description: ''
});

// Computed properties
const productUnits = computed(() => productUnitStore.getProductUnits || []);
const lastUpdated = computed(() => {
    if (productUnits.value.length === 0) return 'Never';
    const latest = productUnits.value.reduce((latest, current) => 
        new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest
    );
    return formatDate(latest.updated_at);
});

const filteredProductUnits = computed(() => {
    if (!searchQuery.value) return productUnits.value;
    
    const query = searchQuery.value.toLowerCase();
    return productUnits.value.filter(productUnit => 
        productUnit.name.toLowerCase().includes(query) ||
        productUnit.symbol.toLowerCase().includes(query) ||
        (productUnit.description && productUnit.description.toLowerCase().includes(query))
    );
});

// Methods
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
};

const closeForm = () => {
    showAddForm.value = false;
    showEditForm.value = false;
    selectedProductUnit.value = null;
    formData.value = { name: '', symbol: '', description: '' };
};

const editProductUnit = (productUnit) => {
    selectedProductUnit.value = productUnit;
    formData.value = {
        name: productUnit.name,
        symbol: productUnit.symbol,
        description: productUnit.description || ''
    };
    showEditForm.value = true;
};

const handleSubmit = async () => {
    loading.value = true;
    try {
        // Ensure we're passing clean, serializable data
        const cleanData = {
            name: String(formData.value.name || '').trim(),
            symbol: String(formData.value.symbol || '').trim(),
            description: String(formData.value.description || '').trim()
        };
        
        if (showEditForm.value) {
            await productUnitStore.update(selectedProductUnit.value.id, cleanData);
        } else {
            await productUnitStore.create(cleanData);
        }
        closeForm();
    } catch (error) {
        console.error('Error saving product unit:', error);
        alert('Error saving product unit. Please try again.');
    } finally {
        loading.value = false;
    }
};

const deleteProductUnit = async (id) => {
    if (confirm('Are you sure you want to delete this product unit?')) {
        try {
            await productUnitStore.delete(id);
        } catch (error) {
            console.error('Error deleting product unit:', error);
            alert('Error deleting product unit. Please try again.');
        }
    }
};

// Load data on mount
onMounted(() => {
    productUnitStore.fetchProductUnits();
});
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