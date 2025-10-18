<template>
    <div class="card">
        <div class="card-body">
            <div class="visitors-stats">
                <div class="chart-header">
                    <div class="visitors-stats-info">
                        <p>{{ t('sales.total') }}</p>
                        <h5>{{ formatCurrency(totalSales) }}</h5>
                        <span>{{ formatDateRange(startDate, endDate) }}</span>
                    </div>
                    <div class="date-filters">
                        <input 
                            type="date" 
                            v-model="startDate" 
                            :max="endDate"
                            class="date-input"
                        />
                        <span class="date-separator">to</span>
                        <input 
                            type="date" 
                            v-model="endDate" 
                            :min="startDate"
                            class="date-input"
                        />
                    </div>
                </div>
                <div class="chart-container">
                    <canvas ref="chartCanvas"></canvas>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSalesStore } from '@/stores/sales.store'
import { useThemeStore } from '@/stores/theme.store'
import Chart from 'chart.js/auto'
import { format, subMonths, parseISO } from 'date-fns'

const { t } = useI18n()
const salesStore = useSalesStore()
const themeStore = useThemeStore()
const chartCanvas = ref(null)
let salesChart = null

// Initialize with last month's date range
const startDate = ref(format(subMonths(new Date(), 1), 'yyyy-MM-dd'))
const endDate = ref(format(new Date(), 'yyyy-MM-dd'))
const totalSales = ref(0)

// Theme-aware colors
const themeColors = computed(() => themeStore.getThemeColors)

// Fetch real sales data from the store
const fetchSalesData = async (start, end) => {
    try {
        // Ensure sales data is loaded
        await salesStore.fetchSales()
        
        const startDateTime = parseISO(start)
        const endDateTime = parseISO(end)
        
        // Filter sales by date range
        const filteredSales = salesStore.getSales.filter(sale => {
            if (!sale.created_at) return false
            const saleDate = new Date(sale.created_at)
            return saleDate >= startDateTime && saleDate <= endDateTime
        })
        
        // Group sales by date
        const salesByDate = new Map()
        
        filteredSales.forEach(sale => {
            const dateKey = format(new Date(sale.created_at), 'yyyy-MM-dd')
            const amount = sale.final_amount || sale.total_amount || 0
            salesByDate.set(dateKey, (salesByDate.get(dateKey) || 0) + amount)
        })
        
        // Generate data array for all days in range
        const days = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const data = Array.from({ length: days }, (_, i) => {
            const date = new Date(startDateTime)
            date.setDate(date.getDate() + i)
            const dateKey = format(date, 'yyyy-MM-dd')
            return {
                date: dateKey,
                sales: salesByDate.get(dateKey) || 0
            }
        })
        
        // Calculate total sales
        totalSales.value = data.reduce((sum, item) => sum + item.sales, 0)
        
        return data
    } catch (error) {
        console.error('Error fetching sales data:', error)
        return []
    }
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'MAD'
    }).format(value)
}

const formatDateRange = (start, end) => {
    return `${format(parseISO(start), 'MMM d, yyyy')} - ${format(parseISO(end), 'MMM d, yyyy')}`
}

const createChart = async () => {
    if (!chartCanvas.value) return
    
    const data = await fetchSalesData(startDate.value, endDate.value)
    
    if (salesChart) {
        salesChart.destroy()
    }
    
    salesChart = new Chart(chartCanvas.value, {
        type: 'line',
        data: {
            labels: data.map(item => format(parseISO(item.date), 'MMM d')),
            datasets: [{
                label: 'Sales',
                data: data.map(item => item.sales),
                borderColor: '#535bf2',
                backgroundColor: 'rgba(83, 91, 242, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `Sales Trend (${formatDateRange(startDate.value, endDate.value)})`,
                    color: themeColors.value.textSecondary,
                    font: {
                        size: 14
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: themeColors.value.border
                    },
                    ticks: {
                        color: themeColors.value.textSecondary
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        color: themeColors.value.textSecondary
                    }
                },
                y: {
                    grid: {
                        color: themeColors.value.border
                    },
                    ticks: {
                        color: themeColors.value.textSecondary,
                        callback: (value) => formatCurrency(value)
                    },
                    title: {
                        display: true,
                        text: 'Sales Amount',
                        color: themeColors.value.textSecondary
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    })
}

// Watch for date changes
watch([startDate, endDate], () => {
    createChart()
})

// Watch for theme changes
watch(() => themeStore.getIsDarkMode, () => {
    if (salesChart) {
        createChart()
    }
})

onMounted(() => {
    createChart()
})
</script>

<style>
.card {
    background: var(--color-surface);
    border-radius: 10px;
    width: 100%;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: auto;
}

.visitors-stats-info {
    flex: 1;
}

.visitors-stats-info p {
    color: var(--color-text-secondary);
    margin-bottom: 0.5rem;
}

.visitors-stats-info h5 {
    font-size: 14px;
    margin-bottom: 0.5rem;
    color: var(--color-text);
}

.visitors-stats-info span {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
}

.date-filters {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.date-input {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text);
    padding: 0.5rem;
    font-size: 0.875rem;
}

.date-separator {
    color: var(--color-text-secondary);
}

.chart-container {
    height: 300px;
    margin-top: 1rem;
}
</style>