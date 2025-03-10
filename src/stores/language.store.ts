import { defineStore } from 'pinia'
import { i18n } from '../i18n'

type Language = 'en' | 'fr'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: (localStorage.getItem('language') || 'en') as Language,
    availableLanguages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
    ]
  }),
  
  actions: {
    setLanguage(lang: Language) {
      this.currentLanguage = lang
      localStorage.setItem('language', lang)
      
      // Update i18n locale
      i18n.global.locale.value = lang

      // Set HTML lang attribute
      document.documentElement.lang = lang
    },

    initLanguageListener() {
      // Listen for language change events from the main process
      const { ipcRenderer } = window.require('electron')
      
      ipcRenderer.on('change-language', (_: any, lang: Language) => {
        this.setLanguage(lang)
      })
    }
  }
}) 