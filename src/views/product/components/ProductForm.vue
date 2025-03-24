<script setup>
    import { ref, onMounted } from 'vue';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();

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
        category: '',
        price: '',
        cost: '',
        stock: '',
        minStock: '',
        status: 'active',
        image: '',
        description: ''
    });
    
    const fileInput = ref(null);
    
    onMounted(() => {
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
        emit('submit', { ...formData.value });
    };
</script> 

<template>
    <div class="p-6">
        <!-- Form Content -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Product Name -->
                <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.name') }}
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
                        {{ t('product.sku') }}
                    </label>
                    <input
                        v-model="formData.sku"
                        type="text"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                </div>

                <!-- Category -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.category') }}
                    </label>
                    <select
                        v-model="formData.category"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Category</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </option>
                    </select>
                </div>

                <!-- Price -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.price') }}
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-gray-400">$</span>
                        <input
                            v-model="formData.price"
                            type="number"
                            step="0.01"
                            class="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                    </div>
                </div>

                <!-- Cost -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.cost') }}
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-gray-400">$</span>
                        <input
                            v-model="formData.cost"
                            type="number"
                            step="0.01"
                            class="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                    </div>
                </div>

                <!-- Stock -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.stock') }}
                    </label>
                    <input
                        v-model="formData.stock"
                        type="number"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                </div>

                <!-- Minimum Stock -->
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">
                        {{ t('product.min_stock') }}
                    </label>
                    <input
                        v-model="formData.minStock"
                        type="number"
                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
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
                        required
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
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    {{ isEditing ? 'Update Product' : 'Add Product' }}
                </button>
            </div>
        </form>
    </div>
</template>