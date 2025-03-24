const { app, BrowserWindow, Menu, MenuItem, ipcMain } = require('electron')
const path = require('path')
const express = require('express')

// Handle SSL certificate errors in development
app.on('ready', () => {
  if (process.env.NODE_ENV === 'development') {
    app.commandLine.appendSwitch('ignore-certificate-errors')
    app.commandLine.appendSwitch('allow-insecure-localhost')
  }
})

// Import auth handlers
const setupAuthHandlers = require('../backend/ipc/auth.handlers')
// Import category handlers
const setupCategoryHandlers = require('../backend/ipc/category.handlers')
// Import client handlers
const setupClientHandlers = require('../backend/ipc/client.handlers')
// Import invoice handlers
const setupInvoiceHandlers = require('../backend/ipc/invoice.handlers')
// Import product handlers
const setupProductHandlers = require('../backend/ipc/product.handlers')
// Import product type handlers
const setupProductTypeHandlers = require('../backend/ipc/productType.handlers')
// Import product unit handlers
const setupProductUnitHandlers = require('../backend/ipc/productUnit.handlers')
// Import return handlers
const setupReturnHandlers = require('../backend/ipc/return.handlers')
// Import sale handlers
const setupSaleHandlers = require('../backend/ipc/sale.handlers')
// Import sale item handlers
const setupSaleItemHandlers = require('../backend/ipc/saleItem.handlers')
// Import supplier handlers
const setupSupplierHandlers = require('../backend/ipc/supplier.handlers')
// Import todo handlers
const setupTodoHandlers = require('../backend/ipc/todo.handlers')

let mainWindow = null
let popupWindow = null

function createPopupWindow() {
  try {
    popupWindow = new BrowserWindow({
      width: 800,
      height: 500,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'dist/preload.js'),
        webSecurity: process.env.NODE_ENV === 'production' // Disable web security in development
      },
      parent: mainWindow,
      modal: true,
      show: false,
      backgroundColor: '#1a1a1a',
      titleBarStyle: 'hidden',
      frame: false,
      resizable: true,
      minimizable: true,
      maximizable: true,
      fullscreenable: false,
      allowRunningInsecureContent: process.env.NODE_ENV === 'development'
    })

    // Load the popup content using the Vue router path
    popupWindow.loadURL('http://localhost:5173/#/product-form-popup');

    // Wait for the page to load before showing
    popupWindow.webContents.on('did-finish-load', () => {
      console.log('Popup window loaded successfully');
      // Add a small delay to ensure the Vue app is ready
      setTimeout(() => {
        popupWindow.show();
      }, 100);
    });

    popupWindow.on('closed', () => {
      console.log('Popup window closed');
      popupWindow = null;
    });

    popupWindow.on('error', (error) => {
      console.error('Popup window error:', error);
      if (popupWindow) {
        popupWindow.close();
      }
    });

    // Debug preload script loading
    popupWindow.webContents.on('preload-error', (event, preloadPath, error) => {
      console.error('Preload script error:', error);
    });

    // Debug navigation errors
    popupWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorCode, errorDescription);
    });

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      popupWindow.webContents.openDevTools();
    }
  } catch (error) {
    console.error('Error creating popup window:', error);
    if (popupWindow) {
      popupWindow.close();
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: process.env.NODE_ENV === 'production', // Disable web security in development
      allowRunningInsecureContent: process.env.NODE_ENV === 'development'
    },
  })

  // Create context menu
  const contextMenu = new Menu()
  contextMenu.append(new MenuItem({ 
    label: 'Inspect Element',
    click: () => {
      mainWindow.webContents.inspectElement(rightClickPosition.x, rightClickPosition.y)
    }
  }))

  let rightClickPosition = { x: 0, y: 0 }

  // Add context menu event listener
  mainWindow.webContents.on('context-menu', (event, params) => {
    rightClickPosition = { x: params.x, y: params.y }
    contextMenu.popup()
  })

  // Create the default menu template
  const template = [
    ...(process.platform === 'darwin' ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(process.platform === 'darwin' ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Language',
          submenu: [
            {
              label: 'English',
              type: 'radio',
              checked: true,
              click: () => {
                mainWindow.webContents.send('change-language', 'en')
              }
            },
            {
              label: 'Français',
              type: 'radio',
              click: () => {
                mainWindow.webContents.send('change-language', 'fr')
              }
            }
          ]
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://your-documentation-url.com')
          }
        },
        {
          label: 'Report Issue',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://your-issue-tracker-url.com')
          }
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => {
            mainWindow.webContents.send('show-about')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // Load the local URL for development
  mainWindow.loadURL('http://localhost:5173')

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  // Setup IPC handlers
  setupAuthHandlers()
  setupCategoryHandlers()
  setupClientHandlers()
  setupInvoiceHandlers()
  setupProductHandlers()
  setupProductTypeHandlers()
  setupProductUnitHandlers()
  setupReturnHandlers()
  setupSaleHandlers()
  setupSaleItemHandlers()
  setupSupplierHandlers()
  setupTodoHandlers()

  // Setup popup window IPC handlers
  ipcMain.on('open-product-form', (event, data) => {
    try {
      if (!popupWindow) {
        createPopupWindow()
      }
    } catch (error) {
      console.error('Error handling open-product-form:', error)
      event.reply('product-form-error', error.message)
    }
  })

  ipcMain.on('close-popup', () => {
    try {
      if (popupWindow) {
        popupWindow.close()
      }
    } catch (error) {
      console.error('Error closing popup:', error)
    }
  })

  ipcMain.on('submit-product-form', (event, data) => {
    try {
      mainWindow.webContents.send('product-form-submitted', data)
      if (popupWindow) {
        popupWindow.close()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      event.reply('product-form-error', error.message)
    }
  })

  return mainWindow
}

const appServer = express()
const port = 3010 // Choose a port for your server

// Middleware to parse JSON requests
appServer.use(express.json())

// Define a route to get todos
appServer.get('/todos', async (req, res) => {
  try {
    const todos = await ipcRenderer.invoke('get-todos') // Use IPC to get todos
    res.json(todos) // Send todos as JSON response
  } catch (error) {
    res.status(500).json({ error: 'Error fetching todos' })
  }
})

// Start the server
appServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})