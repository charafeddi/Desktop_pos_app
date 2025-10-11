const { app, BrowserWindow, Menu, MenuItem, crashReporter, ipcMain, dialog } = require('electron');
const path = require('path');
const express = require('express');
const fs = require('fs');
const db = require('../backend/config/database');

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
const setupUserProfileHandlers = require('../backend/ipc/userProfile.handlers');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'dist/preload.js'),
      webSecurity: false, // Disable web security to allow local file loading
      allowRunningInsecureContent: true,
    },
  });

  // Custom context menu for right-click
  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = new Menu();

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

    const getAllTables = () => new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, rows) => {
        if (err) reject(err); else resolve(rows.map(r => r.name));
      });
    });

    const getTableRows = (tableName) => new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });

    const tables = await getAllTables();
    const data = { createdAt: date.toISOString(), tables: {} };
    for (const t of tables) {
      // eslint-disable-next-line no-await-in-loop
      const rows = await getTableRows(t);
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
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        try {
          // Get list of existing tables
          db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", async (err, existingTables) => {
            if (err) throw err;
            
            const existingTableNames = existingTables.map(t => t.name);
            
            // Clear existing data from all tables (except sqlite_sequence)
            for (const tableName of existingTableNames) {
              if (tableName !== 'sqlite_sequence') {
                await new Promise((resolve, reject) => {
                  db.run(`DELETE FROM ${tableName}`, (err) => {
                    if (err) reject(err); else resolve();
                  });
                });
              }
            }
            
            // Restore data to each table
            for (const [tableName, rows] of Object.entries(backupData.tables)) {
              if (existingTableNames.includes(tableName) && Array.isArray(rows)) {
                if (rows.length > 0) {
                  const columns = Object.keys(rows[0]);
                  const placeholders = columns.map(() => '?').join(', ');
                  const insertSQL = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
                  
                  for (const row of rows) {
                    await new Promise((resolve, reject) => {
                      const values = columns.map(col => row[col]);
                      db.run(insertSQL, values, (err) => {
                        if (err) {
                          console.warn(`Warning: Failed to restore row in ${tableName}:`, err.message);
                          resolve(); // Continue with other rows
                        } else {
                          resolve();
                        }
                      });
                    });
                  }
                }
              }
            }
            
            // Commit transaction
            db.run('COMMIT', (err) => {
              if (err) {
                db.run('ROLLBACK');
                throw new Error(`Restore failed: ${err.message}`);
              }
              console.log('Database restore completed successfully');
            });
          });
          
        } catch (error) {
          db.run('ROLLBACK');
          throw error;
        }
      });
      
      return { 
        success: true, 
        message: `Database restored successfully from backup created: ${backupData.createdAt}`,
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
