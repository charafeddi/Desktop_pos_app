// Toast Manager Service
// Centralized service for managing toast notifications across the application

import { ref } from 'vue'

export interface ToastOptions {
  message: string
  details?: string
  duration?: number
  persistent?: boolean
}

class ToastManager {
  private static instance: ToastManager
  private toastComponent: any = null

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager()
    }
    return ToastManager.instance
  }

  public setToastComponent(component: any) {
    this.toastComponent = component
  }

  public success(message: string, details?: string, duration?: number) {
    this.showToast('success', message, details, duration)
  }

  public error(message: string, details?: string, duration?: number) {
    this.showToast('error', message, details, duration)
  }

  public warning(message: string, details?: string, duration?: number) {
    this.showToast('warning', message, details, duration)
  }

  public info(message: string, details?: string, duration?: number) {
    this.showToast('info', message, details, duration)
  }

  private showToast(type: string, message: string, details?: string, duration?: number) {
    if (this.toastComponent && this.toastComponent.addToast) {
      this.toastComponent.addToast(type, message, details, duration)
    } else {
      console.warn('Toast component not initialized')
      // Fallback to console for development
      console.log(`[${type.toUpperCase()}] ${message}`, details || '')
    }
  }

  // Convenience methods for common scenarios
  public operationSuccess(operation: string, count?: number) {
    const message = count 
      ? `${operation} completed successfully for ${count} items`
      : `${operation} completed successfully`
    this.success(message)
  }

  public operationError(operation: string, error?: string) {
    const message = `${operation} failed`
    this.error(message, error)
  }

  public validationError(field: string, message: string) {
    this.error(`Validation Error: ${field}`, message)
  }

  public networkError(operation?: string) {
    const message = operation 
      ? `Network error during ${operation}`
      : 'Network connection error'
    this.error(message, 'Please check your internet connection and try again')
  }

  public saveSuccess(item: string) {
    this.success(`${item} saved successfully`)
  }

  public deleteSuccess(item: string, count?: number) {
    const message = count 
      ? `${count} ${item}s deleted successfully`
      : `${item} deleted successfully`
    this.success(message)
  }

  public bulkOperationSuccess(operation: string, count: number) {
    this.success(`Bulk ${operation} completed`, `${count} items updated successfully`)
  }

  public bulkOperationError(operation: string, error: string) {
    this.error(`Bulk ${operation} failed`, error)
  }

  public loadingStart(operation: string) {
    this.info(`${operation} in progress...`, 'Please wait')
  }

  public loadingComplete(operation: string) {
    this.success(`${operation} completed`)
  }
}

// Export singleton instance
export const toastManager = ToastManager.getInstance()

// Vue composable for easy use in components
export function useToast() {
  return {
    success: (message: string, details?: string, duration?: number) => 
      toastManager.success(message, details, duration),
    error: (message: string, details?: string, duration?: number) => 
      toastManager.error(message, details, duration),
    warning: (message: string, details?: string, duration?: number) => 
      toastManager.warning(message, details, duration),
    info: (message: string, details?: string, duration?: number) => 
      toastManager.info(message, details, duration),
    
    // Convenience methods
    operationSuccess: (operation: string, count?: number) => 
      toastManager.operationSuccess(operation, count),
    operationError: (operation: string, error?: string) => 
      toastManager.operationError(operation, error),
    validationError: (field: string, message: string) => 
      toastManager.validationError(field, message),
    networkError: (operation?: string) => 
      toastManager.networkError(operation),
    saveSuccess: (item: string) => 
      toastManager.saveSuccess(item),
    deleteSuccess: (item: string, count?: number) => 
      toastManager.deleteSuccess(item, count),
    bulkOperationSuccess: (operation: string, count: number) => 
      toastManager.bulkOperationSuccess(operation, count),
    bulkOperationError: (operation: string, error: string) => 
      toastManager.bulkOperationError(operation, error),
    loadingStart: (operation: string) => 
      toastManager.loadingStart(operation),
    loadingComplete: (operation: string) => 
      toastManager.loadingComplete(operation)
  }
}
