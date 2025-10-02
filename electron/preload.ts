import { contextBridge, IpcRenderer, ipcRenderer, IpcRendererEvent } from 'electron'

// Define types for our IPC channels
type ValidChannels = 'toMain' | 'fromMain' | 'close-popup' | 'submit-product-form' | 'product-form-submitted';
type AuthChannels = 'auth:login' | 'auth:register' | 'auth:logout';
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

    // Backup
    backup: {
      chooseFolder: () => ipcRenderer.invoke('backup:choose-folder'),
      exportJSON: (folderPath: string) => ipcRenderer.invoke('backup:export-json', folderPath),
      scheduleWeekly: (folderPath: string) => ipcRenderer.invoke('backup:schedule-weekly', folderPath),
      cancelSchedule: () => ipcRenderer.invoke('backup:cancel-schedule')
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
    }
  }
) 