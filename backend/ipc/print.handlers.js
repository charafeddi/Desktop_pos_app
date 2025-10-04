const { ipcMain } = require('electron')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

// Print utilities
const PrintHandlers = {
  /**
   * Print text receipt to default printer
   */
  async printTextReceipt(receiptText, printerName = null) {
    try {
      // Get temp file path
      const tempDir = require('os').tmpdir()
      const tempFile = path.join(tempDir, `Receipt_${Date.now()}.txt`)
      
      // Write receipt to file
      fs.writeFileSync(tempFile, receiptText, 'utf8')
      
      // Determine print command based on OS
      let printCommand
      
      if (process.platform === 'win32') {
        // Windows: Use notepad or powershell
        const printerCmd = printerName ? `-d "${printerName}"` : ''
        printCommand = `powershell "Get-Content '${tempFile}' | Out-Printer ${printerCmd}"`
      } else if (process.platform === 'darwin') {
        // macOS: Use lpr
        const printerCmd = printerName ? `-P "${printerName}"` : ''
        printCommand = `lpr ${printerCmd} "${tempFile}"`
      } else {
        // Linux: Use lpwrapper or lp
        const printerCmd = printerName ? `-d "${printerName}"` : ''
        printCommand = `lp ${printerCmd} "${tempFile}"`
      }
      
      return new Promise((resolve, reject) => {
        exec(printCommand, (error, stdout, stderr) => {
          // Clean up temp file
          setTimeout(() => {
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile)
            }
          }, 1000)
          
          if (error) {
            console.error('Print error:', error)
            reject({
              success: false,
              message: `Print failed: ${error.message}`,
              error: error.message
            })
          } else {
            console.log('Print success:', stdout)
            resolve({
              success: true,
              message: 'Receipt printed successfully',
              output: stdout
            })
          }
        })
      })
      
    } catch (error) {
      console.error('Print handler error:', error)
      return {
        success: false,
        message: 'Print functionality error',
        error: error.message
      }
    }
  },

  /**
   * Get available printers
   */
  async getAvailablePrinters() {
    try {
      let command
      
      if (process.platform === 'win32') {
        command = 'powershell "Get-WmiObject -Class Win32_Printer | Select-Object Name, Default, PrinterStatus, WorkOffline"'
      } else if (process.platform === 'darwin') {
        command = 'lpstat -p'
      } else {
        command = 'lpstat -p'
      }
      
      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('Error getting printers:', error)
            resolve([])
            return
          }
          
          const printers = []
          
          try {
            if (process.platform === 'win32') {
              // Parse PowerShell output
              const lines = stdout.split('\n').filter(line => line.trim())
              for (const line of lines) {
                const match = line.match(/(Name|Default|PrinterStatus|WorkOffline)\s*:\s*([^\r\n]+)/)
                if (match) {
                  printers.push({
                    name: match[2],
                    default: line.includes('Default : True'),
                    status: 'Online',
                    platform: 'windows'
                  })
                }
              }
            } else {
              // Parse Unix output
              const lines = stdout.split('\n').filter(line => line.includes('printer'))
              for (const line of lines) {
                const parts = line.split(/\s+/)
                if (parts.length >= 2 && parts[0] === 'printer') {
                  printers.push({
                    name: parts[1],
                    default: false,
                    status: parts[3] || 'Unknown',
                    platform: process.platform
                  })
                }
              }
            }
            
            resolve(printers)
          } catch (parseError) {
            console.error('Error parsing printer list:', parseError)
            resolve([])
          }
        })
      })
      
    } catch (error) {
      console.error('Get printers handler error:', error)
      return []
    }
  },

  /**
   * Test print functionality
   */
  async testPrint(printerName = null) {
    try {
      const testReceipt = `
============================
    TEST PRINT RECEIPT
============================

Company: POS System Test
Date: ${new Date().toLocaleString()}
Time: ${new Date().toLocaleTimeString()}

This is a test print to verify
that your printer is working
correctly with the POS system.

Printer: ${printerName || 'Default Printer'}

============================
If you can read this, printing
is working correctly!
============================
`

      return await PrintHandlers.printTextReceipt(testReceipt, printerName)
      
    } catch (error) {
      return {
        success: false,
        message: 'Test print failed',
        error: error.message
      }
    }
  }
}

// Register IPC handlers
function setupPrintHandlers() {
  console.log('Setting up print handlers...')
  
  /**
   * Print receipt handler
   */
  ipcMain.handle('print-receipt', async (event, { receiptText, printerName }) => {
    try {
      console.log('Print receipt requested:', { receiptText: receiptText.substring(0, 100) + '...', printerName })
      return await PrintHandlers.printTextReceipt(receiptText, printerName)
    } catch (error) {
      console.error('Print receipt handler error:', error)
      return {
        success: false,
        message: 'Failed to print receipt',
        error: error.message
      }
    }
  })

  /**
   * Get available printers handler
   */
  ipcMain.handle('get-printers',
    async (event) => {
      try {
        console.log('Get printers requested')
        const printers = await PrintHandlers.getAvailablePrinters()
        return {
          success: true,
          printers: printers
        }
      } catch (error) {
        console.error('Get printers handler error:', error)
        return {
          success: false,
          printers: [],
          message: 'Failed to get printers',
          error: error.message
        }
      }
    }
  )

  /**
   * Test print handler
   */
  ipcMain.handle('test-print', async (event, { printerName }) => {
    try {
      console.log('Test print requested for:', printerName)
      return await PrintHandlers.testPrint(printerName)
    } catch (error) {
      console.error('Test print handler error:', error)
      return {
        success: false,
        message: 'Test print failed',
        error: error.message
      }
    }
  })

  console.log('Print handlers setup complete')
}

module.exports = setupPrintHandlers
