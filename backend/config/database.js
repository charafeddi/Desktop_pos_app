const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Determine if we're in a packaged app or development
const isPackaged = process.env.NODE_ENV === 'production' || 
                   process.resourcesPath !== undefined ||
                   (process.argv && process.argv[0] && process.argv[0].includes('POS System.exe')) ||
                   (process.execPath && process.execPath.includes('POS System.exe'));

console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    resourcesPath: process.resourcesPath,
    argv0: process.argv[0],
    execPath: process.execPath,
    isPackaged: isPackaged
});

// Create data directory if it doesn't exist
let dataDir;
if (isPackaged) {
    // In packaged app, use user's AppData directory
    const appDataPath = process.env.APPDATA || process.env.HOME || process.env.USERPROFILE;
    dataDir = path.join(appDataPath, 'POS-System', 'data');
    console.log('Using packaged app data directory:', dataDir);
} else {
    // In development, use local data directory
    dataDir = path.join(__dirname, '..', 'data');
    console.log('Using development data directory:', dataDir);
}

// Ensure data directory exists
try {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('Created data directory:', dataDir);
    }
} catch (error) {
    console.error('Error creating data directory:', error);
    // Fallback to current directory
    dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    console.log('Using fallback data directory:', dataDir);
}

// Database file path
const dbPath = path.join(dataDir, 'pos.db');
console.log('Database path:', dbPath);

// Create database connection with error handling
let db;
try {
    db = new Database(dbPath);
    console.log('Connected to SQLite database successfully');
} catch (error) {
    console.error('Error connecting to database:', error);
    console.error('Database path:', dbPath);
    console.error('Directory exists:', fs.existsSync(dataDir));
    console.error('Directory writable:', fs.accessSync ? (() => {
        try {
            fs.accessSync(dataDir, fs.constants.W_OK);
            return true;
        } catch {
            return false;
        }
    })() : 'unknown');
    
    // Try alternative path
    const altPath = path.join(process.cwd(), 'pos.db');
    console.log('Trying alternative path:', altPath);
    try {
        db = new Database(altPath);
        console.log('Connected to database using alternative path');
    } catch (altError) {
        console.error('Alternative path also failed:', altError);
        throw new Error(`Cannot connect to database. Original error: ${error.message}`);
    }
}

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
try {
    // Users table
    db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        mobile_phone TEXT,
        role TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Categories table
    db.exec(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        parent_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories (id)
    )`);

    // Product Types table
    db.exec(`CREATE TABLE IF NOT EXISTS product_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Product Units table
    db.exec(`CREATE TABLE IF NOT EXISTS product_units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Suppliers table
    db.exec(`CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        postal_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Products table
    db.exec(`CREATE TABLE IF NOT EXISTS products (
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id),
        FOREIGN KEY (product_type_id) REFERENCES product_types (id),
        FOREIGN KEY (product_unit_id) REFERENCES product_units (id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
    )`);

    // Customers table
    db.exec(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        postal_code TEXT,
        tax_number TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Sales table
    db.exec(`CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        final_amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Add missing columns if they don't exist (for existing databases)
    const addColumnIfNotExists = (columnName, columnDefinition) => {
        try {
            db.exec(`ALTER TABLE sales ADD COLUMN ${columnName} ${columnDefinition}`);
        } catch (err) {
            if (!err.message.includes('duplicate column name')) {
                console.error(`Error adding ${columnName} column:`, err);
            }
        }
    };

    // Add all missing columns
    addColumnIfNotExists('sale_number', 'TEXT');
    addColumnIfNotExists('invoice_number', 'TEXT');
    addColumnIfNotExists('customer_id', 'INTEGER');
    addColumnIfNotExists('user_id', 'INTEGER');
    addColumnIfNotExists('subtotal', 'REAL');
    addColumnIfNotExists('total_amount', 'REAL');
    addColumnIfNotExists('discount_amount', 'REAL DEFAULT 0');
    addColumnIfNotExists('tax_amount', 'REAL DEFAULT 0');
    addColumnIfNotExists('final_amount', 'REAL');
    addColumnIfNotExists('payment_method', 'TEXT');
    addColumnIfNotExists('payment_status', 'TEXT DEFAULT "completed"');
    addColumnIfNotExists('sale_status', 'TEXT DEFAULT "completed"');
    addColumnIfNotExists('notes', 'TEXT');
    addColumnIfNotExists('created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Sale Items table
    db.exec(`CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )`);

    // Add missing columns to sale_items table if they don't exist
    const addSaleItemColumnIfNotExists = (columnName, columnDefinition) => {
        try {
            db.exec(`ALTER TABLE sale_items ADD COLUMN ${columnName} ${columnDefinition}`);
        } catch (err) {
            if (!err.message.includes('duplicate column name')) {
                console.error(`Error adding sale_items ${columnName} column:`, err);
            }
        }
    };

    // Add all missing columns to sale_items
    addSaleItemColumnIfNotExists('sale_id', 'INTEGER');
    addSaleItemColumnIfNotExists('product_id', 'INTEGER');
    addSaleItemColumnIfNotExists('quantity', 'INTEGER');
    addSaleItemColumnIfNotExists('unit_price', 'REAL');
    addSaleItemColumnIfNotExists('tax_rate', 'REAL DEFAULT 10');
    addSaleItemColumnIfNotExists('discount_amount', 'REAL DEFAULT 0');
    addSaleItemColumnIfNotExists('tax_amount', 'REAL DEFAULT 0');
    addSaleItemColumnIfNotExists('total_amount', 'REAL');
    addSaleItemColumnIfNotExists('created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Returns table
    db.exec(`CREATE TABLE IF NOT EXISTS returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        final_amount REAL NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales (id),
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Add missing columns to returns table if they don't exist
    try {
        db.exec(`ALTER TABLE returns ADD COLUMN discount_amount REAL DEFAULT 0`);
    } catch (err) {
        if (!err.message.includes('duplicate column name')) {
            console.error('Error adding discount_amount column:', err);
        }
    }
    
    try {
        db.exec(`ALTER TABLE returns ADD COLUMN tax_amount REAL DEFAULT 0`);
    } catch (err) {
        if (!err.message.includes('duplicate column name')) {
            console.error('Error adding tax_amount column:', err);
        }
    }
    
    try {
        db.exec(`ALTER TABLE returns ADD COLUMN final_amount REAL DEFAULT 0`);
    } catch (err) {
        if (!err.message.includes('duplicate column name')) {
            console.error('Error adding final_amount column:', err);
        }
    }
    
    try {
        db.exec(`ALTER TABLE returns ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
    } catch (err) {
        if (!err.message.includes('duplicate column name')) {
            console.error('Error adding updated_at column:', err);
        }
    }

    // Return Items table
    db.exec(`CREATE TABLE IF NOT EXISTS return_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        return_id INTEGER NOT NULL,
        sale_item_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (return_id) REFERENCES returns (id),
        FOREIGN KEY (sale_item_id) REFERENCES sale_items (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )`);

    // Add missing columns to return_items table if they don't exist
    try {
        db.exec(`ALTER TABLE return_items ADD COLUMN discount_amount REAL DEFAULT 0`);
    } catch (err) {
        if (!err.message.includes('duplicate column name')) {
            console.error('Error adding discount_amount column to return_items:', err);
        }
    }
    
    try {
        db.exec(`ALTER TABLE return_items ADD COLUMN tax_amount REAL DEFAULT 0`);
    } catch (err) {
        if (!err.message.includes('duplicate column name')) {
            console.error('Error adding tax_amount column to return_items:', err);
        }
    }
    
    try {
        db.exec(`ALTER TABLE return_items ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
    } catch (err) {
        if (!err.message.includes('duplicate column name')) {
            console.error('Error adding created_at column to return_items:', err);
        }
    }

    // Todo table
    db.exec(`
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            due_date DATETIME,
            priority TEXT NOT NULL DEFAULT 'medium',
            status TEXT NOT NULL DEFAULT 'pending',
            assigned_to INTEGER,
            created_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
        )
    `);

    // Inventory table
    db.exec(`
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            warehouse_location TEXT,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
    `);

    // Inventory transactions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS inventory_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            transaction_type TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            reference_type TEXT NOT NULL,
            reference_id INTEGER NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
    `);

    // Settings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_products_unit ON products(product_unit_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_returns_sale ON returns(sale_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_returns_customer ON returns(customer_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_returns_user ON returns(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_return_items_return ON return_items(return_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_return_items_product ON return_items(product_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_todos_assigned ON todos(assigned_to)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_todos_created ON todos(created_by)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON inventory_transactions(product_id)');

    // Ensure required columns exist on products table (for legacy DBs)
    const ensureColumn = (table, column, typeDef, defaultValue) => {
        try {
            const columns = db.pragma(`table_info(${table})`);
            const hasColumn = columns && columns.some(col => col.name === column);
            if (!hasColumn) {
                const defaultClause = defaultValue !== undefined ? ` DEFAULT ${defaultValue}` : '';
                const sql = `ALTER TABLE ${table} ADD COLUMN ${column} ${typeDef}${defaultClause}`;
                db.exec(sql);
                console.log(`Added missing column ${column} to ${table}`);
            }
        } catch (err) {
            console.error(`Error ensuring column ${column} in ${table}:`, err);
        }
    };

    // Add missing stock-related columns if the database was created before these fields existed
    ensureColumn('products', 'min_stock_level', 'INTEGER', 0);
    ensureColumn('products', 'current_stock', 'INTEGER', 0);
    ensureColumn('products', 'max_stock_level', 'INTEGER', 0);
    
    // Add missing is_active column to customers table
    ensureColumn('customers', 'is_active', 'INTEGER', 1);
    
    // Add performance indexes for frequently queried columns
    db.exec(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at)`);
    
    db.exec(`CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id)`);
    
    db.exec(`CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id)`);
    
    db.exec(`CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id)`);
    
    db.exec(`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`);
    
    db.exec(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`);
    
} catch (error) {
    console.error('Database initialization error:', error);
}

module.exports = db; 