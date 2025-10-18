<template >
    <div class="card top-products" @mouseover="showDownload = true" @mouseleave="showDownload = false">
        <div class="card-body">
            <h5 class="card-title">{{ t('products.title_about_to_finish') }}</h5>
            <div class="top-products-list">
                <div v-for="product in productsAboutToFinish" :key="product.id" class="product-item">
                    <h5>{{ product.name }}</h5>
                    <span>{{ product.quantity }} {{ t('products.quantity') }} </span>
                </div>
            </div>
            <div v-if="showDownload" class="download-header">
                <button @click="downloadPDF" class="download-button">
                    <span class="material-icons-outlined">
                        file_download
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useProductStore } from '@/stores/product.store';
import { useI18n } from 'vue-i18n';
import jsPDF from 'jspdf';

// Define the Product interface
interface Product {
    id: number;
    name: string;
    quantity: number;
}

export default defineComponent({
    setup() {
        const { t } = useI18n();
        const productStore = useProductStore();
        const productsAboutToFinish = ref<Product[]>([]);
        const showDownload = ref(false); // State to control download button visibility

        // Function to load Products About To Finish
        async function loadProductsAboutToFinish() {
            productsAboutToFinish.value = await productStore.getProductsAboutToFinish();
        }

        // Function to download the list as a PDF
        function downloadPDF() {
            const doc = new jsPDF();
            doc.text('Products About to Finish', 10, 10);
            productsAboutToFinish.value.forEach((product, index) => {
                doc.text(`${product.name}: ${product.quantity}`, 10, 20 + (index * 10));
            });
            doc.save('products_about_to_finish.pdf');
        }

        // Load initial data
        onMounted(() => {
            loadProductsAboutToFinish();
        });

        return {
            t,
            productsAboutToFinish,
            showDownload,
            downloadPDF
        };
    }
});
</script>

<style scoped>
    /* Add any styles you need here */
    .top-products {
        background: var(--color-surface) !important;
        border: 1px solid var(--color-border) !important;
        border-radius: 10px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        height: 350px !important;
        width: 330px !important;
        position: relative !important; /* For positioning the download header */
        transition: all 0.3s ease-in-out !important;
    }

    [data-theme="dark"] .top-products {
        box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
    }

    [data-theme="light"] .top-products {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    }
    .card-body {
        padding: 25px 25px 0 25px !important;
        height: 100% !important;
    }
    .card-title {
        font-size: 1rem !important;
        font-weight: 500 !important;
        align-self: start !important;
        color: var(--color-text) !important;
    }
    .top-products-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .product-item { 
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        border-radius: 5px;
    }
    .product-item h5 {
        margin: 0 !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        color: var(--color-text) !important;
    }   
    .product-item span {
        color: var(--color-text-secondary) !important;
        font-size: 0.875rem !important;
    }
    .product-item-status {
        font-size: 1.25rem;
    }
    .product-item-success { 
        color: #2ecc71;
    }
    .product-item-danger {
        color: #c0392b;
    }   
    .download-header {
        position: absolute;
        bottom: 10px;
        right: 10px;
        padding: 5px;
    }
    .download-button {
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 0.875rem;
        color: #007bff;
    }
    .download-button i {
        margin-right: 5px;
    }
</style>