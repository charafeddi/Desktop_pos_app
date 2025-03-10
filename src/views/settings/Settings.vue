<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

interface TaxRate {
  id: string
  name: string
  rate: number
  isDefault: boolean
}

interface PrinterSettings {
  enabled: boolean
  printerName: string
  paperSize: string
  printCopies: number
}

const companyInfo = ref({
  name: 'My Store',
  address: '123 Main St',
  phone: '(555) 123-4567',
  email: 'contact@mystore.com',
  taxId: 'TAX-123456'
})

const taxRates = ref<TaxRate[]>([
  { id: '1', name: 'Standard Rate', rate: 20, isDefault: true },
  { id: '2', name: 'Reduced Rate', rate: 10, isDefault: false },
  { id: '3', name: 'Zero Rate', rate: 0, isDefault: false }
])

const printerSettings = ref<PrinterSettings>({
  enabled: true,
  printerName: 'Default Printer',
  paperSize: 'A4',
  printCopies: 1
})

const backupSettings = ref({
  autoBackup: true,
  backupFrequency: 'daily',
  backupLocation: 'cloud'
})

function saveSettings() {
  // Implement settings save logic
  console.log('Saving settings...')
}

function testPrinter() {
  // Implement printer test logic
  console.log('Testing printer...')
}

function backupNow() {
  // Implement manual backup logic
  console.log('Starting manual backup...')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      <div class="space-y-6">
        <!-- Company Information -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Company Information
            </h3>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  v-model="companyInfo.name"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Address</label>
                <input
                  v-model="companyInfo.address"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  v-model="companyInfo.phone"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="companyInfo.email"
                  type="email"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Tax Rates -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Tax Rates
            </h3>
            <div class="space-y-4">
              <div v-for="rate in taxRates" :key="rate.id" class="flex items-center justify-between">
                <div>
                  <input
                    v-model="rate.name"
                    type="text"
                    class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                </div>
                <div class="flex items-center space-x-4">
                  <input
                    v-model.number="rate.rate"
                    type="number"
                    min="0"
                    max="100"
                    class="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                  <span class="text-gray-500">%</span>
                  <input
                    v-model="rate.isDefault"
                    type="radio"
                    name="defaultTax"
                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  >
                  <label class="text-sm text-gray-700">Default</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Printer Settings -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Printer Settings
              </h3>
              <button
                @click="testPrinter"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Test Printer
              </button>
            </div>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="flex items-center">
                  <input
                    v-model="printerSettings.enabled"
                    type="checkbox"
                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-gray-700">Enable Printing</span>
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Printer Name</label>
                <input
                  v-model="printerSettings.printerName"
                  type="text"
                  :disabled="!printerSettings.enabled"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Backup Settings -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Backup Settings
              </h3>
              <button
                @click="backupNow"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Backup Now
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="flex items-center">
                  <input
                    v-model="backupSettings.autoBackup"
                    type="checkbox"
                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-gray-700">Enable Automatic Backup</span>
                </label>
              </div>
              <div v-if="backupSettings.autoBackup">
                <label class="block text-sm font-medium text-gray-700">Backup Frequency</label>
                <select
                  v-model="backupSettings.backupFrequency"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button
            @click="saveSettings"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 