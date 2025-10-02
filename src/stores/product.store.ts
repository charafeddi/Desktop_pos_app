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
    productStock:Product | null,
    loading: boolean,
    error: string | null,
}

export const useProductStore = defineStore('product', {
    state: (): ProductState => ({
        popularProducts: [],
        productsAboutToFinish: [],
        productStock: null,
        products:[],
        loading: false,
        error:null,
    }),
    getters:{
        getProducts: (state) => state.products,
        getPopularProducts:(state) => state.popularProducts,
        getProductAboutTofinish: (state) => state.productsAboutToFinish
    },
    actions: {
        async getAllProducts() {
            this.loading = true;
            this.error = null;
            try {
              console.log('Fetching products');
              const products = await window.electronAPI.products.getAll();
              console.log('products fetched: ', products);
              this.products = products;
            } catch (error) {
                console.error('Error fetching popular products:', error)
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
                console.log('fetching popular products');
                const productsAboutToFinish = await window.electronAPI.products.getProductsLowStock();
                this.productsAboutToFinish = productsAboutToFinish;
            } catch (error) {
                console.error('Error fetching products about to finish:', error)
                return []   
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
                }
                
                return updatedProduct;
            } catch (error) {
                console.error('Error updating product:', error);
                this.error = 'Failed to update product';
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
}) 