import { defineStore } from "pinia";

// Define the Supplier interface
interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  created_at: string;
  updated_at: string;
}

// Define the store state
interface SupplierState {
  suppliers: Supplier[];
  supplier: Supplier | null;
  loading: boolean;
  error: string | null;
}

export const useSupplierStore = defineStore('supplier', {
  state: (): SupplierState => ({
    suppliers: [],
    supplier: null,
    loading: false,
    error: null,
  }),
  getters: {
    getSuppliers: (state) => state.suppliers,
    getSupplierById: (state) => state.supplier,
  },
  actions: {
    async fetchSuppliers() {
      this.loading = true;
      this.error = null;
      try {
        console.log('Fetching suppliers...');
        const suppliers = await window.electronAPI.suppliers.getAll();
        console.log('Suppliers fetched:', suppliers);
        this.suppliers = suppliers;
      } catch (error: any) {
        console.error('Error fetching suppliers:', error);
        this.error = error?.message || 'Failed to fetch suppliers';
      } finally {
        this.loading = false;
      }
    },
    async create(supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) {
      this.loading = true;
      this.error = null;
      try {
        console.log('Creating supplier with data:', supplierData);
        const newSupplier = await window.electronAPI.suppliers.create(supplierData);
        console.log('Supplier created successfully:', newSupplier);
        // Ensure list reflects server truth immediately
        if (newSupplier && typeof newSupplier === 'object') {
          this.suppliers = [newSupplier, ...this.suppliers];
        } else {
          await this.fetchSuppliers();
        }
        return newSupplier;
      } catch (error: any) {
        console.error('Error creating supplier:', error);
        this.error = error?.message || 'Failed to create supplier';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async update(id: number, supplierData: Partial<Supplier>) {
      this.loading = true;
      this.error = null;
      try {
        const result = await window.electronAPI.suppliers.update(id, supplierData);
        const index = this.suppliers.findIndex(sup => String(sup.id) === String(id));
        if (index !== -1) {
          if (result && typeof result === 'object') {
            // Use splice to replace item for guaranteed reactivity
            const next = [...this.suppliers];
            next.splice(index, 1, result);
            this.suppliers = next;
          } else {
            await this.fetchSuppliers();
          }
        }
        return result;
      } catch (error: any) {
        this.error = error?.message || 'Failed to update supplier';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async delete(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await window.electronAPI.suppliers.delete(id);
        this.suppliers = this.suppliers.filter(sup => String(sup.id) !== String(id));
      } catch (error: any) {
        this.error = error?.message || 'Failed to delete supplier';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
