export interface Product {
    id: number
    name: string
    sales: number
    trend: number
}

export interface ProductState {
    popularProducts: Product[]
} 