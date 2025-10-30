<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full">
      <!-- License Status Card -->
      <div v-if="licenseStatus" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">License Status</h2>
          <span 
            v-if="licenseStatus.activated" 
            class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium"
          >
            ✓ Activated
          </span>
          <span 
            v-else 
            class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-sm font-medium"
          >
            Not Activated
          </span>
        </div>

        <div v-if="licenseStatus.activated && licenseStatus.data" class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">License ID</p>
              <p class="font-medium text-gray-900 dark:text-gray-100">{{ licenseStatus.data.licenseId }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Package Type</p>
              <p class="font-medium text-gray-900 dark:text-gray-100 capitalize">{{ licenseStatus.data.packageType }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Devices Allowed</p>
              <p class="font-medium text-gray-900 dark:text-gray-100">{{ licenseStatus.data.deviceCount }}</p>
            </div>
            <div v-if="licenseStatus.data.expiryDate">
              <p class="text-sm text-gray-500 dark:text-gray-400">Expiry Date</p>
              <p class="font-medium text-gray-900 dark:text-gray-100">{{ formatDate(licenseStatus.data.expiryDate) }}</p>
            </div>
          </div>

          <button
            @click="deactivateLicense"
            class="w-full px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            Deactivate License
          </button>
        </div>
      </div>

      <!-- Activation Form -->
      <div v-if="!licenseStatus || !licenseStatus.activated" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Activate License</h2>

        <!-- Device Fingerprint -->
        <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Device ID</label>
          <div class="flex items-center gap-2">
            <input
              type="text"
              :value="deviceFingerprint"
              readonly
              class="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-gray-100 text-sm"
            >
            <button
              @click="copyFingerprint"
              class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              📋 Copy
            </button>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">This is your unique device identifier</p>
        </div>

        <!-- License Key Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            License Key
          </label>
          <input
            v-model="licenseKey"
            type="text"
            placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            @input="formatLicenseKey"
          >
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter the license key provided with your purchase
          </p>
        </div>

        <!-- Customer Info (if needed) -->
        <div v-if="showCustomerInfo" class="mb-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Customer Email
            </label>
            <input
              v-model="customerEmail"
              type="email"
              placeholder="customer@example.com"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Customer Name
            </label>
            <input
              v-model="customerName"
              type="text"
              placeholder="Business Name"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>

        <!-- Validation Result -->
        <div v-if="validationResult" class="mb-4 p-4 rounded-lg" :class="validationResult.valid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
          <p :class="validationResult.valid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'">
            {{ validationResult.message }}
          </p>
          <div v-if="validationResult.valid && validationResult.data" class="mt-2 text-sm">
            <p class="text-gray-700 dark:text-gray-300">
              Package: <span class="font-medium capitalize">{{ validationResult.data.packageType }}</span> | 
              Devices: <span class="font-medium">{{ validationResult.data.deviceCount }}</span>
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p class="text-red-800 dark:text-red-300">{{ error }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p class="text-green-800 dark:text-green-300">{{ success }}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            @click="validateLicense"
            :disabled="!licenseKey || loading"
            class="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Validating...' : 'Validate License' }}
          </button>
          <button
            v-if="validationResult?.valid"
            @click="activateLicense"
            :disabled="loading || activating"
            class="flex-1 px-4 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ activating ? 'Activating...' : 'Activate' }}
          </button>
        </div>

        <!-- Help Text -->
        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p class="text-sm text-blue-800 dark:text-blue-300">
            <strong>Need Help?</strong><br>
            If you don't have a license key, please contact support or make a purchase.
            Each license key can be activated on up to {{ validationResult?.data?.deviceCount || 'the specified number of' }} device(s).
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/utils/toastManager'

const router = useRouter()
const { success: showSuccess, error: showError } = useToast()

const licenseKey = ref('')
const customerEmail = ref('')
const customerName = ref('')
const deviceFingerprint = ref('')
const licenseStatus = ref(null)
const validationResult = ref(null)
const loading = ref(false)
const activating = ref(false)
const error = ref('')
const success = ref('')
const showCustomerInfo = ref(false)

// Format license key as user types
const formatLicenseKey = (event) => {
  let value = event.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  // Format as XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
  value = value.match(/.{1,5}/g)?.join('-') || value
  if (value.length > 29) value = value.substring(0, 29)
  licenseKey.value = value
}

// Get device fingerprint on mount
onMounted(async () => {
  try {
    const result = await window.electronAPI.license.getFingerprint()
    if (result.success) {
      deviceFingerprint.value = result.fingerprint
    }
    
    // Check existing license
    await checkLicense()
  } catch (err) {
    console.error('Error getting fingerprint:', err)
  }
})

// Check license status
const checkLicense = async () => {
  try {
    const result = await window.electronAPI.license.check()
    licenseStatus.value = result
    
    if (result.activated && result.data) {
      // License is active, show status
      showSuccess('License Active', 'Your license is activated and valid')
    }
  } catch (err) {
    console.error('Error checking license:', err)
  }
}

// Validate license key
const validateLicense = async () => {
  if (!licenseKey.value || licenseKey.value.length < 20) {
    error.value = 'Please enter a valid license key'
    return
  }

  loading.value = true
  error.value = ''
  validationResult.value = null

  try {
    const result = await window.electronAPI.license.validate(licenseKey.value)
    
    if (result.success && result.valid) {
      validationResult.value = result
      showCustomerInfo.value = true
      showSuccess('License Valid', 'License key is valid. You can proceed with activation.')
    } else {
      validationResult.value = result
      error.value = result.message || 'Invalid license key'
      showError('Validation Failed', result.message || 'Invalid license key')
    }
  } catch (err) {
    error.value = 'Error validating license. Please try again.'
    showError('Error', 'Failed to validate license')
    console.error('Validation error:', err)
  } finally {
    loading.value = false
  }
}

// Activate license
const activateLicense = async () => {
  if (!licenseKey.value) {
    error.value = 'Please enter a license key'
    return
  }

  activating.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await window.electronAPI.license.activate({
      licenseKey: licenseKey.value,
      customerEmail: customerEmail.value || '',
      customerName: customerName.value || 'Customer'
    })

    if (result.success) {
      success.value = 'License activated successfully!'
      showSuccess('Activation Successful', 'Your license has been activated.')
      await checkLicense()
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } else {
      error.value = result.message || 'Failed to activate license'
      showError('Activation Failed', result.message || 'Failed to activate license')
    }
  } catch (err) {
    error.value = 'Error activating license. Please try again.'
    showError('Error', 'Failed to activate license')
    console.error('Activation error:', err)
  } finally {
    activating.value = false
  }
}

// Deactivate license
const deactivateLicense = async () => {
  if (!confirm('Are you sure you want to deactivate this license on this device?')) {
    return
  }

  try {
    const result = await window.electronAPI.license.deactivate()
    if (result.success) {
      showSuccess('License Deactivated', 'License has been deactivated on this device.')
      await checkLicense()
    } else {
      showError('Error', 'Failed to deactivate license')
    }
  } catch (err) {
    showError('Error', 'Failed to deactivate license')
    console.error('Deactivation error:', err)
  }
}

// Copy fingerprint to clipboard
const copyFingerprint = async () => {
  try {
    await navigator.clipboard.writeText(deviceFingerprint.value)
    showSuccess('Copied', 'Device ID copied to clipboard')
  } catch (err) {
    console.error('Copy error:', err)
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
input[type="text"].uppercase {
  text-transform: uppercase;
}
</style>

