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

    // Product form popup specific methods
    closePopup: () => {
      ipcRenderer.send('close-popup')
    },
    submitProductForm: (data: unknown) => {
      ipcRenderer.send('submit-product-form', data)
    },
    onFormSubmitted: (callback: (data: unknown) => void) => {
      ipcRenderer.on('product-form-submitted', (_event: IpcRendererEvent, data: unknown) => callback(data))
    }
  }
) 