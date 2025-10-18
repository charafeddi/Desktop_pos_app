<template>
  <div class="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold">{{ t('settings.title') }}</h1>
      </div>

      <div class="space-y-6">
        <!-- Company Information -->
        <div class="shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium mb-4">
              {{ t('settings.companyInformation') }}
            </h3>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium ">{{ t('settings.companyName') }}</label>
                <input
                  v-model="companyInfo.name"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium ">{{ t('settings.address') }}</label>
                <input
                  v-model="companyInfo.address"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium ">{{ t('settings.phone') }}</label>
                <input
                  v-model="companyInfo.phone"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium ">{{ t('settings.email') }}</label>
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
              {{ t('settings.taxRates') }}
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
                  <label class="text-sm ">{{ t('settings.default') }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- manage product types/units -->
         <div class="shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium mb-4">
              {{ t('settings.manageProductTypesUnits') }}
            </h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium ">{{ t('settings.productTypes') }}</label>
                <router-link :to="{name:'ProductTypes'}" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  {{ t('settings.manageProductTypes') }}
                </router-link>
              </div>
              <div class="flex items-center justify-between">
                  <label class="block text-sm font-medium ">{{ t('settings.manageProductUnits') }}</label>
                <router-link :to="{name:'ProductUnits'}" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  {{ t('settings.manageProductUnits') }}
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
                {{ t('settings.printerSettings') }}
              </h3>
              <button
                @click="refreshPrinters"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {{ t('settings.refresh') }}
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
                  <span class="ml-2 text-sm ">{{ t('settings.enablePrinting') }}</span>
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium ">Printer</label>
                <select
                  v-model="printerSettings.printerName"
                  :disabled="!printerSettings.enabled"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="" disabled>{{ t('settings.selectPrinter') }}</option>
                  <option
                    v-for="p in printers"
                    :key="p.name"
                    :value="p.name"
                  >
                    {{ p.displayName || p.name }}<span v-if="p.isDefault"> (Default)</span>
                  </option>
                </select>
                <p v-if="printers.length === 0" class="text-sm mt-2">{{ t('settings.noPrintersFound') }}</p>
              </div>
            </div>
            <div class="mt-4">
              <button
                @click="testPrinter"
                :disabled="!printerSettings.enabled || !printerSettings.printerName"
                class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
              >
                {{ t('settings.testPrint') }}
              </button>
            </div>
          </div>
        </div>


        <!-- Save Button -->
        <div class="flex justify-between">
          <button
            @click="resetToDefaults"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            {{ t('settings.resetToDefaults') }}
          </button>
          <button
            @click="saveSettings"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {{ t('settings.saveSettings') }}
          </button>
        </div>

        <!-- Backup & Restore Settings -->
        <div class="shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium mb-4">
              {{ t('settings.databaseBackupRestore') }}
            </h3>
            
            <div class="space-y-4">
              <!-- Backup Folder Selection -->
              <div>
                <label class="block text-sm font-medium mb-2">{{ t('settings.backupFolder') }}:</label>
                <div class="flex gap-2">
                  <input
                    v-model="backupFolder"
                    type="text"
                    readonly
                    class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="No folder selected"
                  >
                  <button
                    @click="chooseBackupFolder"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {{ t('settings.chooseFolder') }}
                  </button>
                </div>
              </div>

              <!-- Backup Options -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <button
                    @click="backupNow"
                    :disabled="!backupFolder"
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {{ t('settings.createBackupNow') }}
                  </button>
                </div>
                <div>
                  <button
                    @click="enableDailyBackup"
                    :disabled="!backupFolder"
                    class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {{ t('settings.enableDailyBackups') }}
                  </button>
                </div>
                <div>
                  <button
                    @click="enableWeeklyBackup"
                    :disabled="!backupFolder"
                    class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {{ t('settings.enableWeeklyBackups') }}
                  </button>
                </div>
              </div>

              <!-- Schedule Status -->
              <div v-if="nextBackup" class="bg-gray-50 p-4 rounded-md">
                <h4 class="font-medium text-gray-900 mb-2">{{ t('settings.backupScheduleStatus') }}:</h4>
                <p class="text-sm text-gray-600 mb-2">{{ t('settings.nextBackup') }}: {{ formatDateTime(nextBackup) }}</p>
                <div class="flex gap-2">
                  <button
                    @click="cancelSchedule"
                    class="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                  >
                    {{ t('settings.cancelBackupSchedule') }}
                  </button>
                </div>
              </div>

              <!-- Restore Section -->
              <div class="border-t pt-4">
                <h4 class="font-medium  mb-2">{{ t('settings.restoreDatabase') }}:</h4>
                <p class="text-xs mb-3">
                  {{ t('settings.warningRestoreDatabase') }}
                </p>
                <div class="flex gap-2">
                  <button
                    @click="chooseRestoreFile"
                    class="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    {{ t('settings.chooseBackupFile') }}
                  </button>
                  <button
                    v-if="selectedRestoreFile"
                    @click="restoreDatabase"
                    class="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    {{ t('settings.restoreDatabase') }}
                  </button>
                </div>
                
                <div v-if="selectedRestoreFile" class="mt-2 text-sm text-gray-600">
                  {{ t('settings.selectedBackupFile') }}: {{ selectedRestoreFile }}
                </div>
              </div>

              <!-- Status Messages -->
              <div v-if="backupMessage" class="mt-4 p-3 rounded-md" :class="backupMessageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'">
                {{ backupMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n();
// Stores
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
// Reactive Variables - Settings from Store
const companyInfo = ref(settingsStore.getCompanyInfo)
const taxRates = ref(settingsStore.getTaxRates)
const printerSettings = ref(settingsStore.getPrinterSettings)
const backupSettings = ref(settingsStore.getBackupSettings)
const backupFolder = ref(settingsStore.getBackupFolder)

// Additional Variables
const printers = ref([])
const nextBackup = ref('')
const selectedRestoreFile = ref('')
const selectedRestoreFilePath = ref('')
const backupMessage = ref('')
const backupMessageType = ref('success')
// Methods
function saveSettings() {
    try {
      // Update store with current values
      settingsStore.updateCompanyInfo(companyInfo.value)
      settingsStore.updateTaxRates(taxRates.value)
      settingsStore.updatePrinterSettings(printerSettings.value)
      settingsStore.updateBackupSettings(backupSettings.value)
      settingsStore.setBackupFolder(backupFolder.value)
      
      // Show success message
      backupMessage.value = 'Settings saved successfully!'
      backupMessageType.value = 'success'
      
      // Clear message after 3 seconds
      setTimeout(() => {
        backupMessage.value = ''
      }, 3000)
      
    } catch (error) {
      backupMessage.value = 'Failed to save settings'
      backupMessageType.value = 'error'
      console.error('Error saving settings:', error)
    }
  }
  
  function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      settingsStore.resetSettings()
      
      // Update local refs
      companyInfo.value = settingsStore.getCompanyInfo
      taxRates.value = settingsStore.getTaxRates
      printerSettings.value = settingsStore.getPrinterSettings
      backupSettings.value = settingsStore.getBackupSettings
      backupFolder.value = settingsStore.getBackupFolder
      
      backupMessage.value = 'Settings reset to defaults successfully!'
      backupMessageType.value = 'success'
      
      setTimeout(() => {
        backupMessage.value = ''
      }, 3000)
    }
  }
  
  function testPrinter() {
    // Implement printer test logic
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
    // Load settings from store
    settingsStore.loadSettings()
    
    // Refresh printers list
    refreshPrinters()
    
    // Debug: Check current locale and translations
    console.log('Settings component mounted')
    console.log('Current locale:', locale.value)
    console.log('Translation test:', t('settings.title'))
  })
  
  // Watch for language changes
  watch(locale, (newLocale) => {
    console.log('Language changed to:', newLocale)
    console.log('Translation test after change:', t('settings.title'))
  })
  
  async function chooseBackupFolder() {
    const folder = await window.electronAPI.backup.chooseFolder()
    if (folder) {
      backupFolder.value = folder
    }
  }

  async function backupNow() {
    if (!backupFolder.value) {
      showMessage('Please select a backup folder first', 'error')
      return
    }
    try {
      const result = await window.electronAPI.backup.exportJSON(backupFolder.value)
      showMessage(`Backup created successfully! File: ${result.filePath}, Tables: ${result.tables}`, 'success')
    } catch (error) {
      showMessage(`Backup failed: ${error.message}`, 'error')
    }
  }

  async function enableDailyBackup() {
    if (!backupFolder.value) {
      showMessage('Please select a backup folder first', 'error')
      return
    }
    try {
      const result = await window.electronAPI.backup.scheduleDaily(backupFolder.value)
      nextBackup.value = result.nextRun
      showMessage(`Daily backups enabled! Next backup: ${formatDateTime(result.nextRun)}`, 'success')
    } catch (error) {
      showMessage(`Failed to enable daily backups: ${error.message}`, 'error')
    }
  }

  async function enableWeeklyBackup() {
    if (!backupFolder.value) {
      showMessage('Please select a backup folder first', 'error')
      return
    }
    try {
      const result = await window.electronAPI.backup.scheduleWeekly(backupFolder.value)
      nextBackup.value = result.nextRun
      showMessage(`Weekly backups enabled! Next backup: ${formatDateTime(result.nextRun)}`, 'success')
    } catch (error) {
      showMessage(`Failed to enable weekly backups: ${error.message}`, 'error')
    }
  }

  async function cancelSchedule() {
    try {
      await window.electronAPI.backup.cancelSchedule()
      nextBackup.value = ''
      showMessage('Backup schedule cancelled', 'success')
    } catch (error) {
      showMessage(`Failed to cancel schedule: ${error.message}`, 'error')
    }
  }

  async function chooseRestoreFile() {
    try {
      const filePath = await window.electronAPI.backup.chooseRestoreFile()
      if (filePath) {
        selectedRestoreFilePath.value = filePath
        selectedRestoreFile.value = filePath.split('/').pop() || filePath.split('\\').pop()
        showMessage('Backup file selected', 'success')
      }
    } catch (error) {
      showMessage(`Failed to select backup file: ${error.message}`, 'error')
    }
  }

  async function restoreDatabase() {
    if (!selectedRestoreFile.value) {
      showMessage('Please select a backup file first', 'error')
      return
    }
    
    const confirmRestore = confirm('⚠️ WARNING: This will completely replace your current database!\n\nThis action cannot be undone. Are you sure you want to continue?')
    if (!confirmRestore) return

    try {
      const result = await window.electronAPI.backup.restoreFromJSON(selectedRestoreFilePath.value)
      showMessage(`Database restored successfully! ${result.message}`, 'success')
      selectedRestoreFile.value = ''
      
      // Refresh the app to reflect the restored data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      showMessage(`Restore failed: ${error.message}`, 'error')
    }
  }

  function showMessage(message, type) {
    backupMessage.value = message
    backupMessageType.value = type
    setTimeout(() => {
      backupMessage.value = ''
    }, 5000)
  }

  function formatDateTime(dateTimeString) {
    return new Date(dateTimeString).toLocaleString()
  }
  </script>