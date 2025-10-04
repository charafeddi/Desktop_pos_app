import { defineStore } from 'pinia'

interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  taxId: string
}

interface TaxRate {
  id: string
  name: string
  rate: number
  isDefault: boolean
}

interface PrinterSettings {
  enabled: boolean
  printerName: string
  paperSize: string
  printCopies: number
}

interface BackupSettings {
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  backupLocation: 'local' | 'cloud'
}

interface SettingsState {
  companyInfo: CompanyInfo
  taxRates: TaxRate[]
  printerSettings: PrinterSettings
  backupSettings: BackupSettings
  backupFolder: string
  loading: boolean
  error: string | null
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    companyInfo: JSON.parse(localStorage.getItem('settings_company') || JSON.stringify({
      name: 'My Store',
      address: '123 Main St',
      phone: '(555) 123-4567',
      email: 'contact@mystore.com',
      taxId: 'TAX-123456'
    })),
    taxRates: JSON.parse(localStorage.getItem('settings_tax_rates') || JSON.stringify([
      { id: '1', name: 'Standard Rate', rate: 20, isDefault: true },
      { id: '2', name: 'Reduced Rate', rate: 10, isDefault: false },
      { id: '3', name: 'Zero Rate', rate: 0, isDefault: false }
    ])),
    printerSettings: JSON.parse(localStorage.getItem('settings_printer') || JSON.stringify({
      enabled: true,
      printerName: '',
      paperSize: 'A4',
      printCopies: 1
    })),
    backupSettings: JSON.parse(localStorage.getItem('settings_backup') || JSON.stringify({
      autoBackup: true,
      backupFrequency: 'weekly',
      backupLocation: 'local'
    })),
    backupFolder: localStorage.getItem('settings_backup_folder') || '',
    loading: false,
    error: null
  }),

  getters: {
    getCompanyInfo: (state) => state.companyInfo,
    getTaxRates: (state) => state.taxRates,
    getPrinterSettings: (state) => state.printerSettings,
    getBackupSettings: (state) => state.backupSettings,
    getBackupFolder: (state) => state.backupFolder,
    getDefaultTaxRate: (state) => state.taxRates.find(rate => rate.isDefault),
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    // Save all settings to localStorage
    saveSettings() {
      try {
        localStorage.setItem('settings_company', JSON.stringify(this.companyInfo))
        localStorage.setItem('settings_tax_rates', JSON.stringify(this.taxRates))
        localStorage.setItem('settings_printer', JSON.stringify(this.printerSettings))
        localStorage.setItem('settings_backup', JSON.stringify(this.backupSettings))
        localStorage.setItem('settings_backup_folder', this.backupFolder)
        this.error = null
        return true
      } catch (error) {
        this.error = 'Failed to save settings'
        console.error('Error saving settings:', error)
        return false
      }
    },

    // Update company info
    updateCompanyInfo(companyInfo: Partial<CompanyInfo>) {
      this.companyInfo = { ...this.companyInfo, ...companyInfo }
      this.saveSettings()
    },

    // Update tax rates
    updateTaxRates(taxRates: TaxRate[]) {
      this.taxRates = taxRates
      this.saveSettings()
    },

    // Add new tax rate
    addTaxRate(taxRate: Omit<TaxRate, 'id'>) {
      const newId = (this.taxRates.length + 1).toString()
      this.taxRates.push({ ...taxRate, id: newId })
      this.saveSettings()
    },

    // Remove tax rate
    removeTaxRate(id: string) {
      this.taxRates = this.taxRates.filter(rate => rate.id !== id)
      this.saveSettings()
    },

    // Set default tax rate
    setDefaultTaxRate(id: string) {
      this.taxRates.forEach(rate => {
        rate.isDefault = rate.id === id
      })
      this.saveSettings()
    },

    // Update printer settings
    updatePrinterSettings(printerSettings: Partial<PrinterSettings>) {
      this.printerSettings = { ...this.printerSettings, ...printerSettings }
      this.saveSettings()
    },

    // Update backup settings
    updateBackupSettings(backupSettings: Partial<BackupSettings>) {
      this.backupSettings = { ...this.backupSettings, ...backupSettings }
      this.saveSettings()
    },

    // Set backup folder
    setBackupFolder(folder: string) {
      this.backupFolder = folder
      this.saveSettings()
    },

    // Reset all settings to defaults
    resetSettings() {
      this.companyInfo = {
        name: 'My Store',
        address: '123 Main St',
        phone: '(555) 123-4567',
        email: 'contact@mystore.com',
        taxId: 'TAX-123456'
      }
      this.taxRates = [
        { id: '1', name: 'Standard Rate', rate: 20, isDefault: true },
        { id: '2', name: 'Reduced Rate', rate: 10, isDefault: false },
        { id: '3', name: 'Zero Rate', rate: 0, isDefault: false }
      ]
      this.printerSettings = {
        enabled: true,
        printerName: '',
        paperSize: 'A4',
        printCopies: 1
      }
      this.backupSettings = {
        autoBackup: true,
        backupFrequency: 'weekly',
        backupLocation: 'local'
      }
      this.backupFolder = ''
      this.saveSettings()
    },

    // Load settings from localStorage (called on app start)
    loadSettings() {
      try {
        const companyInfo = localStorage.getItem('settings_company')
        if (companyInfo) {
          this.companyInfo = JSON.parse(companyInfo)
        }

        const taxRates = localStorage.getItem('settings_tax_rates')
        if (taxRates) {
          this.taxRates = JSON.parse(taxRates)
        }

        const printerSettings = localStorage.getItem('settings_printer')
        if (printerSettings) {
          this.printerSettings = JSON.parse(printerSettings)
        }

        const backupSettings = localStorage.getItem('settings_backup')
        if (backupSettings) {
          this.backupSettings = JSON.parse(backupSettings)
        }

        const backupFolder = localStorage.getItem('settings_backup_folder')
        if (backupFolder) {
          this.backupFolder = backupFolder
        }

        this.error = null
      } catch (error) {
        this.error = 'Failed to load settings'
        console.error('Error loading settings:', error)
      }
    }
  }
})
