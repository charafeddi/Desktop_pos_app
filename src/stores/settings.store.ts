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
    companyInfo: {
      name: 'My Store',
      address: '123 Main St',
      phone: '(555) 123-4567',
      email: 'contact@mystore.com',
      taxId: 'TAX-123456'
    },
    taxRates: [
      { id: '1', name: 'Standard Rate', rate: 20, isDefault: true },
      { id: '2', name: 'Reduced Rate', rate: 10, isDefault: false },
      { id: '3', name: 'Zero Rate', rate: 0, isDefault: false }
    ],
    printerSettings: {
      enabled: true,
      printerName: '',
      paperSize: 'A4',
      printCopies: 1
    },
    backupSettings: {
      autoBackup: true,
      backupFrequency: 'weekly',
      backupLocation: 'local'
    },
    backupFolder: '',
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
    // Load all settings from database
    async loadSettings() {
      this.loading = true
      this.error = null
      
      try {
        console.log('Loading settings from database...')
        
        // Load company info
        const companyInfo = await window.electronAPI.settings.getCompanyInfo()
        if (companyInfo) {
          this.companyInfo = companyInfo
        }
        
        // Load tax rates
        const taxRates = await window.electronAPI.settings.getTaxRates()
        if (taxRates && taxRates.rates) {
          this.taxRates = taxRates.rates
        }
        
        // Load printer settings
        const printerSettings = await window.electronAPI.settings.getPrinterSettings()
        if (printerSettings) {
          this.printerSettings = printerSettings
        }
        
        // Load backup settings from localStorage (not in database yet)
        const backupSettings = localStorage.getItem('settings_backup')
        if (backupSettings) {
          this.backupSettings = JSON.parse(backupSettings)
        }
        
        const backupFolder = localStorage.getItem('settings_backup_folder')
        if (backupFolder) {
          this.backupFolder = backupFolder
        }
        
        console.log('Settings loaded successfully:', {
          companyInfo: this.companyInfo,
          taxRates: this.taxRates,
          printerSettings: this.printerSettings
        })
        
      } catch (error) {
        console.error('Error loading settings:', error)
        this.error = 'Failed to load settings from database'
      } finally {
        this.loading = false
      }
    },

    // Save company info to database
    async saveCompanyInfo(companyInfo: Partial<CompanyInfo>) {
      this.loading = true
      this.error = null
      
      try {
        console.log('Saving company info to database:', companyInfo)
        
        const updatedCompanyInfo = { ...this.companyInfo, ...companyInfo }
        // Serialize the company info to ensure it can be cloned through IPC
        const serializedCompanyInfo = JSON.parse(JSON.stringify(updatedCompanyInfo))
        
        const savedCompanyInfo = await window.electronAPI.settings.saveCompanyInfo(serializedCompanyInfo)
        
        this.companyInfo = savedCompanyInfo
        console.log('Company info saved successfully:', savedCompanyInfo)
        
        return true
      } catch (error) {
        console.error('Error saving company info:', error)
        this.error = 'Failed to save company information'
        return false
      } finally {
        this.loading = false
      }
    },

    // Save tax rates to database
    async saveTaxRates(taxRates: TaxRate[]) {
      this.loading = true
      this.error = null
      
      try {
        console.log('Saving tax rates to database:', taxRates)
        
        // Serialize the tax rates to ensure they can be cloned through IPC
        const serializedTaxRates = JSON.parse(JSON.stringify(taxRates))
        const taxRatesData = { rates: serializedTaxRates }
        
        const savedTaxRates = await window.electronAPI.settings.saveTaxRates(taxRatesData)
        
        this.taxRates = savedTaxRates.rates || taxRates
        console.log('Tax rates saved successfully:', savedTaxRates)
        
        return true
      } catch (error) {
        console.error('Error saving tax rates:', error)
        this.error = 'Failed to save tax rates'
        return false
      } finally {
        this.loading = false
      }
    },

    // Save printer settings to database
    async savePrinterSettings(printerSettings: Partial<PrinterSettings>) {
      this.loading = true
      this.error = null
      
      try {
        console.log('Saving printer settings to database:', printerSettings)
        
        const updatedPrinterSettings = { ...this.printerSettings, ...printerSettings }
        // Serialize the printer settings to ensure they can be cloned through IPC
        const serializedPrinterSettings = JSON.parse(JSON.stringify(updatedPrinterSettings))
        
        const savedPrinterSettings = await window.electronAPI.settings.savePrinterSettings(serializedPrinterSettings)
        
        this.printerSettings = savedPrinterSettings
        console.log('Printer settings saved successfully:', savedPrinterSettings)
        
        return true
      } catch (error) {
        console.error('Error saving printer settings:', error)
        this.error = 'Failed to save printer settings'
        return false
      } finally {
        this.loading = false
      }
    },

    // Update company info (backward compatibility)
    async updateCompanyInfo(companyInfo: Partial<CompanyInfo>) {
      return await this.saveCompanyInfo(companyInfo)
    },

    // Update tax rates (backward compatibility)
    async updateTaxRates(taxRates: TaxRate[]) {
      return await this.saveTaxRates(taxRates)
    },

    // Add new tax rate
    async addTaxRate(taxRate: Omit<TaxRate, 'id'>) {
      const newId = (this.taxRates.length + 1).toString()
      const newTaxRates = [...this.taxRates, { ...taxRate, id: newId }]
      return await this.saveTaxRates(newTaxRates)
    },

    // Remove tax rate
    async removeTaxRate(id: string) {
      const newTaxRates = this.taxRates.filter(rate => rate.id !== id)
      return await this.saveTaxRates(newTaxRates)
    },

    // Set default tax rate
    async setDefaultTaxRate(id: string) {
      const newTaxRates = this.taxRates.map(rate => ({
        ...rate,
        isDefault: rate.id === id
      }))
      return await this.saveTaxRates(newTaxRates)
    },

    // Update printer settings (backward compatibility)
    async updatePrinterSettings(printerSettings: Partial<PrinterSettings>) {
      return await this.savePrinterSettings(printerSettings)
    },

    // Update backup settings (still using localStorage for now)
    updateBackupSettings(backupSettings: Partial<BackupSettings>) {
      this.backupSettings = { ...this.backupSettings, ...backupSettings }
      try {
        localStorage.setItem('settings_backup', JSON.stringify(this.backupSettings))
        this.error = null
        return true
      } catch (error) {
        this.error = 'Failed to save backup settings'
        console.error('Error saving backup settings:', error)
        return false
      }
    },

    // Set backup folder (still using localStorage for now)
    setBackupFolder(folder: string) {
      this.backupFolder = folder
      try {
        localStorage.setItem('settings_backup_folder', folder)
        this.error = null
        return true
      } catch (error) {
        this.error = 'Failed to save backup folder'
        console.error('Error saving backup folder:', error)
        return false
      }
    },

    // Reset all settings to defaults
    async resetSettings() {
      this.loading = true
      this.error = null
      
      try {
        console.log('Resetting all settings to defaults...')
        
        // Reset company info
        const defaultCompanyInfo = {
          name: 'My Store',
          address: '123 Main St',
          phone: '(555) 123-4567',
          email: 'contact@mystore.com',
          taxId: 'TAX-123456'
        }
        await this.saveCompanyInfo(defaultCompanyInfo)
        
        // Reset tax rates
        const defaultTaxRates = [
          { id: '1', name: 'Standard Rate', rate: 20, isDefault: true },
          { id: '2', name: 'Reduced Rate', rate: 10, isDefault: false },
          { id: '3', name: 'Zero Rate', rate: 0, isDefault: false }
        ]
        await this.saveTaxRates(defaultTaxRates)
        
        // Reset printer settings
        const defaultPrinterSettings = {
          enabled: true,
          printerName: '',
          paperSize: 'A4',
          printCopies: 1
        }
        await this.savePrinterSettings(defaultPrinterSettings)
        
        // Reset backup settings (localStorage)
        this.backupSettings = {
          autoBackup: true,
          backupFrequency: 'weekly',
          backupLocation: 'local'
        }
        this.backupFolder = ''
        localStorage.setItem('settings_backup', JSON.stringify(this.backupSettings))
        localStorage.setItem('settings_backup_folder', '')
        
        console.log('All settings reset to defaults successfully')
        return true
        
      } catch (error) {
        console.error('Error resetting settings:', error)
        this.error = 'Failed to reset settings'
        return false
      } finally {
        this.loading = false
      }
    },

    // Legacy method for backward compatibility (now uses database)
    async saveSettings() {
      console.log('saveSettings() called - this method is deprecated, use specific save methods instead')
      
      try {
        // Save all database-backed settings
        await this.saveCompanyInfo(this.companyInfo)
        await this.saveTaxRates(this.taxRates)
        await this.savePrinterSettings(this.printerSettings)
        
        // Save localStorage-backed settings
        localStorage.setItem('settings_backup', JSON.stringify(this.backupSettings))
        localStorage.setItem('settings_backup_folder', this.backupFolder)
        
        this.error = null
        return true
      } catch (error) {
        this.error = 'Failed to save settings'
        console.error('Error saving settings:', error)
        return false
      }
    }
  }
})