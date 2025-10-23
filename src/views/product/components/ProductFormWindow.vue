<template>
    <div class="fixed inset-0 flex items-center justify-center z-50 modal-overlay">
        <div class="rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto modal-container">
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 modal-header">
                <h2 class="text-xl font-semibold modal-title">
                    {{ isEditing ? 'Edit Product' : 'Add New Product' }}
                </h2>
                <button 
                    @click="$emit('close')" 
                    class="transition-colors modal-close"
                >
                    <span class="material-icons-outlined text-2xl">close</span>
                </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 modal-body">
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

<style scoped>
.modal-overlay {
    background-color: rgba(0, 0, 0, 0.45);
}

[data-theme="light"] .modal-overlay {
    background-color: rgba(0, 0, 0, 0.35);
}

[data-theme="dark"] .modal-overlay {
    background-color: rgba(0, 0, 0, 0.6);
}

.modal-container {
    background-color: var(--color-surface) !important;
    color: var(--color-text) !important;
    border: 1px solid var(--color-border) !important;
    transition: all 0.3s ease-in-out;
}

.modal-header {
    border-bottom: 1px solid var(--color-border) !important;
}

.modal-title {
    color: var(--color-text) !important;
}

.modal-close {
    color: var(--color-text-secondary) !important;
}
.modal-close:hover {
    color: var(--color-text) !important;
}

.modal-body {
    color: var(--color-text) !important;
}

[data-theme="light"] .modal-container {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12) !important;
}

[data-theme="dark"] .modal-container {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6) !important;
}
</style>