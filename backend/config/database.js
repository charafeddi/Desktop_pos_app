const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Database file path
const dbPath = path.join(dataDir, 'pos.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables if they don't exist
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
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
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        parent_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories (id)
    )`);

    // Product Types table
    db.run(`CREATE TABLE IF NOT EXISTS product_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Product Units table
    db.run(`CREATE TABLE IF NOT EXISTS product_units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Suppliers table
    db.run(`CREATE TABLE IF NOT EXISTS suppliers (
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
    db.run(`CREATE TABLE IF NOT EXISTS products (
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
    db.run(`CREATE TABLE IF NOT EXISTS customers (
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
    db.run(`CREATE TABLE IF NOT EXISTS sales (
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
        db.run(`ALTER TABLE sales ADD COLUMN ${columnName} ${columnDefinition}`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error(`Error adding ${columnName} column:`, err);
            }
        });
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
    db.run(`CREATE TABLE IF NOT EXISTS sale_items (
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
        db.run(`ALTER TABLE sale_items ADD COLUMN ${columnName} ${columnDefinition}`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error(`Error adding sale_items ${columnName} column:`, err);
            }
        });
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
    db.run(`CREATE TABLE IF NOT EXISTS returns (
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
    db.run(`ALTER TABLE returns ADD COLUMN discount_amount REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding discount_amount column:', err);
        }
    });
    
    db.run(`ALTER TABLE returns ADD COLUMN tax_amount REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding tax_amount column:', err);
        }
    });
    
    db.run(`ALTER TABLE returns ADD COLUMN final_amount REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding final_amount column:', err);
        }
    });
    
    db.run(`ALTER TABLE returns ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding updated_at column:', err);
        }
    });

    // Return Items table
    db.run(`CREATE TABLE IF NOT EXISTS return_items (
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
    db.run(`ALTER TABLE return_items ADD COLUMN discount_amount REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding discount_amount column to return_items:', err);
        }
    });
    
    db.run(`ALTER TABLE return_items ADD COLUMN tax_amount REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding tax_amount column to return_items:', err);
        }
    });
    
    db.run(`ALTER TABLE return_items ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding created_at column to return_items:', err);
        }
    });

    // Todo table
    db.run(`
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
    db.run(`
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
    db.run(`
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
    db.run(`
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_products_unit ON products(product_unit_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_returns_sale ON returns(sale_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_returns_customer ON returns(customer_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_returns_user ON returns(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_return_items_return ON return_items(return_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_return_items_product ON return_items(product_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_todos_assigned ON todos(assigned_to)');
    db.run('CREATE INDEX IF NOT EXISTS idx_todos_created ON todos(created_by)');
    db.run('CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON inventory_transactions(product_id)');

    // Ensure required columns exist on products table (for legacy DBs)
    const ensureColumn = (table, column, typeDef, defaultValue) => {
        db.all(`PRAGMA table_info(${table})`, (err, columns) => {
            if (err) {
                console.error(`Error reading schema for ${table}:`, err);
                return;
            }
            const hasColumn = columns && columns.some(col => col.name === column);
            if (!hasColumn) {
                const defaultClause = defaultValue !== undefined ? ` DEFAULT ${defaultValue}` : '';
                const sql = `ALTER TABLE ${table} ADD COLUMN ${column} ${typeDef}${defaultClause}`;
                db.run(sql, alterErr => {
                    if (alterErr) {
                        console.error(`Error adding column ${column} to ${table}:`, alterErr);
                    } else {
                        console.log(`Added missing column ${column} to ${table}`);
                    }
                });
            }
        });
    };

    // Add missing stock-related columns if the database was created before these fields existed
    ensureColumn('products', 'min_stock_level', 'INTEGER', 0);
    ensureColumn('products', 'current_stock', 'INTEGER', 0);
    ensureColumn('products', 'max_stock_level', 'INTEGER', 0);
    
    // Add missing is_active column to customers table
    ensureColumn('customers', 'is_active', 'INTEGER', 1);
    
    // Add performance indexes for frequently queried columns
    db.run(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)`, (err) => {
        if (err) console.error('Error creating sales date index:', err);
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id)`, (err) => {
        if (err) console.error('Error creating sales customer index:', err);
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id)`, (err) => {
        if (err) console.error('Error creating sale items product index:', err);
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id)`, (err) => {
        if (err) console.error('Error creating sale items sale index:', err);
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`, (err) => {
        if (err) console.error('Error creating products SKU index:', err);
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`, (err) => {
        if (err) console.error('Error creating products category index:', err);
    });
});

module.exports = db; 