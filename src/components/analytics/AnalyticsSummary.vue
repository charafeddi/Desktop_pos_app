<!-- src/components/analytics/AnalyticsSummary.vue -->
<template>
  <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 shadow-lg">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        🚀 Advanced Analytics Dashboard
      </h2>
      <p class="text-gray-600 mb-6">
        Your POS system now features enterprise-level analytics and reporting capabilities
      </p>
    </div>

    <!-- Feature Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      
      <!-- Interactive Charts -->
      <div class="bg-white rounded-lg p-4 shadow-md">
        <div class="text-center">
          <div class="text-3xl mb-2">📊</div>
          <h3 class="font-semibold text-gray-900 mb-2">Interactive Charts</h3>
          <p class="text-sm text-gray-600">Chart.js powered visualizations with zoom, pan, and fullscreen support</p>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
          <span>✓ Line Charts</span>
          <span>✓ Bar Charts</span>
          <span>✓ Doughnut Charts</span>
          <span>✓ Time Series</span>
        </div>
      </div>

      <!-- Real-Time Updates -->
      <div class="bg-white rounded-lg p-4 shadow-md">
        <div class="text-center">
          <div class="text-3xl mb-2">⚡</div>
          <h3 class="font-semibold text-gray-900 mb-2">Real-Time Metrics</h3>
          <p class="text-sm text-gray-600">Live activity feed and hourly performance tracking</p>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
          <span>✓ Live Activity Feed</span>
          <span>✓ Hourly Sales</span>
          <span>✓ Today's Revenue</span>
          <span>✓ Sales Predictions</span>
        </div>
      </div>

      <!-- Enhanced KPIs -->
      <div class="bg-white rounded-lg p-4 shadow-md">
        <div class="text-center">
          <div class="text-3xl mb-2">📈</div>
          <h3 class="font-semibold text-gray-900 mb-2">Enhanced KPIs</h3>
          <p class="text-sm text-gray-600">Comprehensive key performance indicators with growth analytics</p>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
          <span>✓ Revenue Growth</span>
          <span>✓ Sales Trends</span>
          <span>✓ Inventory Health</span>
          <span>✓ Performance Metrics</span>
        </div>
      </div>

      <!-- Advanced Reporting -->
      <div class="bg-white rounded-lg p-4 shadow-md">
        <div class="text-center">
          <div class="text-3xl mb-2">📋</div>
          <h3 class="font-semibold text-gray-900 mb-2">Advanced Reporting</h3>
          <p class="text-sm text-gray-600">Professional reports with export capabilities</p>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
          <span>✓ PDF Reports</span>
          <span>✓ CSV Export</span>
          <span>✓ Scheduled Reports</span>
          <span>✓ Custom Filters</span>
        </div>
      </div>

      <!-- Smart Insights -->
      <div class="bg-white rounded-lg p-4 shadow-md">
        <div class="text-center">
          <div class="text-3xl mb-2">🧠</div>
          <h3 class="font-semibold text-gray-900 mb-2">Smart Insights</h3>
          <p class="text-sm text-gray-600">AI-powered business intelligence and predictions</p>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
          <span>✓ Sales Predictions</span>
          <span>✓ Trend Analysis</span>
          <span>✓ Customer Insights</span>
          <span>✓ Inventory Alerts</span>
        </div>
      </div>

      <!-- Customizable Dashboard -->
      <div class="bg-white rounded-lg p-4 shadow-md">
        <div class="text-center">
          <div class="text-3xl mb-2">⚙️</div>
          <h3 class="font-semibold text-gray-900 mb-2">Customizable Layout</h3>
          <p class="text-sm text-gray-600">Flexible dashboard with draggable widgets</p>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
          <span>✓ Drag & Drop</span>
          <span>✓ Multiple Views</span>
          <span>✓ Save Layouts</span>
          <span>✓ Personal Themes</span>
        </div>
      </div>
    </div>

    <!-- Benefits -->
    <div class="mt-8 bg-white rounded-lg p-4 shadow-md">
      <h3 class="font-semibold text-gray-900 mb-4">🎯 Business Benefits</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-medium text-gray-800 mb-2">📈 Improved Decision Making</h4>
          <p class="text-sm text-gray-600">Real-time insights help you make data-driven decisions quickly</p>
        </div>
        <div>
          <h4 class="font-medium text-gray-800 mb-2">💰 Revenue Optimization</h4>
          <p class="text-sm text-gray-600">Identify trends and opportunities to maximize sales and profits</p>
        </div>
        <div>
          <h4 class="font-medium text-gray-800 mb-2">🎛️ Inventory Management</h4>
          <p class="text-sm text-gray-600">Smart alerts for stock levels and purchase recommendations</p>
        </div>
        <div>
          <h4 class="font-medium text-white mb-2">📞 Customer Insights</h4>
          <p class="text-sm text-gray-600">Understand customer behavior and improve satisfaction</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-6 flex justify-center gap-4">
      <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        📊 View Full Dashboard
      </button>
      <button class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
        📤 Export Report
      </button>
      <button class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
        ⚙️ Configure Settings
      </button>
    </div>
    <!-- Supplier Spend Summary (shown only when data exists) -->
    <div v-if="supplierSpend && supplierSpend.length" class="mt-8 bg-white rounded-lg p-4 shadow-md">
      <h3 class="font-semibold text-gray-900 mb-4">Supplier Spend</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-gray-600">
              <th class="py-2 pr-4">Supplier</th>
              <th class="py-2 pr-4">Total Spend</th>
              <th class="py-2 pr-4">Products</th>
              <th class="py-2 pr-4">Sales</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in supplierSpend" :key="row.supplier_id" class="border-t">
              <td class="py-2 pr-4">{{ row.supplier_name }}</td>
              <td class="py-2 pr-4">{{ Number(row.total_spend).toLocaleString() }}</td>
              <td class="py-2 pr-4">{{ row.products_count }}</td>
              <td class="py-2 pr-4">{{ row.sales_count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Price Comparison (shown only when data exists) -->
    <div v-if="priceComparisons && priceComparisons.length" class="mt-6 bg-white rounded-lg p-4 shadow-md">
      <h3 class="font-semibold text-gray-900 mb-4">Product Price Comparison (by supplier)</h3>
      <div class="space-y-4">
        <div v-for="group in priceComparisons" :key="group.product_name + (group.sku||'')" class="border rounded p-3">
          <div class="flex justify-between items-center">
            <div>
              <div class="font-medium text-gray-800">{{ group.product_name }} <span v-if="group.sku" class="text-gray-500">(SKU: {{ group.sku }})</span></div>
              <div class="text-xs text-gray-500">Min: {{ group.min_price }} | Max: {{ group.max_price }} | Avg: {{ group.avg_price }}</div>
            </div>
          </div>
          <div class="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div v-for="s in group.suppliers" :key="s.supplier_id + ':' + s.purchase_price" class="p-2 rounded border">
              <div class="text-gray-700">{{ s.supplier_name || 'Unassigned' }}</div>
              <div class="text-sm text-gray-500">Price: {{ s.purchase_price }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
const supplierSpend = ref([])
const priceComparisons = ref([])

onMounted(async () => {
  try { supplierSpend.value = await window.electronAPI.analytics.supplierSpend() } catch {}
  try { priceComparisons.value = await window.electronAPI.analytics.productPriceCompare() } catch {}
})
</script>

<style scoped>
/* Enhance the gradient and animations */
.bg-gradient-to-br {
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #ede9fe 100%);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > div {
  animation: fadeInUp 0.5s ease-out;
}

.grid > div:nth-child(1) { animation-delay: 0.1s; }
.grid > div:nth-child(2) { animation-delay: 0.2s; }
.grid > div:nth-child(3) { animation-delay: 0.3s; }
.grid > div:nth-child(4) { animation-delay: 0.4s; }
.grid > div:nth-child(5) { animation-delay: 0.5s; }
.grid > div:nth-child(6) { animation-delay: 0.6s; }

/* Hover effects */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

button {
  transition: all 0.2s ease-out;
}
</style>
