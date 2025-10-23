declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, data: unknown) => void;
      receive: (channel: string, func: (...args: unknown[]) => void) => void;
      auth: {
        login: (data: { email: string; password: string }) => Promise<any>;
        register: (data: any) => Promise<any>;
        logout: () => Promise<any>;
      };
      products: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (data: any) => Promise<any>;
        update: (id: number, data: any) => Promise<any>;
        delete: (id: number) => Promise<any>;
        getProductStock: (id: number) => Promise<any>,
        getPopularProduct: (limit:number, period:any) => Promise<any>,
        getProductsLowStock: () => Promise<any>,
        
      };
      categories: {
        getAll: () => Promise<any[]>;
        getByID: (id: number) => Promise<any>;
        create: (data: any) => Promise<any>;
        update: (id: number, data: any) => Promise<any>;
        delete: (id: number) => Promise<any>;
      };
      suppliers:{
        getAll: () => Promise<any>;
        getByID: (id: number) => Promise<any>;
        create: (data: any) => Promise<any>;
        update: (id: number, data: any) => Promise<any>;
        delete: (id: number) => Promise<any>;
      };

      productTypes: {
        getAll: () => Promise<any>,
        getByID: (id: number) => Promise<any>,
        create: (data: any) => Promise<any>,
        update: (id: number, data: any) => Promise<any>,
        delete: (id: number) => Promise<any>
      };
  
      productUnits: {
        getAll: () => Promise<any>,
        getByID: (id: number) => Promise<any>,
        create: (data: any) => Promise<any>,
        update: (id: number, data: any) => Promise<any>,
        delete: (id: number) => Promise<any>
      };

      customers: {
        getAll: () => Promise<any>,
        getByID: (id: number) => Promise<any>,
        create: (data: any) => Promise<any>,
        update: (id: number, data: any) => Promise<any>,
        delete: (id: number) => Promise<any>
      },

      sales: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        getItems: (id: number) => Promise<any[]>;
        create: (data: any) => Promise<any>;
        update: (id: number, data: any) => Promise<any>;
        delete: (id: number) => Promise<any>;
      },

      returns: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        getItems: (id: number) => Promise<any[]>;
        create: (data: any) => Promise<any>;
        update: (id: number, data: any) => Promise<any>;
        delete: (id: number) => Promise<any>;
        getBySale: (saleId: number) => Promise<any[]>;
        getByCustomer: (customerId: number) => Promise<any[]>;
        search: (searchParams: any) => Promise<any[]>;
      },

      printers: {
        getAll: () => Promise<any[]>
      };

      backup: {
        chooseFolder: () => Promise<string | null>;
        exportJSON: (folderPath: string) => Promise<{ filePath: string; tables: number }>;
        scheduleDaily: (folderPath: string) => Promise<{ nextRun: string; folderPath: string; frequency: string }>;
        scheduleWeekly: (folderPath: string) => Promise<{ nextRun: string; folderPath: string; frequency: string }>;
        cancelSchedule: () => Promise<{ cancelled: boolean }>;
        chooseRestoreFile: () => Promise<string | null>;
        restoreFromJSON: (filePath: string) => Promise<{ success: boolean; message: string; tablesRestored: number }>;
      };

      settings: {
        getCompanyInfo: () => Promise<any>;
        saveCompanyInfo: (companyInfo: any) => Promise<any>;
        getTaxRates: () => Promise<any>;
        saveTaxRates: (taxRates: any) => Promise<any>;
        getPrinterSettings: () => Promise<any>;
        savePrinterSettings: (printerSettings: any) => Promise<any>;
        getAll: () => Promise<any[]>;
        setMultiple: (settings: any) => Promise<any>;
        getByKey: (key: string) => Promise<any>;
        setByKey: (key: string, value: string) => Promise<any>;
        deleteByKey: (key: string) => Promise<boolean>;
      };
      
      closePopup: () => void;
      submitProductForm: (data: unknown) => void;
      onFormSubmitted: (callback: (data: unknown) => void) => void;
    };
  }
}

export {};