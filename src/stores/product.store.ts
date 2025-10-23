import { defineStore } from 'pinia'

interface Product {
    id: number,
    name: string,
    sku: string,
    barcode: string,
    description: string,
    category_id: number,
    product_type_id: number,
    product_unit_id: number,
    supplier_id: number, 
    purchase_price: number, 
    selling_price: number,
    tax_rate: number, 
    min_stock_level: number, 
    current_stock: number,
    sales: number,
    trend: number
}

interface ProductState {
    popularProducts: Product[],
    productsAboutToFinish: Product[],
    products: Product[],
    productStock: Product | null,
    loading: boolean,
    error: string | null,
    // Performance optimization properties
    lastFetchTime: number | null,
    cacheExpiry: number,
    searchCache: Map<string, Product[]>,
    filtersCache: Map<string, Product[]>
}

export const useProductStore = defineStore('product', {
    state: (): ProductState => ({
        popularProducts: [],
        productsAboutToFinish: [],
        productStock: null,
        products:[],
        loading: false,
        error: null,
        // Performance optimization properties
        lastFetchTime: null,
        cacheExpiry: 180000, // 3 minutes cache expiry
        searchCache: new Map(),
        filtersCache: new Map()
    }),
    getters:{
        getProducts: (state) => state.products,
        getPopularProducts:(state) => state.popularProducts,
        getProductAboutTofinish: (state) => state.productsAboutToFinish,
        
        // Performance optimized getters with cache checks
        getProductsWithSearch: (state) => (searchQuery: string, categoryFilter: string) => {
            const cacheKey = `${searchQuery}-${categoryFilter}`
            
            // Check if result is cached
            if (state.searchCache.has(cacheKey)) {
                return state.searchCache.get(cacheKey)
            }
            
            // Perform search/filter
            let filteredProducts = state.products
            
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                filteredProducts = filteredProducts.filter(product =>
                    product.name.toLowerCase().includes(query) ||
                    product.sku.toLowerCase().includes(query) ||
                    product.barcode.includes(query)
                )
            }
            
            if (categoryFilter && categoryFilter !== 'all') {
                filteredProducts = filteredProducts.filter(product =>
                    product.category_id.toString() === categoryFilter
                )
            }
            
            // Cache the result
            state.searchCache.set(cacheKey, filteredProducts)
            
            return filteredProducts
        },
        
        getProductByBarcode: (state) => (barcode: string) => {
            return state.products.find(product => product.barcode === barcode)
        },
        
        getLowStockProducts: (state) => {
            return state.products.filter(product => 
                product.current_stock <= product.min_stock_level
            )
        },
        
        getOutOfStockProducts: (state) => {
            return state.products.filter(product => product.current_stock === 0)
        },
        
        getTotalInventoryValue: (state) => {
            return state.products.reduce((total, product) => 
                total + (product.current_stock * product.selling_price), 0
            )
        }
    },
    actions: {
        async getAllProducts(forceRefresh = false) {
            // Check if we should refresh based on cache
            const now = Date.now()
            const shouldRefresh = forceRefresh || 
                                !this.lastFetchTime || 
                                (now - this.lastFetchTime) > this.cacheExpiry
            
            if (!shouldRefresh) {
                return
            }

            this.loading = true;
            this.error = null;
            try {
              console.log('Fetching products');
              const products = await window.electronAPI.products.getAll();
              console.log('products fetched: ', products);
              this.products = products;
              this.lastFetchTime = now;
              
              // Clear search caches when products are updated
              this.clearSearchCache();
            } catch (error) {
                console.error('Error fetching products:', error)
                return []
            } finally {
                this.loading = false;
            }
        },
        async fetchPopularProducts(limit = 10, period = null) {
            this.loading = true;
            this.error = null;
            try {
                console.log('Fetching popular products');
                const popularProducts = await window.electronAPI.products.getPopularProduct(limit, period);
                console.log('Popular products fetched: ', popularProducts);
                this.popularProducts = popularProducts;
            } catch (error) {
                console.error('Error fetching popular products:', error);
                this.error = 'Failed to fetch popular products';
                return [];
            } finally {
                this.loading = false;
            }
        },
        async getProductsAboutToFinish() {
            this.loading = true;
            this.error = null;
            try {
                console.log('fetching products about to finish');
                const productsAboutToFinish = await window.electronAPI.products.getProductsLowStock();
                this.productsAboutToFinish = productsAboutToFinish;
                return productsAboutToFinish;
            } catch (error) {
                console.error('Error fetching products about to finish:', error)
                this.error = 'Failed to fetch products about to finish';
                return []   
            } finally {
                this.loading = false;
            }
        },
        async updateProduct(id, productData) {
            this.loading = true;
            this.error = null;
            try {
                console.log('Updating product:', id, productData);
                const updatedProduct = await window.electronAPI.products.update(id, productData);
                console.log('Product updated:', updatedProduct);
                
                // Update the product in the local state
                const index = this.products.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.products[index] = { ...this.products[index], ...productData };
                    
                    // Clear relevant caches
                    this.clearSearchCache();
                }
                
                return updatedProduct;
            } catch (error) {
                console.error('Error updating product:', error);
                this.error = 'Failed to update product';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Clear search cache to force fresh filtering
         */
        clearSearchCache(): void {
            this.searchCache.clear()
            this.filtersCache.clear()
        },

        /**
         * Clear all caches and force refresh
         */
        clearAllCaches(): void {
            this.clearSearchCache()
            this.lastFetchTime = null
        },

        /**
         * Force refresh products from database
         */
        async forceRefreshProducts(): Promise<void> {
            this.clearAllCaches()
            await this.getAllProducts(true)
        }
    }
}) 