<template>
  <div class="print-settings-container">
    <!-- Header -->
    <div class="settings-header">
      <h2 class="settings-title">{{ t('print.settings.title') }}</h2>
      <p class="settings-description">{{ t('print.settings.description') }}</p>
    </div>

    <!-- Printer Selection -->
    <div class="settings-section">
      <h3 class="section-title">{{ t('print.settings.printer.title') }}</h3>
      
      <div class="form-group">
        <label class="form-label">{{ t('print.settings.printer.select') }}</label>
        <div class="printer-select-container">
          <select 
            v-model="selectedPrinter" 
            class="form-select"
            :disabled="loading"
          >
            <option value="">{{ t('print.settings.printer.default') }}</option>
            <option 
              v-for="printer in availablePrinters" 
              :key="printer.name"
              :value="printer.name"
            >
              {{ printer.name }} {{ printer.default ? '(Default)' : '' }}
            </option>
          </select>
          
          <button 
            @click="refreshPrinters" 
            :disabled="loading"
            class="btn btn-secondary btn-icon"
            :title="t('print.settings.printer.refresh')"
          >
            <span class="material-icons-outlined">refresh</span>
          </button>
        </div>
      </div>

      <!-- Printer Test -->
      <div class="form-group">
        <button 
          @click="testPrint" 
          :disabled="loading || !selectedPrinter"
          class="btn btn-primary"
        >
          <span class="material-icons-outlined">print</span>
          {{ t('print.settings.printer.test') }}
        </button>
      </div>
    </div>

    <!-- Receipt Template Settings -->
    <div class="settings-section">
      <h3 class="section-title">{{ t('print.settings.template.title') }}</h3>

      <div class="form-group">
        <label class="form-label">{{ t('print.settings.template.company_name') }}</label>
        <input 
          type="text" 
          v-model="templateSettings.company_name" 
          class="form-input"
          :placeholder="t('print.settings.template.company_name_placeholder')"
        />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('print.settings.template.company_address') }}</label>
        <input 
          type="text" 
          v-model="templateSettings.company_address" 
          class="form-input"
          :placeholder="t('print.settings.template.company_address_placeholder')"
        />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('print.settings.template.company_phone') }}</label>
        <input 
          type="text" 
          v-model="templateSettings.company_phone" 
          class="form-input"
          :placeholder="t('print.settings.template.company_phone_placeholder')"
        />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('print.settings.template.default_tax_rate') }}</label>
        <div class="input-group">
          <input 
            type="number" 
            v-model.number="templateSettings.default_tax_rate" 
            class="form-input"
            min="0"
            max="100"
            step="0.1"
          />
          <span class="input-suffix">%</span>
        </div>
      </div>
    </div>

    <!-- Receipt Options -->
    <div class="settings-section">
      <h3 class="section-title">{{ t('print.settings.options.title') }}</h3>

      <div class="checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="printOptions.auto_print"
            class="checkbox"
          />
          <span class="checkbox-text">{{ t('print.settings.options.auto_print') }}</span>
        </label>
      </div>

      <div class="checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="printOptions.show_qr_code"
            class="checkbox"
          />
          <span class="checkbox-text">{{ t('print.settings.options.show_qr_code') }}</span>
        </label>
      </div>

      <div class="checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="printOptions.print_watermark"
            class="checkbox"
          />
          <span class="checkbox-text">{{ t('print.settings.options.print_watermark') }}</span>
        </label>
      </div>
    </div>

    <!-- Actions -->
    <div class="settings-action">
      <button 
        @click="saveSettings" 
        :disabled="loading"
        class="btn btn-success"
      >
        <span class="material-icons-outlined">save</span>
        {{ t('print.settings.save') }}
      </button>

      <button 
        @click="loadDefaultSettings" 
        :disabled="loading"
        class="btn btn-secondary"
      >
        <span class="material-icons-outlined">restore</span>
        {{ t('print.settings.reset') }}
      </button>
    </div>

    <!-- Status Messages -->
    <div v-if="message" class="message" :class="messageType">
      <span class="message-text">{{ message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// State
const loading = ref(false)
const message = ref('')
const messageType = ref('')
const selectedPrinter = ref('')
const availablePrinters = ref([])

// Template settings
const templateSettings = reactive({
  company_name: '',
  company_address: '',
  company_phone: '',
  default_tax_rate: 10
})

// Print options
const printOptions = reactive({
  auto_print: false,
  show_qr_code: false,
  print_watermark: false
})

// Methods
const refreshPrinters = async () => {
  loading.value = true
  message.value = ''
  
  try {
    const response = await window.electronAPI.print.getPrinters()
    if (response.success) {
      availablePrinters.value = response.printers
      showMessage(t('print.settings.printer.refresh_success'), 'success')
    } else {
      showMessage(t('print.settings.printer.refresh_error'), 'error')
    }
  } catch (error) {
    console.error('Error refreshing printers:', error)
    showMessage(t('print.settings.printer.refresh_error'), 'error')
  } finally {
    loading.value = false
  }
}

const testPrint = async () => {
  loading.value = true
  message.value = ''
  
  try {
    const response = await window.electronAPI.print.testPrint(selectedPrinter.value)
    if (response.success) {
      showMessage(t('print.settings.printer.test_success'), 'success')
    } else {
      showMessage(response.message || t('print.settings.printer.test_error'), 'error')
    }
  } catch (error) {
    console.error('Error testing printer:', error)
    showMessage(t('print.settings.printer.test_error'), 'error')
  } finally {
    loading.value = false
  }
}

const saveSettings = () => {
  try {
    const settings = {
      selectedPrinter: selectedPrinter.value,
      templateSettings: { ...templateSettings },
      printOptions: { ...printOptions }
    }
    
    localStorage.setItem('printSettings', JSON.stringify(settings))
    showMessage(t('print.settings.save_success'), 'success')
  } catch (error) {
    console.error('Error saving settings:', error)
    showMessage(t('print.settings.save_error'), 'error')
  }
}

const loadSettings = () => {
  try {
    const saved = localStorage.getItem('printSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      
      selectedPrinter.value = settings.selectedPrinter || ''
      Object.assign(templateSettings, settings.templateSettings || {})
      Object.assign(printOptions, settings.printOptions || {})
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

const loadDefaultSettings = () => {
  selectedPrinter.value = ''
  templateSettings.company_name = ''
  templateSettings.company_address = ''
  templateSettings.company_phone = ''
  templateSettings.default_tax_rate = 10
  
  printOptions.auto_print = false
  printOptions.show_qr_code = false
  printOptions.print_watermark = false
  
  showMessage(t('print.settings.reset_success'), 'success')
}

const showMessage = (text, type = 'info') => {
  message.value = text
  messageType.value = type
  
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 3000)
}

// Lifecycle
onMounted(() => {
  loadSettings()
  refreshPrinters()
})
</script>

<style scoped>
.print-settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.pairings-header {
  margin-bottom: 30px;
}

.settings-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.settings-description {
  color: #7f8c8d;
  margin: 0;
}

.settings-section {
  margin-bottom**: 30px;
  padding: 20px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  background: #f8f9fa;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #34495e;
  margin-bottom: 5px;
}

.form-input, .form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-select:focus, .form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.printer-select-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.printer-select-container .form-select {
  flex: 1;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #219a52;
}

.btn-icon {
  padding: 8px;
  min-width: auto;
}

.checkbox-group {
  margin-bottom: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox {
  width: 18px;
  height: 18px;
}

.checkbox-text {
  font-weight: 400;
  color: #34495e;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-suffix {
  margin-left: 8px;
  color: #7f8c8d;
}

.settings-action {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}

.message {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message-text {
  display: block;
}
</style>
