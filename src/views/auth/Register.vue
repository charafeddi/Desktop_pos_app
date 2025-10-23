<template>
  <section class="container">
    <div class="register-container">
      <div class="circle circle-one"></div>
      <div class="form-container">
        <img src="/assets/img/Sign up-cuate.png" alt="Register Illustration" class="illustration" />
        <h1 class="opacity">REGISTER</h1>
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <input 
              type="text" 
              placeholder="Full Name" 
              v-model="formData.name"
              required
              :class="{ 'error': validationErrors.name, 'valid': formData.name && !validationErrors.name }"
            />
            <div v-if="validationErrors.name" class="field-error">{{ validationErrors.name }}</div>
          </div>
          <div class="form-group">
            <input 
              type="email" 
              placeholder="Email" 
              v-model="formData.email"
              required
              :class="{ 'error': validationErrors.email, 'valid': formData.email && !validationErrors.email }"
            />
            <div v-if="validationErrors.email" class="field-error">{{ validationErrors.email }}</div>
          </div>
          <div class="form-group">
            <input 
              type="tel" 
              placeholder="Mobile Phone" 
              v-model="formData.mobile_phone"
              required
              :class="{ 'error': validationErrors.mobile_phone, 'valid': formData.mobile_phone && !validationErrors.mobile_phone }"
            />
            <div v-if="validationErrors.mobile_phone" class="field-error">{{ validationErrors.mobile_phone }}</div>
          </div>
          <div class="form-group">
            <select 
              v-model="formData.role"
              required
              class="form-select"
              :class="{ 'error': validationErrors.role, 'valid': formData.role && !validationErrors.role }"
            >
              <option value="" disabled>Select Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
            <div v-if="validationErrors.role" class="field-error">{{ validationErrors.role }}</div>
          </div>
          <div class="password-group">
            <div class="form-group">
              <input 
                type="password" 
                placeholder="Password" 
                v-model="formData.password"
                required
                :class="{ 'error': validationErrors.password, 'valid': formData.password && !validationErrors.password }"
              />
              <div v-if="validationErrors.password" class="field-error">{{ validationErrors.password }}</div>
            </div>
            <div class="form-group">
              <input 
                type="password" 
                placeholder="Confirm Password" 
                v-model="confirmPassword"
                required
                :class="{ 'error': validationErrors.confirmPassword, 'valid': confirmPassword && !validationErrors.confirmPassword }"
              />
              <div v-if="validationErrors.confirmPassword" class="field-error">{{ validationErrors.confirmPassword }}</div>
            </div>
          </div>
          <div class="error-message" v-if="error">
            {{ error }}
          </div>
          <button class="opacity" type="submit" :disabled="isRegistering || isValidationInProgress">
            <span v-if="isRegistering || isValidationInProgress">Processing...</span>
            <span v-else>CREATE ACCOUNT</span>
          </button>
        </form>
        <div class="register-forget opacity">
          <a href="#" @click.prevent="goToLogin">ALREADY HAVE AN ACCOUNT?</a>
        </div>
      </div>
      <div class="circle circle-two"></div>
    </div>
    <div class="theme-btn-container"></div>
    
    <!-- Loading Spinner -->
    <LoadingSpinner 
      v-if="isRegistering || isValidationInProgress"
      :message="getLoadingMessage()"
      :fullscreen="true"
      :overlay="true"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useToast } from '@/utils/toastManager'
import { useErrorHandler } from '@/utils/errorHandler'

// Composables
const router = useRouter()
const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()
const { handleNetworkError, handleDatabaseError, handleValidationError, handleBusinessLogicError } = useErrorHandler()

// Stores
const authStore = useAuthStore()

// Reactive Variables
const formData = reactive({
  name: '',
  email: '',
  mobile_phone: '',
  password: '',
  role: ''
})

const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')

// Loading states
const isRegistering = ref(false)
const isValidationInProgress = ref(false)

// Form validation errors
const validationErrors = reactive({
  name: '',
  email: '',
  mobile_phone: '',
  password: '',
  confirmPassword: '',
  role: ''
})

const themes = [
  {
    background: "#1A1A2E",
    color: "#FFFFFF",
    primaryColor: "#0F3460"
  },
  {
    background: "#461220",
    color: "#FFFFFF",
    primaryColor: "#E94560"
  },
  {
    background: "#192A51",
    color: "#FFFFFF",
    primaryColor: "#967AA1"
  },
  {
    background: "#F7B267",
    color: "#000000",
    primaryColor: "#F4845F"
  },
  {
    background: "#F25F5C",
    color: "#000000",
    primaryColor: "#642B36"
  },
  {
    background: "#231F20",
    color: "#FFF",
    primaryColor: "#BB4430"
  }
]

// Helper methods
const getLoadingMessage = () => {
  if (isRegistering.value) return 'Creating your account...'
  if (isValidationInProgress.value) return 'Validating form...'
  return 'Processing...'
}

const validateForm = () => {
  isValidationInProgress.value = true
  
  // Clear previous errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key] = ''
  })
  
  let isValid = true
  
  // Name validation
  if (!formData.name.trim()) {
    validationErrors.name = 'Full name is required'
    isValid = false
  } else if (formData.name.trim().length < 2) {
    validationErrors.name = 'Name must be at least 2 characters'
    isValid = false
  } else if (formData.name.trim().length > 50) {
    validationErrors.name = 'Name must be less than 50 characters'
    isValid = false
  }
  
  // Email validation
  if (!formData.email.trim()) {
    validationErrors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    validationErrors.email = 'Please enter a valid email address'
    isValid = false
  }
  
  // Phone validation
  if (!formData.mobile_phone.trim()) {
    validationErrors.mobile_phone = 'Mobile phone is required'
    isValid = false
  } else if (!/^[+]?[0-9\s\-()]{10,15}$/.test(formData.mobile_phone.trim())) {
    validationErrors.mobile_phone = 'Please enter a valid phone number'
    isValid = false
  }
  
  // Role validation
  if (!formData.role) {
    validationErrors.role = 'Please select a role'
    isValid = false
  }
  
  // Password validation
  if (!formData.password) {
    validationErrors.password = 'Password is required'
    isValid = false
  } else if (formData.password.length < 6) {
    validationErrors.password = 'Password must be at least 6 characters'
    isValid = false
  } else if (formData.password.length > 128) {
    validationErrors.password = 'Password must be less than 128 characters'
    isValid = false
  }
  
  // Confirm password validation
  if (!confirmPassword.value) {
    validationErrors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (formData.password !== confirmPassword.value) {
    validationErrors.confirmPassword = 'Passwords do not match'
    isValid = false
  }
  
  isValidationInProgress.value = false
  return isValid
}

// Methods
function setTheme(theme) {
  const root = document.querySelector(":root")
  if (root) {
    root.style.setProperty("--background", theme.background)
    root.style.setProperty("--color", theme.color)
    root.style.setProperty("--primary-color", theme.primaryColor)
  }
}

function displayThemeButtons() {
  const btnContainer = document.querySelector(".theme-btn-container")
  if (btnContainer) {
    themes.forEach((theme) => {
      const div = document.createElement("div")
      div.className = "theme-btn"
      div.style.cssText = `background: ${theme.background}; width: 25px; height: 25px`
      div.addEventListener("click", () => setTheme(theme))
      btnContainer.appendChild(div)
    })
  }
}

// Lifecycle Hooks
onMounted(() => {
  displayThemeButtons()
})

async function handleRegister() {
  try {
    error.value = ''
    
    // Validate form
    if (!validateForm()) {
      handleValidationError(new Error('Form validation failed'), 'Registration')
      showError('Validation Error', 'Please fix the errors below and try again')
      return
    }
    
    isRegistering.value = true
    showInfo('Creating Account', 'Setting up your new account...')
    
    // Create a clean object with only the data we want to send
    const registrationData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      mobile_phone: formData.mobile_phone.trim(),
      password: formData.password,
      role: formData.role
    }
    
    await authStore.register(registrationData)
    
    showSuccess('Account Created', 'Welcome! Your account has been successfully created')
    
    // Add notification
    if (window.addNotification) {
      window.addNotification('success', 'Account Created', 'Welcome to the POS system!')
    }
    
    router.push('/dashboard')
  } catch (err) {
    const errorMessage = err && typeof err === 'object' && 'message' in err ? err.message : ''
    
    if (errorMessage.includes('UNIQUE constraint') || errorMessage.includes('duplicate')) {
      if (errorMessage.includes('email')) {
        handleDatabaseError(err, 'Registration')
        showError('Email Already Exists', 'An account with this email already exists. Please use a different email.')
        validationErrors.email = 'This email is already registered'
      } else if (errorMessage.includes('phone')) {
        handleDatabaseError(err, 'Registration')
        showError('Phone Already Exists', 'An account with this phone number already exists. Please use a different phone number.')
        validationErrors.mobile_phone = 'This phone number is already registered'
      } else {
        handleDatabaseError(err, 'Registration')
        showError('Account Exists', 'An account with this information already exists')
      }
    } else if (errorMessage.includes('validation') || errorMessage.includes('required')) {
      handleValidationError(err, 'Registration')
      showError('Validation Error', errorMessage || 'Please check your input and try again')
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      handleNetworkError(err, 'Registration')
      showError('Connection Error', 'Unable to connect to the server. Please check your internet connection and try again.')
    } else {
      handleNetworkError(err, 'Registration')
      showError('Registration Failed', errorMessage || 'An unexpected error occurred. Please try again.')
    }
    
    error.value = errorMessage || 'Registration failed. Please try again.'
  } finally {
    isRegistering.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
:root {
  --background: #1a1a2e;
  --color: #ffffff;
  --primary-color: #0f3460;
}

* {
  box-sizing: border-box;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--background);
  color: var(--color);
  letter-spacing: 1px;
  transition: background 0.2s ease;
  padding: 2rem;
}

.register-container {
  position: relative;
  width: 100%;
  max-width: 40rem;
}

.form-container {
  border: 1px solid hsla(0, 0%, 65%, 0.158);
  box-shadow: 0 0 36px 1px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(20px);
  z-index: 99;
  padding: 2rem;
}

.register-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  width: 100%;
}

.register-container form input {
  display: block;
  padding: 14.5px;
  width: 100%;
  color: var(--color-text) !important;
  outline: none;
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 5px;
  font-weight: 500;
  letter-spacing: 0.8px;
  font-size: 15px;
  backdrop-filter: blur(15px);
  transition: all 0.3s ease;
}

/* Force text color for light theme */
[data-theme="light"] .register-container form input {
  color: #1f2937 !important;
  background-color: #ffffff !important;
  border-color: #d1d5db !important;
}

/* Force text color for dark theme */
[data-theme="dark"] .register-container form input {
  color: #f9fafb !important;
  background-color: #374151 !important;
  border-color: #4b5563 !important;
}

.register-container form input:focus {
  box-shadow: 0 0 16px 1px rgba(0, 0, 0, 0.2);
  animation: wobble 0.3s ease-in;
}

.register-container form button {
  background-color: var(--primary-color);
  color: var(--color);
  display: block;
  padding: 13px;
  border-radius: 5px;
  outline: none;
  font-size: 18px;
  letter-spacing: 1.5px;
  font-weight: bold;
  width: 100%;
  cursor: pointer;
  margin: 2rem 0;
  transition: all 0.1s ease-in-out;
  border: none;
  grid-column: 1 / -1;
}

.register-container form button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-container form button:not(:disabled):hover {
  box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.error-message {
  color: #ff4757;
  font-size: 14px;
  margin: 1rem 0;
  text-align: center;
  grid-column: 1 / -1;
}

.circle {
  width: 8rem;
  height: 8rem;
  background: var(--primary-color);
  border-radius: 50%;
  position: absolute;
  z-index: -1;
}

.circle-one {
  top: -20px;
  left: -20px;
}

.circle-two {
  bottom: -20px;
  right: -20px;
}

.illustration {
  position: absolute;
  top: -14%;
  right: -30%;
  width: 100%;
  max-width: 400px;
  z-index: -1;
}

.register-forget {
  text-align: center;
}

.register-forget a {
  text-decoration: none;
  font-size: 14px;
}

.register-forget a:hover {
  text-decoration: underline;
}

.theme-btn-container {
  position: fixed;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
}

.theme-btn {
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.theme-btn:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .register-container {
    width: 95%;
  }
  
  .illustration {
    display: none;
  }
}

.field-error {
  color: #ff4757;
  font-size: 12px;
  margin-top: 4px;
  text-align: left;
  min-height: 20px;
}

.register-container form input.valid {
  border-color: #28a745;
}

.register-container form input.valid:focus {
  box-shadow: 0 0 16px 1px rgba(40, 167, 69, 0.2);
}

.register-container form input.error {
  border-color: #ff4757;
}

.register-container form input.error:focus {
  box-shadow: 0 0 16px 1px rgba(255, 71, 87, 0.2);
}

.password-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  grid-column: 1 / -1;
}

.password-group .form-group {
  margin: 0;
}

.form-select {
  display: block;
  padding: 14.5px;
  width: 100%;
  color: var(--color-text) !important;
  outline: none;
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 5px;
  font-weight: 500;
  letter-spacing: 0.8px;
  font-size: 15px;
  backdrop-filter: blur(15px);
  transition: all 0.3s ease;
  cursor: pointer;
}

/* Force text color for light theme */
[data-theme="light"] .form-select {
  color: #1f2937 !important;
  background-color: #ffffff !important;
  border-color: #d1d5db !important;
}

/* Force text color for dark theme */
[data-theme="dark"] .form-select {
  color: #f9fafb !important;
  background-color: #374151 !important;
  border-color: #4b5563 !important;
}

.form-select:focus {
  box-shadow: 0 0 16px 1px rgba(0, 0, 0, 0.2);
}

.form-select option {
  background: var(--background);
  background-color: #9191911f;
  color: var(--color);
}
</style> 