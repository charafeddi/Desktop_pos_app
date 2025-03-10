import { defineStore } from 'pinia'

interface Product {
    id: number
    name: string
    sales: number
    trend: number
}

interface ProductState {
    popularProducts: Product[]
}

export const useProductStore = defineStore('product', {
    state: (): ProductState => ({
        popularProducts: []
    }),

    actions: {
        async getPopularProducts(): Promise<Product[]> {
            try {
                // Here you would typically make an API call
                // For now, we'll return mock data
                const mockData: Product[] = [
                    {
                        id: 1,
                        name: 'Product A',
                        sales: 150,
                        trend: 15 // percentage increase
                    },
                    {
                        id: 2,
                        name: 'Product B',
                        sales: 120,
                        trend: -5 // percentage decrease
                    },
                    {
                        id: 3,
                        name: 'Product C',
                        sales: 100,
                        trend: 10
                    },
                    {
                        id: 4,
                        name: 'Product D',
                        sales: 80,
                        trend: 5
                    }
                ]

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 500))
                
                this.popularProducts = mockData
                return mockData
            } catch (error) {
                console.error('Error fetching popular products:', error)
                return []
            }
        }
    }
}) 