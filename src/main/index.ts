import { app, BrowserWindow, Menu } from 'electron'
import path from 'path'

function createWindow() {
  // Create the window first
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    frame: true,
    autoHideMenuBar: true,
    title: 'POS System',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true
    }
  })

  // Remove menu in multiple ways to ensure it's gone
  Menu.setApplicationMenu(null)
  mainWindow.setMenu(null)
  mainWindow.removeMenu()

  // Load content
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Handle menu visibility after window is ready
  mainWindow.once('ready-to-show', () => {
    // Ensure menu is removed again after window is ready
    mainWindow.removeMenu()
    mainWindow.setMenu(null)
    mainWindow.setMenuBarVisibility(false)
    
    // Show the window
    mainWindow.show()
    mainWindow.webContents.openDevTools()
  })

  // Handle menu visibility when window is focused
  mainWindow.on('focus', () => {
    mainWindow.setMenuBarVisibility(false)
    mainWindow.setAutoHideMenuBar(true)
  })

  return mainWindow
}

// Remove application menu before creating any windows
app.on('ready', () => {
  Menu.setApplicationMenu(null)
})

// Create window when app is ready
app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
}) 