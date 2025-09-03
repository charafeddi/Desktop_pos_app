<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useI18n } from 'vue-i18n';
    import { useCategoryStore } from '../../../stores/category.store';
    import { useSupplierStore } from '../../../stores/supplier.store';
    import { useProductTypeStore } from '../../../stores/productType.store';
    import { useProductUnitStore } from '../../../stores/productUnit.store';
    import { useAuthStore } from '../../../stores/auth.store';

    const { t } = useI18n();
    const categoryStore = useCategoryStore();
    const supplierStore = useSupplierStore();
    const productTypeStore = useProductTypeStore();
    const productUnitStore = useProductUnitStore();
    const authStore = useAuthStore();

    const props = defineProps({
        isEditing: {
            type: Boolean,
            default: false
        },
        product: {
            type: Object,
            default: () => ({})
        },
        categories: {
            type: Array,
            required: true
        }
    });
    
    const emit = defineEmits(['close', 'submit']);
    
    const formData = ref({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        category_id: '',
        product_type_id: '',
        product_unit_id: '',
        supplier_id: '',
        purchase_price: '',
        selling_price: '',
        tax_rate: 0,
        min_stock_level: 0,
        current_stock: 0,
        max_stock_level: 0,
        status: 'active',
        image: ''
    });
    
    const fileInput = ref(null);
    
    onMounted(async () => {
        // Load all related data
        await Promise.all([
            categoryStore.fetchCategories(),
            supplierStore.fetchSuppliers(),
            productTypeStore.fetchProductTypes(),
            productUnitStore.fetchProductUnits()
        ]);

        // Populate form if editing
        if (props.isEditing && props.product) {
            formData.value = { ...props.product };
        }
    });
    
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                formData.value.image = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = () => {
        // Get current user ID from auth store
        const currentUser = authStore.getCurrentUser;
        if (!currentUser) {
            alert('User not authenticated');
            return;
        }

        // Prepare data for submission
        const submitData = {
            ...formData.value,
            user_id: currentUser.id, // Add the logged-in user ID
            // Convert string values to numbers where needed
            category_id: parseInt(formData.value.category_id),
            product_type_id: parseInt(formData.value.product_type_id),
            product_unit_id: parseInt(formData.value.product_unit_id),
            supplier_id: parseInt(formData.value.supplier_id),
            purchase_price: parseFloat(formData.value.purchase_price),
            selling_price: parseFloat(formData.value.selling_price),
            tax_rate: parseFloat(formData.value.tax_rate),
            min_stock_level: parseInt(formData.value.min_stock_level),
            current_stock: parseInt(formData.value.current_stock),
            max_stock_level: parseInt(formData.value.max_stock_level)
        };

        emit('submit', submitData);
    };

    // Computed properties for form validation
    const isFormValid = computed(() => {
        return formData.value.name && 
               formData.value.sku && 
               formData.value.category_id && 
               formData.value.product_type_id && 
               formData.value.product_unit_id && 
               formData.value.supplier_id && 
               formData.value.purchase_price && 
               formData.value.selling_price;
    });
</script> 

<template>
    <div class="p-6">
        <!-- Form Content -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Product Name -->
                <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.name') }} *
                    </label>
                    <input
                        v-model="formData.name"
                        type="text"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                </div>

                <!-- SKU -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.sku') }} *
                    </label>
                    <input
                        v-model="formData.sku"
                        type="text"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                </div>

                <!-- Barcode -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.barcode') }}
                    </label>
                    <input
                        v-model="formData.barcode"
                        type="text"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                </div>

                <!-- Category -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.category') }} *
                    </label>
                    <select
                        v-model="formData.category_id"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Category</option>
                        <option v-for="cat in categoryStore.getCategories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </option>
                    </select>
                </div>

                <!-- Product Type -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.product_type') }} *
                    </label>
                    <select
                        v-model="formData.product_type_id"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Product Type</option>
                        <option v-for="pt in productTypeStore.getProductTypes" :key="pt.id" :value="pt.id">
                            {{ pt.name }}
                        </option>
                    </select>
                </div>

                <!-- Product Unit -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.product_unit') }} *
                    </label>
                    <select
                        v-model="formData.product_unit_id"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Product Unit</option>
                        <option v-for="pu in productUnitStore.getProductUnits" :key="pu.id" :value="pu.id">
                            {{ pu.name }} ({{ pu.symbol }})
                        </option>
                    </select>
                </div>

                <!-- Supplier -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.supplier') }} *
                    </label>
                    <select
                        v-model="formData.supplier_id"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Supplier</option>
                        <option v-for="sup in supplierStore.getSuppliers" :key="sup.id" :value="sup.id">
                            {{ sup.name }}
                        </option>
                    </select>
                </div>

                <!-- Purchase Price -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.purchase_price') }} *
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-gray-400">$</span>
                        <input
                            v-model="formData.purchase_price"
                            type="number"
                            step="0.01"
                            min="0"
                            class="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                    </div>
                </div>

                <!-- Selling Price -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.selling_price') }} *
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-gray-400">$</span>
                        <input
                            v-model="formData.selling_price"
                            type="number"
                            step="0.01"
                            min="0"
                            class="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                    </div>
                </div>

                <!-- Tax Rate -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.tax_rate') }} (%)
                    </label>
                    <input
                        v-model="formData.tax_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                </div>

                <!-- Current Stock -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.current_stock') }}
                    </label>
                    <input
                        v-model="formData.current_stock"
                        type="number"
                        min="0"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                </div>

                <!-- Minimum Stock Level -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.min_stock_level') }}
                    </label>
                    <input
                        v-model="formData.min_stock_level"
                        type="number"
                        min="0"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                </div>

                <!-- Maximum Stock Level -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.max_stock_level') }}
                    </label>
                    <input
                        v-model="formData.max_stock_level"
                        type="number"
                        min="0"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                </div>

                <!-- Status -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.status') }}
                    </label>
                    <select
                        v-model="formData.status"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>
                </div>

                <!-- Image Upload -->
                <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.image') }}
                    </label>
                    <div class="flex items-center space-x-4">
                        <div class="w-20 h-20 border rounded-lg overflow-hidden">
                            <img
                                v-if="formData.image"
                                :src="formData.image"
                                alt="Product"
                                class="w-full h-full object-cover"
                            >
                            <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div class="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                @change="handleImageUpload"
                                class="hidden"
                                ref="fileInput"
                            >
                            <button
                                type="button"
                                @click="$refs.fileInput.click()"
                                class="px-4 py-2 border rounded-lg hover:bg-gray-500"
                            >
                                Choose Image
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Description -->
                <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.description') }}
                    </label>
                    <textarea
                        v-model="formData.description"
                        rows="3"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="col-span-2 mt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    @click="$emit('close')"
                    class="px-4 py-2 border rounded-lg hover:bg-gray-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    :disabled="!isFormValid"
                    :class="isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'"
                    class="px-4 py-2 text-white rounded-lg"
                >
                    {{ isEditing ? 'Update Product' : 'Add Product' }}
                </button>
            </div>
        </form>
    </div>
</template>