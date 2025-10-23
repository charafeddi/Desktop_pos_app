import { useProductStore } from '@/stores/product.store'
import { useSalesStore } from '@/stores/sales.store'
import useCustomerStore from '@/stores/customers.store'
import { useCategoryStore } from '@/stores/category.store'
import { useSupplierStore } from '@/stores/supplier.store'
import { useAnalyticsStore } from '@/stores/analytics.store'
import { useTodoStore } from '@/stores/todo.store'
import { useSettingsStore } from '@/stores/settings.store'

// Global refresh handler
export class RefreshHandler {
  private static instance: RefreshHandler
  private isRefreshing = false

  public static getInstance(): RefreshHandler {
    if (!RefreshHandler.instance) {
      RefreshHandler.instance = new RefreshHandler()
    }
    return RefreshHandler.instance
  }

  public async refreshAll(): Promise<void> {
    if (this.isRefreshing) {
      console.log('Refresh already in progress, skipping...')
      return
    }

    this.isRefreshing = true
    console.log('Starting global app refresh...')

    try {
      // Get all store instances
      const productStore = useProductStore()
      const salesStore = useSalesStore()
      const customerStore = useCustomerStore()
      const categoryStore = useCategoryStore()
      const supplierStore = useSupplierStore()
      const analyticsStore = useAnalyticsStore()
      const todoStore = useTodoStore()
      const settingsStore = useSettingsStore()

      // Refresh all stores in parallel
      await Promise.all([
        productStore.getAllProducts(true).catch(err => console.error('Error refreshing products:', err)), // Force refresh
        salesStore.fetchSales().catch(err => console.error('Error refreshing sales:', err)),
        customerStore.fetchCustomers().catch(err => console.error('Error refreshing customers:', err)),
        categoryStore.fetchCategories().catch(err => console.error('Error refreshing categories:', err)),
        supplierStore.fetchSuppliers().catch(err => console.error('Error refreshing suppliers:', err)),
        analyticsStore.fetchAnalyticsData().catch(err => console.error('Error refreshing analytics:', err)),
        todoStore.fetchTodos().catch(err => console.error('Error refreshing todos:', err)),
        settingsStore.loadSettings().catch(err => console.error('Error refreshing settings:', err))
      ])

      console.log('Global app refresh completed successfully')
      
      // Show success notification
      this.showNotification('App data refreshed successfully!', 'success')
      
    } catch (error) {
      console.error('Error during global refresh:', error)
      this.showNotification('Error refreshing app data. Please try again.', 'error')
    } finally {
      this.isRefreshing = false
    }
  }

  public async refreshProducts(): Promise<void> {
    try {
      const productStore = useProductStore()
      await productStore.getAllProducts(true) // Force refresh
      console.log('Products refreshed')
    } catch (error) {
      console.error('Error refreshing products:', error)
    }
  }

  public async refreshSales(): Promise<void> {
    try {
      const salesStore = useSalesStore()
      await salesStore.fetchSales()
      console.log('Sales refreshed')
    } catch (error) {
      console.error('Error refreshing sales:', error)
    }
  }

  public async refreshCustomers(): Promise<void> {
    try {
      const customerStore = useCustomerStore()
      await customerStore.fetchCustomers()
      console.log('Customers refreshed')
    } catch (error) {
      console.error('Error refreshing customers:', error)
    }
  }

  public async refreshCategories(): Promise<void> {
    try {
      const categoryStore = useCategoryStore()
      await categoryStore.fetchCategories()
      console.log('Categories refreshed')
    } catch (error) {
      console.error('Error refreshing categories:', error)
    }
  }

  public async refreshSuppliers(): Promise<void> {
    try {
      const supplierStore = useSupplierStore()
      await supplierStore.fetchSuppliers()
      console.log('Suppliers refreshed')
    } catch (error) {
      console.error('Error refreshing suppliers:', error)
    }
  }

  public async refreshAnalytics(): Promise<void> {
    try {
      const analyticsStore = useAnalyticsStore()
      await analyticsStore.fetchAnalyticsData()
      console.log('Analytics refreshed')
    } catch (error) {
      console.error('Error refreshing analytics:', error)
    }
  }

  public async refreshTodos(): Promise<void> {
    try {
      const todoStore = useTodoStore()
      await todoStore.fetchTodos()
      console.log('Todos refreshed')
    } catch (error) {
      console.error('Error refreshing todos:', error)
    }
  }

  public async refreshSettings(): Promise<void> {
    try {
      const settingsStore = useSettingsStore()
      await settingsStore.loadSettings()
      console.log('Settings refreshed')
    } catch (error) {
      console.error('Error refreshing settings:', error)
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Create a simple notification element
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `

    // Set background color based on type
    switch (type) {
      case 'success':
        notification.style.backgroundColor = '#10b981'
        break
      case 'error':
        notification.style.backgroundColor = '#ef4444'
        break
      default:
        notification.style.backgroundColor = '#3b82f6'
    }

    notification.textContent = message
    document.body.appendChild(notification)

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }
}

// Initialize refresh handler and set up event listeners
export function initializeRefreshHandler(): void {
  const refreshHandler = RefreshHandler.getInstance()

  // Set up IPC event listeners
  if (window.electronAPI) {
    // Listen for refresh start event
    window.electronAPI.onRefreshStart(() => {
      console.log('Refresh started from context menu')
    })

    // Listen for refresh complete event
    window.electronAPI.onRefreshComplete(() => {
      console.log('Refresh completed from context menu')
    })

    // Listen for refresh error event
    window.electronAPI.onRefreshError((error: string) => {
      console.error('Refresh error from context menu:', error)
      refreshHandler.showNotification(`Refresh error: ${error}`, 'error')
    })

    // Listen for individual refresh events
    window.electronAPI.onRefreshProducts(() => refreshHandler.refreshProducts())
    window.electronAPI.onRefreshSales(() => refreshHandler.refreshSales())
    window.electronAPI.onRefreshCustomers(() => refreshHandler.refreshCustomers())
    window.electronAPI.onRefreshCategories(() => refreshHandler.refreshCategories())
    window.electronAPI.onRefreshSuppliers(() => refreshHandler.refreshSuppliers())
    window.electronAPI.onRefreshAnalytics(() => refreshHandler.refreshAnalytics())
    window.electronAPI.onRefreshTodos(() => refreshHandler.refreshTodos())
    window.electronAPI.onRefreshSettings(() => refreshHandler.refreshSettings())

    console.log('Refresh handler initialized with IPC listeners')
  } else {
    console.warn('ElectronAPI not available, refresh handler initialized without IPC listeners')
  }
}

// Clean up event listeners
export function cleanupRefreshHandler(): void {
  if (window.electronAPI) {
    window.electronAPI.removeRefreshListeners()
    console.log('Refresh handler cleaned up')
  }
}
