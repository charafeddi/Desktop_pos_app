const { app, BrowserWindow, Menu, MenuItem } = require('electron')
const path = require('path')

// Import auth handlers
const setupAuthHandlers = require('../backend/ipc/auth.handlers')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
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

  return mainWindow
}

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