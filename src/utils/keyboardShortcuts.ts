import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme.store'

// Keyboard shortcut definitions
export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  action: () => void
  category: string
}

export class KeyboardShortcutManager {
  private static instance: KeyboardShortcutManager
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private router: any = null
  private themeStore: any = null
  private isEnabled: boolean = true
  private showHelp: boolean = false

  public static getInstance(): KeyboardShortcutManager {
    if (!KeyboardShortcutManager.instance) {
      KeyboardShortcutManager.instance = new KeyboardShortcutManager()
    }
    return KeyboardShortcutManager.instance
  }

  public initialize(router: any, themeStore: any) {
    this.router = router
    this.themeStore = themeStore
    this.setupShortcuts()
    this.bindEvents()
  }

  private setupShortcuts() {
    // Navigation shortcuts
    this.addShortcut({
      key: '1',
      ctrlKey: true,
      description: 'Go to Dashboard',
      action: () => this.router?.push('/'),
      category: 'Navigation'
    })

    this.addShortcut({
      key: '2',
      ctrlKey: true,
      description: 'Go to Products',
      action: () => this.router?.push('/product'),
      category: 'Navigation'
    })

    this.addShortcut({
      key: '3',
      ctrlKey: true,
      description: 'Go to POS (Point of Sale)',
      action: () => this.router?.push('/pos'),
      category: 'Navigation'
    })

    this.addShortcut({
      key: '4',
      ctrlKey: true,
      description: 'Go to Sales',
      action: () => this.router?.push('/sales'),
      category: 'Navigation'
    })

    this.addShortcut({
      key: '5',
      ctrlKey: true,
      description: 'Go to Customers',
      action: () => this.router?.push('/customers'),
      category: 'Navigation'
    })

    this.addShortcut({
      key: '6',
      ctrlKey: true,
      description: 'Go to Categories',
      action: () => this.router?.push('/category'),
      category: 'Navigation'
    })

    this.addShortcut({
      key: '7',
      ctrlKey: true,
      description: 'Go to Suppliers',
      action: () => this.router?.push('/supplier'),
      category: 'Navigation'
    })

    this.addShortcut({
      key: '8',
      ctrlKey: true,
      description: 'Go to Analytics',
      action: () => this.router?.push('/analytics'),
      category: 'Navigation'
    })

    this.addShortcut({
      key: '9',
      ctrlKey: true,
      description: 'Go to Settings',
      action: () => this.router?.push('/settings'),
      category: 'Navigation'
    })

    this.addShortcut({
      key: '0',
      ctrlKey: true,
      description: 'Go to Todo List',
      action: () => this.router?.push('/todo'),
      category: 'Navigation'
    })

    // Product Management shortcuts
    this.addShortcut({
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
      description: 'Add New Product',
      action: () => this.triggerEvent('add-product'),
      category: 'Products'
    })

    this.addShortcut({
      key: 't',
      ctrlKey: true,
      shiftKey: true,
      description: 'Manage Product Types',
      action: () => this.router?.push('/product-types'),
      category: 'Products'
    })

    this.addShortcut({
      key: 'u',
      ctrlKey: true,
      shiftKey: true,
      description: 'Manage Product Units',
      action: () => this.router?.push('/product-units'),
      category: 'Products'
    })

    // POS shortcuts
    this.addShortcut({
      key: 'n',
      ctrlKey: true,
      description: 'New Sale (Go to POS)',
      action: () => this.router?.push('/pos'),
      category: 'POS'
    })

    this.addShortcut({
      key: 'Enter',
      ctrlKey: true,
      description: 'Complete Sale (in POS)',
      action: () => this.triggerEvent('complete-sale'),
      category: 'POS'
    })

    this.addShortcut({
      key: 'Escape',
      description: 'Cancel Current Operation',
      action: () => this.triggerEvent('cancel-operation'),
      category: 'POS'
    })

    // General shortcuts
    this.addShortcut({
      key: 'r',
      ctrlKey: true,
      description: 'Refresh App Data',
      action: () => this.triggerEvent('refresh-app'),
      category: 'General'
    })

    this.addShortcut({
      key: 's',
      ctrlKey: true,
      description: 'Save Current Data',
      action: () => this.triggerEvent('save-data'),
      category: 'General'
    })

    this.addShortcut({
      key: 'f',
      ctrlKey: true,
      description: 'Focus Search',
      action: () => this.triggerEvent('focus-search'),
      category: 'General'
    })

    this.addShortcut({
      key: 'h',
      ctrlKey: true,
      description: 'Toggle Help (Keyboard Shortcuts)',
      action: () => this.toggleHelp(),
      category: 'General'
    })

    // Theme shortcuts
    this.addShortcut({
      key: 'd',
      ctrlKey: true,
      shiftKey: true,
      description: 'Toggle Dark/Light Mode',
      action: () => this.themeStore?.toggleTheme(),
      category: 'Theme'
    })

    // Quick actions
    this.addShortcut({
      key: 'q',
      ctrlKey: true,
      description: 'Quick Add Customer',
      action: () => this.triggerEvent('quick-add-customer'),
      category: 'Quick Actions'
    })

    this.addShortcut({
      key: 'i',
      ctrlKey: true,
      description: 'Quick Inventory Check',
      action: () => this.router?.push('/inventory'),
      category: 'Quick Actions'
    })

    // Print shortcuts
    this.addShortcut({
      key: 'p',
      ctrlKey: true,
      description: 'Print Receipt',
      action: () => this.triggerEvent('print-receipt'),
      category: 'Print'
    })

    // Export shortcuts
    this.addShortcut({
      key: 'e',
      ctrlKey: true,
      shiftKey: true,
      description: 'Export Data',
      action: () => this.triggerEvent('export-data'),
      category: 'Export'
    })
  }

  private addShortcut(shortcut: KeyboardShortcut) {
    const key = this.generateKey(shortcut)
    this.shortcuts.set(key, shortcut)
  }

  private generateKey(shortcut: KeyboardShortcut): string {
    const modifiers = []
    if (shortcut.ctrlKey) modifiers.push('ctrl')
    if (shortcut.shiftKey) modifiers.push('shift')
    if (shortcut.altKey) modifiers.push('alt')
    if (shortcut.metaKey) modifiers.push('meta')
    
    return `${modifiers.join('+')}+${shortcut.key.toLowerCase()}`
  }

  private bindEvents() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.isEnabled) return

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return
    }

    const key = this.generateKey({
      key: event.key,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      description: '',
      action: () => {},
      category: ''
    })

    const shortcut = this.shortcuts.get(key)
    if (shortcut) {
      event.preventDefault()
      event.stopPropagation()
      
      try {
        shortcut.action()
        this.showShortcutNotification(shortcut.description)
      } catch (error) {
        console.error('Error executing shortcut:', error)
      }
    }
  }

  private triggerEvent(eventName: string, data?: any) {
    const customEvent = new CustomEvent(eventName, { detail: data })
    window.dispatchEvent(customEvent)
  }

  private showShortcutNotification(message: string) {
    // Create notification element
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 16px;
      background-color: var(--color-primary);
      color: white;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
    `

    notification.textContent = message
    document.body.appendChild(notification)

    // Auto remove after 2 seconds
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transform = 'translateX(-50%) translateY(-20px)'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 2000)
  }

  private toggleHelp() {
    this.showHelp = !this.showHelp
    if (this.showHelp) {
      this.showShortcutsHelp()
    } else {
      this.hideShortcutsHelp()
    }
  }

  private showShortcutsHelp() {
    // Create help modal
    const modal = document.createElement('div')
    modal.id = 'shortcuts-help-modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    const modalContent = document.createElement('div')
    modalContent.style.cssText = `
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `

    // Group shortcuts by category
    const categories = new Map<string, KeyboardShortcut[]>()
    this.shortcuts.forEach(shortcut => {
      if (!categories.has(shortcut.category)) {
        categories.set(shortcut.category, [])
      }
      categories.get(shortcut.category)!.push(shortcut)
    })

    let html = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: var(--color-text);">Keyboard Shortcuts</h2>
        <button id="close-help" style="background: none; border: none; color: var(--color-text); font-size: 24px; cursor: pointer;">&times;</button>
      </div>
    `

    categories.forEach((shortcuts, category) => {
      html += `
        <div style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: var(--color-text); font-size: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">${category}</h3>
          <div style="display: grid; gap: 8px;">
      `
      
      shortcuts.forEach(shortcut => {
        const keyDisplay = this.formatKeyDisplay(shortcut)
        html += `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
            <span style="color: var(--color-text-secondary);">${shortcut.description}</span>
            <kbd style="background-color: var(--color-background); border: 1px solid var(--color-border); border-radius: 4px; padding: 4px 8px; font-size: 12px; color: var(--color-text);">${keyDisplay}</kbd>
          </div>
        `
      })
      
      html += `
          </div>
        </div>
      `
    })

    html += `
      <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--color-border);">
        <p style="margin: 0; color: var(--color-text-secondary); font-size: 14px;">Press Ctrl+H to toggle this help</p>
      </div>
    `

    modalContent.innerHTML = html
    modal.appendChild(modalContent)
    document.body.appendChild(modal)

    // Close button functionality
    const closeBtn = modalContent.querySelector('#close-help')
    closeBtn?.addEventListener('click', () => {
      this.hideShortcutsHelp()
    })

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideShortcutsHelp()
      }
    })

    // Close on Escape key
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hideShortcutsHelp()
        document.removeEventListener('keydown', escapeHandler)
      }
    }
    document.addEventListener('keydown', escapeHandler)
  }

  private hideShortcutsHelp() {
    const modal = document.getElementById('shortcuts-help-modal')
    if (modal) {
      modal.remove()
      this.showHelp = false
    }
  }

  private formatKeyDisplay(shortcut: KeyboardShortcut): string {
    const parts = []
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.shiftKey) parts.push('Shift')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.metaKey) parts.push('Cmd')
    
    // Format special keys
    let key = shortcut.key
    if (key === ' ') key = 'Space'
    if (key === 'Enter') key = 'Enter'
    if (key === 'Escape') key = 'Esc'
    if (key === 'ArrowUp') key = '↑'
    if (key === 'ArrowDown') key = '↓'
    if (key === 'ArrowLeft') key = '←'
    if (key === 'ArrowRight') key = '→'
    
    parts.push(key)
    return parts.join(' + ')
  }

  public enable() {
    this.isEnabled = true
  }

  public disable() {
    this.isEnabled = false
  }

  public getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
  }

  public getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(s => s.category === category)
  }
}

// Export singleton instance
export const keyboardShortcuts = KeyboardShortcutManager.getInstance()
