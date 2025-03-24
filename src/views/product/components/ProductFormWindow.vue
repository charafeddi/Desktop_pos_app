<template>
    <div>
        <!-- This component doesn't need a template as it only handles window creation -->
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
const { ipcRenderer } = require('electron');

const props = defineProps({
    isEditing: {
        type: Boolean,
        default: false
    },
    product: {
        type: Object,
        default: () => ({
            id: null,
            name: '',
            description: '',
            price: 0,
            category_id: null
        })
    },
    categories: {
        type: Array,
        required: true,
        default: () => []
    }
});

const emit = defineEmits(['close', 'submit', 'error']);

onMounted(() => {
    try {
        // Ensure we only send serializable data with safe property access
        const serializableData = {
            isEditing: props.isEditing,
            product: {
                id: props.product?.id ?? null,
                name: props.product?.name ?? '',
                description: props.product?.description ?? '',
                price: props.product?.price ?? 0,
                category_id: props.product?.category_id ?? null
            },
            categories: (props.categories || []).map(category => ({
                id: category?.id ?? null,
                name: category?.name ?? '',
                // Add other serializable properties as needed
            }))
        };

        // Open the popup window through IPC
        ipcRenderer.send('open-product-form', serializableData);

        // Listen for form submission
        ipcRenderer.on('product-form-submitted', (event, data) => {
            emit('submit', data);
            emit('close');
        });
    } catch (error) {
        console.error('Error opening product form:', error);
        emit('error', error);
        emit('close');
    }
});

onUnmounted(() => {
    try {
        ipcRenderer.removeAllListeners('product-form-submitted');
    } catch (error) {
        console.error('Error cleaning up event listener:', error);
    }
});
</script> 