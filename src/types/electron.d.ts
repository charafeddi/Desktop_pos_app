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
        scheduleWeekly: (folderPath: string) => Promise<{ nextRun: string; folderPath: string }>;
        cancelSchedule: () => Promise<{ cancelled: boolean }>;
      };
      
      closePopup: () => void;
      submitProductForm: (data: unknown) => void;
      onFormSubmitted: (callback: (data: unknown) => void) => void;
    };
  }
}

export {};