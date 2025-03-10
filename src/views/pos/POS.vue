<script setup lang="ts">
    import { ref, computed } from 'vue'
    
    interface Product {
      id: string
      name: string
      price: number
      category: string
      image?: string
    }
    
    interface CartItem extends Product {
      quantity: number
    }
    
    const products = ref<Product[]>([
      { id: '1', name: 'Product A', price: 19.99, category: 'Category 1' },
      { id: '2', name: 'Product B', price: 29.99, category: 'Category 1' },
      { id: '3', name: 'Product C', price: 39.99, category: 'Category 2' },
      { id: '4', name: 'Product D', price: 49.99, category: 'Category 2' },
      { id: '5', name: 'Product E', price: 59.99, category: 'Category 3' }
    ])
    
    const cart = ref<CartItem[]>([])
    const searchQuery = ref('')
    const selectedCategory = ref('all')
    
    const categories = computed(() => {
      const cats = ['all', ...new Set(products.value.map(p => p.category))]
      return cats
    })
    
    const filteredProducts = computed(() => {
      return products.value.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = selectedCategory.value === 'all' || product.category === selectedCategory.value
        return matchesSearch && matchesCategory
      })
    })
    
    const cartTotal = computed(() => {
      return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
    })
    
    function addToCart(product: Product) {
      const existingItem = cart.value.find(item => item.id === product.id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        cart.value.push({ ...product, quantity: 1 })
      }
    }
    
    function removeFromCart(productId: string) {
      const index = cart.value.findIndex(item => item.id === productId)
      if (index !== -1) {
        cart.value.splice(index, 1)
      }
    }
    
    function updateQuantity(productId: string, newQuantity: number) {
      const item = cart.value.find(item => item.id === productId)
      if (item) {
        if (newQuantity <= 0) {
          removeFromCart(productId)
        } else {
          item.quantity = newQuantity
        }
      }
    }
    
    function checkout() {
      // Implement checkout logic here
      console.log('Checking out:', cart.value)
      cart.value = []
    }
    
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    }
    </script>
    
    <template>
      <div class="min-h-screen bg-gray-100">
        <div class="flex h-screen">
          <!-- Products Section -->
          <div class="flex-1 p-6 overflow-auto">
            <div class="mb-6">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products..."
                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
            </div>
    
            <div class="mb-6 flex space-x-2">
              <button
                v-for="category in categories"
                :key="category"
                @click="selectedCategory = category"
                :class="[
                  'px-4 py-2 rounded-lg',
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                ]"
              >
                {{ category }}
              </button>
            </div>
    
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                class="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
                @click="addToCart(product)"
              >
                <div class="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <h3 class="text-lg font-semibold">{{ product.name }}</h3>
                <p class="text-gray-600">{{ formatCurrency(product.price) }}</p>
              </div>
            </div>
          </div>
    
          <!-- Cart Section -->
          <div class="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold mb-4">Cart</h2>
              <div class="space-y-4">
                <div
                  v-for="item in cart"
                  :key="item.id"
                  class="flex items-center justify-between"
                >
                  <div>
                    <h3 class="font-medium">{{ item.name }}</h3>
                    <p class="text-gray-600">{{ formatCurrency(item.price) }}</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      @click="updateQuantity(item.id, item.quantity - 1)"
                      class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span class="w-8 text-center">{{ item.quantity }}</span>
                    <button
                      @click="updateQuantity(item.id, item.quantity + 1)"
                      class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
    
            <div class="mt-auto p-6 border-t border-gray-200">
              <div class="flex justify-between mb-4">
                <span class="font-medium">Total</span>
                <span class="font-bold">{{ formatCurrency(cartTotal) }}</span>
              </div>
              <button
                @click="checkout"
                :disabled="cart.length === 0"
                class="w-full py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>