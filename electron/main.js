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

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'dist/preload.js'),
      webSecurity: process.env.NODE_ENV === 'production', // Disable web security in development
      allowRunningInsecureContent: process.env.NODE_ENV === 'development',
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

  // Load the local URL for development
  mainWindow.loadURL('http://localhost:5173');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Setup IPC handlers
  setupAuthHandlers();
  setupCategoryHandlers();
  setupClientHandlers();
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

  // Simple in-memory weekly scheduler
  let backupInterval = null;
  let scheduledFolder = null;

  ipcMain.handle('backup:schedule-weekly', async (_event, folderPath) => {
    if (!folderPath) throw new Error('No folder path provided');
    scheduledFolder = folderPath;
    if (backupInterval) {
      clearInterval(backupInterval);
      backupInterval = null;
    }
    // Run immediately once, then every 7 days
    try { await exportBackupJSON(scheduledFolder); } catch (_) {}
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    backupInterval = setInterval(() => {
      // Fire and forget; errors are ignored for scheduled runs
      exportBackupJSON(scheduledFolder).catch(() => {});
    }, weekMs);
    const nextRun = new Date(Date.now() + weekMs).toISOString();
    return { nextRun, folderPath: scheduledFolder };
  });

  ipcMain.handle('backup:cancel-schedule', async () => {
    if (backupInterval) {
      clearInterval(backupInterval);
      backupInterval = null;
    }
    scheduledFolder = null;
    return { cancelled: true };
  });

  return mainWindow;
}

const appServer = express();
const port = 3010; // Choose a port for your server

// Middleware to parse JSON requests
appServer.use(express.json());

// Define a route to get todos
appServer.get('/todos', async (req, res) => {
  try {
    const todos = []; // Placeholder; avoid using ipcRenderer in main process
    res.json(todos); // Send todos as JSON response
  } catch (error) {
    res.status(500).json({ error: 'Error fetching todos' });
  }
});

// Start the server
appServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

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
