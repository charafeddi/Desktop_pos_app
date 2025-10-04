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

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// Initialize theme after pinia is set up
const themeStore = useThemeStore()
themeStore.loadTheme()

app.mount('#app')
