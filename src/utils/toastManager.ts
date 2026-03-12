// Toast Manager Service
// Centralized service for managing toast notifications across the application

export interface ToastOptions {
  message: string
  details?: string
  duration?: number
  persistent?: boolean
}

class ToastManager {
  private static instance: ToastManager
  private toastComponent: any = null
  private recentToasts = new Map<string, number>()
  private sessionToasts = new Set<string>()
  private readonly duplicateWindowMs = 5000

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
    const normalizedMessage = (message || '').trim()
    const normalizedDetails = (details || '').trim()
    if (!normalizedMessage) {
      return
    }

    if (this.shouldSuppressNavigationToast(type, normalizedMessage, normalizedDetails)) {
      return
    }

    const toastKey = `${type}|${normalizedMessage}|${normalizedDetails}`
    const now = Date.now()
    const lastShownAt = this.recentToasts.get(toastKey)

    // Prevent rapid duplicate toasts.
    if (lastShownAt && now - lastShownAt < this.duplicateWindowMs) {
      return
    }

    // "Loading/Loaded" messages should appear only once per session.
    if (this.isInitialLoadingToast(type, normalizedMessage, normalizedDetails)) {
      if (this.sessionToasts.has(toastKey)) {
        return
      }
      this.sessionToasts.add(toastKey)
    }

    this.recentToasts.set(toastKey, now)
    this.cleanupRecentToasts(now)

    if (this.toastComponent && this.toastComponent.addToast) {
      this.toastComponent.addToast(type, normalizedMessage, normalizedDetails || undefined, duration)
    } else {
      console.warn('Toast component not initialized')
      // Fallback to console for development
      console.log(`[${type.toUpperCase()}] ${normalizedMessage}`, normalizedDetails || '')
    }
  }

  private isInitialLoadingToast(type: string, message: string, details?: string): boolean {
    const content = `${message} ${details || ''}`.toLowerCase()

    // Info/success data-loading messages — show at most once per session
    if ((type === 'info' || type === 'success') && /loading|loaded|fetching/.test(content)) {
      return true
    }

    // Warning messages about partial/unavailable data during page load — once per session
    if (type === 'warning' && /may not be available|not be available|partial|some .+ (warning|data)/.test(content)) {
      return true
    }

    return false
  }

  private shouldSuppressNavigationToast(type: string, message: string, details?: string): boolean {
    const content = `${message} ${details || ''}`.toLowerCase()

    // Completely suppress all passive data-loading info/success toasts on every navigation
    if ((type === 'info' || type === 'success') && /loading|loaded|fetching|ready|initializing/.test(content)) {
      return true
    }

    // Suppress "Filters Cleared" and similar UI-state toasts that aren't user-action feedback
    if (type === 'info' && /filters cleared|search.*reset|reset.*filter/.test(content)) {
      return true
    }

    return false
  }

  private cleanupRecentToasts(now: number) {
    const maxAge = 60000
    for (const [key, timestamp] of this.recentToasts.entries()) {
      if (now - timestamp > maxAge) {
        this.recentToasts.delete(key)
      }
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
