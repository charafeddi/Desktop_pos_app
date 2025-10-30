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
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useToast } from '@/utils/toastManager'
import { useErrorHandler } from '@/utils/errorHandler'
import { formatCurrency } from '@/utils/currency'

// Composables
const { t } = useI18n()
const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()
const { handleNetworkError, handleDatabaseError, handleValidationError, handleBusinessLogicError } = useErrorHandler()

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
const discountAmount = ref(0)
const discountType = ref('percentage') // 'percentage' or 'amount'
const paymentMethod = ref('cash')
const cashReceived = ref(0)
const showPaymentModal = ref(false)
const showScannerModal = ref(false)
const scannerError = ref('')
const showReceiptPreview = ref(false)
const receiptData = ref(null)

// Advanced filter variables
const categoryFilter = ref('')
const priceRangeFilter = ref('')
const stockFilter = ref('')
const supplierFilter = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')
const showAdvancedFilters = ref(false)

// Loading states
const isLoading = ref(false)
const isProcessingPayment = ref(false)
const isClearingCart = ref(false)
const isScanning = ref(false)

// Confirmation dialog state
const showClearCartConfirm = ref(false)

// Helper methods
const getLoadingMessage = () => {
  if (isLoading.value) return 'Loading POS data...'
  if (isProcessingPayment.value) return 'Processing payment...'
  if (isClearingCart.value) return 'Clearing cart...'
  if (isScanning.value) return 'Scanning barcode...'
  return 'Processing...'
}

const confirmClearCart = async () => {
  try {
    isClearingCart.value = true
    showInfo('Clearing Cart', 'Removing all items from cart...')
    
    cart.value = []
    
    showSuccess('Cart Cleared', 'All items have been removed from cart')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Cart Cleared', 'All items removed')
    }
  } catch (error) {
    handleNetworkError(error, 'Clear Cart')
    showError('Clear Failed', 'An error occurred while clearing the cart')
  } finally {
    isClearingCart.value = false
    showClearCartConfirm.value = false
  }
}

const cancelClearCart = () => {
  showClearCartConfirm.value = false
}
// Computed Properties
const products = computed(() => productStore.getProducts)
const customers = computed(() => customerStore.getCustomers)
const categories = computed(() => {
  const cats = ['all', ...new Set(products.value.map(p => p.category_id))]
  return cats
})

// Unique values for filter dropdowns
const uniqueCategories = computed(() => {
  const categoryMap = new Map()
  products.value.forEach(product => {
    if (product.category_id && product.category_name) {
      categoryMap.set(product.category_id, {
        id: product.category_id,
        name: product.category_name
      })
    }
  })
  return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const uniqueSuppliers = computed(() => {
  const supplierMap = new Map()
  products.value.forEach(product => {
    if (product.supplier_id && product.supplier_name) {
      supplierMap.set(product.supplier_id, {
        id: product.supplier_id,
        name: product.supplier_name
      })
    }
  })
  return Array.from(supplierMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (categoryFilter.value) count++
  if (priceRangeFilter.value) count++
  if (stockFilter.value) count++
  if (supplierFilter.value) count++
  return count
})

// Advanced search and filter implementation
const filteredProducts = computed(() => {
  if (!Array.isArray(products.value) || products.value.length === 0) {
    return []
  }
  
  let filtered = [...products.value]
  
  // Text search - search in name, SKU, barcode, description, category name, supplier name
  if (searchQuery.value && searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(product => {
      const name = (product.name || '').toLowerCase()
      const sku = (product.sku || '').toLowerCase()
      const barcode = (product.barcode || '').toLowerCase()
      const description = (product.description || '').toLowerCase()
      const categoryName = (product.category_name || '').toLowerCase()
      const supplierName = (product.supplier_name || '').toLowerCase()
      
      return name.includes(query) ||
             sku.includes(query) ||
             barcode.includes(query) ||
             description.includes(query) ||
             categoryName.includes(query) ||
             supplierName.includes(query)
    })
  }
  
  // Category filter
  if (categoryFilter.value && categoryFilter.value !== '') {
    filtered = filtered.filter(product => 
      product.category_id.toString() === categoryFilter.value
    )
  }
  
  // Price range filter
  if (priceRangeFilter.value && priceRangeFilter.value !== '') {
    filtered = filtered.filter(product => {
      const price = Number(product.selling_price) || 0
      
      switch (priceRangeFilter.value) {
        case 'low':
          return price < 10
        case 'medium':
          return price >= 10 && price < 50
        case 'high':
          return price >= 50 && price < 100
        case 'premium':
          return price >= 100
        default:
          return true
      }
    })
  }
  
  // Stock level filter
  if (stockFilter.value && stockFilter.value !== '') {
    filtered = filtered.filter(product => {
      const stock = Number(product.current_stock) || 0
      const minStock = Number(product.min_stock_level) || 0
      const maxStock = Number(product.max_stock_level) || 0
      
      switch (stockFilter.value) {
        case 'in_stock':
          return stock > minStock
        case 'low_stock':
          return stock > 0 && stock <= minStock
        case 'out_of_stock':
          return stock === 0
        case 'overstocked':
          return maxStock > 0 && stock > maxStock
        default:
          return true
      }
    })
  }
  
  // Supplier filter
  if (supplierFilter.value && supplierFilter.value !== '') {
    filtered = filtered.filter(product => 
      product.supplier_id.toString() === supplierFilter.value
    )
  }
  
  // Only show active products
  filtered = filtered.filter(product => product.is_active !== false)
  
  // Sort products
  if (sortBy.value && sortBy.value !== '') {
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy.value) {
        case 'name':
          aValue = (a.name || '').toLowerCase()
          bValue = (b.name || '').toLowerCase()
          break
        case 'price':
          aValue = Number(a.selling_price) || 0
          bValue = Number(b.selling_price) || 0
          break
        case 'stock':
          aValue = Number(a.current_stock) || 0
          bValue = Number(b.current_stock) || 0
          break
        case 'sku':
          aValue = (a.sku || '').toLowerCase()
          bValue = (b.sku || '').toLowerCase()
          break
        case 'category':
          aValue = (a.category_name || '').toLowerCase()
          bValue = (b.category_name || '').toLowerCase()
          break
        default:
          return 0
      }
      
      if (sortOrder.value === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })
  }
  
  return filtered
})

const cartSubtotal = computed(() => {
  return cart.value.reduce((total, item) => {
    const price = item.customPrice || item.selling_price
    const discount = item.discount || 0
    const discountedPrice = price * (1 - discount / 100)
    return total + (discountedPrice * item.quantity)
  }, 0)
})

const overallDiscountAmount = computed(() => {
  if (discountType.value === 'percentage') {
    return cartSubtotal.value * (discountPercentage.value / 100)
  } else {
    return Math.min(discountAmount.value, cartSubtotal.value) // Can't discount more than subtotal
  }
})

const cartAfterDiscount = computed(() => {
  return cartSubtotal.value - overallDiscountAmount.value
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
  return cartAfterDiscount.value + cartTax.value
})
  
  const change = computed(() => {
    return Math.max(0, cashReceived.value - cartTotal.value)
  })
  
  // Load data on mount
  onMounted(async () => {
    try {
      isLoading.value = true
      showInfo('Loading POS Data', 'Fetching products, categories, and customers...')
      
      // Load all required data with error handling
      await Promise.all([
        productStore.getAllProducts(),
        categoryStore.fetchCategories(),
        customerStore.fetchCustomers()
      ])
      
      showSuccess('POS Ready', 'Point of sale system loaded successfully')
      
      // Add keyboard shortcut event listeners
      window.addEventListener('complete-sale', handleCompleteSaleShortcut)
      window.addEventListener('cancel-operation', handleCancelOperation)
      window.addEventListener('focus-search', handleFocusSearch)
      
    } catch (error) {
      handleNetworkError(error, 'POS Data Loading')
      showError('Loading Failed', 'Failed to load POS data. Please refresh the page.')
    } finally {
      isLoading.value = false
    }
  })

  onUnmounted(() => {
    // Remove keyboard shortcut event listeners
    window.removeEventListener('complete-sale', handleCompleteSaleShortcut)
    window.removeEventListener('cancel-operation', handleCancelOperation)
    window.removeEventListener('focus-search', handleFocusSearch)
  })

  // Keyboard shortcut handlers
  const handleCompleteSaleShortcut = () => {
    if (cart.value.length > 0 && !showPaymentModal.value) {
      showPaymentModal.value = true
    }
  }

  const handleCancelOperation = () => {
    if (showPaymentModal.value) {
      showPaymentModal.value = false
    } else if (showQuantityModal.value) {
      showQuantityModal.value = false
    } else if (showScannerModal.value) {
      showScannerModal.value = false
    } else if (showReceiptPreview.value) {
      showReceiptPreview.value = false
    }
  }

  const handleFocusSearch = () => {
    // Focus on the search input
    const searchInput = document.querySelector('input[type="text"]')
    if (searchInput) {
      searchInput.focus()
    }
  }

// Clear all filters method
const clearAllFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  priceRangeFilter.value = ''
  stockFilter.value = ''
  supplierFilter.value = ''
  sortBy.value = 'name'
  sortOrder.value = 'asc'
  showAdvancedFilters.value = false
  
  showInfo('Filters Cleared', 'All search and filter options have been reset')
}

// Handle search input key events
const handleSearchKeydown = (event) => {
  if (event.key === 'Enter') {
    // Focus on first result or show advanced filters
    if (filteredProducts.value.length === 0) {
      showAdvancedFilters.value = true
    }
  } else if (event.key === 'Escape') {
    searchQuery.value = ''
    showAdvancedFilters.value = false
  }
}

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
    try {
      if (!barcodeInput.value.trim()) {
        handleValidationError(new Error('Barcode is required'), 'Barcode Search')
        showError('Barcode Required', 'Please enter a barcode to search')
        return
      }

      const product = products.value.find(p => p.barcode === barcodeInput.value.trim())
      
      if (product) {
        openQuantityModal(product)
        showSuccess('Product Found', `${product.name} found`)
        barcodeInput.value = ''
        
        // Add notification
        if (window.addNotification) {
          window.addNotification('success', 'Product Found', `${product.name} ready to add`)
        }
      } else {
        handleBusinessLogicError(new Error('Product not found'), 'Barcode Search')
        showWarning('Product Not Found', `No product found with barcode: ${barcodeInput.value}`)
        barcodeInput.value = ''
      }
    } catch (error) {
      handleNetworkError(error, 'Barcode Search')
      showError('Search Failed', 'An error occurred while searching for product')
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
    try {
      if (isScanning.value) return

      isScanning.value = true
      scannerError.value = ''
      showInfo('Starting Scanner', 'Initializing barcode scanner...')

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
          handleNetworkError(err, 'Barcode Scanner')
          showError('Scanner Error', 'Failed to initialize barcode scanner')
          scannerError.value = 'Failed to initialize camera scanner'
          isScanning.value = false
          return
        }
        
        showSuccess('Scanner Ready', 'Barcode scanner initialized successfully')
        Quagga.start()
      })

      // Handle successful barcode detection
      Quagga.onDetected(function(result) {
        try {
          const code = result.codeResult.code
          
          // Find product by barcode
          const product = products.value.find(p => p.barcode === code)
          if (product) {
            showSuccess('Product Scanned', `${product.name} detected`)
            
            // Stop scanner and close modal
            stopScanner()
            showScannerModal.value = false
            
            // Add product to cart
            openQuantityModal(product)
            
            // Add notification
            if (window.addNotification) {
              window.addNotification('success', 'Product Scanned', `${product.name} detected`)
            }
          } else {
            handleBusinessLogicError(new Error('Product not found'), 'Barcode Scanner')
            showWarning('Product Not Found', `No product found with barcode: ${code}`)
            scannerError.value = `Product with barcode ${code} not found`
            // Keep scanner running for next scan
          }
        } catch (error) {
          handleNetworkError(error, 'Barcode Detection')
          showError('Detection Error', 'An error occurred while processing barcode')
          scannerError.value = 'Error processing barcode'
        }
      })
    } catch (error) {
      handleNetworkError(error, 'Barcode Scanner')
      showError('Scanner Failed', 'An error occurred while starting the scanner')
      scannerError.value = 'Failed to start scanner'
      isScanning.value = false
    }
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
      isProcessingPayment.value = true
      
      // Validate required data
      if (!cart.value || cart.value.length === 0) {
        handleValidationError(new Error('Cart is empty'), 'Payment Processing')
        showError('Empty Cart', 'Please add items to cart before processing payment')
        return
      }

      // Validate payment method
      if (!paymentMethod.value) {
        handleValidationError(new Error('Payment method not selected'), 'Payment Processing')
        showError('Payment Method Required', 'Please select a payment method')
        return
      }

      // Validate cash payment
      if (paymentMethod.value === 'cash' && cashReceived.value < cartTotal.value) {
        handleValidationError(new Error('Insufficient cash received'), 'Payment Processing')
        showError('Insufficient Cash', `Cash received ($${cashReceived.value}) is less than total ($${cartTotal.value})`)
        return
      }

      showInfo('Processing Payment', 'Creating sale record...')

      // Get default tax rate safely
      const defaultTaxRate = settingsStore?.getDefaultTaxRate?.rate || 0

      // Prepare sale data
      const saleData = {
        customer_id: selectedCustomerId.value || null,
        total_amount: cartSubtotal.value || 0,
        discount_amount: overallDiscountAmount.value || 0,
        tax_amount: cartTax.value || 0,
        final_amount: cartTotal.value || 0,
        payment_method: paymentMethod.value || 'cash',
        discount_type: discountType.value || 'percentage',
        discount_value: discountType.value === 'percentage' ? 
          (discountPercentage.value || 0) : (discountAmount.value || 0),
        items: cart.value.map(item => ({
          product_id: item.id,
          quantity: item.quantity || 1,
          unit_price: item.customPrice || item.selling_price || 0,
          total_amount: (item.customPrice || item.selling_price || 0) * (item.quantity || 1),
          discount_amount: item.discount || 0,
          tax_rate: item.taxRate || defaultTaxRate
        }))
      }
      
      // Create the sale in the database
      const newSale = await salesStore.createSale(saleData)
      
      if (!newSale) {
        throw new Error('Failed to create sale record')
      }
      
      // Get customer and cashier info for receipt
      const customerInfo = selectedCustomerId.value ? 
        (customers.value || []).find(c => c.id === selectedCustomerId.value) : null
      
      // Store sale data for receipt before clearing cart
      const receiptSaleData = {
        customer_id: selectedCustomerId.value,
        total_amount: cartSubtotal.value,
        discount_amount: overallDiscountAmount.value,
        tax_amount: cartTax.value,
        final_amount: cartTotal.value,
        payment_method: paymentMethod.value,
        discount_type: discountType.value,
        discount_value: discountType.value === 'percentage' ? 
          (discountPercentage.value || 0) : (discountAmount.value || 0),
        items: cart.value.map(item => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity || 1,
          unit_price: item.customPrice || item.selling_price || 0,
          total_amount: (item.customPrice || item.selling_price || 0) * (item.quantity || 1),
          tax_rate: item.taxRate || defaultTaxRate,
          discount_amount: item.discount || 0
        }))
      }
      
      // Show success message
      showSuccess('Payment Processed', `Sale completed successfully! Total: $${cartTotal.value}`)
      
      // Add notification
      if (window.addNotification) {
        window.addNotification('success', 'Sale Completed', `Payment processed for $${cartTotal.value}`)
      }
      
      // Close payment modal
      showPaymentModal.value = false
      
      // Clear cart and reset form
      cart.value = []
      selectedCustomerId.value = null
      discountPercentage.value = 0
      discountAmount.value = 0
      discountType.value = 'percentage'
      cashReceived.value = 0
      
      // Show receipt preview with stored sale data
      showReceiptPreview.value = true
      receiptData.value = receiptSaleData
      
    } catch (error) {
      if (error.message?.includes('validation') || error.message?.includes('required')) {
        handleValidationError(error, 'Payment Processing')
        showError('Validation Error', error.message)
      } else if (error.message?.includes('database') || error.message?.includes('constraint')) {
        handleDatabaseError(error, 'Payment Processing')
        showError('Database Error', 'Failed to save sale record. Please try again.')
      } else {
        handleNetworkError(error, 'Payment Processing')
        showError('Payment Failed', 'An error occurred while processing payment. Please try again.')
      }
      
      // Add notification
      if (window.addNotification) {
        window.addNotification('error', 'Payment Failed', 'Could not process payment')
      }
    } finally {
      isProcessingPayment.value = false
    }
  }
  
  function clearCart() {
    try {
      if (cart.value.length === 0) {
        handleBusinessLogicError(new Error('Cart is already empty'), 'Clear Cart')
        showWarning('Empty Cart', 'Cart is already empty')
        return
      }

      // Show confirmation dialog
      showClearCartConfirm.value = true
    } catch (error) {
      handleNetworkError(error, 'Clear Cart')
      showError('Clear Failed', 'An error occurred while clearing the cart')
    }
  }

  
  // Keyboard shortcuts
  function handleKeydown(event) {
    if (event.key === 'Enter' && barcodeInput.value) {
      searchByBarcode()
    }
  }
  
  // Using centralized formatCurrency from currency.ts
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
        <!-- Search and Filter Section -->
        <div class="p-4 border-b">
          <div class="flex flex-col gap-4">
            <!-- Main Search Bar -->
            <div class="flex flex-col lg:flex-row gap-4">
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
              
              <!-- Product Search Input -->
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-500 mb-2">Search Products</label>
                <div class="relative">
                  <input
                    v-model="searchQuery"
                    @keydown="handleSearchKeydown"
                    type="text"
                    placeholder="Search by name, SKU, barcode, description, category, or supplier..."
                    class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                  <button 
                    v-if="searchQuery"
                    @click="searchQuery = ''"
                    class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <span class="material-icons-outlined text-sm">clear</span>
                  </button>
                </div>
              </div>
              
              <!-- Filter Controls -->
              <div class="flex gap-2 items-end">
                <button 
                  @click="showAdvancedFilters = !showAdvancedFilters"
                  class="btn btn-secondary rounded-lg px-4 py-3 hover:bg-gray-500 flex items-center"
                >
                  <span class="material-icons-outlined">tune</span>
                  Filters
                  <span v-if="activeFiltersCount > 0" class="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {{ activeFiltersCount }}
                  </span>
                </button>
                <button 
                  @click="clearAllFilters"
                  class="btn btn-secondary rounded-lg px-4 py-3 hover:bg-gray-500 flex items-center"
                >
                  <span class="material-icons-outlined">clear_all</span>
                  Clear
                </button>
              </div>
            </div>
            
            <!-- Advanced Filters Panel -->
            <div v-if="showAdvancedFilters" class="border-t pt-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Category Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select v-model="categoryFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Categories</option>
                    <option v-for="category in uniqueCategories" :key="category.id" :value="category.id">{{ category.name }}</option>
                  </select>
                </div>
                
                <!-- Price Range Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <select v-model="priceRangeFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Prices</option>
                    <option value="low">Under $10</option>
                    <option value="medium">$10 - $50</option>
                    <option value="high">$50 - $100</option>
                    <option value="premium">Over $100</option>
                  </select>
                </div>
                
                <!-- Stock Level Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Stock Level</label>
                  <select v-model="stockFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Stock Levels</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="overstocked">Overstocked</option>
                  </select>
                </div>
                
                <!-- Supplier Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select v-model="supplierFilter" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Suppliers</option>
                    <option v-for="supplier in uniqueSuppliers" :key="supplier.id" :value="supplier.id">{{ supplier.name }}</option>
                  </select>
                </div>
              </div>
              
              <!-- Sort Options -->
              <div class="mt-4 flex flex-col md:flex-row gap-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <div class="flex gap-2">
                    <select v-model="sortBy" class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="name">Name</option>
                      <option value="price">Price</option>
                      <option value="stock">Stock Level</option>
                      <option value="sku">SKU</option>
                      <option value="category">Category</option>
                    </select>
                    <button 
                      @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
                      class="btn btn-secondary rounded-lg px-4 py-2 hover:bg-gray-500 flex items-center"
                    >
                      <span class="material-icons-outlined">
                        {{ sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                      </span>
                      {{ sortOrder === 'asc' ? 'Ascending' : 'Descending' }}
                    </button>
                  </div>
                </div>
                
                <!-- Results Count -->
                <div class="flex items-end">
                  <div class="text-sm text-gray-600">
                    {{ filteredProducts.length }} of {{ products.length }} products
                  </div>
                </div>
              </div>
            </div>
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
            
            <!-- Discount Line -->
            <div v-if="overallDiscountAmount > 0" class="flex justify-between text-sm text-green-600">
              <span class="text-gray-400">Discount:</span>
              <span class="font-medium">-{{ formatCurrency(overallDiscountAmount) }}</span>
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
          
          <!-- Discount Section -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Discount</label>
            <div class="flex space-x-2 mb-2">
              <select
                v-model="discountType"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="amount">Fixed Amount ($)</option>
              </select>
              <input
                v-if="discountType === 'percentage'"
                v-model.number="discountPercentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="0"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <input
                v-else
                v-model.number="discountAmount"
                type="number"
                min="0"
                :max="cartSubtotal"
                step="0.01"
                placeholder="0.00"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div v-if="overallDiscountAmount > 0" class="text-sm text-green-600">
              Discount: -{{ formatCurrency(overallDiscountAmount) }}
            </div>
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
          
          <!-- Order Summary -->
          <div class="bg-gray-50 p-3 rounded-lg space-y-2">
            <div class="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{{ formatCurrency(cartSubtotal) }}</span>
            </div>
            <div v-if="overallDiscountAmount > 0" class="flex justify-between text-sm text-green-600">
              <span>Discount:</span>
              <span>-{{ formatCurrency(overallDiscountAmount) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Tax:</span>
              <span>{{ formatCurrency(cartTax) }}</span>
            </div>
            <div class="border-t pt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <span class="text-blue-600">{{ formatCurrency(cartTotal) }}</span>
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
      v-if="showReceiptPreview && receiptData"
      :sale-data="receiptData"
      :customer="receiptData.customer_id ? customers.find(c => c.id === receiptData.customer_id) : null"
      :cashier="{ name: 'Current User' }"
      @close="showReceiptPreview = false; receiptData = null"
    />
    
    <!-- Loading Spinner -->
    <LoadingSpinner 
      v-if="isLoading || isProcessingPayment || isClearingCart"
      :message="getLoadingMessage()"
      :fullscreen="true"
    />
    
    <!-- Confirmation Dialog for Clear Cart -->
    <ConfirmationDialog
      :is-open="showClearCartConfirm"
      :title="'Clear Cart'"
      :message="'Are you sure you want to clear all items from the cart? This action cannot be undone.'"
      :type="'warning'"
      :confirm-text="'Clear Cart'"
      :cancel-text="'Cancel'"
      :is-loading="isClearingCart"
      @confirm="confirmClearCart"
      @cancel="cancelClearCart"
    />
  </div>
</template>

<style scoped>
.btn {
  @apply transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

/* Dark theme support */
:deep(.bg-gray-100) {
  @apply bg-gray-800/30;
}

:deep(.text-gray-700) {
  @apply text-gray-300;
}

:deep(.text-gray-600) {
  @apply text-gray-400;
}

:deep(.border-gray-200) {
  @apply border-gray-600;
}

:deep(.border-gray-300) {
  @apply border-gray-500;
}

/* Dark theme adjustments */
:deep(.bg-blue-100) {
  @apply bg-blue-900/30;
}

:deep(.text-blue-600) {
  @apply text-blue-400;
}

:deep(.bg-green-100) {
  @apply bg-green-900/30;
}

:deep(.text-green-600) {
  @apply text-green-400;
}

:deep(.bg-red-100) {
  @apply bg-red-900/30;
}

:deep(.text-red-600) {
  @apply text-red-400;
}
</style>