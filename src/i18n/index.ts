import { createI18n } from 'vue-i18n'
import en from './en.json'
import fr from './fr.json'

export const i18n = createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: localStorage.getItem('language') || 'en', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages: {
    en,
    fr
  }
}) 