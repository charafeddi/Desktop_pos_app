<template>
  <div class="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
    <!-- Loading State -->
    <LoadingSpinner 
      v-if="isLoading || isSaving || isResetting || isRefreshingPrinters || isTestingPrinter || isBackingUp || isRestoring || isChoosingFolder || isChoosingFile"
      :message="getLoadingMessage()"
      :fullscreen="true"
      :overlay="true"
    />

    <!-- Error State -->
    <div v-else-if="hasError" class="flex flex-col items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium mb-2" style="color: var(--color-text)">Settings Error</h3>
        <p class="mb-4" style="color: var(--color-text-secondary)">{{ errorMessage }}</p>
        <button 
          @click="resetErrorState" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Settings Content -->
    <div v-else class="max-w-7xl mx-auto">
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
                  :class="validationErrors.name ? 'border-red-500' : 'border-gray-300'"
                  class="mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600">{{ validationErrors.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium ">{{ t('settings.address') }}</label>
                <input
                  v-model="companyInfo.address"
                  type="text"
                  :class="validationErrors.address ? 'border-red-500' : 'border-gray-300'"
                  class="mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                <p v-if="validationErrors.address" class="mt-1 text-sm text-red-600">{{ validationErrors.address }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium ">{{ t('settings.phone') }}</label>
                <input
                  v-model="companyInfo.phone"
                  type="text"
                  :class="validationErrors.phone ? 'border-red-500' : 'border-gray-300'"
                  class="mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                <p v-if="validationErrors.phone" class="mt-1 text-sm text-red-600">{{ validationErrors.phone }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium ">{{ t('settings.email') }}</label>
                <input
                  v-model="companyInfo.email"
                  type="email"
                  :class="validationErrors.email ? 'border-red-500' : 'border-gray-300'"
                  class="mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600">{{ validationErrors.email }}</p>
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

        <!-- Currency Settings -->
        <div class="shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium mb-4">
              {{ t('settings.currency') }}
            </h3>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label class="block text-sm font-medium ">{{ t('settings.currencyCode') }}</label>
                <select
                  v-model="currency.code"
                  @change="updateCurrencyFromCode"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="MAD">MAD - Moroccan Dirham</option>
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="SAR">SAR - Saudi Riyal</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium ">{{ t('settings.currencySymbol') }}</label>
                <input
                  v-model="currency.symbol"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="$"
                >
              </div>
              <div>
                <label class="block text-sm font-medium ">{{ t('settings.currencyName') }}</label>
                <input
                  v-model="currency.name"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="US Dollar"
                >
              </div>
            </div>
            <div class="mt-4 p-4 bg-gray-50 rounded-md">
              <p class="text-sm text-gray-600">
                <strong>Preview:</strong> {{ formatCurrency(1234.56) }}
              </p>
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
            @click="confirmReset"
            :disabled="isResetting"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isResetting ? 'Resetting...' : t('settings.resetToDefaults') }}
          </button>
          <button
            @click="saveSettings"
            :disabled="isSaving"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving ? 'Saving...' : t('settings.saveSettings') }}
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
                    @click="confirmRestore"
                    :disabled="isRestoring"
                    class="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isRestoring ? 'Restoring...' : t('settings.restoreDatabase') }}
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

    <!-- Confirmation Dialogs -->
    <ConfirmationDialog
      :is-visible="showResetConfirm"
      title="Reset Settings"
      message="Are you sure you want to reset all settings to defaults? This action cannot be undone."
      type="warning"
      confirmText="Reset"
      cancelText="Cancel"
      :loading="isResetting"
      @confirm="resetToDefaults"
      @cancel="cancelReset"
    />

    <ConfirmationDialog
      :is-visible="showRestoreConfirm"
      title="Restore Database"
      message="⚠️ WARNING: This will completely replace your current database! This action cannot be undone. Are you sure you want to continue?"
      type="danger"
      confirmText="Restore"
      cancelText="Cancel"
      :loading="isRestoring"
      @confirm="restoreDatabase"
      @cancel="cancelRestore"
    />
  </div>
</template> 

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useI18n } from 'vue-i18n'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useToast } from '@/utils/toastManager'
import { useErrorHandler } from '@/utils/errorHandler'
import { electronAPI } from '@/utils/electronAPI'
import { formatCurrency } from '@/utils/currency'

const { t, locale } = useI18n();
const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()
const { handleNetworkError, handleDatabaseError, handleValidationError, handleBusinessLogicError } = useErrorHandler()

// Stores
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// Loading states
const isLoading = ref(false)
const isSaving = ref(false)
const isResetting = ref(false)
const isRefreshingPrinters = ref(false)
const isTestingPrinter = ref(false)
const isBackingUp = ref(false)
const isRestoring = ref(false)
const isChoosingFolder = ref(false)
const isChoosingFile = ref(false)

// Confirmation dialog states
const showResetConfirm = ref(false)
const showRestoreConfirm = ref(false)

// Error states
const hasError = ref(false)
const errorMessage = ref('')
const validationErrors = ref({})

// Reactive Variables - Settings from Store
const companyInfo = ref(settingsStore.getCompanyInfo)
const taxRates = ref(settingsStore.getTaxRates)
const printerSettings = ref(settingsStore.getPrinterSettings)
const backupSettings = ref(settingsStore.getBackupSettings)
const backupFolder = ref(settingsStore.getBackupFolder)
// Initialize currency with default values if null
const currency = ref(settingsStore.getCurrency || { code: 'USD', symbol: '$', name: 'US Dollar' })

// Additional Variables
const printers = ref([])
const nextBackup = ref('')
const selectedRestoreFile = ref('')
const selectedRestoreFilePath = ref('')
const backupMessage = ref('')
const backupMessageType = ref('success')
// Helper methods
const getLoadingMessage = () => {
  if (isSaving.value) return 'Saving settings...'
  if (isResetting.value) return 'Resetting settings...'
  if (isRefreshingPrinters.value) return 'Refreshing printers...'
  if (isTestingPrinter.value) return 'Testing printer...'
  if (isBackingUp.value) return 'Creating backup...'
  if (isRestoring.value) return 'Restoring database...'
  if (isChoosingFolder.value) return 'Choosing folder...'
  if (isChoosingFile.value) return 'Choosing file...'
  return 'Loading...'
}

const resetErrorState = () => {
  hasError.value = false
  errorMessage.value = ''
  validationErrors.value = {}
}

const validateCompanyInfo = () => {
  const errors = {}
  
  if (!companyInfo.value.name?.trim()) {
    errors.name = 'Company name is required'
  }
  
  if (companyInfo.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyInfo.value.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  if (companyInfo.value.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(companyInfo.value.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }
  
  return errors
}

const validateTaxRates = () => {
  const errors = {}
  
  taxRates.value.forEach((rate, index) => {
    if (!rate.name?.trim()) {
      errors[`tax_${index}_name`] = 'Tax rate name is required'
    }
    
    if (rate.rate < 0 || rate.rate > 100) {
      errors[`tax_${index}_rate`] = 'Tax rate must be between 0 and 100'
    }
  })
  
  return errors
}

const confirmReset = () => {
  showResetConfirm.value = true
}

const cancelReset = () => {
  showResetConfirm.value = false
}

const confirmRestore = () => {
  showRestoreConfirm.value = true
}

const cancelRestore = () => {
  showRestoreConfirm.value = false
}

// Methods
async function saveSettings() {
  try {
    isSaving.value = true
    resetErrorState()
    
    // Validate form data
    const companyErrors = validateCompanyInfo()
    const taxErrors = validateTaxRates()
    
    if (Object.keys(companyErrors).length > 0 || Object.keys(taxErrors).length > 0) {
      validationErrors.value = { ...companyErrors, ...taxErrors }
      handleValidationError(new Error('Form validation failed'), 'Save Settings')
      showError('Validation Error', 'Please fix the form errors before saving')
      return
    }
    
    showInfo('Saving Settings', 'Please wait while we save your settings...')
    
    // Update store with current values using async methods
    await settingsStore.saveCompanyInfo(companyInfo.value)
    await settingsStore.saveTaxRates(taxRates.value)
    await settingsStore.savePrinterSettings(printerSettings.value)
    
    // Ensure currency object has all required fields before saving
    if (currency.value && currency.value.code && currency.value.symbol && currency.value.name) {
      console.log('Saving currency with data:', currency.value)
      await settingsStore.saveCurrency(currency.value)
    } else {
      console.error('Currency object incomplete:', currency.value)
      throw new Error('Currency settings are incomplete')
    }
    
    settingsStore.updateBackupSettings(backupSettings.value)
    settingsStore.setBackupFolder(backupFolder.value)
    
    showSuccess('Settings Saved', 'Your settings have been saved successfully!')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Settings Updated', 'Settings saved successfully')
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      backupMessage.value = ''
    }, 3000)
    
  } catch (error) {
    handleDatabaseError(error, 'Save Settings')
    showError('Save Failed', 'Failed to save settings. Please try again.')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while saving settings'
    
    backupMessage.value = 'Failed to save settings: ' + error.message
    backupMessageType.value = 'error'
  } finally {
    isSaving.value = false
  }
}
  
async function resetToDefaults() {
  try {
    isResetting.value = true
    resetErrorState()
    
    showWarning('Reset Settings', 'This will reset all settings to defaults. This action cannot be undone.')
    
    await settingsStore.resetSettings()
    
    // Update local refs
    companyInfo.value = settingsStore.getCompanyInfo
    taxRates.value = settingsStore.getTaxRates
    printerSettings.value = settingsStore.getPrinterSettings
    backupSettings.value = settingsStore.getBackupSettings
    backupFolder.value = settingsStore.getBackupFolder
    currency.value = settingsStore.getCurrency || { code: 'USD', symbol: '$', name: 'US Dollar' }
    
    showSuccess('Settings Reset', 'Settings have been reset to defaults successfully!')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Settings Reset', 'Settings reset to defaults')
    }
    
    backupMessage.value = 'Settings reset to defaults successfully!'
    backupMessageType.value = 'success'
    
    setTimeout(() => {
      backupMessage.value = ''
    }, 3000)
    
  } catch (error) {
    handleDatabaseError(error, 'Reset Settings')
    showError('Reset Failed', 'Failed to reset settings. Please try again.')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while resetting settings'
  } finally {
    isResetting.value = false
    showResetConfirm.value = false
  }
}
  
async function testPrinter() {
  try {
    isTestingPrinter.value = true
    resetErrorState()
    
    if (!printerSettings.value.enabled) {
      handleValidationError(new Error('Printing is not enabled'), 'Test Printer')
      showError('Printer Test Failed', 'Please enable printing first')
      return
    }
    
    if (!printerSettings.value.printerName) {
      handleValidationError(new Error('No printer selected'), 'Test Printer')
      showError('Printer Test Failed', 'Please select a printer first')
      return
    }
    
    showInfo('Testing Printer', 'Sending test print to ' + printerSettings.value.printerName)
    
    // Implement printer test logic
    const result = await electronAPI.print.testPrint(printerSettings.value.printerName)
    
    showSuccess('Printer Test', 'Test print sent successfully!')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Printer Test', 'Test print sent successfully')
    }
    
  } catch (error) {
    handleBusinessLogicError(error, 'Test Printer')
    showError('Printer Test Failed', 'Failed to send test print. Please check your printer connection.')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while testing the printer'
  } finally {
    isTestingPrinter.value = false
  }
}

async function refreshPrinters() {
  try {
    isRefreshingPrinters.value = true
    resetErrorState()
    
    showInfo('Refreshing Printers', 'Loading available printers...')
    
    const list = await electronAPI.printers.getAll()
    printers.value = Array.isArray(list) ? list : []
    
    // If current selection no longer exists, clear it
    if (!printers.value.some(p => p.name === printerSettings.value.printerName)) {
      const defaultPrinter = printers.value.find(p => p.isDefault)
      printerSettings.value.printerName = defaultPrinter?.name || ''
    }
    
    showSuccess('Printers Refreshed', `Found ${printers.value.length} printer(s)`)
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Printers Refreshed', `${printers.value.length} printers found`)
    }
    
  } catch (error) {
    handleNetworkError(error, 'Refresh Printers')
    showError('Refresh Failed', 'Failed to load printers. Please check your printer connection.')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while refreshing printers'
    printers.value = []
  } finally {
    isRefreshingPrinters.value = false
  }
}

onMounted(async () => {
  try {
    isLoading.value = true
    resetErrorState()
    
    showInfo('Loading Settings', 'Loading your settings from database...')
    
    // Load settings from database
    await settingsStore.loadSettings()
    
    // Update local refs with loaded data
    companyInfo.value = settingsStore.getCompanyInfo
    taxRates.value = settingsStore.getTaxRates
    printerSettings.value = settingsStore.getPrinterSettings
    backupSettings.value = settingsStore.getBackupSettings
    backupFolder.value = settingsStore.getBackupFolder
    currency.value = settingsStore.getCurrency || { code: 'USD', symbol: '$', name: 'US Dollar' }
    
    // Refresh printers list
    await refreshPrinters()
    
    showSuccess('Settings Loaded', 'Your settings have been loaded successfully!')
    
    // Debug: Check current locale and translations
    console.log('Settings component mounted')
    console.log('Current locale:', locale.value)
    console.log('Translation test:', t('settings.title'))
    console.log('Loaded company info:', companyInfo.value)
    
  } catch (error) {
    handleDatabaseError(error, 'Load Settings')
    showError('Load Failed', 'Failed to load settings. Please refresh the page.')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while loading settings'
  } finally {
    isLoading.value = false
  }
})
  
  // Watch for language changes
  watch(locale, (newLocale) => {
    console.log('Language changed to:', newLocale)
    console.log('Translation test after change:', t('settings.title'))
  })
  
async function chooseBackupFolder() {
  try {
    isChoosingFolder.value = true
    resetErrorState()
    
    showInfo('Choosing Folder', 'Please select a backup folder...')
    
    const folder = await electronAPI.backup.chooseFolder()
    if (folder) {
      backupFolder.value = folder
      showSuccess('Folder Selected', 'Backup folder selected successfully!')
    }
  } catch (error) {
    handleBusinessLogicError(error, 'Choose Backup Folder')
    showError('Folder Selection Failed', 'Failed to select backup folder. Please try again.')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while selecting folder'
  } finally {
    isChoosingFolder.value = false
  }
}

async function backupNow() {
  try {
    isBackingUp.value = true
    resetErrorState()
    
    if (!backupFolder.value) {
      handleValidationError(new Error('No backup folder selected'), 'Create Backup')
      showError('Backup Failed', 'Please select a backup folder first')
      return
    }
    
    showInfo('Creating Backup', 'Creating database backup...')
    
    const result = await electronAPI.backup.exportJSON(backupFolder.value)
    
    showSuccess('Backup Created', `Backup created successfully! File: ${result.filePath}, Tables: ${result.tables}`)
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Backup Created', 'Database backup completed')
    }
    
    showMessage(`Backup created successfully! File: ${result.filePath}, Tables: ${result.tables}`, 'success')
  } catch (error) {
    handleDatabaseError(error, 'Create Backup')
    showError('Backup Failed', 'Failed to create backup. Please try again.')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while creating backup'
    showMessage(`Backup failed: ${error.message}`, 'error')
  } finally {
    isBackingUp.value = false
  }
}

async function enableDailyBackup() {
  try {
    isBackingUp.value = true
    resetErrorState()
    
    if (!backupFolder.value) {
      handleValidationError(new Error('No backup folder selected'), 'Enable Daily Backup')
      showError('Backup Failed', 'Please select a backup folder first')
      return
    }
    
    showInfo('Enabling Daily Backup', 'Setting up daily backup schedule...')
    
    const result = await electronAPI.backup.scheduleDaily(backupFolder.value)
    nextBackup.value = result.nextRun
    
    showSuccess('Daily Backup Enabled', `Daily backups enabled! Next backup: ${formatDateTime(result.nextRun)}`)
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Daily Backup Enabled', 'Daily backup schedule activated')
    }
    
    showMessage(`Daily backups enabled! Next backup: ${formatDateTime(result.nextRun)}`, 'success')
  } catch (error) {
    handleDatabaseError(error, 'Enable Daily Backup')
    showError('Backup Failed', 'Failed to enable daily backups. Please try again.')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while enabling daily backups'
    showMessage(`Failed to enable daily backups: ${error.message}`, 'error')
  } finally {
    isBackingUp.value = false
  }
}

async function enableWeeklyBackup() {
  try {
    isBackingUp.value = true
    resetErrorState()
    
    if (!backupFolder.value) {
      handleValidationError(new Error('No backup folder selected'), 'Enable Weekly Backup')
      showError('Backup Failed', 'Please select a backup folder first')
      return
    }
    
    showInfo('Enabling Weekly Backup', 'Setting up weekly backup schedule...')
    
    const result = await electronAPI.backup.scheduleWeekly(backupFolder.value)
    nextBackup.value = result.nextRun
    
    showSuccess('Weekly Backup Enabled', `Weekly backups enabled! Next backup: ${formatDateTime(result.nextRun)}`)
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Weekly Backup Enabled', 'Weekly backup schedule activated')
    }
    
    showMessage(`Weekly backups enabled! Next backup: ${formatDateTime(result.nextRun)}`, 'success')
  } catch (error) {
    handleDatabaseError(error, 'Enable Weekly Backup')
    showError('Backup Failed', 'Failed to enable weekly backups. Please try again.')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while enabling weekly backups'
    showMessage(`Failed to enable weekly backups: ${error.message}`, 'error')
  } finally {
    isBackingUp.value = false
  }
}

async function cancelSchedule() {
  try {
    isBackingUp.value = true
    resetErrorState()
    
    showInfo('Cancelling Schedule', 'Cancelling backup schedule...')
    
    await electronAPI.backup.cancelSchedule()
    nextBackup.value = ''
    
    showSuccess('Schedule Cancelled', 'Backup schedule cancelled successfully!')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Schedule Cancelled', 'Backup schedule cancelled')
    }
    
    showMessage('Backup schedule cancelled', 'success')
  } catch (error) {
    handleDatabaseError(error, 'Cancel Schedule')
    showError('Cancel Failed', 'Failed to cancel backup schedule. Please try again.')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while cancelling schedule'
    showMessage(`Failed to cancel schedule: ${error.message}`, 'error')
  } finally {
    isBackingUp.value = false
  }
}

async function chooseRestoreFile() {
  try {
    isChoosingFile.value = true
    resetErrorState()
    
    console.log('Starting chooseRestoreFile...')
    showInfo('Choosing File', 'Please select a backup file to restore...')
    
    const filePath = await electronAPI.backup.chooseRestoreFile()
    console.log('File path returned from electronAPI:', filePath)
    
    if (filePath) {
      selectedRestoreFilePath.value = filePath
      selectedRestoreFile.value = filePath.split('/').pop() || filePath.split('\\').pop()
      console.log('Selected file path:', selectedRestoreFilePath.value)
      console.log('Selected file name:', selectedRestoreFile.value)
      showSuccess('File Selected', 'Backup file selected successfully!')
      showMessage('Backup file selected', 'success')
    } else {
      console.log('No file selected or operation cancelled')
    }
  } catch (error) {
    console.error('Error in chooseRestoreFile:', error)
    handleBusinessLogicError(error, 'Choose Restore File')
    showError('File Selection Failed', 'Failed to select backup file. Please try again.')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while selecting file'
    showMessage(`Failed to select backup file: ${error.message}`, 'error')
  } finally {
    isChoosingFile.value = false
  }
}

async function restoreDatabase() {
  try {
    isRestoring.value = true
    resetErrorState()
    
    console.log('Starting restore process...')
    console.log('Selected restore file:', selectedRestoreFile.value)
    console.log('Selected restore file path:', selectedRestoreFilePath.value)
    
    if (!selectedRestoreFile.value) {
      handleValidationError(new Error('No backup file selected'), 'Restore Database')
      showError('Restore Failed', 'Please select a backup file first')
      return
    }
    
    if (!selectedRestoreFilePath.value) {
      handleValidationError(new Error('No backup file path selected'), 'Restore Database')
      showError('Restore Failed', 'Please select a backup file first')
      return
    }
    
    console.log('Calling electronAPI.backup.restoreFromJSON with path:', selectedRestoreFilePath.value)
    
    showWarning('Restore Database', 'This will completely replace your current database! This action cannot be undone.')
    
    const result = await electronAPI.backup.restoreFromJSON(selectedRestoreFilePath.value)
    
    console.log('Restore result:', result)
    
    if (!result) {
      throw new Error('No result returned from restore operation')
    }
    
    showSuccess('Database Restored', `Database restored successfully! ${result.message}`)
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Database Restored', 'Database restored successfully')
    }
    
    showMessage(`Database restored successfully! ${result.message}`, 'success')
    selectedRestoreFile.value = ''
    selectedRestoreFilePath.value = ''
    
    // Refresh the app to reflect the restored data
    setTimeout(() => {
      window.location.reload()
    }, 2000)
    
  } catch (error) {
    console.error('Restore error:', error)
    handleDatabaseError(error, 'Restore Database')
    showError('Restore Failed', 'Failed to restore database. Please try again.')
    hasError.value = true
    errorMessage.value = error.message || 'An error occurred while restoring database'
    showMessage(`Restore failed: ${error.message}`, 'error')
  } finally {
    isRestoring.value = false
    showRestoreConfirm.value = false
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

  // Currency mapping for auto-update
  const currencyMap = {
    'USD': { symbol: '$', name: 'US Dollar' },
    'EUR': { symbol: '€', name: 'Euro' },
    'GBP': { symbol: '£', name: 'British Pound' },
    'MAD': { symbol: 'د.م.', name: 'Moroccan Dirham' },
    'AED': { symbol: 'د.إ', name: 'UAE Dirham' },
    'SAR': { symbol: 'ر.س', name: 'Saudi Riyal' },
    'CAD': { symbol: '$', name: 'Canadian Dollar' },
    'AUD': { symbol: '$', name: 'Australian Dollar' },
    'JPY': { symbol: '¥', name: 'Japanese Yen' },
    'CNY': { symbol: '¥', name: 'Chinese Yuan' }
  }

  function updateCurrencyFromCode() {
    if (!currency.value || !currency.value.code) {
      console.error('Currency is not initialized')
      return
    }
    
    const currencyInfo = currencyMap[currency.value.code]
    if (currencyInfo) {
      currency.value.symbol = currencyInfo.symbol
      currency.value.name = currencyInfo.name
    }
  }
  </script>