import { defineStore } from "pinia";

// Define the ProductType interface
interface ProductType {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Define the store state
interface ProductTypeState {
  productTypes: ProductType[];
  productType: ProductType | null;
  loading: boolean;
  error: string | null;
}

export const useProductTypeStore = defineStore('productType', {
  state: (): ProductTypeState => ({
    productTypes: [],
    productType: null,
    loading: false,
    error: null,
  }),
  getters: {
    getProductTypes: (state) => state.productTypes,
    getProductTypeById: (state) => state.productType,
  },
  actions: {
    async fetchProductTypes() {
      this.loading = true;
      this.error = null;
      try {
        console.log('Fetching product types...');
        const productTypes = await window.electronAPI.productTypes.getAll();
        console.log('Product types fetched:', productTypes);
        this.productTypes = productTypes;
      } catch (error: any) {
        console.error('Error fetching product types:', error);
        this.error = error?.message || 'Failed to fetch product types';
      } finally {
        this.loading = false;
      }
    },
    async create(productTypeData: Omit<ProductType, 'id' | 'created_at' | 'updated_at'>) {
      this.loading = true;
      this.error = null;
      try {
        console.log('Creating product type with data:', productTypeData);
        const newProductType = await window.electronAPI.productTypes.create(productTypeData);
        console.log('Product type created successfully:', newProductType);
        this.productTypes.push(newProductType);
        return newProductType;
      } catch (error: any) {
        console.error('Error creating product type:', error);
        this.error = error?.message || 'Failed to create product type';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async update(id: number, productTypeData: Partial<ProductType>) {
      this.loading = true;
      this.error = null;
      try {
        const result = await window.electronAPI.productTypes.update(id, productTypeData);
        const index = this.productTypes.findIndex(pt => pt.id === id);
        if (index !== -1) {
          this.productTypes[index] = result;
        }
        return result;
      } catch (error: any) {
        this.error = error?.message || 'Failed to update product type';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async delete(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await window.electronAPI.productTypes.delete(id);
        this.productTypes = this.productTypes.filter(pt => pt.id !== id);
      } catch (error: any) {
        this.error = error?.message || 'Failed to delete product type';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
