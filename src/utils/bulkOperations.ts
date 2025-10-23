// Bulk Operations Utility
// This utility handles bulk operations for products in a maintainable way

export interface BulkOperation {
  id: string
  name: string
  description: string
  icon: string
  requiresConfirmation: boolean
  action: (selectedIds: number[], data?: any) => Promise<void>
}

export interface BulkEditData {
  category_id?: number
  product_type_id?: number
  product_unit_id?: number
  supplier_id?: number
  status?: string
  tax_rate?: number
  min_stock_level?: number
  max_stock_level?: number
  // Price operations
  priceOperation?: 'set' | 'increase' | 'decrease'
  priceValue?: number
  priceField?: 'purchase_price' | 'selling_price'
}

export class BulkOperationsManager {
  private static instance: BulkOperationsManager
  private operations: Map<string, BulkOperation> = new Map()

  public static getInstance(): BulkOperationsManager {
    if (!BulkOperationsManager.instance) {
      BulkOperationsManager.instance = new BulkOperationsManager()
    }
    return BulkOperationsManager.instance
  }

  public initialize() {
    this.registerDefaultOperations()
  }

  private registerDefaultOperations() {
    // Bulk Edit Operation
    this.registerOperation({
      id: 'bulk-edit',
      name: 'Bulk Edit',
      description: 'Edit multiple products at once',
      icon: 'edit',
      requiresConfirmation: false,
      action: async (selectedIds: number[], data: BulkEditData) => {
        await this.performBulkEdit(selectedIds, data)
      }
    })

    // Bulk Delete Operation
    this.registerOperation({
      id: 'bulk-delete',
      name: 'Delete Products',
      description: 'Delete selected products permanently',
      icon: 'delete',
      requiresConfirmation: true,
      action: async (selectedIds: number[]) => {
        await this.performBulkDelete(selectedIds)
      }
    })

    // Bulk Status Change
    this.registerOperation({
      id: 'bulk-status',
      name: 'Change Status',
      description: 'Change status of selected products',
      icon: 'toggle_on',
      requiresConfirmation: false,
      action: async (selectedIds: number[], data: { status: string }) => {
        await this.performBulkStatusChange(selectedIds, data.status)
      }
    })

    // Bulk Export
    this.registerOperation({
      id: 'bulk-export',
      name: 'Export Products',
      description: 'Export selected products to CSV',
      icon: 'download',
      requiresConfirmation: false,
      action: async (selectedIds: number[]) => {
        await this.performBulkExport(selectedIds)
      }
    })
  }

  public registerOperation(operation: BulkOperation) {
    this.operations.set(operation.id, operation)
  }

  public getOperation(id: string): BulkOperation | undefined {
    return this.operations.get(id)
  }

  public getAllOperations(): BulkOperation[] {
    return Array.from(this.operations.values())
  }

  public async executeOperation(operationId: string, selectedIds: number[], data?: any): Promise<void> {
    const operation = this.getOperation(operationId)
    if (!operation) {
      throw new Error(`Operation ${operationId} not found`)
    }

    if (selectedIds.length === 0) {
      throw new Error('No products selected')
    }

    await operation.action(selectedIds, data)
  }

  private async performBulkEdit(selectedIds: number[], data: BulkEditData): Promise<void> {
    try {
      // Call the backend to perform bulk edit
      const result = await window.electronAPI.bulkUpdateProducts(selectedIds, data)
      
      if (result.success) {
        // Dispatch event to refresh products
        window.dispatchEvent(new CustomEvent('products-updated'))
        console.log(`Successfully updated ${result.updatedCount} products`)
      } else {
        throw new Error(result.error || 'Bulk edit failed')
      }
    } catch (error) {
      console.error('Bulk edit error:', error)
      throw error
    }
  }

  private async performBulkDelete(selectedIds: number[]): Promise<void> {
    try {
      const result = await window.electronAPI.bulkDeleteProducts(selectedIds)
      
      if (result.success) {
        // Dispatch event to refresh products
        window.dispatchEvent(new CustomEvent('products-updated'))
        console.log(`Successfully deleted ${result.deletedCount} products`)
      } else {
        throw new Error(result.error || 'Bulk delete failed')
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      throw error
    }
  }

  private async performBulkStatusChange(selectedIds: number[], status: string): Promise<void> {
    try {
      const result = await window.electronAPI.bulkUpdateProducts(selectedIds, { status })
      
      if (result.success) {
        window.dispatchEvent(new CustomEvent('products-updated'))
        console.log(`Successfully updated status for ${result.updatedCount} products`)
      } else {
        throw new Error(result.error || 'Bulk status change failed')
      }
    } catch (error) {
      console.error('Bulk status change error:', error)
      throw error
    }
  }

  private async performBulkExport(selectedIds: number[]): Promise<void> {
    try {
      const result = await window.electronAPI.exportProducts(selectedIds)
      
      if (result.success) {
        console.log(`Successfully exported ${result.exportedCount} products`)
      } else {
        throw new Error(result.error || 'Bulk export failed')
      }
    } catch (error) {
      console.error('Bulk export error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const bulkOperations = BulkOperationsManager.getInstance()
