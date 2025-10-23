<template>
    <div class="card top-products" @mouseover="showDownload = true" @mouseleave="showDownload = false">
        <div class="card-body">
            <h5 class="card-title">{{ t('products.title_about_to_finish') }}</h5>
            
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style="border-color: var(--color-primary)"></div>
                <p class="mt-2 text-sm" style="color: var(--color-text-secondary)">Loading...</p>
            </div>
            
            <!-- Error State -->
            <div v-else-if="error" class="text-center py-4">
                <p class="text-sm text-red-500">{{ error }}</p>
                <button @click="loadProductsAboutToFinish" class="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                    Retry
                </button>
            </div>
            
            <!-- Empty State -->
            <div v-else-if="productsAboutToFinish.length === 0" class="text-center py-4">
                <p class="text-sm" style="color: var(--color-text-secondary)">No products about to finish</p>
            </div>
            
            <!-- Products List -->
            <div v-else class="top-products-list">
                <div v-for="product in productsAboutToFinish" :key="product.id" class="product-item">
                    <h5>{{ product.name }}</h5>
                    <span>{{ product.current_stock || product.quantity }} {{ t('products.quantity') }}</span>
                </div>
            </div>
            
            <div v-if="showDownload && productsAboutToFinish.length > 0" class="download-header">
                <button @click="downloadPDF" class="download-button">
                    <span class="material-icons-outlined">
                        file_download
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product.store'
import { useI18n } from 'vue-i18n'
import jsPDF from 'jspdf'

// Composables
const { t } = useI18n()
const productStore = useProductStore()

// Reactive variables
const productsAboutToFinish = ref([])
const showDownload = ref(false)
const loading = ref(false)
const error = ref('')

// Function to load Products About To Finish
async function loadProductsAboutToFinish() {
  try {
    loading.value = true
    error.value = ''
    console.log('Loading products about to finish...')
    
    const products = await productStore.getProductsAboutToFinish()
    console.log('Products about to finish loaded:', products)
    
    productsAboutToFinish.value = products || []
    
    if (productsAboutToFinish.value.length === 0) {
      console.log('No products about to finish found')
    }
  } catch (err) {
    console.error('Error loading products about to finish:', err)
    error.value = 'Failed to load products about to finish'
    productsAboutToFinish.value = []
  } finally {
    loading.value = false
  }
}

// Function to download the list as a PDF
function downloadPDF() {
  try {
    const doc = new jsPDF()
    doc.text('Products About to Finish', 10, 10)
    productsAboutToFinish.value.forEach((product, index) => {
      const stock = product.current_stock || product.quantity || 0
      doc.text(`${product.name}: ${stock}`, 10, 20 + (index * 10))
    })
    doc.save('products_about_to_finish.pdf')
  } catch (err) {
    console.error('Error generating PDF:', err)
  }
}

// Load initial data
onMounted(() => {
  loadProductsAboutToFinish()
})
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
    
    /* Loading spinner animation */
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>