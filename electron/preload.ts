import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

// Define types for our IPC channels
type ValidChannels = 'toMain' | 'fromMain' | 'close-popup' | 'submit-product-form' | 'product-form-submitted';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // General IPC methods
    send: (channel: ValidChannels, data: unknown) => {
      // whitelist channels
      let validChannels = ['toMain']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      }
    },
    receive: (channel: ValidChannels, func: (...args: unknown[]) => void) => {
      let validChannels = ['fromMain']
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (_event: IpcRendererEvent, ...args: unknown[]) => func(...args))
      }
    },

    // Product form popup specific methods
    closePopup: () => {
      ipcRenderer.send('close-popup')
    },
    submitProductForm: (data: unknown) => {
      ipcRenderer.send('submit-product-form', data)
    },
    onFormSubmitted: (callback: (data: unknown) => void) => {
      ipcRenderer.on('product-form-submitted', (_event: IpcRendererEvent, data: unknown) => callback(data))
    }
  }
) 