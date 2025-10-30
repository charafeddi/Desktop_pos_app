<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isVisible" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75 p-4" @click.self="handleBackdropClick">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">License Activation Required</h2>
              <button
                v-if="!isRequired"
                @click="close"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span class="material-icons-outlined">close</span>
              </button>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This application requires a valid license to continue. Please activate your license below.
            </p>
          </div>

          <!-- Body -->
          <div class="px-6 py-4">
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
                  class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center gap-2 transition-colors"
                >
                  <span class="material-icons-outlined text-sm">content_copy</span>
                  Copy
                </button>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">This is your unique device identifier</p>
            </div>

            <!-- License Key Input -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                License Key
              </label>
              <textarea
                v-model="licenseKey"
                rows="3"
                placeholder="Enter your license key (e.g., ABCD1-EFGH2-IJKL3-...)"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
                @input="formatLicenseKey"
                @keyup.ctrl.enter="validateLicense"
              ></textarea>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Paste your full license key here. You can also paste with Ctrl+V or right-click paste.
              </p>
            </div>

            <!-- Customer Info (if needed) -->
            <div v-if="showCustomerInfo" class="mb-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer Email (Optional)
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
                  Customer Name (Optional)
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
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              @click="validateLicense"
              :disabled="!licenseKey || loading"
              class="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading ? 'Validating...' : 'Validate License' }}
            </button>
            <button
              v-if="validationResult?.valid"
              @click="activateLicense"
              :disabled="loading || activating"
              class="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ activating ? 'Activating...' : 'Activate & Continue' }}
            </button>
          </div>

          <!-- Help Text -->
          <div class="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-blue-800 dark:text-blue-300">
              <strong>Need Help?</strong><br>
              If you don't have a license key, please contact support or make a purchase.
              Each license key can be activated on up to {{ validationResult?.data?.deviceCount || 'the specified number of' }} device(s).
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useToast } from '@/utils/toastManager'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  isRequired: {
    type: Boolean,
    default: true // Block app until activated
  }
})

const emit = defineEmits(['activated', 'close'])

const { success: showSuccess, error: showError } = useToast()

const licenseKey = ref('')
const customerEmail = ref('')
const customerName = ref('')
const deviceFingerprint = ref('')
const validationResult = ref(null)
const loading = ref(false)
const activating = ref(false)
const error = ref('')
const success = ref('')
const showCustomerInfo = ref(false)

// Format license key as user types
// Allow longer keys (removed length limit), just format with dashes every 5 chars
const formatLicenseKey = (event) => {
  // Remove existing dashes and non-alphanumeric, but preserve case for base64
  let value = event.target.value.replace(/[^A-Za-z0-9]/gi, '')
  // Format as XXXXX-XXXXX-XXXXX-... (groups of 5)
  // Don't limit length - allow full base64 string
  value = value.match(/.{1,5}/g)?.join('-') || value
  licenseKey.value = value
}

// Get device fingerprint on mount
onMounted(async () => {
  try {
    const result = await window.electronAPI.license.getFingerprint()
    if (result.success) {
      deviceFingerprint.value = result.fingerprint
    }
  } catch (err) {
    console.error('Error getting fingerprint:', err)
  }
})

// Validate license key
const validateLicense = async () => {
  if (!licenseKey.value || licenseKey.value.replace(/-/g, '').length < 20) {
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
      
      // Emit activation event to parent
      emit('activated')
      
      // Close modal after short delay
      setTimeout(() => {
        close()
      }, 1500)
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

// Close modal
const close = () => {
  if (!props.isRequired) {
    emit('close')
  }
}

// Handle backdrop click
const handleBackdropClick = () => {
  if (!props.isRequired) {
    close()
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
</script>

<style scoped>
/* License key textarea styling */
textarea.font-mono {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.05em;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}
</style>

