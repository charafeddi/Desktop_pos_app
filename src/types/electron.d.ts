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
      closePopup: () => void;
      submitProductForm: (data: unknown) => void;
      onFormSubmitted: (callback: (data: unknown) => void) => void;
    };
  }
}

export {};
