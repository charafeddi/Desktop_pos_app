// Type definitions for API responses
interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: any;
  };
  message?: string;
}

// Utility for safely accessing window.electronAPI
export function safeElectronAPI() {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI;
  }
  return null;
}

// Helper function to safely call electron API methods
export async function safeElectronCall<T = any>(
  apiPath: string,
  method: string,
  ...args: any[]
): Promise<T | null> {
  const electronAPI = safeElectronAPI();
  if (!electronAPI) {
    console.warn(`Electron API not available for ${apiPath}.${method}`);
    return null;
  }

  try {
    // Navigate to the nested API path
    const pathParts = apiPath.split('.');
    let api: any = electronAPI;
    
    for (const part of pathParts) {
      if (api && typeof api === 'object' && part in api) {
        api = api[part];
      } else {
        console.warn(`API path ${apiPath} not found`);
        return null;
      }
    }

    if (typeof api[method] === 'function') {
      return await api[method](...args);
    } else {
      console.warn(`Method ${method} not found on ${apiPath}`);
      return null;
    }
  } catch (error) {
    console.error(`Error calling ${apiPath}.${method}:`, error);
    return null;
  }
}

// Specific helper functions for common API calls
export const electronAPI = {
  // Auth
  auth: {
    login: (data: { email: string; password: string }) => 
      safeElectronCall<AuthResponse>('auth', 'login', data),
    register: (data: any) => 
      safeElectronCall<AuthResponse>('auth', 'register', data),
    logout: () => 
      safeElectronCall<AuthResponse>('auth', 'logout')
  },

  // Products
  products: {
    getAll: () => 
      safeElectronCall('products', 'getAll'),
    getById: (id: number) => 
      safeElectronCall('products', 'getById', id),
    create: (data: any) => 
      safeElectronCall('products', 'create', data),
    update: (id: number, data: any) => 
      safeElectronCall('products', 'update', id, data),
    delete: (id: number) => 
      safeElectronCall('products', 'delete', id),
    getProductStock: (id: number) => 
      safeElectronCall('products', 'getProductStock', id),
    getPopularProduct: (limit: number, period: any) => 
      safeElectronCall('products', 'getPopularProduct', limit, period),
    getProductsLowStock: () => 
      safeElectronCall('products', 'getProductsLowStock')
  },

  // Categories
  categories: {
    getAll: () => 
      safeElectronCall('categories', 'getAll'),
    getByID: (id: number) => 
      safeElectronCall('categories', 'getByID', id),
    create: (data: any) => 
      safeElectronCall('categories', 'create', data),
    update: (id: number, data: any) => 
      safeElectronCall('categories', 'update', id, data),
    delete: (id: number) => 
      safeElectronCall('categories', 'delete', id)
  },

  // Sales
  sales: {
    getAll: () => 
      safeElectronCall('sales', 'getAll'),
    getById: (id: number) => 
      safeElectronCall('sales', 'getById', id),
    getItems: (id: number) => 
      safeElectronCall('sales', 'getItems', id),
    create: (data: any) => 
      safeElectronCall('sales', 'create', data),
    update: (id: number, data: any) => 
      safeElectronCall('sales', 'update', id, data),
    delete: (id: number) => 
      safeElectronCall('sales', 'delete', id)
  },

  // Customers
  customers: {
    getAll: () => 
      safeElectronCall('customers', 'getAll'),
    getByID: (id: number) => 
      safeElectronCall('customers', 'getByID', id),
    create: (data: any) => 
      safeElectronCall('customers', 'create', data),
    update: (id: number, data: any) => 
      safeElectronCall('customers', 'update', id, data),
    delete: (id: number) => 
      safeElectronCall('customers', 'delete', id),
    toggleStatus: (id: number) => 
      safeElectronCall('customers', 'toggleStatus', id)
  },

  // Returns
  returns: {
    getAll: () => 
      safeElectronCall('returns', 'getAll'),
    getById: (id: number) => 
      safeElectronCall('returns', 'getById', id),
    getItems: (id: number) => 
      safeElectronCall('returns', 'getItems', id),
    create: (data: any) => 
      safeElectronCall('returns', 'create', data),
    update: (id: number, data: any) => 
      safeElectronCall('returns', 'update', id, data),
    delete: (id: number) => 
      safeElectronCall('returns', 'delete', id),
    getBySale: (saleId: number) => 
      safeElectronCall('returns', 'getBySale', saleId),
    getByCustomer: (customerId: number) => 
      safeElectronCall('returns', 'getByCustomer', customerId),
    search: (searchParams: any) => 
      safeElectronCall('returns', 'search', searchParams)
  },

  // Suppliers
  suppliers: {
    getAll: () => 
      safeElectronCall('suppliers', 'getAll'),
    getByID: (id: number) => 
      safeElectronCall('suppliers', 'getByID', id),
    create: (data: any) => 
      safeElectronCall('suppliers', 'create', data),
    update: (id: number, data: any) => 
      safeElectronCall('suppliers', 'update', id, data),
    delete: (id: number) => 
      safeElectronCall('suppliers', 'delete', id)
  },

  // Product Types
  productTypes: {
    getAll: () => 
      safeElectronCall('productTypes', 'getAll'),
    getByID: (id: number) => 
      safeElectronCall('productTypes', 'getByID', id),
    create: (data: any) => 
      safeElectronCall('productTypes', 'create', data),
    update: (id: number, data: any) => 
      safeElectronCall('productTypes', 'update', id, data),
    delete: (id: number) => 
      safeElectronCall('productTypes', 'delete', id)
  },

  // Product Units
  productUnits: {
    getAll: () => 
      safeElectronCall('productUnits', 'getAll'),
    getByID: (id: number) => 
      safeElectronCall('productUnits', 'getByID', id),
    create: (data: any) => 
      safeElectronCall('productUnits', 'create', data),
    update: (id: number, data: any) => 
      safeElectronCall('productUnits', 'update', id, data),
    delete: (id: number) => 
      safeElectronCall('productUnits', 'delete', id)
  },

  // Todos
  todos: {
    getTodos: () => 
      safeElectronCall('todos', 'getTodos'),
    getTodoById: (id: number) => 
      safeElectronCall('todos', 'getTodoById', id),
    createTodo: (data: any) => 
      safeElectronCall('todos', 'createTodo', data),
    updateTodo: (data: any) => 
      safeElectronCall('todos', 'updateTodo', data.id, data),
    deleteTodo: (id: number) => 
      safeElectronCall('todos', 'deleteTodo', id)
  },

  // Analytics
  analytics: {
    supplierSpend: () => 
      safeElectronCall('analytics', 'supplierSpend'),
    productPriceCompare: () => 
      safeElectronCall('analytics', 'productPriceCompare')
  },

  // Printers
  printers: {
    getAll: () => 
      safeElectronCall('printers', 'getAll')
  },

  // Settings
  settings: {
    getCompanyInfo: () => 
      safeElectronCall('settings', 'getCompanyInfo'),
    saveCompanyInfo: (companyInfo: any) => 
      safeElectronCall('settings', 'saveCompanyInfo', companyInfo),
    getTaxRates: () => 
      safeElectronCall('settings', 'getTaxRates'),
    saveTaxRates: (taxRates: any) => 
      safeElectronCall('settings', 'saveTaxRates', taxRates),
    getPrinterSettings: () => 
      safeElectronCall('settings', 'getPrinterSettings'),
    savePrinterSettings: (printerSettings: any) => 
      safeElectronCall('settings', 'savePrinterSettings', printerSettings),
    getCurrency: () => 
      safeElectronCall('settings', 'getCurrency'),
    saveCurrency: (currency: any) => 
      safeElectronCall('settings', 'saveCurrency', currency),
    getAll: () => 
      safeElectronCall('settings', 'getAll'),
    setMultiple: (settings: any) => 
      safeElectronCall('settings', 'setMultiple', settings),
    getByKey: (key: string) => 
      safeElectronCall('settings', 'getByKey', key),
    setByKey: (key: string, value: string) => 
      safeElectronCall('settings', 'setByKey', key, value),
    deleteByKey: (key: string) => 
      safeElectronCall('settings', 'deleteByKey', key)
  },

  // Backup & Restore
  backup: {
    chooseFolder: () => 
      safeElectronCall('backup', 'chooseFolder'),
    exportJSON: (folderPath: string) => 
      safeElectronCall('backup', 'exportJSON', folderPath),
    scheduleDaily: (folderPath: string) => 
      safeElectronCall('backup', 'scheduleDaily', folderPath),
    scheduleWeekly: (folderPath: string) => 
      safeElectronCall('backup', 'scheduleWeekly', folderPath),
    cancelSchedule: () => 
      safeElectronCall('backup', 'cancelSchedule'),
    chooseRestoreFile: () => 
      safeElectronCall('backup', 'chooseRestoreFile'),
    restoreFromJSON: (filePath: string) => 
      safeElectronCall('backup', 'restoreFromJSON', filePath)
  },

  // Print
  print: {
    printReceipt: (receiptText: string, printerName?: string) => 
      safeElectronCall('print', 'printReceipt', receiptText, printerName),
    getPrinters: () => 
      safeElectronCall('print', 'getPrinters'),
    testPrint: (printerName?: string) => 
      safeElectronCall('print', 'testPrint', printerName)
  }
};
