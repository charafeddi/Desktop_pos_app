<script setup>
    import { ref, onMounted, computed, watch } from 'vue';
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
    const errors = ref({});
    const isSubmitting = ref(false);
    const showSuccessMessage = ref(false);
    
    // Validation rules
    const validationRules = {
        name: {
            required: true,
            minLength: 2,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\s\-_.,()]+$/,
            message: 'Product name must be 2-100 characters and contain only letters, numbers, spaces, and basic punctuation'
        },
        sku: {
            required: true,
            minLength: 3,
            maxLength: 50,
            pattern: /^[A-Z0-9\-_]+$/,
            message: 'SKU must be 3-50 characters, uppercase letters, numbers, hyphens, and underscores only'
        },
        barcode: {
            required: false,
            pattern: /^[0-9]+$/,
            message: 'Barcode must contain only numbers'
        },
        purchase_price: {
            required: true,
            min: 0.01,
            max: 999999.99,
            message: 'Purchase price must be between $0.01 and $999,999.99'
        },
        selling_price: {
            required: true,
            min: 0.01,
            max: 999999.99,
            message: 'Selling price must be between $0.01 and $999,999.99'
        },
        tax_rate: {
            required: false,
            min: 0,
            max: 100,
            message: 'Tax rate must be between 0% and 100%'
        },
        current_stock: {
            required: false,
            min: 0,
            max: 999999,
            message: 'Current stock must be between 0 and 999,999'
        },
        min_stock_level: {
            required: false,
            min: 0,
            max: 999999,
            message: 'Minimum stock level must be between 0 and 999,999'
        },
        max_stock_level: {
            required: false,
            min: 0,
            max: 999999,
            message: 'Maximum stock level must be between 0 and 999,999'
        }
    };
    
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
        
        // Initial validation
        validateForm();
    });
    
    // Watch for changes and validate in real-time
    watch(formData, () => {
        validateForm();
    }, { deep: true });
    
    const validateField = (fieldName, value) => {
        const rule = validationRules[fieldName];
        if (!rule) return null;
        
        // Required field validation
        if (rule.required && (!value || value.toString().trim() === '')) {
            return `${fieldName.replace('_', ' ')} is required`;
        }
        
        // Skip other validations if field is empty and not required
        if (!value || value.toString().trim() === '') {
            return null;
        }
        
        // Min length validation
        if (rule.minLength && value.toString().length < rule.minLength) {
            return `${fieldName.replace('_', ' ')} must be at least ${rule.minLength} characters`;
        }
        
        // Max length validation
        if (rule.maxLength && value.toString().length > rule.maxLength) {
            return `${fieldName.replace('_', ' ')} must be no more than ${rule.maxLength} characters`;
        }
        
        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value.toString())) {
            return rule.message;
        }
        
        // Numeric range validation
        if (rule.min !== undefined && parseFloat(value) < rule.min) {
            return `${fieldName.replace('_', ' ')} must be at least ${rule.min}`;
        }
        
        if (rule.max !== undefined && parseFloat(value) > rule.max) {
            return `${fieldName.replace('_', ' ')} must be no more than ${rule.max}`;
        }
        
        return null;
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        // Validate each field
        Object.keys(validationRules).forEach(fieldName => {
            const error = validateField(fieldName, formData.value[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
            }
        });
        
        // Business logic validations
        if (formData.value.selling_price && formData.value.purchase_price) {
            const sellingPrice = parseFloat(formData.value.selling_price);
            const purchasePrice = parseFloat(formData.value.purchase_price);
            
            if (sellingPrice < purchasePrice) {
                newErrors.selling_price = 'Selling price should not be less than purchase price';
            }
        }
        
        if (formData.value.max_stock_level && formData.value.min_stock_level) {
            const maxStock = parseInt(formData.value.max_stock_level);
            const minStock = parseInt(formData.value.min_stock_level);
            
            if (maxStock < minStock) {
                newErrors.max_stock_level = 'Maximum stock level should not be less than minimum stock level';
            }
        }
        
        // Required dropdown validations
        if (!formData.value.category_id) {
            newErrors.category_id = 'Category is required';
        }
        
        if (!formData.value.product_type_id) {
            newErrors.product_type_id = 'Product type is required';
        }
        
        if (!formData.value.product_unit_id) {
            newErrors.product_unit_id = 'Product unit is required';
        }
        
        if (!formData.value.supplier_id) {
            newErrors.supplier_id = 'Supplier is required';
        }
        
        errors.value = newErrors;
    };
    
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                errors.value.image = 'Image size must be less than 5MB';
                return;
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                errors.value.image = 'Please select a valid image file';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                formData.value.image = e.target.result;
                delete errors.value.image; // Clear image error
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async () => {
        validateForm();
        
        // Check if there are any errors
        if (Object.keys(errors.value).length > 0) {
            return;
        }
        
        isSubmitting.value = true;
        
        try {
            // Get current user ID from auth store
            const currentUser = authStore.getCurrentUser;
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Prepare data for submission
            const submitData = {
                ...formData.value,
                user_id: currentUser.id,
                // Convert string values to numbers where needed
                category_id: parseInt(formData.value.category_id),
                product_type_id: parseInt(formData.value.product_type_id),
                product_unit_id: parseInt(formData.value.product_unit_id),
                supplier_id: parseInt(formData.value.supplier_id),
                purchase_price: parseFloat(formData.value.purchase_price),
                selling_price: parseFloat(formData.value.selling_price),
                tax_rate: parseFloat(formData.value.tax_rate) || 0,
                min_stock_level: parseInt(formData.value.min_stock_level) || 0,
                current_stock: parseInt(formData.value.current_stock) || 0,
                max_stock_level: parseInt(formData.value.max_stock_level) || 0
            };

            // Normalize optional unique fields to null when blank
            if (typeof submitData.barcode === 'string' && submitData.barcode.trim() === '') {
                submitData.barcode = null;
            }

            emit('submit', submitData);
            
            // Show success message
            showSuccessMessage.value = true;
            setTimeout(() => {
                showSuccessMessage.value = false;
            }, 3000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            errors.value.submit = error.message || 'An error occurred while submitting the form';
        } finally {
            isSubmitting.value = false;
        }
    };

    // Computed properties for form validation
    const isFormValid = computed(() => {
        return Object.keys(errors.value).length === 0 && 
               formData.value.name && 
               formData.value.sku && 
               formData.value.category_id && 
               formData.value.product_type_id && 
               formData.value.product_unit_id && 
               formData.value.supplier_id && 
               formData.value.purchase_price && 
               formData.value.selling_price;
    });
    
    const hasErrors = computed(() => {
        return Object.keys(errors.value).length > 0;
    });
</script> 

<template>
    <div class="p-6 product-form">
        <!-- Success Message -->
        <div v-if="showSuccessMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                Product {{ isEditing ? 'updated' : 'created' }} successfully!
            </div>
        </div>

        <!-- Submit Error Message -->
        <div v-if="errors.submit" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                {{ errors.submit }}
            </div>
        </div>

        <!-- Form Content -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Product Name -->
                <div class="col-span-2">
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.name') }} *
                    </label>
                    <input
                        v-model="formData.name"
                        type="text"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                        :class="{ 'border-red-500': errors.name }"
                        required
                    >
                    <div v-if="errors.name" class="mt-1 text-sm text-red-600">
                        {{ errors.name }}
                    </div>
                </div>

                <!-- SKU -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.sku') }} *
                    </label>
                    <input
                        v-model="formData.sku"
                        type="text"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                        :class="{ 'border-red-500': errors.sku }"
                        required
                    >
                    <div v-if="errors.sku" class="mt-1 text-sm text-red-600">
                        {{ errors.sku }}
                    </div>
                </div>

                <!-- Barcode -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.barcode') }}
                    </label>
                    <input
                        v-model="formData.barcode"
                        type="text"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                        :class="{ 'border-red-500': errors.barcode }"
                    >
                    <div v-if="errors.barcode" class="mt-1 text-sm text-red-600">
                        {{ errors.barcode }}
                    </div>
                </div>

                <!-- Category -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.category') }} *
                    </label>
                    <select
                        v-model="formData.category_id"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                        :class="{ 'border-red-500': errors.category_id }"
                        required
                    >
                        <option value="">Select Category</option>
                        <option v-for="cat in categoryStore.getCategories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </option>
                    </select>
                    <div v-if="errors.category_id" class="mt-1 text-sm text-red-600">
                        {{ errors.category_id }}
                    </div>
                </div>

                <!-- Product Type -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.product_type') }} *
                    </label>
                    <select
                        v-model="formData.product_type_id"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                        :class="{ 'border-red-500': errors.product_type_id }"
                        required
                    >
                        <option value="">Select Product Type</option>
                        <option v-for="pt in productTypeStore.getProductTypes" :key="pt.id" :value="pt.id">
                            {{ pt.name }}
                        </option>
                    </select>
                    <div v-if="errors.product_type_id" class="mt-1 text-sm text-red-600">
                        {{ errors.product_type_id }}
                    </div>
                </div>

                <!-- Product Unit -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.product_unit') }} *
                    </label>
                    <select
                        v-model="formData.product_unit_id"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                        :class="{ 'border-red-500': errors.product_unit_id }"
                        required
                    >
                        <option value="">Select Product Unit</option>
                        <option v-for="pu in productUnitStore.getProductUnits" :key="pu.id" :value="pu.id">
                            {{ pu.name }} ({{ pu.symbol }})
                        </option>
                    </select>
                    <div v-if="errors.product_unit_id" class="mt-1 text-sm text-red-600">
                        {{ errors.product_unit_id }}
                    </div>
                </div>

                <!-- Supplier -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.supplier') }} *
                    </label>
                    <select
                        v-model="formData.supplier_id"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                        :class="{ 'border-red-500': errors.supplier_id }"
                        required
                    >
                        <option value="">Select Supplier</option>
                        <option v-for="sup in supplierStore.getSuppliers" :key="sup.id" :value="sup.id">
                            {{ sup.name }}
                        </option>
                    </select>
                    <div v-if="errors.supplier_id" class="mt-1 text-sm text-red-600">
                        {{ errors.supplier_id }}
                    </div>
                </div>

                <!-- Purchase Price -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.purchase_price') }} *
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-2 label-text">$</span>
                        <input
                            v-model="formData.purchase_price"
                            type="number"
                            step="0.01"
                            min="0"
                            class="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none input-control"
                            :class="{ 'border-red-500': errors.purchase_price }"
                            required
                        >
                    </div>
                    <div v-if="errors.purchase_price" class="mt-1 text-sm text-red-600">
                        {{ errors.purchase_price }}
                    </div>
                </div>

                <!-- Selling Price -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.selling_price') }} *
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-2 label-text">$</span>
                        <input
                            v-model="formData.selling_price"
                            type="number"
                            step="0.01"
                            min="0"
                            class="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none input-control"
                            :class="{ 'border-red-500': errors.selling_price }"
                            required
                        >
                    </div>
                    <div v-if="errors.selling_price" class="mt-1 text-sm text-red-600">
                        {{ errors.selling_price }}
                    </div>
                </div>

                <!-- Tax Rate -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.tax_rate') }} (%)
                    </label>
                    <input
                        v-model="formData.tax_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                        :class="{ 'border-red-500': errors.tax_rate }"
                    >
                    <div v-if="errors.tax_rate" class="mt-1 text-sm text-red-600">
                        {{ errors.tax_rate }}
                    </div>
                </div>

                <!-- Current Stock -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.current_stock') }}
                    </label>
                    <input
                        v-model="formData.current_stock"
                        type="number"
                        min="0"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                        :class="{ 'border-red-500': errors.current_stock }"
                    >
                    <div v-if="errors.current_stock" class="mt-1 text-sm text-red-600">
                        {{ errors.current_stock }}
                    </div>
                </div>

                <!-- Minimum Stock Level -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.min_stock_level') }}
                    </label>
                    <input
                        v-model="formData.min_stock_level"
                        type="number"
                        min="0"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                        :class="{ 'border-red-500': errors.min_stock_level }"
                    >
                    <div v-if="errors.min_stock_level" class="mt-1 text-sm text-red-600">
                        {{ errors.min_stock_level }}
                    </div>
                </div>

                <!-- Maximum Stock Level -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.max_stock_level') }}
                    </label>
                    <input
                        v-model="formData.max_stock_level"
                        type="number"
                        min="0"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                        :class="{ 'border-red-500': errors.max_stock_level }"
                    >
                    <div v-if="errors.max_stock_level" class="mt-1 text-sm text-red-600">
                        {{ errors.max_stock_level }}
                    </div>
                </div>

                <!-- Status -->
                <div>
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.status') }}
                    </label>
                    <select
                        v-model="formData.status"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>
                </div>

                <!-- Image Upload -->
                <div class="col-span-2">
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.image') }}
                    </label>
                    <div class="flex items-center space-x-4">
                        <div class="w-20 h-20 border rounded-lg overflow-hidden preview-box">
                            <img
                                v-if="formData.image"
                                :src="formData.image"
                                alt="Product"
                                class="w-full h-full object-cover"
                            >
                            <div v-else class="w-full h-full flex items-center justify-center preview-placeholder">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-text-secondary)">
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
                                class="px-4 py-2 border rounded-lg button-secondary"
                            >
                                Choose Image
                            </button>
                        </div>
                    </div>
                    <div v-if="errors.image" class="mt-1 text-sm text-red-600">
                        {{ errors.image }}
                    </div>
                </div>

                <!-- Description -->
                <div class="col-span-2">
                    <label class="block text-sm font-medium mb-1 label-text">
                        {{ t('product.description') }}
                    </label>
                    <textarea
                        v-model="formData.description"
                        rows="3"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none input-control"
                    ></textarea>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="col-span-2 mt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    @click="$emit('close')"
                    class="px-4 py-2 border rounded-lg button-secondary"
                    :disabled="isSubmitting"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    :disabled="!isFormValid || isSubmitting"
                    :class="isFormValid && !isSubmitting ? 'button-primary' : 'button-disabled'"
                    class="px-4 py-2 text-white rounded-lg"
                >
                    <span v-if="isSubmitting" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {{ isEditing ? 'Updating...' : 'Adding...' }}
                    </span>
                    <span v-else>
                        {{ isEditing ? 'Update Product' : 'Add Product' }}
                    </span>
                </button>
            </div>
            
            <!-- Form Validation Summary -->
            <div v-if="hasErrors" class="col-span-2 mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    Please fix the following errors before submitting:
                </div>
                <ul class="mt-2 ml-6 list-disc">
                    <li v-for="(error, field) in errors" :key="field" class="text-sm">
                        {{ error }}
                    </li>
                </ul>
            </div>
        </form>
    </div>
</template>

<style scoped>
.product-form { color: var(--color-text) !important; }
.label-text { color: var(--color-text-secondary) !important; }
.input-control {
    border-color: var(--color-border) !important;
    background-color: var(--color-surface) !important;
    color: var(--color-text) !important;
}
.input-control:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary) !important;
    border-color: var(--color-primary) !important;
}
.preview-box { border-color: var(--color-border) !important; }
.preview-placeholder { background-color: var(--color-background) !important; }
.button-secondary {
    border-color: var(--color-border) !important;
    background-color: var(--color-surface) !important;
    color: var(--color-text) !important;
}
.button-secondary:hover { background-color: var(--color-background) !important; }
.button-primary { background-color: var(--color-primary) !important; }
.button-primary:hover { filter: brightness(0.95); }
.button-disabled { background-color: var(--color-border) !important; cursor: not-allowed; }
</style>