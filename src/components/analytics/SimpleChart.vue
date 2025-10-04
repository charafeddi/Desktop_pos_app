<!-- src/components/analytics/SimpleChart.vue -->
<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Simple Revenue Chart</h3>
      <span class="text-sm text-gray-500">Chart Test</span>
    </div>
    <div style="height: 300px;">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Use real sales data from props
  const salesChartData = props.data?.salesChartData || []
  
  // Process real data for chart
  const chartData = {
    labels: salesChartData.length > 0 
      ? salesChartData.map(item => {
          const date = new Date(item.date || item.period)
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        })
      : ['No Data'],
    datasets: [{
      label: 'Revenue',
      data: salesChartData.length > 0 
        ? salesChartData.map(item => item.revenue || item.total_amount || 0)
        : [0],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  }

  chartInstance = new ChartJS(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        title: { 
          display: true,
          text: salesChartData.length > 0 ? 'Real Sales Revenue Trend' : 'No Sales Data Available'
        }
      },
      scales: {
        y: { 
          beginAtZero: true,
          title: {
            display: true,
            text: 'Revenue ($)'
          }
        },
        x: { 
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    }
  })
}

// Watch for data changes and update chart
watch(() => props.data, () => {
  createChart()
}, { deep: true })

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
/* Chart container styles */
canvas {
  max-height: 300px;
}
</style>
