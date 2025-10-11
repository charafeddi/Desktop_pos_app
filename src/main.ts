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

try {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.use(i18n)

  // Initialize theme after pinia is set up
  const themeStore = useThemeStore()
  themeStore.loadTheme()

  app.mount('#app')
  console.log('✅ Vue app mounted successfully')
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
