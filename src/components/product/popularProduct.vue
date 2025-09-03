<template>
    <div class="card top-products">
        <div class="card-body">
            <h5 class="card-title">{{ t('products.title') }}</h5>
            <div class="top-products-list">
                <div v-for="product in popularProducts" :key="product.id" class="product-item">
                    <h5>{{ product.name }}</h5>
                    <span>{{ product.sales }} {{ t('products.sales') }} </span>
                    <i class="material-icons product-item-status" 
                       :class="product.trend > 0 ? 'product-item-success' : 'product-item-danger'">
                        {{ product.trend > 0 ? 'arrow_upward' : 'arrow_downward' }}
                    </i>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/product.store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const productStore = useProductStore()

// Get popular products from store using getter
const popularProducts = computed(() => productStore.getPopularProducts)

// Function to load popular products
async function loadPopularProducts() {
    await productStore.fetchPopularProducts()
}

// Load initial data
onMounted(() => {
    loadPopularProducts()
})
</script>

<style scoped>
.top-products {
    background: rgb(45, 45, 45);
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    height: 350px;
    width: 350px;
}

.card-body {
    padding: 25px 25px 0 25px;
    height: 100%;
}

.top-products-list {
    height: calc(100% - 60px); /* Subtract the title height and padding */
    overflow-y: auto;
    padding-right: 10px; /* Add padding for scrollbar */
}

/* Scrollbar Styles */
.top-products-list::-webkit-scrollbar {
    width: 3px;
}

.top-products-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 1.5px;
}

.top-products-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 1.5px;
}

.top-products-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* Ensure the list items don't stick to the edges */
.product-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(229, 231, 235, 0.1);
    margin-right: 5px;
}

.product-item:last-child {
    border-bottom: none;
}

.product-item h5 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
}

.product-item span {
    color: #6b7280;
    font-size: 0.875rem;
}

.product-item-status {
    font-size: 1.25rem;
}

.product-item-success {
    color: #22c55e;
}

.product-item-danger {
    color: #ef4444;
}
</style>