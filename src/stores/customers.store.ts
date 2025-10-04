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
    // Performance optimization properties
    lastFetchTime: number | null,
    cacheExpiry: number,
    searchCache: Map<string, Customer[]>,
    filterCache: Map<string, Customer[]>
}

export const useCustomerStore = defineStore('customer', {
    state: (): CustomerState => ({
        customers: [],
        customer: null,
        loading: false,
        error: null,
        // Performance optimization properties
        lastFetchTime: null,
        cacheExpiry: 300000, // 5 minutes cache expiry
        searchCache: new Map(),
        filterCache: new Map()
    }),
    getters: {
        getCustomers: (state) => state.customers,
        getCustomerById: (state) => state.customer,
        
        // Performance optimized getters
        getCustomersWithSearch: (state) => (searchQuery: string) => {
            const cacheKey = `search-${searchQuery}`
            
            // Check cache first
            if (state.searchCache.has(cacheKey)) {
                return state.searchCache.get(cacheKey)!
            }
            
            // Perform search
            let filteredCustomers = state.customers
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                filteredCustomers = state.customers.filter(customer =>
                    customer.name.toLowerCase().includes(query) ||
                    customer.email.toLowerCase().includes(query) ||
                    customer.phone.includes(query)
                )
            }
            
            // Cache the result
            state.searchCache.set(cacheKey, filteredCustomers)
            return filteredCustomers
        },
        
        getActiveCustomers: (state) => {
            return state.customers.filter(customer => customer.is_active === 1)
        },
        
        getInactiveCustomers: (state) => {
            return state.customers.filter(customer => customer.is_active === 0)
        },
        
        getCustomerStats: (state) => {
            const total = state.customers.length
            const active = state.customers.filter(c => c.is_active === 1).length
            const inactive = total - active
            
            return {
                totalCustomers: total,
                activeCustomers: active,
                inactiveCustomers: inactive
            }
        }
    },
    actions: {
        async fetchCustomers(forceRefresh = false) {
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
                console.log('Fetching customers...');
                const customers = await window.electronAPI.customers.getAll();
                console.log('Customers fetched:', customers);
                this.customers = customers;
                this.lastFetchTime = now;
                
                // Clear caches when customers are updated
                this.clearCustomerCache();
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

        /**
         * Clear customer caches to force fresh computation
         */
        clearCustomerCache(): void {
            this.searchCache.clear()
            this.filterCache.clear()
        },

        /**
         * Clear all caches and force refresh
         */
        clearAllCaches(): void {
            this.clearCustomerCache()
            this.lastFetchTime = null
        }
    }
})

export default useCustomerStore