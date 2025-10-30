const { app, BrowserWindow, Menu, MenuItem, crashReporter, ipcMain, dialog } = require('electron');
const path = require('path');
const express = require('express');
const fs = require('fs');
const db = require('../backend/config/database');

// Performance optimizations
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--disable-background-timer-throttling');
app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('--disable-renderer-backgrounding');
app.commandLine.appendSwitch('--disable-features', 'TranslateUI');
app.commandLine.appendSwitch('--disable-ipc-flooding-protection');

// Memory optimizations
app.commandLine.appendSwitch('--max-old-space-size', '4096');
app.commandLine.appendSwitch('--no-sandbox');

// Handle SSL certificate errors in development
app.on('ready', () => {
  if (process.env.NODE_ENV === 'development') {
    app.commandLine.appendSwitch('ignore-certificate-errors');
    app.commandLine.appendSwitch('allow-insecure-localhost');
  }
});

// Enable crash reporting
crashReporter.start({
  submitURL: '',
  uploadToServer: false,
  compress: true,
});

// Remove the application menu entirely
Menu.setApplicationMenu(null);

// Import auth handlers
const setupAuthHandlers = require('../backend/ipc/auth.handlers');
// Import category handlers
const setupCategoryHandlers = require('../backend/ipc/category.handlers');
// Import client handlers
const setupClientHandlers = require('../backend/ipc/client.handlers');
const setupPrintHandlers = require('../backend/ipc/print.handlers');
// Import invoice handlers
const setupInvoiceHandlers = require('../backend/ipc/invoice.handlers');
// Import product handlers
const setupProductHandlers = require('../backend/ipc/product.handlers');
// Import product type handlers
const setupProductTypeHandlers = require('../backend/ipc/productType.handlers');
// Import product unit handlers
const setupProductUnitHandlers = require('../backend/ipc/productUnit.handlers');
// Import return handlers
const setupReturnHandlers = require('../backend/ipc/return.handlers');
// Import sale handlers
const setupSaleHandlers = require('../backend/ipc/sale.handlers');
// Import sale item handlers
const setupSaleItemHandlers = require('../backend/ipc/saleItem.handlers');
// Import supplier handlers
const setupSupplierHandlers = require('../backend/ipc/supplier.handlers');
// Import todo handlers
const setupTodoHandlers = require('../backend/ipc/todo.handlers');
const setupLicenseHandlers = require('../backend/ipc/license.handlers');
const setupUserProfileHandlers = require('../backend/ipc/userProfile.handlers');
// Import cloud sync handlers
const CloudSyncHandlers = require('../backend/ipc/cloudSync.handlers');
const EmailHandlers = require('../backend/ipc/email.handlers');
const setupAnalyticsHandlers = require('../backend/ipc/analytics.handlers');
const setupSettingsHandlers = require('../backend/ipc/settings.handlers');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'POS System - Point of Sale',
    icon: path.join(__dirname, '../public/assets/img/logo.png'), // Custom app icon
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'dist/preload.js'),
      webSecurity: false, // Disable web security to allow local file loading
      allowRunningInsecureContent: true,
      // Performance optimizations
      enableRemoteModule: false,
      backgroundThrottling: false,
      offscreen: false,
      // Memory optimizations
      v8CacheOptions: 'code',
      // Disable unnecessary features
      experimentalFeatures: false,
      enableBlinkFeatures: '',
      disableBlinkFeatures: 'Auxclick',
    },
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

// Bulk operations handlers
ipcMain.handle('bulk-update-products', async (event, productIds, updateData) => {
  try {
    console.log('Bulk updating products:', productIds, updateData);
    
    const db = new Database(path.join(__dirname, '../backend/data/pos.db'));
    let updatedCount = 0;
    
    for (const productId of productIds) {
      try {
        // Build update query dynamically based on provided fields
        const updateFields = [];
        const updateValues = [];
        
        if (updateData.category_id !== undefined) {
          updateFields.push('category_id = ?');
          updateValues.push(updateData.category_id);
        }
        
        if (updateData.product_type_id !== undefined) {
          updateFields.push('product_type_id = ?');
          updateValues.push(updateData.product_type_id);
        }
        
        if (updateData.product_unit_id !== undefined) {
          updateFields.push('product_unit_id = ?');
          updateValues.push(updateData.product_unit_id);
        }
        
        if (updateData.supplier_id !== undefined) {
          updateFields.push('supplier_id = ?');
          updateValues.push(updateData.supplier_id);
        }
        
        if (updateData.status !== undefined) {
          updateFields.push('status = ?');
          updateValues.push(updateData.status);
        }
        
        if (updateData.tax_rate !== undefined) {
          updateFields.push('tax_rate = ?');
          updateValues.push(updateData.tax_rate);
        }
        
        if (updateData.min_stock_level !== undefined) {
          updateFields.push('min_stock_level = ?');
          updateValues.push(updateData.min_stock_level);
        }
        
        if (updateData.max_stock_level !== undefined) {
          updateFields.push('max_stock_level = ?');
          updateValues.push(updateData.max_stock_level);
        }
        
        // Handle price operations
        if (updateData.priceField && updateData.priceOperation && updateData.priceValue !== undefined) {
          if (updateData.priceOperation === 'set') {
            updateFields.push(`${updateData.priceField} = ?`);
            updateValues.push(updateData.priceValue);
          } else if (updateData.priceOperation === 'increase') {
            updateFields.push(`${updateData.priceField} = ${updateData.priceField} * (1 + ?)`);
            updateValues.push(updateData.priceValue / 100);
          } else if (updateData.priceOperation === 'decrease') {
            updateFields.push(`${updateData.priceField} = ${updateData.priceField} * (1 - ?)`);
            updateValues.push(updateData.priceValue / 100);
          }
        }
        
        if (updateFields.length > 0) {
          updateFields.push('updated_at = ?');
          updateValues.push(new Date().toISOString());
          updateValues.push(productId);
          
          const updateQuery = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
          const result = db.prepare(updateQuery).run(...updateValues);
          
          if (result.changes > 0) {
            updatedCount++;
          }
        }
      } catch (error) {
        console.error(`Error updating product ${productId}:`, error);
      }
    }
    
    db.close();
    
    return {
      success: true,
      updatedCount: updatedCount,
      message: `Successfully updated ${updatedCount} products`
    };
    
  } catch (error) {
    console.error('Bulk update error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('bulk-delete-products', async (event, productIds) => {
  try {
    console.log('Bulk deleting products:', productIds);
    
    const db = new Database(path.join(__dirname, '../backend/data/pos.db'));
    let deletedCount = 0;
    
    for (const productId of productIds) {
      try {
        const result = db.prepare('DELETE FROM products WHERE id = ?').run(productId);
        if (result.changes > 0) {
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error deleting product ${productId}:`, error);
      }
    }
    
    db.close();
    
    return {
      success: true,
      deletedCount: deletedCount,
      message: `Successfully deleted ${deletedCount} products`
    };
    
  } catch (error) {
    console.error('Bulk delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('export-products', async (event, productIds) => {
  try {
    console.log('Exporting products:', productIds);
    
    const db = new Database(path.join(__dirname, '../backend/data/pos.db'));
    
    // Get products data
    const placeholders = productIds.map(() => '?').join(',');
    const products = db.prepare(`
      SELECT p.*, c.name as category_name, pt.name as product_type_name, 
             pu.name as product_unit_name, pu.symbol as product_unit_symbol,
             s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_types pt ON p.product_type_id = pt.id
      LEFT JOIN product_units pu ON p.product_unit_id = pu.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id IN (${placeholders})
    `).all(...productIds);
    
    db.close();
    
    // Convert to CSV format
    const csvHeaders = [
      'ID', 'Name', 'SKU', 'Barcode', 'Description', 'Category', 'Product Type',
      'Product Unit', 'Supplier', 'Purchase Price', 'Selling Price', 'Tax Rate',
      'Min Stock Level', 'Max Stock Level', 'Current Stock', 'Status', 'Created At'
    ];
    
    const csvRows = products.map(product => [
      product.id,
      product.name,
      product.sku,
      product.barcode || '',
      product.description || '',
      product.category_name || '',
      product.product_type_name || '',
      `${product.product_unit_name} (${product.product_unit_symbol})`,
      product.supplier_name || '',
      product.purchase_price,
      product.selling_price,
      product.tax_rate,
      product.min_stock_level,
      product.max_stock_level,
      product.current_stock,
      product.status,
      product.created_at
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    // Save to file
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    const filename = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    const filepath = path.join(os.homedir(), 'Downloads', filename);
    
    fs.writeFileSync(filepath, csvContent);
    
    return {
      success: true,
      exportedCount: products.length,
      filepath: filepath,
      message: `Successfully exported ${products.length} products to ${filename}`
    };
    
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Custom context menu for right-click
mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = new Menu();

    // Add "Refresh App Data" option to the context menu
    menu.append(
      new MenuItem({
        label: '🔄 Refresh App Data',
        click: async () => {
          try {
            // Send refresh event to renderer process
            mainWindow.webContents.send('app-refresh-start');
            
            // Trigger refresh of all stores
            await Promise.all([
              mainWindow.webContents.send('refresh-products'),
              mainWindow.webContents.send('refresh-sales'),
              mainWindow.webContents.send('refresh-customers'),
              mainWindow.webContents.send('refresh-categories'),
              mainWindow.webContents.send('refresh-suppliers'),
              mainWindow.webContents.send('refresh-analytics'),
              mainWindow.webContents.send('refresh-todos'),
              mainWindow.webContents.send('refresh-settings')
            ]);
            
            // Send completion event
            mainWindow.webContents.send('app-refresh-complete');
            
            console.log('App data refreshed successfully');
          } catch (error) {
            console.error('Error refreshing app data:', error);
            mainWindow.webContents.send('app-refresh-error', error.message);
          }
        },
      })
    );

    // Add separator
    menu.append(new MenuItem({ type: 'separator' }));

    // Add "Inspect Element" option to the context menu
    menu.append(
      new MenuItem({
        label: 'Inspect Element',
        click: () => {
          mainWindow.webContents.inspectElement(params.x, params.y);
        },
      })
    );

    // Add other default context menu items if needed
    // For example: Copy, Paste, etc.
    menu.append(new MenuItem({ role: 'copy' }));
    menu.append(new MenuItem({ role: 'paste' }));

    // Show the context menu
    menu.popup({ window: mainWindow, x: params.x, y: params.y });
  });

  // Keyboard shortcut: Ctrl+Shift+I toggles DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    const isToggle =
      input.type === 'keyDown' &&
      input.key.toLowerCase() === 'i' &&
      input.control &&
      input.shift;
    if (isToggle) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
      event.preventDefault();
    }
  });

  // Load the appropriate URL based on environment
  const isDevelopment = process.env.NODE_ENV === 'development' && 
                        process.argv[0].includes('electron');
  
  console.log('Environment detection:', {
    NODE_ENV: process.env.NODE_ENV,
    argv0: process.argv[0],
    isDevelopment: isDevelopment
  });

  // ✅ Smart loading: dev server OR built files
  const indexPath = path.join(__dirname, '../dist/index.html');
  
  console.log('Checking for built files at:', indexPath);
  
  if (fs.existsSync(indexPath)) {
    // ✅ Production: Load built Vue app
    console.log('✅ Loading built Vue app from:', indexPath);
    mainWindow.loadFile(indexPath);
  } else {
    // ✅ Development: Load Vue dev server
    console.log('⚠️ Built files not found, loading dev server...');
    if (isDevelopment) {
      mainWindow.loadURL('http://localhost:5173');
    } else {
      console.error('❌ No built files and not in development mode!');
      mainWindow.loadURL('data:text/html,<h1>Error: Vue.js build not found</h1><p>Please run: npm run build</p>');
    }
  }

  // Open DevTools in development
  if (isDevelopment) {
    mainWindow.webContents.openDevTools();
  }

  // Setup IPC handlers
  setupAuthHandlers();
  setupCategoryHandlers();
  setupClientHandlers();
  setupPrintHandlers();
  setupInvoiceHandlers();
  setupProductHandlers();
  setupProductTypeHandlers();
  setupProductUnitHandlers();
  setupReturnHandlers();
  setupSaleHandlers();
  setupSaleItemHandlers();
  setupSupplierHandlers();
  new EmailHandlers();
  new CloudSyncHandlers();
  setupAnalyticsHandlers();
  setupSettingsHandlers();
  setupLicenseHandlers(ipcMain);

  // File save handler
  ipcMain.handle('save-file', async (event, data, filename, type) => {
    try {
      console.log('Main process: save-file handler called');
      console.log('Main process: filename:', filename, 'type:', type, 'data length:', data.length);
      
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save File',
        defaultPath: filename,
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: type === 'csv' ? 'CSV Files' : 'PDF Files', extensions: [type] }
        ]
      });

      console.log('Main process: dialog result:', result);

      if (!result.canceled && result.filePath) {
        console.log('Main process: saving to path:', result.filePath);
        
        // Handle different file types
        if (type === 'pdf') {
          console.log('Main process: writing PDF as binary');
          // For PDF, write as binary
          fs.writeFileSync(result.filePath, Buffer.from(data, 'binary'));
        } else {
          console.log('Main process: writing as UTF-8');
          // For CSV and other text files, write as UTF-8
          fs.writeFileSync(result.filePath, data, 'utf8');
        }
        
        console.log('Main process: file saved successfully');
        return { success: true, path: result.filePath };
      } else {
        console.log('Main process: save cancelled by user');
        return { success: false, error: 'Save cancelled' };
      }
    } catch (error) {
      console.error('Main process: Error saving file:', error);
      console.error('Main process: Error stack:', error.stack);
      return { success: false, error: error.message };
    }
  });
  setupTodoHandlers();
  setupUserProfileHandlers();

  // Printers: provide list of available printers
  ipcMain.handle('printers:get-all', async (event) => {
    try {
      const printers = await mainWindow.webContents.getPrintersAsync();
      return printers;
    } catch (error) {
      throw new Error(error.message);
    }
  });

  // Backup: choose destination folder
  ipcMain.handle('backup:choose-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select backup folder',
      properties: ['openDirectory', 'createDirectory']
    });
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  // Backup: export database tables to JSON file in the given folder
  const exportBackupJSON = async (folderPath) => {
    if (!folderPath) throw new Error('No folder path provided');
    const date = new Date();
    const dateStamp = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const filePath = path.join(folderPath, `pos-backup-${dateStamp}.json`);

    const getAllTables = () => {
      try {
        const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        const rows = stmt.all();
        return rows.map(r => r.name);
      } catch (err) {
        throw err;
      }
    };

    const getTableRows = (tableName) => {
      try {
        const stmt = db.prepare(`SELECT * FROM ${tableName}`);
        return stmt.all();
      } catch (err) {
        throw err;
      }
    };

    const tables = getAllTables();
    const data = { createdAt: date.toISOString(), tables: {} };
    for (const t of tables) {
      const rows = getTableRows(t);
      data.tables[t] = rows;
    }
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { filePath, tables: Object.keys(data.tables).length };
  };

  ipcMain.handle('backup:export-json', async (_event, folderPath) => {
    try {
      return await exportBackupJSON(folderPath);
    } catch (error) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  });

  // Enhanced backup scheduler with daily and weekly options
  let backupInterval = null;
  let scheduledFolder = null;
  let backupFrequency = 'weekly';

  function calculateNextBackupTime(frequency) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight

    if (frequency === 'daily') {
      return tomorrow;
    } else if (frequency === 'weekly') {
      // Next Monday at midnight
      const daysUntilMonday = (8 - now.getDay()) % 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));
      nextMonday.setHours(0, 0, 0, 0);
      return nextMonday;
    }
    return tomorrow;
  }

  function scheduleNextBackup() {
    if (!scheduledFolder) return;

    const nextBackupTime = calculateNextBackupTime(backupFrequency);
    const now = new Date();
    const msUntilNext = nextBackupTime.getTime() - now.getTime();

    console.log(`Next backup scheduled for: ${nextBackupTime.toLocaleString()}`);
    
    setTimeout(async () => {
      try {
        await exportBackupJSON(scheduledFolder);
        console.log('Scheduled backup completed successfully');
        // Schedule the next backup
        scheduleNextBackup();
      } catch (error) {
        console.error('Scheduled backup failed:', error);
        // Reschedule for next day even if failed
        setTimeout(scheduleNextBackup, 24 * 60 * 60 * 1000);
      }
    }, msUntilNext);
  }

  ipcMain.handle('backup:schedule-daily', async (_event, folderPath) => {
    if (!folderPath) throw new Error('No folder path provided');
    scheduledFolder = folderPath;
    backupFrequency = 'daily';
    
    // Clear any existing schedule
    if (backupInterval) {
      clearInterval(backupInterval);
      backupInterval = null;
    }
    
    // Run immediately once
    try { 
      await exportBackupJSON(scheduledFolder); 
      console.log('Initial daily backup completed');
    } catch (error) {
      console.error('Initial backup failed:', error);
    }
    
    // Schedule next backup for midnight
    scheduleNextBackup();

    const nextRun = calculateNextBackupTime('daily');
    return { nextRun: nextRun.toISOString(), folderPath: scheduledFolder, frequency: 'daily' };
  });

  ipcMain.handle('backup:schedule-weekly', async (_event, folderPath) => {
    if (!folderPath) throw new Error('No folder path provided');
    scheduledFolder = folderPath;
    backupFrequency = 'weekly';
    
    if (backupInterval) {
      clearInterval(backupInterval);
      backupInterval = null;
    }
    
    // Run immediately once
    try { 
      await exportBackupJSON(scheduledFolder); 
      console.log('Initial weekly backup completed');
    } catch (error) {
      console.error('Initial backup failed:', error);
    }
    
    // Schedule next backup for next Monday
    scheduleNextBackup();

    const nextRun = calculateNextBackupTime('weekly');
    return { nextRun: nextRun.toISOString(), folderPath: scheduledFolder, frequency: 'weekly' };
  });

  ipcMain.handle('backup:cancel-schedule', async () => {
    if (backupInterval) {
      clearInterval(backupInterval);
      backupInterval = null;
    }
    scheduledFolder = null;
    backupFrequency = 'weekly';
    return { cancelled: true };
  });

  // Restore functionality
  ipcMain.handle('backup:choose-restore-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select backup file to restore',
      properties: ['openFile'],
      filters: [
        { name: 'JSON Backup Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle('backup:restore-from-json', async (event, filePath) => {
    try {
      if (!filePath) throw new Error('No file path provided');
      
      // Read and parse the backup file
      const backupData = JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));
      
      if (!backupData.tables || typeof backupData.tables !== 'object') {
        throw new Error('Invalid backup file format');
      }

      console.log(`Starting restore from backup created: ${backupData.createdAt}`);
      
      // Start transaction for restore
      db.exec('BEGIN TRANSACTION');
      
      try {
        // Get list of existing tables
        const existingTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
        const existingTableNames = existingTables.map(t => t.name);
        
        // DON'T clear existing data - we want to merge, not replace
        // This preserves current data and adds backup data
        
        // Restore data to each table with smart merging
        for (const [tableName, rows] of Object.entries(backupData.tables)) {
          if (existingTableNames.includes(tableName) && Array.isArray(rows)) {
            if (rows.length > 0) {
              try {
                // Get current table schema to check which columns exist
                const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
                const existingColumns = tableInfo.map(col => col.name);
                
                // Filter backup data to only include columns that exist in current schema
                const filteredRows = rows.map(row => {
                  const filteredRow = {};
                  for (const [key, value] of Object.entries(row)) {
                    if (existingColumns.includes(key)) {
                      filteredRow[key] = value;
                    } else {
                      console.warn(`Skipping column '${key}' in ${tableName} - not in current schema`);
                    }
                  }
                  return filteredRow;
                });
                
                if (filteredRows.length > 0 && Object.keys(filteredRows[0]).length > 0) {
                  const columns = Object.keys(filteredRows[0]);
                  const placeholders = columns.map(() => '?').join(', ');
                  
                  // Get existing records to avoid duplicates
                  const existingRecords = db.prepare(`SELECT * FROM ${tableName}`).all();
                  const existingIds = new Set(existingRecords.map(record => record.id));
                  
                  // Use INSERT OR IGNORE to only add new records, not replace existing ones
                  // This preserves ALL existing data and only adds new records from backup
                  const insertSQL = `INSERT OR IGNORE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
                  const stmt = db.prepare(insertSQL);
                  
                  let addedCount = 0;
                  let skippedCount = 0;
                  
                  for (const row of filteredRows) {
                    try {
                      // Skip if this record already exists (by ID)
                      if (row.id && existingIds.has(row.id)) {
                        skippedCount++;
                        continue;
                      }
                      
                      const values = columns.map(col => row[col]);
                      const result = stmt.run(values);
                      
                      if (result.changes > 0) {
                        addedCount++;
                      } else {
                        skippedCount++;
                      }
                    } catch (err) {
                      console.warn(`Warning: Failed to restore row in ${tableName}:`, err.message);
                      skippedCount++;
                      // Continue with other rows
                    }
                  }
                  
                  console.log(`Restored ${addedCount} new records to ${tableName}, skipped ${skippedCount} existing records`);
                } else {
                  console.warn(`No compatible columns found for ${tableName} - skipping restore`);
                }
              } catch (err) {
                console.error(`Error processing table ${tableName}:`, err.message);
                // Continue with other tables
              }
            }
          }
        }
        
        // Commit transaction
        db.exec('COMMIT');
        console.log('Database restore completed successfully');
        
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      
      return { 
        success: true, 
        message: `Database restored successfully from backup created: ${backupData.createdAt}. Existing data was preserved and new records were added.`,
        tablesRestored: Object.keys(backupData.tables).length
      };
      
    } catch (error) {
      console.error('Restore error:', error);
      throw new Error(`Restore failed: ${error.message}`);
    }
  });

  return mainWindow;
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// App control handlers
ipcMain.handle('app:close', async () => {
  try {
    app.quit();
    return { success: true };
  } catch (error) {
    console.error('Error closing app:', error);
    return { success: false, error: error.message };
  }
});
