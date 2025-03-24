<template>
    <div class="h-screen bg-gray-900 flex flex-col">
        <!-- Custom Title Bar -->
        <div class="bg-gray-800 h-8 flex items-center justify-between px-4">
            <div class="text-gray-300 text-sm">
                {{ isEditing ? t('product.edit_product') : t('product.add_new_product') }}
            </div>
            <div class="flex items-center space-x-2">
                <button @click="handleClose" class="text-gray-400 hover:text-gray-300">
                    <span class="material-icons-outlined text-sm">close</span>
                </button>
            </div>
        </div>

        <!-- Form Content -->
        <div class="flex-1 overflow-auto p-4">
            <ProductForm
                :is-editing="isEditing"
                :product="product"
                :categories="categories"
                @close="handleClose"
                @submit="handleSubmit"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ProductForm from './ProductForm.vue';
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

const handleClose = () => {
    try {
        if (window.electronAPI) {
            window.electronAPI.closePopup();
        }
        emit('close');
    } catch (error) {
        console.error('Error closing popup:', error);
        emit('close');
    }
};

const handleSubmit = (formData) => {
    try {
        if (window.electronAPI) {
            window.electronAPI.submitProductForm(formData);
        }
        handleClose();
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};

// Handle escape key
onMounted(() => {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            handleClose();
        }
    });
});
</script>

<style>
/* Custom scrollbar for the form content */
.overflow-auto::-webkit-scrollbar {
    width: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
    background: #1a1a1a;
}

.overflow-auto::-webkit-scrollbar-thumb {
    background: #4a4a4a;
    border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
    background: #5a5a5a;
}
</style> 