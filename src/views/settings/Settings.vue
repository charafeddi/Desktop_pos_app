<template>
  <div class="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Settings</h1>
      </div>

      <div class="space-y-6">
        <!-- Company Information -->
        <div class="shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium mb-4">
              Company Information
            </h3>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium ">Company Name</label>
                <input
                  v-model="companyInfo.name"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium ">Address</label>
                <input
                  v-model="companyInfo.address"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium ">Phone</label>
                <input
                  v-model="companyInfo.phone"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium ">Email</label>
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
        <div class="shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium mb-4">
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
                  <span class="">%</span>
                  <input
                    v-model="rate.isDefault"
                    type="radio"
                    name="defaultTax"
                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  >
                  <label class="text-sm ">Default</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- manage product types/units -->
         <div class="shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium mb-4">
              Manage Product Types/Units
            </h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium ">Product Types</label>
                <router-link :to="{name:'ProductTypes'}" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Manage Product Types
                </router-link>
              </div>
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium ">Product Units</label>
                <router-link :to="{name:'ProductUnits'}" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Manage Product Units
                </router-link>
              </div>
            </div>
          </div>
         </div>
        <!-- Printer Settings -->
        <div class=" shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg leading-6 font-medium ">
                Printer Settings
              </h3>
              <button
                @click="refreshPrinters"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Refresh
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
                  <span class="ml-2 text-sm ">Enable Printing</span>
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium ">Printer</label>
                <select
                  v-model="printerSettings.printerName"
                  :disabled="!printerSettings.enabled"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="" disabled>Select a printer</option>
                  <option
                    v-for="p in printers"
                    :key="p.name"
                    :value="p.name"
                  >
                    {{ p.displayName || p.name }}<span v-if="p.isDefault"> (Default)</span>
                  </option>
                </select>
                <p v-if="printers.length === 0" class="text-sm mt-2">No printers found.</p>
              </div>
            </div>
            <div class="mt-4">
              <button
                @click="testPrinter"
                :disabled="!printerSettings.enabled || !printerSettings.printerName"
                class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
              >
                Test Print
              </button>
            </div>
          </div>
        </div>

        <!-- Backup Settings -->
        <div class=" shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg leading-6 font-medium ">
                Backup Settings
              </h3>
              <div class="space-x-2">
                <button
                  @click="chooseBackupFolder"
                  class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                >
                  Choose Folder
                </button>
                <button
                  @click="backupNow"
                  :disabled="!backupFolder"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Backup Now
                </button>
              </div>
            </div>
            <div class="space-y-4">
              <div>
                <label class="flex items-center">
                  <input
                    v-model="backupSettings.autoBackup"
                    type="checkbox"
                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm ">Enable Automatic Backup</span>
                </label>
              </div>
              <div v-if="backupSettings.autoBackup">
                <label class="block text-sm font-medium ">Backup Frequency</label>
                <div class="mt-1">
                  <span class="text-sm">Weekly backups will run automatically.</span>
                </div>
                <div class="mt-2 flex items-center space-x-2">
                  <button
                    @click="enableWeeklyBackup"
                    :disabled="!backupFolder"
                    class="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >Enable Weekly</button>
                  <button
                    @click="disableWeeklyBackup"
                    class="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >Disable</button>
                </div>
                <div v-if="nextBackup" class="text-xs mt-2">Next backup: {{ nextBackup }}</div>
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



<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth.store'
  
  const authStore = useAuthStore()
  
  // Types removed to avoid linter issues parsing TS in Vue SFC
  
  const companyInfo = ref({
    name: 'My Store',
    address: '123 Main St',
    phone: '(555) 123-4567',
    email: 'contact@mystore.com',
    taxId: 'TAX-123456'
  })
  
  const taxRates = ref([
    { id: '1', name: 'Standard Rate', rate: 20, isDefault: true },
    { id: '2', name: 'Reduced Rate', rate: 10, isDefault: false },
    { id: '3', name: 'Zero Rate', rate: 0, isDefault: false }
  ])
  
  const printerSettings = ref({
    enabled: true,
    printerName: 'Default Printer',
    paperSize: 'A4',
    printCopies: 1
  })

  const printers = ref([])
  
  const backupSettings = ref({
    autoBackup: true,
    backupFrequency: 'weekly',
    backupLocation: 'local'
  })
  const backupFolder = ref('')
  const nextBackup = ref('')
  
  function saveSettings() {
    // Implement settings save logic
    console.log('Saving settings...')
  }
  
  function testPrinter() {
    // Implement printer test logic
    console.log('Testing printer...')
  }
  
  async function refreshPrinters() {
    try {
      const list = await window.electronAPI.printers.getAll()
      printers.value = Array.isArray(list) ? list : []
      // If current selection no longer exists, clear it
      if (!printers.value.some(p => p.name === printerSettings.value.printerName)) {
        const defaultPrinter = printers.value.find(p => p.isDefault)
        printerSettings.value.printerName = defaultPrinter?.name || ''
      }
    } catch (err) {
      console.error('Failed to load printers', err)
      printers.value = []
    }
  }

  onMounted(() => {
    refreshPrinters()
  })
  
  async function chooseBackupFolder() {
    const folder = await window.electronAPI.backup.chooseFolder()
    if (folder) {
      backupFolder.value = folder
    }
  }

  async function backupNow() {
    if (!backupFolder.value) return
    const result = await window.electronAPI.backup.exportJSON(backupFolder.value)
    console.log('Backup created:', result)
  }

  async function enableWeeklyBackup() {
    if (!backupFolder.value) return
    const result = await window.electronAPI.backup.scheduleWeekly(backupFolder.value)
    nextBackup.value = result.nextRun
  }

  async function disableWeeklyBackup() {
    await window.electronAPI.backup.cancelSchedule()
    nextBackup.value = ''
  }
  </script>