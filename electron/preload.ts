import { contextBridge, IpcRenderer, ipcRenderer, IpcRendererEvent } from 'electron'

// Define types for our IPC channels
type ValidChannels = 'toMain' | 'fromMain' | 'close-popup' | 'submit-product-form' | 'product-form-submitted';
type AuthChannels = 'auth:login' | 'auth:register' | 'auth:logout';
type PrintChannels = 'print-receipt' | 'get-printers' | 'test-print';
type ProductChannels = 'get-products' | 'create-product' | 'update-product' | 'delete-product' | 'get-product-by-id';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // General IPC methods
    send: (channel: ValidChannels, data: unknown) => {
      // whitelist channels
      let validChannels = ['toMain']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      }
    },
    receive: (channel: ValidChannels, func: (...args: unknown[]) => void) => {
      let validChannels = ['fromMain']
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (_event: IpcRendererEvent, ...args: unknown[]) => func(...args))
      }
    },

    // Auth methods
    auth: {
      login: (data: { email: string; password: string }) => ipcRenderer.invoke('auth:login', data),
      register: (data: any) => ipcRenderer.invoke('auth:register', data),
      logout: () => ipcRenderer.invoke('auth:logout')
    },

    // Product methods
    products: {
      getAll: () => ipcRenderer.invoke('get-products'),
      getById: (id: number) => ipcRenderer.invoke('get-product-by-id', id),
      create: (data: any) => ipcRenderer.invoke('create-product', data),
      update: (id: number, data: any) => ipcRenderer.invoke('update-product', id, data),
      delete: (id: number) => ipcRenderer.invoke('delete-product', id),
      getProductStock: (id: number) => ipcRenderer.invoke('get-product-stock', id),
      getPopularProduct: (limit:number, period:any) => ipcRenderer.invoke('get-popular-products', limit, period),
      getProductsLowStock: () => ipcRenderer.invoke('get-product-low-stock'),
    },

    categories:{
      getAll: () => ipcRenderer.invoke('get-categories'),
      getByID: (id: number) => ipcRenderer.invoke('get-category-by-id', id),
      create: (data: any) => ipcRenderer.invoke('create-category', data),
      update: (id:number, data:any) => ipcRenderer.invoke('update-category', id, data),
      delete: (id: number) => ipcRenderer.invoke('delete-category', id)
    },

    // Todo methods
    todos: {
    getTodos: () => ipcRenderer.invoke('get-todos'),
    getTodoById: (id: number) => ipcRenderer.invoke('get-todo-by-id', id),
    createTodo: (data: any) => ipcRenderer.invoke('create-todo', data),
    updateTodo: (data: any) => ipcRenderer.invoke('update-todo', data.id, data),
    deleteTodo: (id: number) => ipcRenderer.invoke('delete-todo', id),
    },
    
    suppliers: {
      getAll: () => ipcRenderer.invoke('get-suppliers'),
      getByID: (id: number) => ipcRenderer.invoke('get-supplier-by-id', id),
      create: (data: any) => ipcRenderer.invoke('create-supplier', data),
      update: (id: number, data: any) => ipcRenderer.invoke('update-supplier', id, data),
      delete: (id: number) => ipcRenderer.invoke('delete-supplier', id)
    },

    customers: {
      getAll: () => ipcRenderer.invoke('get-customers'),
      getByID: (id: number) => ipcRenderer.invoke('get-customer-by-id', id),
      create: (data: any) => ipcRenderer.invoke('create-customer', data),
      update: (id: number, data: any) => ipcRenderer.invoke('update-customer', id, data),
      delete: (id: number) => ipcRenderer.invoke('delete-customer', id),
      toggleStatus: (id: number) => ipcRenderer.invoke('toggle-customer-status', id)
    },

    sales: {
      getAll: () => ipcRenderer.invoke('get-sales'),
      getById: (id: number) => ipcRenderer.invoke('get-sale-by-id', id),
      getItems: (id: number) => ipcRenderer.invoke('get-sale-items', id),
      create: (data: any) => ipcRenderer.invoke('create-sale', data),
      update: (id: number, data: any) => ipcRenderer.invoke('update-sale', id, data),
      delete: (id: number) => ipcRenderer.invoke('delete-sale', id)
    },

    // Analytics methods
    analytics: {
      supplierSpend: () => ipcRenderer.invoke('analytics:supplier-spend'),
      productPriceCompare: () => ipcRenderer.invoke('analytics:product-price-compare'),
    },

    returns: {
      getAll: () => ipcRenderer.invoke('get-returns'),
      getById: (id: number) => ipcRenderer.invoke('get-return-by-id', id),
      getItems: (id: number) => ipcRenderer.invoke('get-return-items', id),
      create: (data: any) => ipcRenderer.invoke('create-return', data),
      update: (id: number, data: any) => ipcRenderer.invoke('update-return', id, data),
      delete: (id: number) => ipcRenderer.invoke('delete-return', id),
      getBySale: (saleId: number) => ipcRenderer.invoke('get-returns-by-sale', saleId),
      getByCustomer: (customerId: number) => ipcRenderer.invoke('get-returns-by-customer', customerId),
      search: (searchParams: any) => ipcRenderer.invoke('search-returns', searchParams)
    },

    productTypes: {
      getAll: () => ipcRenderer.invoke('get-product-types'),
      getByID: (id: number) => ipcRenderer.invoke('get-product-type-by-id', id),
      create: (data: any) => ipcRenderer.invoke('create-product-type', data),
      update: (id: number, data: any) => ipcRenderer.invoke('update-product-type', id, data),
      delete: (id: number) => ipcRenderer.invoke('delete-product-type', id)
    },

    productUnits: {
      getAll: () => ipcRenderer.invoke('get-product-units'),
      getByID: (id: number) => ipcRenderer.invoke('get-product-unit-by-id', id),
      create: (data: any) => ipcRenderer.invoke('create-product-unit', data),
      update: (id: number, data: any) => ipcRenderer.invoke('update-product-unit', id, data),
      delete: (id: number) => ipcRenderer.invoke('delete-product-unit', id)
    },

    // Printers
    printers: {
      getAll: () => ipcRenderer.invoke('printers:get-all')
    },

    // Enhanced Backup & Restore
    backup: {
      chooseFolder: () => ipcRenderer.invoke('backup:choose-folder'),
      exportJSON: (folderPath: string) => ipcRenderer.invoke('backup:export-json', folderPath),
      scheduleDaily: (folderPath: string) => ipcRenderer.invoke('backup:schedule-daily', folderPath),
      scheduleWeekly: (folderPath: string) => ipcRenderer.invoke('backup:schedule-weekly', folderPath),
      cancelSchedule: () => ipcRenderer.invoke('backup:cancel-schedule'),
      chooseRestoreFile: () => ipcRenderer.invoke('backup:choose-restore-file'),
      restoreFromJSON: (filePath: string) => ipcRenderer.invoke('backup:restore-from-json', filePath)
    },

    // Product form popup specific methods
    closePopup: () => {
      ipcRenderer.send('close-popup')
    },
    submitProductForm: (data: unknown) => {
      ipcRenderer.send('submit-product-form', data)
    },
    onFormSubmitted: (callback: (data: unknown) => void) => {
      ipcRenderer.on('product-form-submitted', (_event: IpcRendererEvent, data: unknown) => callback(data))
    },

    // File operations
    files: {
      saveFile: (data: string, filename: string, type: string) => ipcRenderer.invoke('save-file', data, filename, type)
    },

    // Print methods
    print: {
      printReceipt: (receiptText: string, printerName?: string) => ipcRenderer.invoke('print-receipt', { receiptText, printerName }),
      getPrinters: () => ipcRenderer.invoke('get-printers'),
      testPrint: (printerName?: string) => ipcRenderer.invoke('test-print', { printerName })
    },

    // User Profile methods
    getUserStats: (userId: number) => ipcRenderer.invoke('get-user-stats', userId),
    getUserActivity: (userId: number, limit?: number) => ipcRenderer.invoke('get-user-activity', userId, limit),
    updateUserProfile: (userId: number, profileData: any) => ipcRenderer.invoke('update-user-profile', userId, profileData),
    changeUserPassword: (userId: number, passwordData: any) => ipcRenderer.invoke('change-user-password', userId, passwordData),

    // App control methods
    closeApp: () => ipcRenderer.invoke('app:close'),

    // Email methods
    email: {
      sendPasswordReset: (email: string) => ipcRenderer.invoke('email:send-password-reset', email),
      verifyResetToken: (token: string) => ipcRenderer.invoke('email:verify-reset-token', token),
      resetPassword: (token: string, newPassword: string) => ipcRenderer.invoke('email:reset-password', token, newPassword),
      sendWelcome: (email: string, userName: string, tempPassword: string) => ipcRenderer.invoke('email:send-welcome', email, userName, tempPassword),
      testConfiguration: () => ipcRenderer.invoke('email:test-configuration'),
      cleanupTokens: () => ipcRenderer.invoke('email:cleanup-tokens'),
      getTokenStats: () => ipcRenderer.invoke('email:get-token-stats')
    },

    // Cloud Sync methods
    cloudSync: {
      initialize: () => ipcRenderer.invoke('cloud-sync:initialize'),
      authenticate: () => ipcRenderer.invoke('cloud-sync:authenticate'),
      handleAuthCode: (code: string) => ipcRenderer.invoke('cloud-sync:handle-auth-code', code),
      uploadDatabase: () => ipcRenderer.invoke('cloud-sync:upload-database'),
      downloadDatabase: () => ipcRenderer.invoke('cloud-sync:download-database'),
      checkUpdates: () => ipcRenderer.invoke('cloud-sync:check-updates'),
      downloadUpdate: (updateFile: any) => ipcRenderer.invoke('cloud-sync:download-update', updateFile),
      startAutoSync: () => ipcRenderer.invoke('cloud-sync:start-auto-sync'),
      stopAutoSync: () => ipcRenderer.invoke('cloud-sync:stop-auto-sync'),
      getStatus: () => ipcRenderer.invoke('cloud-sync:get-status')
    },

    // Settings methods
    settings: {
      getCompanyInfo: () => ipcRenderer.invoke('settings:get-company-info'),
      saveCompanyInfo: (companyInfo: any) => ipcRenderer.invoke('settings:save-company-info', companyInfo),
      getTaxRates: () => ipcRenderer.invoke('settings:get-tax-rates'),
      saveTaxRates: (taxRates: any) => ipcRenderer.invoke('settings:save-tax-rates', taxRates),
      getPrinterSettings: () => ipcRenderer.invoke('settings:get-printer-settings'),
      savePrinterSettings: (printerSettings: any) => ipcRenderer.invoke('settings:save-printer-settings', printerSettings),
      getCurrency: () => ipcRenderer.invoke('settings:get-currency'),
      saveCurrency: (currency: any) => ipcRenderer.invoke('settings:save-currency', currency),
      getAll: () => ipcRenderer.invoke('settings:get-all'),
      setMultiple: (settings: any) => ipcRenderer.invoke('settings:set-multiple', settings),
      getByKey: (key: string) => ipcRenderer.invoke('settings:get-by-key', key),
      setByKey: (key: string, value: string) => ipcRenderer.invoke('settings:set-by-key', key, value),
      deleteByKey: (key: string) => ipcRenderer.invoke('settings:delete-by-key', key)
    },

    license: {
      getFingerprint: () => ipcRenderer.invoke('license:get-fingerprint'),
      validate: (licenseKey: string) => ipcRenderer.invoke('license:validate', licenseKey),
      activate: (data: { licenseKey: string; customerEmail: string; customerName: string }) => ipcRenderer.invoke('license:activate', data),
      check: () => ipcRenderer.invoke('license:check'),
      deactivate: () => ipcRenderer.invoke('license:deactivate')
    },

    // Refresh event listeners
    onRefreshStart: (callback: () => void) => ipcRenderer.on('app-refresh-start', callback),
    onRefreshComplete: (callback: () => void) => ipcRenderer.on('app-refresh-complete', callback),
    onRefreshError: (callback: (error: string) => void) => ipcRenderer.on('app-refresh-error', (_event, error) => callback(error)),
    
    // Individual refresh event listeners
    onRefreshProducts: (callback: () => void) => ipcRenderer.on('refresh-products', callback),
    onRefreshSales: (callback: () => void) => ipcRenderer.on('refresh-sales', callback),
    onRefreshCustomers: (callback: () => void) => ipcRenderer.on('refresh-customers', callback),
    onRefreshCategories: (callback: () => void) => ipcRenderer.on('refresh-categories', callback),
    onRefreshSuppliers: (callback: () => void) => ipcRenderer.on('refresh-suppliers', callback),
    onRefreshAnalytics: (callback: () => void) => ipcRenderer.on('refresh-analytics', callback),
    onRefreshTodos: (callback: () => void) => ipcRenderer.on('refresh-todos', callback),
    onRefreshSettings: (callback: () => void) => ipcRenderer.on('refresh-settings', callback),

  // Remove refresh event listeners
  removeRefreshListeners: () => {
    ipcRenderer.removeAllListeners('app-refresh-start');
    ipcRenderer.removeAllListeners('app-refresh-complete');
    ipcRenderer.removeAllListeners('app-refresh-error');
    ipcRenderer.removeAllListeners('refresh-products');
    ipcRenderer.removeAllListeners('refresh-sales');
    ipcRenderer.removeAllListeners('refresh-customers');
    ipcRenderer.removeAllListeners('refresh-categories');
    ipcRenderer.removeAllListeners('refresh-suppliers');
    ipcRenderer.removeAllListeners('refresh-analytics');
    ipcRenderer.removeAllListeners('refresh-todos');
    ipcRenderer.removeAllListeners('refresh-settings');
  },

  // Bulk operations
  bulkUpdateProducts: (productIds: number[], updateData: any) => ipcRenderer.invoke('bulk-update-products', productIds, updateData),
  bulkDeleteProducts: (productIds: number[]) => ipcRenderer.invoke('bulk-delete-products', productIds),
  exportProducts: (productIds: number[]) => ipcRenderer.invoke('export-products', productIds)
  }
) 