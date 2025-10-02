import { defineStore } from "pinia";

// Define the ProductUnit interface
interface ProductUnit {
  id: number;
  name: string;
  symbol: string;
  created_at: string;
  updated_at: string;
}

// Define the store state
interface ProductUnitState {
  productUnits: ProductUnit[];
  productUnit: ProductUnit | null;
  loading: boolean;
  error: string | null;
}

export const useProductUnitStore = defineStore('productUnit', {
  state: (): ProductUnitState => ({
    productUnits: [],
    productUnit: null,
    loading: false,
    error: null,
  }),
  getters: {
    getProductUnits: (state) => state.productUnits,
    getProductUnitById: (state) => state.productUnit,
  },
  actions: {
    async fetchProductUnits() {
      this.loading = true;
      this.error = null;
      try {
        console.log('Fetching product units...');
        const productUnits = await window.electronAPI.productUnits.getAll();
        console.log('Product units fetched:', productUnits);
        this.productUnits = productUnits;
      } catch (error: any) {
        console.error('Error fetching product units:', error);
        this.error = error?.message || 'Failed to fetch product units';
      } finally {
        this.loading = false;
      }
    },
    async create(productUnitData: Omit<ProductUnit, 'id' | 'created_at' | 'updated_at'>) {
      this.loading = true;
      this.error = null;
      try {
        console.log('Creating product unit with data:', productUnitData);
        const newProductUnit = await window.electronAPI.productUnits.create(productUnitData);
        console.log('Product unit created successfully:', newProductUnit);
        if (newProductUnit && typeof newProductUnit === 'object') {
          // Immutable prepend for reactivity
          this.productUnits = [newProductUnit, ...this.productUnits];
        } else {
          await this.fetchProductUnits();
        }
        return newProductUnit;
      } catch (error: any) {
        console.error('Error creating product unit:', error);
        this.error = error?.message || 'Failed to create product unit';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async update(id: number, productUnitData: Partial<ProductUnit>) {
      this.loading = true;
      this.error = null;
      try {
        const result = await window.electronAPI.productUnits.update(id, productUnitData);
        const index = this.productUnits.findIndex(pu => String(pu.id) === String(id));
        if (index !== -1) {
          if (result && typeof result === 'object') {
            const next = [...this.productUnits];
            next.splice(index, 1, result);
            this.productUnits = next;
          } else {
            await this.fetchProductUnits();
          }
        }
        return result;
      } catch (error: any) {
        this.error = error?.message || 'Failed to update product unit';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async delete(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await window.electronAPI.productUnits.delete(id);
        this.productUnits = this.productUnits.filter(pu => String(pu.id) !== String(id));
      } catch (error: any) {
        this.error = error?.message || 'Failed to delete product unit';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
