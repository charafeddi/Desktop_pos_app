<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useProductStore } from '@/stores/product.store'
import { useCategoryStore } from '@/stores/category.store'
import { useCustomerStore } from '@/stores/Customers.store'
import { useSalesStore } from '@/stores/sales.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useI18n } from 'vue-i18n'
import Quagga from 'quagga'
import { Receipt, createReceiptFromSale } from '@/utils/receiptUtils'
import ReceiptPreview from '@/components/printer/ReceiptPreview.vue'

// Composables
const { t } = useI18n()

// Stores
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const customerStore = useCustomerStore()
const salesStore = useSalesStore()
const settingsStore = useSettingsStore()

// Reactive Variables
const cart = ref([])
const searchQuery = ref('')
const selectedCategory = ref('all')
const barcodeInput = ref('')
const showQuantityModal = ref(false)
const selectedProduct = ref(null)
const quantityInput = ref(1)
const customPriceInput = ref(0)
const showCustomPrice = ref(false)
const selectedTaxRate = ref(null)
const selectedCustomerId = ref(null)
const discountPercentage = ref(0)
const paymentMethod = ref('cash')
const cashReceived = ref(0)
const showPaymentModal = ref(false)
const showScannerModal = ref(false)
const isScanning = ref(false)
const scannerError = ref('')
const showReceiptPreview = ref(false)
// Computed Properties
const products = computed(() => productStore.getProducts)
const customers = computed(() => customerStore.getCustomers)
const categories = computed(() => {
  const cats = ['all', ...new Set(products.value.map(p => p.category_id))]
  return cats
})
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         product.barcode.includes(searchQuery.value)
    const matchesCategory = selectedCategory.value === 'all' || product.category_id.toString() === selectedCategory.value
    const isActive = product.is_active !== false
    return matchesSearch && matchesCategory && isActive
  })
})

const cartSubtotal = computed(() => {
  return cart.value.reduce((total, item) => {
    const price = item.customPrice || item.selling_price
    const discount = item.discount || 0
    const discountedPrice = price * (1 - discount / 100)
    return total + (discountedPrice * item.quantity)
  }, 0)
})
  
  const cartTax = computed(() => {
    return cart.value.reduce((total, item) => {
      const price = item.customPrice || item.selling_price
      const discount = item.discount || 0
      const discountedPrice = price * (1 - discount / 100)
      const itemSubtotal = discountedPrice * item.quantity
      
      // Use item-specific tax rate if available, otherwise use default
      const taxRate = item.taxRate || (settingsStore.getDefaultTaxRate?.rate || 0)
      
      return total + (itemSubtotal * taxRate / 100)
    }, 0)
  })
  
  // Calculate tax breakdown by rate
  const taxBreakdown = computed(() => {
    const breakdown = new Map()
    
    cart.value.forEach(item => {
      const price = item.customPrice || item.selling_price
      const discount = item.discount || 0
      const discountedPrice = price * (1 - discount / 100)
      const itemSubtotal = discountedPrice * item.quantity
      
      // Use item-specific tax rate if available, otherwise use default
      const taxRate = item.taxRate || (settingsStore.getDefaultTaxRate?.rate || 0)
      
      if (taxRate > 0) {
        const taxAmount = itemSubtotal * taxRate / 100
        const existingAmount = breakdown.get(taxRate) || 0
        breakdown.set(taxRate, existingAmount + taxAmount)
      }
    })
    
    return Array.from(breakdown.entries()).map(([rate, amount]) => ({
      rate,
      amount,
      name: settingsStore.getTaxRates.find(tr => tr.rate === rate)?.name || `${rate}% Tax`
    }))
  })
  
  const cartTotal = computed(() => {
    return cartSubtotal.value + cartTax.value
  })
  
  const change = computed(() => {
    return Math.max(0, cashReceived.value - cartTotal.value)
  })
  
  // Load data on mount
  onMounted(async () => {
    await productStore.getAllProducts()
    await categoryStore.fetchCategories()
    await customerStore.fetchCustomers()
})

// Methods
function addToCart(product, quantity = 1) {
  if (product.current_stock < quantity) {
    alert(`Only ${product.current_stock} items available in stock`)
    return
  }
    
    const existingItem = cart.value.find(item => item.id === product.id)
    if (existingItem) {
      if (existingItem.quantity + quantity > product.current_stock) {
        alert(`Only ${product.current_stock} items available in stock`)
        return
      }
      existingItem.quantity += quantity
    } else {
      // Add product with default tax rate from settings
      const defaultTaxRate = settingsStore.getDefaultTaxRate?.rate || 0
      cart.value.push({ 
        ...product, 
        quantity,
        taxRate: defaultTaxRate
      })
    }
  }
  
  function openQuantityModal(product) {
    selectedProduct.value = product
    quantityInput.value = 1
    customPriceInput.value = product.selling_price
    selectedTaxRate.value = settingsStore.getDefaultTaxRate?.rate || 0
    showQuantityModal.value = true
    nextTick(() => {
      document.getElementById('quantity-input')?.focus()
    })
  }
  
  function confirmAddToCart() {
    if (selectedProduct.value) {
      const product = selectedProduct.value
      const quantity = quantityInput.value
      const customPrice = customPriceInput.value
      const taxRate = selectedTaxRate.value
      
      if (product.current_stock < quantity) {
        alert(`Only ${product.current_stock} items available in stock`)
        return
      }
      
      const existingItem = cart.value.find(item => item.id === product.id)
      if (existingItem) {
        if (existingItem.quantity + quantity > product.current_stock) {
          alert(`Only ${product.current_stock} items available in stock`)
          return
        }
        existingItem.quantity += quantity
        if (customPrice !== product.selling_price) {
          existingItem.customPrice = customPrice
        }
        if (taxRate !== (settingsStore.getDefaultTaxRate?.rate || 0)) {
          existingItem.taxRate = taxRate
        }
      } else {
        cart.value.push({ 
          ...product, 
          quantity,
          customPrice: customPrice !== product.selling_price ? customPrice : undefined,
          taxRate: taxRate
        })
      }
      
      showQuantityModal.value = false
      selectedProduct.value = null
    }
  }
  
  function removeFromCart(productId) {
    const index = cart.value.findIndex(item => item.id === productId)
    if (index !== -1) {
      cart.value.splice(index, 1)
    }
  }
  
  function updateQuantity(productId, newQuantity) {
    const item = cart.value.find(item => item.id === productId)
    if (item) {
      if (newQuantity <= 0) {
        removeFromCart(productId)
      } else if (newQuantity > item.current_stock) {
        alert(`Only ${item.current_stock} items available in stock`)
      } else {
        item.quantity = newQuantity
      }
    }
  }
  
  function updateCustomPrice(productId, newPrice) {
    const item = cart.value.find(item => item.id === productId)
    if (item) {
      item.customPrice = newPrice
    }
  }
  
  function applyDiscount(productId, discount) {
    const item = cart.value.find(item => item.id === productId)
    if (item) {
      item.discount = discount
    }
  }
  
  function searchByBarcode() {
    if (barcodeInput.value.trim()) {
      const product = products.value.find(p => p.barcode === barcodeInput.value.trim())
      if (product) {
        openQuantityModal(product)
        barcodeInput.value = ''
      } else {
        alert(t('POS.product_not_found'))
      }
    }
  }

  // Barcode Scanner Functions
  function openScanner() {
    showScannerModal.value = true
    scannerError.value = ''
    nextTick(() => {
      startScanner()
    })
  }

  function closeScanner() {
    stopScanner()
    showScannerModal.value = false
    scannerError.value = ''
  }

  function startScanner() {
    if (isScanning.value) return

    isScanning.value = true
    scannerError.value = ''

    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('#scanner-container'),
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment" // Use back camera
        },
      },
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ]
      },
      locate: true,
      locator: {
        patchSize: "medium",
        halfSample: true
      }
    }, function(err) {
      if (err) {
        console.error('Scanner initialization error:', err)
        scannerError.value = 'Failed to initialize camera scanner'
        isScanning.value = false
        return
      }
      Quagga.start()
    })

    // Handle successful barcode detection
    Quagga.onDetected(function(result) {
      const code = result.codeResult.code
      
      // Find product by barcode
      const product = products.value.find(p => p.barcode === code)
      if (product) {
        // Stop scanner and close modal
        stopScanner()
        showScannerModal.value = false
        
        // Add product to cart
        openQuantityModal(product)
      } else {
        scannerError.value = `Product with barcode ${code} not found`
        // Keep scanner running for next scan
      }
    })
  }

  function stopScanner() {
    if (isScanning.value) {
      Quagga.stop()
      isScanning.value = false
    }
  }

  // Cleanup scanner on component unmount
  onUnmounted(() => {
    stopScanner()
  })
  
  function openPaymentModal() {
    if (cart.value.length === 0) {
      alert('Cart is empty')
      return
    }
    showPaymentModal.value = true
    cashReceived.value = cartTotal.value
  }
  
  async function processPayment() {
    try {
      // Prepare sale data
      const saleData = {
        customer_id: selectedCustomerId.value,
        total_amount: cartSubtotal.value,
        discount_amount: 0, // TODO: Implement discount calculation
        tax_amount: cartTax.value,
        final_amount: cartTotal.value,
        payment_method: paymentMethod.value,
        items: cart.value.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.customPrice || item.selling_price,
          total_amount: (item.customPrice || item.selling_price) * item.quantity,
          tax_rate: settingsStore.getDefaultTaxRate?.rate || 0
        }))
      }
      
      
      // Create the sale in the database
      const newSale = await salesStore.createSale(saleData)
      
      
      // Get customer and cashier info for receipt
      const customerInfo = selectedCustomerId.value ? 
        customers.value.find(c => c.id === selectedCustomerId.value) : null
      
      // Show receipt preview with sale data
      showReceiptPreview.value = true
      
      // Clear cart and reset form
      cart.value = []
      selectedCustomerId.value = null
      discountPercentage.value = 0
      showPaymentModal.value = false
      
      alert('Sale completed successfully! Check receipt preview.')
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Error processing payment. Please try again.')
    }
  }
  
  function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
      cart.value = []
    }
  }

  
  // Keyboard shortcuts
  function handleKeydown(event) {
    if (event.key === 'Enter' && barcodeInput.value) {
      searchByBarcode()
    }
  }
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }
</script>
    
<template>
  <div class="min-h-screen" @keydown="handleKeydown">
    <!-- Header -->
    <div class="shadow-sm border-b">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-400">Point of Sale</h1>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-600">
              {{ new Date().toLocaleDateString() }} - {{ new Date().toLocaleTimeString() }}
            </div>
            <div class="text-sm font-medium text-gray-400">
              Items: {{ cart.length }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex h-[calc(100vh-80px)]">
      <!-- Products Section -->
      <div class="flex-1 flex flex-col">
        <!-- Search and Barcode Section -->
        <div class="p-4 border-b">
          <div class="flex space-x-4">
            <!-- Barcode Scanner Input -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-500 mb-2">{{ t('POS.barcode_scanner') }}</label>
              <div class="flex">
                <input
                  v-model="barcodeInput"
                  type="text"
                  :placeholder="t('POS.scan_or_enter_barcode')"
                  class="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  @keydown.enter="searchByBarcode"
                >
                <button
                  @click="openScanner"
                  class="px-4 py-3 bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  :title="t('POS.open_camera_scanner')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
                <button
                  @click="searchByBarcode"
                  class="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Search Input -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-500 mb-2">Search Products</label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name, SKU, or description..."
                class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
          </div>
        </div>

        <!-- Category Filter -->
        <div class=" p-4 border-b">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in categories"
              :key="category"
              @click="selectedCategory = category"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ category === 'all' ? 'All Categories' : `Category ${category}` }}
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="flex-1 p-4 overflow-auto">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
              @click="openQuantityModal(product)"
            >
              <!-- Product Image -->
              <div class="aspect-square bg-gray-100 rounded-t-xl flex items-center justify-center">
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.name"
                  class="w-full h-full object-cover rounded-t-xl"
                >
                <div v-else class="text-gray-400">
                  <img src="/assets/img/product-no-image.png" alt="Product" class="w-12 h-12 mx-auto">
                </div>
              </div>
              
              <!-- Product Info -->
              <div class="p-4">
                <h3 class="font-semibold text-gray-400 text-sm mb-1 line-clamp-2">{{ product.name }}</h3>
                <p class="text-xs text-gray-500 mb-2">SKU: {{ product.sku }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-bold text-blue-600">{{ formatCurrency(product.selling_price) }}</span>
                  <span class="text-xs text-gray-500">Stock: {{ product.current_stock }}</span>
                </div>
                
                <!-- Stock Warning -->
                <div v-if="product.current_stock <= product.min_stock_level" class="mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Low Stock
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Section -->
      <div class="w-96 border-l border-gray-200 flex flex-col">
        <!-- Cart Header -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-400">Shopping Cart</h2>
            <button
              @click="clearCart"
              :disabled="cart.length === 0"
              class="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-auto p-4">
          <div v-if="cart.length === 0" class="text-center text-gray-500 mt-8">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
            </svg>
            <p>Your cart is empty</p>
            <p class="text-sm">Add products to get started</p>
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="item in cart"
              :key="item.id"
              class="bg-gray-50 rounded-lg p-3"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <h3 class="font-medium text-gray-400 text-sm">{{ item.name }}</h3>
                  <p class="text-xs text-gray-500">SKU: {{ item.sku }}</p>
                </div>
                <button
                  @click="removeFromCart(item.id)"
                  class="text-red-500 hover:text-red-700"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <!-- Price and Quantity Controls -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <button
                    @click="updateQuantity(item.id, item.quantity - 1)"
                    class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    :value="item.quantity"
                    @change="updateQuantity(item.id, parseInt($event.target.value) || 1)"
                    class="w-12 text-center border border-gray-300 rounded py-1 text-sm"
                    type="number"
                    min="1"
                    :max="item.current_stock"
                  >
                  <button
                    @click="updateQuantity(item.id, item.quantity + 1)"
                    class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                
                <div class="text-right">
                  <div class="font-semibold text-gray-400">
                    {{ formatCurrency((item.customPrice || item.selling_price) * item.quantity) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatCurrency(item.customPrice || item.selling_price) }} each
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="border-t border-gray-200 p-4">
          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Subtotal:</span>
              <span class="font-medium">{{ formatCurrency(cartSubtotal) }}</span>
            </div>
            
            <!-- Tax Breakdown -->
            <div v-if="taxBreakdown.length > 0">
              <div v-for="tax in taxBreakdown" :key="tax.rate" class="flex justify-between text-sm">
                <span class="text-gray-400">{{ tax.name }}:</span>
                <span class="font-medium">{{ formatCurrency(tax.amount) }}</span>
              </div>
            </div>
            
            <!-- Single Tax Line (if no breakdown) -->
            <div v-else-if="cartTax > 0" class="flex justify-between text-sm">
              <span class="text-gray-400">Tax:</span>
              <span class="font-medium">{{ formatCurrency(cartTax) }}</span>
            </div>
            
            <div class="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span class="text-blue-600">{{ formatCurrency(cartTotal) }}</span>
            </div>
          </div>
          
          <button
            @click="openPaymentModal"
            :disabled="cart.length === 0"
            class="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ t('POS.process_payment')}}
          </button>
        </div>
      </div>
    </div>

    <!-- Quantity Modal -->
    <div v-if="showQuantityModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-96 max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Add to Cart</h3>
        
        <div v-if="selectedProduct" class="mb-4">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <h4 class="font-medium">{{ selectedProduct.name }}</h4>
              <p class="text-sm text-gray-500">Stock: {{ selectedProduct.current_stock }}</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                id="quantity-input"
                v-model.number="quantityInput"
                type="number"
                min="1"
                :max="selectedProduct.current_stock"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tax Rate</label>
              <select
                v-model="selectedTaxRate"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">No Tax (0%)</option>
                <option 
                  v-for="taxRate in settingsStore.getTaxRates" 
                  :key="taxRate.id" 
                  :value="taxRate.rate"
                >
                  {{ taxRate.name }} ({{ taxRate.rate }}%)
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Price (optional)</label>
              <input
                v-model.number="customPriceInput"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :placeholder="formatCurrency(selectedProduct.selling_price)"
              >
            </div>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button
            @click="showQuantityModal = false"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {{t('POS.Cancel')}}
          </button>
          <button
            @click="confirmAddToCart"
            class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {{t('POS.add_to_cart')}}
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-96 max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">{{ t('POS.process_payment')}}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Customer (optional)</label>
            <select
              v-model="selectedCustomerId"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Walk-in Customer</option>
              <option 
                v-for="customer in customers" 
                :key="customer.id" 
                :value="customer.id"
              >
                {{ customer.name }} {{ customer.email ? `(${customer.email})` : '' }}
              </option>
            </select>
            
            <!-- Debug info -->
            <div v-if="customers.length > 0" class="text-xs text-gray-500 mt-1">
              {{ customers.length }} customers available
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              v-model="paymentMethod"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile Payment</option>
            </select>
          </div>
          
          <div v-if="paymentMethod === 'cash'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Cash Received</label>
            <input
              v-model.number="cashReceived"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <div v-if="change > 0" class="mt-2 text-sm text-green-600">
              Change: {{ formatCurrency(change) }}
            </div>
          </div>
          
          <div class="bg-gray-50 p-3 rounded-lg">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ formatCurrency(cartTotal) }}</div>
              <div class="text-sm text-gray-500">Total Amount</div>
            </div>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button
            @click="showPaymentModal = false"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="processPayment"
            :disabled="paymentMethod === 'cash' && cashReceived < cartTotal"
            class="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>

    <!-- Barcode Scanner Modal -->
    <div v-if="showScannerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeScanner">
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-900">{{ t('POS.barcode_scanner') }}</h3>
          <button
            @click="closeScanner"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="text-center mb-4">
          <p class="text-gray-600">{{ t('POS.scanner_instructions') }}</p>
        </div>

        <!-- Scanner Container -->
        <div class="relative">
          <div id="scanner-container" class="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div v-if="!isScanning" class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-600">{{ t('POS.initializing_camera') }}</p>
            </div>
          </div>
          
          <!-- Scanner Overlay -->
          <div v-if="isScanning" class="absolute inset-0 pointer-events-none">
            <div class="absolute inset-0 bg-black bg-opacity-20"></div>
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-32 border-2 border-white rounded-lg">
              <div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
              <div class="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
              <div class="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
              <div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="scannerError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ scannerError }}</p>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-800">
                <strong>{{ t('POS.scanner_instructions_detailed') }}</strong>
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3 mt-6">
          <button
            @click="closeScanner"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {{ t('POS.close_scanner') }}
          </button>
          <button
            v-if="scannerError"
            @click="startScanner"
            class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {{ t('POS.retry') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Receipt Preview Modal -->
    <ReceiptPreview 
      v-if="showReceiptPreview"
      :sale-data="{
        customer_id: selectedCustomerId.value,
        total_amount: cartSubtotal.value,
        discount_amount: 0,
        tax_amount: cartTax.value,
        final_amount: cartTotal.value,
        payment_method: paymentMethod.value,
        items: cart.value.map(item => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.customPrice || item.selling_price,
          total_amount: (item.customPrice || item.selling_price) * item.quantity,
          tax_rate: settingsStore.getDefaultTaxRate?.rate || 0,
          discount_amount: item.discount || 0
        }))
      }"
      :customer="selectedCustomerId.value ? customers.find(c => c.id === selectedCustomerId.value) : null"
      :cashier="{ name: 'Current User' }"
      @close="showReceiptPreview = false"
    />
  </div>
</template>