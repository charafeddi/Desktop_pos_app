import { defineStore } from 'pinia';

export interface SaleItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Sale {
    id: string;
    items: SaleItem[];
    total: number;
    date: Date;
    customer?: string;
}

interface SaleState {
    sales: Sale[];
    currentSale: Sale | null;
}

export const useSaleStore = defineStore('sale', {
    state: (): SaleState => ({
        sales: [],
        currentSale: null,
    }),
    actions: {
        startNewSale(customer?: string) {
            this.currentSale = {
                id: Date.now().toString(),
                items: [],
                total: 0,
                date: new Date(),
                customer,
            };
        },
        addItemToCurrentSale(item: SaleItem) {
            if (!this.currentSale) return;
            const existing = this.currentSale.items.find(i => i.id === item.id);
            if (existing) {
                existing.quantity += item.quantity;
            } else {
                this.currentSale.items.push({ ...item });
            }
            this.calculateTotal();
        },
        removeItemFromCurrentSale(itemId: string) {
            if (!this.currentSale) return;
            this.currentSale.items = this.currentSale.items.filter(i => i.id !== itemId);
            this.calculateTotal();
        },
        calculateTotal() {
            if (!this.currentSale) return;
            this.currentSale.total = this.currentSale.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
        },
        finalizeCurrentSale() {
            if (!this.currentSale) return;
            this.sales.push({ ...this.currentSale });
            this.currentSale = null;
        },
        clearSales() {
            this.sales = [];
        },
    },
});