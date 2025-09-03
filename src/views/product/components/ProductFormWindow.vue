<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-black rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-100">
                    {{ isEditing ? 'Edit Product' : 'Add New Product' }}
                </h2>
                <button 
                    @click="$emit('close')" 
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <span class="material-icons-outlined text-2xl">close</span>
                </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6">
                <ProductForm 
                    :is-editing="isEditing"
                    :product="product"
                    :categories="categories"
                    @close="$emit('close')"
                    @submit="handleFormSubmit"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import ProductForm from './ProductForm.vue';

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

const handleFormSubmit = (formData) => {
    emit('submit', formData);
};
</script> 