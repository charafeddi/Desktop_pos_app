import { defineStore } from 'pinia'

interface Customer {
    id: number,
    name: string,
    email: string,
    phone: string,
    address: string,
    city: string,
    country: string,
    postal_code: string,
    tax_number: string,
    is_active: number,
    created_at: string,
    updated_at: string,
    sale_count?: number,
    total_amount_count?: number
}

interface CustomerState {
    customers: Customer[],
    customer: Customer | null,
    loading: boolean,
    error: string | null,
}

export const useCustomerStore = defineStore('customer', {
    state: (): CustomerState => ({
        customers: [],
        customer: null,
        loading: false,
        error: null,
    }),
    getters: {
        getCustomers: (state) => state.customers,
        getCustomerById: (state) => state.customer,
    },
    actions: {
        async fetchCustomers() {
            this.loading = true;
            this.error = null;
            try {
                console.log('Fetching customers...');
                const customers = await window.electronAPI.customers.getAll();
                console.log('Customers fetched:', customers);
                this.customers = customers;
            } catch (error: any) {
                console.error('Error fetching customers:', error);
                this.error = error?.message || 'Failed to fetch customers';
            } finally {
                this.loading = false;
            }
        },
        async create(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
            this.loading = true;
            this.error = null;
            try {
                console.log('Creating customer with data:', customerData);
                const newCustomer = await window.electronAPI.customers.create(customerData);
                console.log('Customer created successfully:', newCustomer);
                if (newCustomer && typeof newCustomer === 'object') {
                    this.customers = [newCustomer, ...this.customers];
                } else {
                    await this.fetchCustomers();
                }
                return newCustomer;
            } catch (error: any) {
                console.error('Error creating customer:', error);
                this.error = error?.message || 'Failed to create customer';
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async update(id: number, customerData: Partial<Customer>) {
            this.loading = true;
            this.error = null;
            try {
                const result = await window.electronAPI.customers.update(id, customerData);
                const index = this.customers.findIndex(c => String(c.id) === String(id));
                if (index !== -1) {
                    if (result && typeof result === 'object') {
                        const next = [...this.customers];
                        next.splice(index, 1, result);
                        this.customers = next;
                    } else {
                        await this.fetchCustomers();
                    }
                }
                return result;
            } catch (error: any) {
                this.error = error?.message || 'Failed to update customer';
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async delete(id: number) {
            this.loading = true;
            this.error = null;
            try {
                await window.electronAPI.customers.delete(id);
                this.customers = this.customers.filter(c => String(c.id) !== String(id));
            } catch (error: any) {
                this.error = error?.message || 'Failed to delete customer';
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async toggleStatus(id: number) {
            this.loading = true;
            this.error = null;
            try {
                const updatedCustomer = await window.electronAPI.customers.toggleStatus(id);
                const index = this.customers.findIndex(c => String(c.id) === String(id));
                if (index !== -1 && updatedCustomer) {
                    const next = [...this.customers];
                    next.splice(index, 1, updatedCustomer);
                    this.customers = next;
                }
                return updatedCustomer;
            } catch (error: any) {
                this.error = error?.message || 'Failed to toggle customer status';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    }
})

export default useCustomerStore