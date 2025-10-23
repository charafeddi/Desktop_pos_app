// Global Error Handler Utility
// Centralized error handling for the entire application

import { toastManager } from './toastManager'

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  timestamp?: string
  userAgent?: string
  url?: string
}

export interface ErrorDetails {
  message: string
  code?: string
  stack?: string
  context?: ErrorContext
}

class GlobalErrorHandler {
  private static instance: GlobalErrorHandler
  private errorLog: ErrorDetails[] = []
  private maxLogSize = 100

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler()
    }
    return GlobalErrorHandler.instance
  }

  public initialize() {
    // Global error handlers
    window.addEventListener('error', this.handleGlobalError.bind(this))
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
    
    // Vue error handler
    this.setupVueErrorHandler()
    
    console.log('🛡️ Global Error Handler initialized')
  }

  private handleGlobalError(event: ErrorEvent) {
    const errorDetails: ErrorDetails = {
      message: event.message,
      code: 'GLOBAL_ERROR',
      stack: event.error?.stack,
      context: {
        component: 'Global',
        action: 'JavaScript Error',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }

    this.logError(errorDetails)
    this.showUserFriendlyError(errorDetails)
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    const errorDetails: ErrorDetails = {
      message: event.reason?.message || 'Unhandled Promise Rejection',
      code: 'UNHANDLED_REJECTION',
      stack: event.reason?.stack,
      context: {
        component: 'Global',
        action: 'Promise Rejection',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }

    this.logError(errorDetails)
    this.showUserFriendlyError(errorDetails)
  }

  private setupVueErrorHandler() {
    // This will be called from main.ts to set up Vue error handling
    console.log('Vue error handler setup ready')
  }

  public handleVueError(error: Error, instance: any, info: string) {
    const errorDetails: ErrorDetails = {
      message: error.message,
      code: 'VUE_ERROR',
      stack: error.stack,
      context: {
        component: instance?.$options?.name || 'Unknown Component',
        action: info,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }

    this.logError(errorDetails)
    this.showUserFriendlyError(errorDetails)
  }

  public handleNetworkError(error: any, context?: ErrorContext) {
    const errorDetails: ErrorDetails = {
      message: this.getNetworkErrorMessage(error),
      code: 'NETWORK_ERROR',
      stack: error.stack,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }

    this.logError(errorDetails)
    this.showUserFriendlyError(errorDetails)
  }

  public handleValidationError(field: string, message: string, context?: ErrorContext) {
    const errorDetails: ErrorDetails = {
      message: `Validation Error: ${field} - ${message}`,
      code: 'VALIDATION_ERROR',
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }

    this.logError(errorDetails)
    toastManager.validationError(field, message)
  }

  public handleBusinessLogicError(message: string, context?: ErrorContext) {
    const errorDetails: ErrorDetails = {
      message,
      code: 'BUSINESS_LOGIC_ERROR',
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }

    this.logError(errorDetails)
    toastManager.error(message, 'Please check your input and try again')
  }

  public handleDatabaseError(error: any, operation: string, context?: ErrorContext) {
    const errorDetails: ErrorDetails = {
      message: `Database Error during ${operation}`,
      code: 'DATABASE_ERROR',
      stack: error.stack,
      context: {
        ...context,
        action: operation,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }

    this.logError(errorDetails)
    toastManager.error(`Database operation failed`, `Error during ${operation}. Please try again.`)
  }

  private getNetworkErrorMessage(error: any): string {
    if (error.code === 'NETWORK_ERROR') {
      return 'Network connection failed'
    }
    if (error.status === 404) {
      return 'Resource not found'
    }
    if (error.status === 403) {
      return 'Access denied'
    }
    if (error.status === 500) {
      return 'Server error occurred'
    }
    if (error.status >= 400 && error.status < 500) {
      return 'Request failed'
    }
    if (error.status >= 500) {
      return 'Server error'
    }
    return 'Network error occurred'
  }

  private logError(errorDetails: ErrorDetails) {
    // Add to error log
    this.errorLog.unshift(errorDetails)
    
    // Keep only the most recent errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group('🚨 Error Logged')
      console.error('Message:', errorDetails.message)
      console.error('Code:', errorDetails.code)
      console.error('Context:', errorDetails.context)
      if (errorDetails.stack) {
        console.error('Stack:', errorDetails.stack)
      }
      console.groupEnd()
    }
  }

  private showUserFriendlyError(errorDetails: ErrorDetails) {
    // Don't show toast for validation errors (handled separately)
    if (errorDetails.code === 'VALIDATION_ERROR') {
      return
    }

    // Show appropriate user-friendly message
    switch (errorDetails.code) {
      case 'NETWORK_ERROR':
        toastManager.networkError(errorDetails.context?.action)
        break
      case 'DATABASE_ERROR':
        toastManager.error('Database Error', 'Unable to complete the operation. Please try again.')
        break
      case 'BUSINESS_LOGIC_ERROR':
        toastManager.error('Operation Failed', errorDetails.message)
        break
      case 'VUE_ERROR':
        toastManager.error('Application Error', 'An unexpected error occurred. Please refresh the page.')
        break
      default:
        toastManager.error('Unexpected Error', 'Something went wrong. Please try again.')
    }
  }

  public getErrorLog(): ErrorDetails[] {
    return [...this.errorLog]
  }

  public clearErrorLog() {
    this.errorLog = []
  }

  public exportErrorLog(): string {
    return JSON.stringify(this.errorLog, null, 2)
  }

  public cleanup() {
    window.removeEventListener('error', this.handleGlobalError.bind(this))
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
  }
}

// Export singleton instance
export const globalErrorHandler = GlobalErrorHandler.getInstance()

// Vue composable for easy use in components
export function useErrorHandler() {
  return {
    handleNetworkError: (error: any, context?: ErrorContext) => 
      globalErrorHandler.handleNetworkError(error, context),
    handleValidationError: (field: string, message: string, context?: ErrorContext) => 
      globalErrorHandler.handleValidationError(field, message, context),
    handleBusinessLogicError: (message: string, context?: ErrorContext) => 
      globalErrorHandler.handleBusinessLogicError(message, context),
    handleDatabaseError: (error: any, operation: string, context?: ErrorContext) => 
      globalErrorHandler.handleDatabaseError(error, operation, context),
    getErrorLog: () => globalErrorHandler.getErrorLog(),
    clearErrorLog: () => globalErrorHandler.clearErrorLog(),
    exportErrorLog: () => globalErrorHandler.exportErrorLog()
  }
}
