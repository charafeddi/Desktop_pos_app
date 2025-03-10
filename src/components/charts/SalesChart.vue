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

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Chart from 'chart.js/auto'
import { format, subMonths, parseISO } from 'date-fns'

const { t } = useI18n()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let salesChart: Chart | null = null

// Initialize with last month's date range
const startDate = ref(format(subMonths(new Date(), 1), 'yyyy-MM-dd'))
const endDate = ref(format(new Date(), 'yyyy-MM-dd'))
const totalSales = ref(0)

// Mock data - Replace this with actual API call
const fetchSalesData = async (start: string, end: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Generate mock data for the date range
    const startDateTime = parseISO(start)
    const endDateTime = parseISO(end)
    const days = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24))
    
    const data = Array.from({ length: days }, (_, i) => {
        const date = new Date(startDateTime)
        date.setDate(date.getDate() + i)
        return {
            date: format(date, 'yyyy-MM-dd'),
            sales: Math.floor(Math.random() * 10000) + 1000
        }
    })
    
    // Calculate total sales
    totalSales.value = data.reduce((sum, item) => sum + item.sales, 0)
    
    return data
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'MAD'
    }).format(value)
}

const formatDateRange = (start: string, end: string) => {
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
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#6b7280',
                        callback: (value) => formatCurrency(value as number)
                    }
                }
            }
        }
    })
}

// Watch for date changes
watch([startDate, endDate], () => {
    createChart()
})

onMounted(() => {
    createChart()
})
</script>

<style>
.card {
    background: rgb(45, 45, 45);
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
    color: #6b7280;
    margin-bottom: 0.5rem;
}

.visitors-stats-info h5 {
    font-size: 14px;
    margin-bottom: 0.5rem;
}

.visitors-stats-info span {
    color: #6b7280;
    font-size: 0.875rem;
}

.date-filters {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.date-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #fff;
    padding: 0.5rem;
    font-size: 0.875rem;
}

.date-separator {
    color: #6b7280;
}

.chart-container {
    height: 300px;
    margin-top: 1rem;
}
</style>