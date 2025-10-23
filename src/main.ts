/// <reference path="./types/electron.d.ts" />

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// styles   
import './style.css'

// i18n
import { i18n } from './i18n'

// Theme store
import { useThemeStore } from './stores/theme.store'

// Refresh handler
import { initializeRefreshHandler, cleanupRefreshHandler } from './utils/refreshHandler'

// Error handling
import { globalErrorHandler } from './utils/errorHandler'
import { toastManager } from './utils/toastManager'

// Keyboard shortcuts
import { keyboardShortcuts } from './utils/keyboardShortcuts'

try {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.use(i18n)

  // Initialize theme after pinia is set up
  const themeStore = useThemeStore()
  themeStore.loadTheme()

  // Initialize error handling
  globalErrorHandler.initialize()

  // Initialize refresh handler
  initializeRefreshHandler()

  // Initialize keyboard shortcuts
  keyboardShortcuts.initialize(router, themeStore)

  app.mount('#app')
  console.log('✅ Vue app mounted successfully')
  
  // Clean up refresh handler when app is unmounted
  app.config.globalProperties.$cleanup = cleanupRefreshHandler
} catch (error) {
  console.error('❌ Vue app mounting error:', error)
  // Show error message in the app
  document.getElementById('app')!.innerHTML = `
    <div style="padding: 20px; color: red; font-family: Arial;">
      <h2>Application Error</h2>
      <p>Failed to initialize the application:</p>
      <pre>${error}</pre>
    </div>
  `
}
