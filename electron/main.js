const { app, BrowserWindow, Menu, MenuItem, crashReporter } = require('electron');
const path = require('path');
const express = require('express');

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
  setupTodoHandlers();

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
