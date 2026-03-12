# POS Desktop Application - Architecture Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Layers](#architecture-layers)
5. [Data Flow](#data-flow)
6. [Key Components](#key-components)
7. [Database Schema](#database-schema)
8. [IPC Communication](#ipc-communication)
9. [State Management](#state-management)
10. [Security & Authentication](#security--authentication)
11. [Performance Optimizations](#performance-optimizations)
12. [Build & Deployment](#build--deployment)

---

## 🎯 Overview

This is a **Professional Point of Sale (POS) Desktop Application** built with modern web technologies wrapped in Electron. It provides a complete solution for retail businesses including inventory management, sales tracking, customer management, analytics, and more.

### Key Features
- 🛒 Point of Sale (POS) system
- 📦 Inventory management
- 👥 Customer & supplier management
- 📊 Analytics & reporting
- 🔄 Cloud synchronization
- 🖨️ Receipt printing
- 📧 Email notifications
- 🔐 License-based activation
- 🌐 Multi-language support (i18n)
- 🎨 Theme customization

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router (Hash mode for Electron)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components + Material Design Icons
- **Charts**: Chart.js with vue-chartjs
- **Internationalization**: vue-i18n

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3 (better-sqlite3)
- **ORM**: Custom models (no ORM, direct SQL)
- **Authentication**: JWT + bcryptjs
- **Email**: Nodemailer

### Desktop
- **Framework**: Electron 28
- **IPC**: Electron IPC (Inter-Process Communication)
- **Preload**: Context isolation with contextBridge

### Additional Libraries
- **PDF Generation**: jsPDF + jspdf-autotable
- **CSV Export**: PapaParse
- **Barcode Scanning**: Quagga
- **Cloud Storage**: Google Drive API
- **Validation**: Vuelidate
- **Date Handling**: date-fns

---

## 📁 Project Structure

```
Desktop_pos_app/
├── backend/                      # Backend server & business logic
│   ├── config/                   # Configuration files
│   │   ├── database.js          # SQLite database setup & migrations
│   │   └── env.js               # Environment configuration
│   ├── controllers/             # Business logic controllers
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── sale.controller.js
│   │   └── ...
│   ├── models/                  # Database models (SQLite queries)
│   │   ├── product.model.js
│   │   ├── sale.model.js
│   │   ├── user.model.js
│   │   └── ...
│   ├── routes/                  # Express API routes
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   └── ...
│   ├── ipc/                     # Electron IPC handlers
│   │   ├── product.handlers.js
│   │   ├── sale.handlers.js
│   │   ├── auth.handlers.js
│   │   └── ...
│   ├── middleware/              # Express middleware
│   │   ├── auth.js
│   │   ├── sanitize.js
│   │   └── requestLogger.js
│   ├── services/                # Business services
│   │   ├── backup.service.js
│   │   ├── cloudSync.service.js
│   │   └── email.service.js
│   ├── migrations/              # SQL migration files
│   │   ├── 0001_audit_log_and_products_triggers.sql
│   │   └── 0002_partial_indexes.sql
│   ├── data/                    # SQLite database & images
│   │   ├── pos.db              # Main database file
│   │   └── images/             # Product images
│   └── server.js               # Express server entry point
│
├── electron/                    # Electron main process
│   ├── main.js                 # Main process (window management, IPC setup)
│   ├── preload.ts              # Preload script (contextBridge API)
│   └── tsconfig.json
│
├── src/                        # Vue.js frontend application
│   ├── assets/                 # Static assets (images, icons)
│   ├── components/             # Vue components
│   │   ├── analytics/          # Analytics components
│   │   ├── charts/             # Chart components
│   │   ├── common/             # Shared components
│   │   ├── license/            # License activation
│   │   ├── partials/           # Layout partials (Header, Sidebar)
│   │   ├── printer/            # Printing components
│   │   ├── product/            # Product management
│   │   └── topMenu/            # Top menu bar
│   ├── i18n/                   # Internationalization
│   │   ├── en.json
│   │   ├── fr.json
│   │   └── index.ts
│   ├── router/                 # Vue Router configuration
│   │   └── index.ts
│   ├── stores/                 # Pinia state stores
│   │   ├── auth.store.ts
│   │   ├── product.store.ts
│   │   ├── sale.store.ts
│   │   ├── customers.store.ts
│   │   └── ...
│   ├── types/                  # TypeScript type definitions
│   │   ├── electron.d.ts
│   │   ├── product.ts
│   │   └── router.ts
│   ├── utils/                  # Utility functions
│   │   ├── electronAPI.ts      # Electron API wrapper
│   │   ├── errorHandler.ts
│   │   ├── toastManager.ts
│   │   ├── currency.ts
│   │   └── ...
│   ├── views/                  # Page components
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard
│   │   ├── pos/                # Point of Sale
│   │   ├── inventory/          # Inventory management
│   │   ├── analytics/          # Analytics & reports
│   │   ├── customers/          # Customer management
│   │   ├── product/            # Product management
│   │   └── ...
│   ├── App.vue                 # Root component
│   ├── main.ts                 # Vue app entry point
│   └── style.css               # Global styles
│
├── build/                      # Build resources (icons, etc.)
├── desktop-app/                # Built Electron app output
├── dist/                       # Vite build output
├── public/                     # Public static files
├── scripts/                    # Build & utility scripts
├── package.json                # Project dependencies
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

---

## 🏗️ Architecture Layers

### 1. **Presentation Layer (Frontend - Vue.js)**
- **Responsibility**: User interface, user interactions, data presentation
- **Technology**: Vue 3 + TypeScript + Tailwind CSS
- **Components**:
  - Views (pages)
  - Components (reusable UI elements)
  - Stores (Pinia state management)
  - Router (navigation)

### 2. **Application Layer (Electron Main Process)**
- **Responsibility**: Desktop integration, IPC coordination, window management
- **Technology**: Electron
- **Components**:
  - Main process (`electron/main.js`)
  - Preload script (`electron/preload.ts`)
  - IPC handlers (`backend/ipc/`)

### 3. **Business Logic Layer (Backend)**
- **Responsibility**: Business rules, data validation, processing
- **Technology**: Node.js + Express
- **Components**:
  - Controllers (business logic)
  - Services (complex operations)
  - Middleware (request processing)

### 4. **Data Access Layer (Models)**
- **Responsibility**: Database operations, data persistence
- **Technology**: better-sqlite3
- **Components**:
  - Models (database queries)
  - Migrations (schema changes)

### 5. **Data Layer (Database)**
- **Responsibility**: Data storage
- **Technology**: SQLite3
- **Features**:
  - WAL mode for performance
  - Foreign keys enabled
  - Indexes for optimization
  - Triggers for audit logs

---

## 🔄 Data Flow

### Request Flow (Frontend → Backend → Database)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Vue Component (e.g., Product.vue)                              │
│  - User clicks "Add Product"                                     │
│  - Form validation (Vuelidate)                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Pinia Store (e.g., product.store.ts)                           │
│  - Action: createProduct(productData)                            │
│  - State management                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Electron API (utils/electronAPI.ts)                            │
│  - window.electronAPI.products.create(productData)               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Preload Script (electron/preload.ts)                           │
│  - contextBridge exposes API                                     │
│  - ipcRenderer.invoke('create-product', productData)             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  IPC Handler (backend/ipc/product.handlers.js)                  │
│  - ipcMain.handle('create-product', ...)                         │
│  - Image processing (base64 → file)                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Model (backend/models/product.model.js)                        │
│  - Product.create(productData)                                   │
│  - SQL query execution                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Database (backend/data/pos.db)                                 │
│  - SQLite INSERT operation                                       │
│  - Triggers fire (audit logs)                                    │
│  - Returns lastInsertRowid                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Response flows back through the same chain                      │
│  - Database → Model → IPC → Preload → Store → Component         │
└─────────────────────────────────────────────────────────────────┘
```

### Example: Creating a Sale

1. **User Action**: User adds items to cart in POS view
2. **Component**: `views/pos/POS.vue` manages cart state
3. **Store Action**: `sale.store.ts` → `createSale(saleData)`
4. **IPC Call**: `electronAPI.sales.create(saleData)`
5. **IPC Handler**: `sale.handlers.js` receives request
6. **Transaction**: Database transaction begins
   - Insert into `sales` table
   - Insert multiple rows into `sale_items` table
   - Update `products.current_stock` for each item
   - Commit transaction
7. **Response**: Sale ID returned to frontend
8. **UI Update**: Receipt printed, cart cleared, success message shown

---

## 🔑 Key Components

### 1. **Electron Main Process** (`electron/main.js`)

**Responsibilities**:
- Create and manage browser windows
- Setup IPC handlers
- Handle system-level operations (file dialogs, printing)
- Manage application lifecycle
- Database initialization

**Key Features**:
```javascript
// Window creation with security settings
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,      // Security: no Node in renderer
    contextIsolation: true,       // Security: isolated contexts
    preload: path.join(__dirname, 'dist/preload.js')
  }
})

// Performance optimizations
app.commandLine.appendSwitch('--disable-gpu-sandbox')
app.commandLine.appendSwitch('--max-old-space-size', '4096')

// IPC handler setup
setupProductHandlers()
setupSaleHandlers()
// ... other handlers
```

### 2. **Preload Script** (`electron/preload.ts`)

**Responsibilities**:
- Bridge between renderer and main process
- Expose safe APIs to frontend
- Implement security through contextBridge

**Architecture**:
```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  products: {
    getAll: () => ipcRenderer.invoke('get-products'),
    create: (data) => ipcRenderer.invoke('create-product', data),
    // ... other methods
  },
  sales: { /* ... */ },
  auth: { /* ... */ },
  // ... other modules
})
```

### 3. **Database Configuration** (`backend/config/database.js`)

**Key Features**:
- WAL (Write-Ahead Logging) mode for performance
- Automatic migrations
- Backup system
- Environment-aware paths (dev vs production)

**Optimizations**:
```javascript
db = new Database(dbPath, {
  pragma: {
    journal_mode: 'WAL',           // Better concurrency
    synchronous: 'NORMAL',         // Faster writes
    cache_size: -64000,            // 64MB cache
    temp_store: 'MEMORY',          // In-memory temp tables
    mmap_size: 268435456,          // 256MB memory-mapped I/O
    wal_autocheckpoint: 1000       // Checkpoint every 1000 pages
  }
})
```

### 4. **Pinia Stores** (State Management)

**Store Structure**:
```typescript
// Example: product.store.ts
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
    // Performance caching
    lastFetchTime: null,
    cacheExpiry: 180000,  // 3 minutes
    searchCache: new Map()
  }),
  
  getters: {
    getProducts: (state) => state.products,
    getLowStockProducts: (state) => 
      state.products.filter(p => p.current_stock <= p.min_stock_level)
  },
  
  actions: {
    async getAllProducts(forceRefresh = false) {
      // Cache check
      if (!forceRefresh && this.isCacheValid()) {
        return
      }
      
      this.loading = true
      const products = await electronAPI.products.getAll()
      this.products = products
      this.lastFetchTime = Date.now()
      this.loading = false
    }
  }
})
```

### 5. **IPC Handlers** (`backend/ipc/`)

**Pattern**:
```javascript
// product.handlers.js
function setupProductHandlers() {
  ipcMain.handle('get-products', async (event) => {
    try {
      const products = await Product.getAll()
      return products
    } catch (error) {
      throw new Error(error.message)
    }
  })
  
  ipcMain.handle('create-product', async (event, productData) => {
    try {
      // Image processing
      if (productData.image?.startsWith('data:image')) {
        productData.image = await saveBase64Image(productData.image)
      }
      
      const productId = await Product.create(productData)
      return { id: productId, ...productData }
    } catch (error) {
      throw new Error(error.message)
    }
  })
}
```

### 6. **Models** (`backend/models/`)

**Pattern**:
```javascript
// product.model.js
class Product {
  static async create(productData) {
    const stmt = db.prepare(`
      INSERT INTO products (name, sku, barcode, ...)
      VALUES (?, ?, ?, ...)
    `)
    const result = stmt.run(name, sku, barcode, ...)
    return result.lastInsertRowid
  }
  
  static async getAll() {
    const stmt = db.prepare(`
      SELECT p.*, 
        c.name as category_name,
        pt.name as product_type_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_types pt ON p.product_type_id = pt.id
      ORDER BY p.name ASC
    `)
    return stmt.all()
  }
}
```

---

## 🗄️ Database Schema

### Core Tables

#### **users**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  mobile_phone TEXT,
  role TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### **products**
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  barcode TEXT UNIQUE,
  description TEXT,
  category_id INTEGER,
  product_type_id INTEGER,
  product_unit_id INTEGER,
  supplier_id INTEGER,
  purchase_price REAL NOT NULL,
  selling_price REAL NOT NULL,
  tax_rate REAL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  max_stock_level INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  is_active INTEGER DEFAULT 1,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories (id),
  FOREIGN KEY (product_type_id) REFERENCES product_types (id),
  FOREIGN KEY (product_unit_id) REFERENCES product_units (id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
)
```

#### **sales**
```sql
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_number TEXT,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER,
  user_id INTEGER NOT NULL,
  subtotal REAL,
  total_amount REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  final_amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'completed',
  sale_status TEXT DEFAULT 'completed',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
)
```

#### **sale_items**
```sql
CREATE TABLE sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  tax_rate REAL DEFAULT 10,
  discount_amount REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
)
```

### Relationships

```
users (1) ──────────── (N) sales
customers (1) ──────── (N) sales
sales (1) ──────────── (N) sale_items
products (1) ──────── (N) sale_items
categories (1) ──────── (N) products
suppliers (1) ──────── (N) products
product_types (1) ──── (N) products
product_units (1) ──── (N) products
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
```

---

## 📡 IPC Communication

### Communication Pattern

**Renderer Process** ↔ **Preload Script** ↔ **Main Process** ↔ **Backend**

### Security Model

1. **Context Isolation**: Renderer has no direct access to Node.js
2. **Preload Script**: Only exposes whitelisted APIs
3. **IPC Validation**: All inputs validated in handlers

### Example Flow

```typescript
// 1. Frontend (Vue Component)
const products = await window.electronAPI.products.getAll()

// 2. Preload Script (electron/preload.ts)
products: {
  getAll: () => ipcRenderer.invoke('get-products')
}

// 3. IPC Handler (backend/ipc/product.handlers.js)
ipcMain.handle('get-products', async (event) => {
  return await Product.getAll()
})

// 4. Model (backend/models/product.model.js)
static async getAll() {
  return db.prepare('SELECT * FROM products').all()
}
```

---

## 🔐 Security & Authentication

### Authentication Flow

1. **Login**: User submits credentials
2. **Validation**: Backend validates against database (bcrypt)
3. **Token Generation**: JWT token created
4. **Storage**: Token stored in localStorage
5. **Subsequent Requests**: Token included in requests
6. **Verification**: Token verified on protected routes

### Password Security

```javascript
// Hashing (registration)
const salt = bcrypt.genSaltSync(10)
const hashedPassword = bcrypt.hashSync(password, salt)

// Verification (login)
const isValid = bcrypt.compareSync(password, user.password)
```

### License System

- **Device Fingerprinting**: Unique device identification
- **Activation**: License key validation
- **Validation**: Check on app startup
- **Deactivation**: Remove license from device

---

## ⚡ Performance Optimizations

### 1. **Database Optimizations**

- **WAL Mode**: Better concurrency, faster writes
- **Indexes**: Strategic indexes on foreign keys and search columns
- **Prepared Statements**: Reusable compiled queries
- **Connection Pooling**: Single persistent connection
- **Pragma Optimizations**: Cache size, memory-mapped I/O

### 2. **Frontend Optimizations**

- **Lazy Loading**: Routes loaded on demand
- **Component Caching**: Computed properties cached
- **Store Caching**: 3-minute cache for product lists
- **Search Caching**: Map-based search result caching
- **Debouncing**: Search input debounced

### 3. **Electron Optimizations**

- **GPU Acceleration**: Disabled for stability
- **Memory Limits**: Increased heap size (4GB)
- **Background Throttling**: Disabled for responsiveness
- **Preload Compilation**: TypeScript compiled ahead

### 4. **Build Optimizations**

- **Tree Shaking**: Unused code removed
- **Code Splitting**: Chunks for better loading
- **Minification**: Production builds minified
- **Asset Optimization**: Images compressed

---

## 🚀 Build & Deployment

### Development

```bash
# Install dependencies
npm install

# Run Vue dev server
npm run dev

# Run Electron in dev mode
npm run electron:dev
```

### Production Build

```bash
# Build preload script
npm run build:preload

# Build Vue app
npm run build

# Build Electron app (Windows)
npm run electron:build:win

# Build for all platforms
npm run electron:build:all
```

### Build Output

```
desktop-app/
├── POS System-1.0.0-x64.exe      # Windows installer
├── POS System-1.0.0-x64.dmg      # macOS installer
└── POS System-1.0.0-x64.AppImage # Linux installer
```

### Distribution

- **Windows**: NSIS installer or portable executable
- **macOS**: DMG with drag-to-Applications
- **Linux**: AppImage or DEB package

---

## 📊 Key Workflows

### 1. **POS Sale Workflow**

```
1. User scans/searches products
2. Products added to cart
3. Apply discounts/taxes
4. Select payment method
5. Process sale (database transaction):
   - Create sale record
   - Create sale_items records
   - Update product stock
   - Generate invoice number
6. Print receipt
7. Clear cart
```

### 2. **Inventory Management**

```
1. Add/Edit products
2. Set stock levels (min/max)
3. Track stock movements
4. Low stock alerts
5. Stock adjustments
6. Supplier management
```

### 3. **Backup & Restore**

```
1. Choose backup location
2. Export database to JSON
3. Schedule automatic backups (daily/weekly)
4. Restore from backup file
5. Merge or replace data
```

### 4. **Cloud Sync**

```
1. Authenticate with Google Drive
2. Upload database backup
3. Download from cloud
4. Auto-sync on schedule
5. Conflict resolution
```

---

## 🎨 UI/UX Architecture

### Component Hierarchy

```
App.vue
├── Menu.vue (Top menu bar)
├── LicenseModal.vue (License activation)
├── ErrorBoundary.vue (Error handling)
├── ToastNotification.vue (Notifications)
└── Main Layout
    ├── Sidebar.vue (Navigation)
    ├── Header.vue (User info, search)
    └── Router View (Page content)
        ├── Dashboard.vue
        ├── POS.vue
        ├── Inventory.vue
        ├── Analytics.vue
        └── ...
```

### Theme System

- **Dark/Light Mode**: Toggle via theme store
- **Persistence**: Saved in localStorage
- **CSS Variables**: Dynamic theme colors
- **Tailwind Integration**: Theme-aware classes

---

## 🔧 Configuration Files

### Key Configuration

- **package.json**: Dependencies, scripts, Electron builder config
- **vite.config.ts**: Vite build configuration
- **tsconfig.json**: TypeScript compiler options
- **tailwind.config.js**: Tailwind CSS customization
- **backend/config/env.js**: Environment variables
- **electron-builder**: Build configuration for packaging

---

## 📝 Best Practices

### Code Organization

1. **Separation of Concerns**: Clear layer boundaries
2. **Single Responsibility**: Each module has one job
3. **DRY Principle**: Reusable utilities and components
4. **Type Safety**: TypeScript for frontend
5. **Error Handling**: Try-catch blocks, error boundaries

### Database

1. **Transactions**: Use for multi-step operations
2. **Indexes**: Add for frequently queried columns
3. **Migrations**: Version-controlled schema changes
4. **Backups**: Automated daily/weekly backups
5. **Validation**: Input validation before database operations

### Security

1. **Context Isolation**: Electron security best practices
2. **Input Sanitization**: Sanitize all user inputs
3. **SQL Injection Prevention**: Prepared statements
4. **Authentication**: JWT-based auth
5. **License Validation**: Device-based licensing

---

## 🐛 Debugging

### Development Tools

- **Vue DevTools**: Component inspection
- **Electron DevTools**: Main process debugging
- **SQLite Browser**: Database inspection
- **Console Logging**: Strategic logging throughout

### Common Issues

1. **White Screen**: Check build paths, console errors
2. **Database Locked**: WAL mode helps, check transactions
3. **IPC Errors**: Verify handler registration, channel names
4. **Performance**: Check cache, indexes, query optimization

---

## 📚 Additional Resources

### Documentation

- **Vue 3**: https://vuejs.org/
- **Electron**: https://www.electronjs.org/
- **Pinia**: https://pinia.vuejs.org/
- **Vite**: https://vitejs.dev/
- **SQLite**: https://www.sqlite.org/

### Project Files

- `README.md`: Setup and usage instructions
- `BUILD_GUIDE.md`: Detailed build instructions
- `DATABASE-FIXED.md`: Database troubleshooting
- `WHITE-SCREEN-FIX.md`: Common UI issues

---

## 🎯 Summary

This POS application follows a **layered architecture** with clear separation between:
- **Presentation** (Vue.js frontend)
- **Application** (Electron desktop wrapper)
- **Business Logic** (Node.js backend)
- **Data Access** (SQLite models)
- **Data Storage** (SQLite database)

The architecture emphasizes:
- ✅ **Security**: Context isolation, input validation
- ✅ **Performance**: Caching, indexes, optimizations
- ✅ **Maintainability**: Clear structure, separation of concerns
- ✅ **Scalability**: Modular design, extensible architecture
- ✅ **User Experience**: Responsive UI, offline-first design

This design allows for easy maintenance, testing, and future enhancements while providing a robust, performant desktop application for point-of-sale operations.
