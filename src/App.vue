<!-- Root template with authentication check -->
<template>
  <ErrorBoundary>
    <!-- License Activation Modal (blocks app if required) -->
    <LicenseModal
      :is-visible="showLicenseModal"
      :is-required="true"
      @activated="handleLicenseActivated"
    />

    <Menu />
    
    <!-- Loading state -->
    <div v-if="isLoading || isCheckingLicense" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ isCheckingLicense ? 'Checking license...' : 'Loading...' }}</p>
    </div>
    
    <!-- Show nothing if license is not activated -->
    <div v-else-if="!isLicenseActivated" class="w-full h-full">
      <!-- License modal will handle this, but we block the UI -->
    </div>
    
    <!-- Login/Register view when not authenticated but license is valid -->
    <div v-else-if="!isAuthenticated" class="w-full h-full">
      <router-view></router-view>
    </div>
    
    <!-- Main layout when authenticated -->
    <div v-else class="main-layout">
      <!-- Sidebar component -->
      <Sidebar @toggle-sidebar="handleSidebarToggle" :is-collapsed="isSidebarCollapsed"/>
      
      <!-- Page container with header and main content -->
      <div class="page-container" :class="{ 'collapsed': isSidebarCollapsed }">
        <Header />
        <div class="main-content">
          <router-view></router-view>
        </div>
      </div>
    </div>
    
    <!-- Toast Notifications -->
    <ToastNotification ref="toastComponent" />
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth.store'
import { useLanguageStore } from './stores/language.store'
import Sidebar from './components/partials/Sidebar.vue'
import Header from './components/partials/Header.vue'
import '@material-design-icons/font'
import Menu from './components/topMenu/Menu.vue'
import ErrorBoundary from './components/common/ErrorBoundary.vue'
import ToastNotification from './components/common/ToastNotification.vue'
import LicenseModal from './components/license/LicenseModal.vue'
import { toastManager } from './utils/toastManager'

// Initialize route, router, and stores
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

// Toast component reference
const toastComponent = ref()

// Initialize language listener when component mounts
onMounted(() => {
  languageStore.initLanguageListener()
  
  // Initialize toast manager with component reference
  if (toastComponent.value) {
    toastManager.setToastComponent(toastComponent.value)
  }
})

// Sidebar state
const isSidebarCollapsed = ref(false)

const handleSidebarToggle = (collapsed: boolean) => {
  isSidebarCollapsed.value = collapsed
}

// Loading state for initial auth check
const isLoading = ref(true)
const isCheckingLicense = ref(true)
const isLicenseActivated = ref(false)
const showLicenseModal = ref(false)

// Computed property to check if user is authenticated
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Check license status
const checkLicense = async () => {
  try {
    isCheckingLicense.value = true
    const result = await window.electronAPI.license.check()
    
    if (result.success && result.activated && result.valid) {
      isLicenseActivated.value = true
      showLicenseModal.value = false
    } else {
      // License not activated - show modal
      isLicenseActivated.value = false
      showLicenseModal.value = true
    }
  } catch (error) {
    console.error('❌ License check error:', error)
    // On error, show license modal
    isLicenseActivated.value = false
    showLicenseModal.value = true
  } finally {
    isCheckingLicense.value = false
  }
}

// Handle license activation
const handleLicenseActivated = async () => {
  // Re-check license status
  await checkLicense()
}

// Initialize authentication state
onMounted(async () => {
  try {
    // First check license (REQUIRED BEFORE EVERYTHING)
    await checkLicense()
    
    // Only proceed with auth if license is valid
    if (isLicenseActivated.value) {
      // Check if we have stored auth data
      const token = localStorage.getItem('auth_token')
      const user = localStorage.getItem('auth_user')
      
      if (token && user) {
        // Restore auth state
        authStore.setToken(token)
        authStore.setUser(JSON.parse(user))
      }
    }
  } catch (error) {
    console.error('❌ Authentication initialization error:', error)
    // Clear invalid data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  } finally {
    // Always finish loading after checks
    setTimeout(() => {
      isLoading.value = false
    }, 100)
  }
})

// Logout handler function
async function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style>

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

/* Base styles */
#app {
  height: 100%;
  width: 100%;
}

/* Layout styles */
.main-layout {
  display: flex;
  height: 100%;
  width: 100%;
}

.page-container {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease-in-out;
}



.main-content {
  flex: 1;
  width: 100%;
  overflow: auto;
}

/* Navigation styles */
.router-link-active {
  background-color: rgb(239 246 255);
  color: rgb(37 99 235);
}

/* Material Icons styles */
.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}

/* Material Icons sizes */
.material-icons.md-18 { font-size: 18px; }
.material-icons.md-24 { font-size: 24px; }
.material-icons.md-36 { font-size: 36px; }
.material-icons.md-48 { font-size: 48px; }

/* Material Icons colors */
.material-icons.md-dark { color: rgba(0, 0, 0, 0.54); }
.material-icons.md-dark.md-inactive { color: rgba(0, 0, 0, 0.26); }
.material-icons.md-light { color: rgba(255, 255, 255, 1); }
.material-icons.md-light.md-inactive { color: rgba(255, 255, 255, 0.3); }

/* Dropdown transitions */
.origin-top-right {
  transition: all 0.1s ease-out;
}

.origin-top-right[v-show="true"] {
  transform: scale(1);
  opacity: 1;
}

.origin-top-right[v-show="false"] {
  transform: scale(0.95);
  opacity: 0;
}

/* Loading styles */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #6b7280;
  font-size: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-container {
    margin-left: 0;
  }
}
</style>
