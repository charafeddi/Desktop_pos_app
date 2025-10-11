import { defineStore } from 'pinia'

interface ThemeState {
  isDarkMode: boolean
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  textSecondaryColor: string
  borderColor: string
  errorColor: string
  successColor: string
  warningColor: string
  infoColor: string
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    isDarkMode: true, // Default to dark mode, will be updated in loadTheme()
    // Unified color palette
    primaryColor: '#535bf2',
    secondaryColor: '#646cff',
    accentColor: '#f5f6f7',
    backgroundColor: '#242424',
    surfaceColor: '#2a2a2a',
    textColor: '#d7d7d7',
    textSecondaryColor: '#6b7280',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    errorColor: '#ef4444',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    infoColor: '#3b82f6'
  }),

  getters: {
    getIsDarkMode: (state) => state.isDarkMode,
    getPrimaryColor: (state) => state.primaryColor,
    getSecondaryColor: (state) => state.secondaryColor,
    getAccentColor: (state) => state.accentColor,
    getBackgroundColor: (state) => state.backgroundColor,
    getSurfaceColor: (state) => state.surfaceColor,
    getTextColor: (state) => state.textColor,
    getTextSecondaryColor: (state) => state.textSecondaryColor,
    getBorderColor: (state) => state.borderColor,
    getErrorColor: (state) => state.errorColor,
    getSuccessColor: (state) => state.successColor,
    getWarningColor: (state) => state.warningColor,
    getInfoColor: (state) => state.infoColor,
    
    // Computed theme colors based on mode
    getThemeColors: (state) => ({
      primary: state.primaryColor,
      secondary: state.secondaryColor,
      accent: state.accentColor,
      background: state.isDarkMode ? state.backgroundColor : '#ffffff',
      surface: state.isDarkMode ? state.surfaceColor : '#f8fafc',
      text: state.isDarkMode ? state.textColor : '#1f2937',
      textSecondary: state.isDarkMode ? state.textSecondaryColor : '#6b7280',
      border: state.isDarkMode ? state.borderColor : 'rgba(0, 0, 0, 0.1)',
      error: state.errorColor,
      success: state.successColor,
      warning: state.warningColor,
      info: state.infoColor
    })
  },

  actions: {
    // Toggle between dark and light mode
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      this.applyTheme()
      this.saveTheme()
    },

    // Set specific theme mode
    setTheme(isDark: boolean) {
      this.isDarkMode = isDark
      this.applyTheme()
      this.saveTheme()
    },

    // Apply theme to document
    applyTheme() {
      const root = document.documentElement
      const colors = this.getThemeColors
      
      // Set CSS custom properties
      root.style.setProperty('--color-primary', colors.primary)
      root.style.setProperty('--color-secondary', colors.secondary)
      root.style.setProperty('--color-accent', colors.accent)
      root.style.setProperty('--color-background', colors.background)
      root.style.setProperty('--color-surface', colors.surface)
      root.style.setProperty('--color-text', colors.text)
      root.style.setProperty('--color-text-secondary', colors.textSecondary)
      root.style.setProperty('--color-border', colors.border)
      root.style.setProperty('--color-error', colors.error)
      root.style.setProperty('--color-success', colors.success)
      root.style.setProperty('--color-warning', colors.warning)
      root.style.setProperty('--color-info', colors.info)
      
      // Set data attribute for CSS targeting
      root.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light')
      
      // Update body class
      document.body.className = this.isDarkMode ? 'dark-theme' : 'light-theme'
    },

    // Save theme preference to localStorage
    saveTheme() {
      localStorage.setItem('theme_dark_mode', JSON.stringify(this.isDarkMode))
    },

    // Load theme preference from localStorage
    loadTheme() {
      try {
        const savedTheme = localStorage.getItem('theme_dark_mode')
        if (savedTheme !== null) {
          this.isDarkMode = JSON.parse(savedTheme)
        } else {
          // Default to dark mode if localStorage not available
          this.isDarkMode = true
        }
      } catch (error) {
        console.warn('Theme loading error:', error)
        this.isDarkMode = true
      }
      this.applyTheme()
    },

    // Update color palette
    updateColorPalette(colors: Partial<Pick<ThemeState, 'primaryColor' | 'secondaryColor' | 'accentColor'>>) {
      if (colors.primaryColor) this.primaryColor = colors.primaryColor
      if (colors.secondaryColor) this.secondaryColor = colors.secondaryColor
      if (colors.accentColor) this.accentColor = colors.accentColor
      this.applyTheme()
    },

    // Reset to default colors
    resetColors() {
      this.primaryColor = '#535bf2'
      this.secondaryColor = '#646cff'
      this.accentColor = '#f5f6f7'
      this.applyTheme()
    }
  }
})
