<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ t('auth.reset_password') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ t('auth.reset_password_description') }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="verifying" class="text-center">
        <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ t('auth.verifying_token') }}
        </div>
      </div>

      <!-- Invalid Token -->
      <div v-else-if="invalidToken" class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">{{ t('auth.invalid_token') }}</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ t('auth.invalid_token_description') }}</p>
            </div>
            <div class="mt-4">
              <div class="-mx-2 -my-1.5 flex">
                <router-link
                  to="/forgot-password"
                  class="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  {{ t('auth.request_new_link') }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-else-if="successMessage" class="rounded-md bg-green-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
            <div class="mt-4">
              <router-link
                to="/login"
                class="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
              >
                {{ t('auth.back_to_login') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-else-if="errorMessage" class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Reset Form -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="password" class="sr-only">{{ t('auth.new_password') }}</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              :placeholder="t('auth.new_password_placeholder')"
              :disabled="loading"
            />
          </div>
          <div>
            <label for="confirmPassword" class="sr-only">{{ t('auth.confirm_password') }}</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              :placeholder="t('auth.confirm_password_placeholder')"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Password Requirements -->
        <div class="text-sm text-gray-600">
          <p class="font-medium">{{ t('auth.password_requirements') }}:</p>
          <ul class="mt-1 list-disc list-inside space-y-1">
            <li :class="{ 'text-green-600': password.length >= 8, 'text-gray-400': password.length < 8 }">
              {{ t('auth.minimum_8_characters') }}
            </li>
            <li :class="{ 'text-green-600': hasUppercase, 'text-gray-400': !hasUppercase }">
              {{ t('auth.one_uppercase_letter') }}
            </li>
            <li :class="{ 'text-green-600': hasLowercase, 'text-gray-400': !hasLowercase }">
              {{ t('auth.one_lowercase_letter') }}
            </li>
            <li :class="{ 'text-green-600': hasNumber, 'text-gray-400': !hasNumber }">
              {{ t('auth.one_number') }}
            </li>
          </ul>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? t('auth.resetting') : t('auth.reset_password') }}
          </button>
        </div>

        <div class="text-center">
          <router-link
            to="/login"
            class="font-medium text-red-600 hover:text-red-500"
          >
            {{ t('auth.back_to_login') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const verifying = ref(true)
const invalidToken = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const user = ref(null)

// Password validation
const hasUppercase = computed(() => /[A-Z]/.test(password.value))
const hasLowercase = computed(() => /[a-z]/.test(password.value))
const hasNumber = computed(() => /\d/.test(password.value))

const isFormValid = computed(() => {
  return password.value.length >= 8 &&
         hasUppercase.value &&
         hasLowercase.value &&
         hasNumber.value &&
         password.value === confirmPassword.value
})

const verifyToken = async () => {
  const token = route.query.token
  
  if (!token) {
    invalidToken.value = true
    verifying.value = false
    return
  }

  try {
    const result = await window.electronAPI.email.verifyResetToken(token)
    
    if (result.success) {
      user.value = result.user
    } else {
      invalidToken.value = true
    }
  } catch (error) {
    console.error('Token verification error:', error)
    invalidToken.value = true
  } finally {
    verifying.value = false
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const token = route.query.token
    const result = await window.electronAPI.email.resetPassword(token, password.value)
    
    if (result.success) {
      successMessage.value = result.message
    } else {
      errorMessage.value = result.error
    }
  } catch (error) {
    errorMessage.value = 'An unexpected error occurred. Please try again.'
    console.error('Password reset error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  verifyToken()
})
</script>
