/**
 * Currency formatting utility
 * Uses the currency settings from the settings store to format values
 */

import { useSettingsStore } from '@/stores/settings.store'

/**
 * Format a number as currency using the current currency settings
 * @param value - The value to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value == null || value === '') {
    return formatCurrency(0)
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return formatCurrency(0)
  }

  // Get currency settings from store
  const settingsStore = useSettingsStore()
  const currency = settingsStore.getCurrency || { code: 'USD', symbol: '$', name: 'US Dollar' }

  // Format using the currency code for Intl.NumberFormat
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency?.code || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue)

  // If the currency uses a custom symbol that's different from the code, replace it
  if (currency?.symbol && currency.symbol !== currency.code) {
    // Replace the default symbol with the custom symbol
    // This is a simple approach - for production, you might want to use a more robust solution
    const currencySymbol = formatted.match(/[^\d.,\s]+/)?.[0] || ''
    return formatted.replace(currencySymbol, currency.symbol)
  }

  return formatted
}

/**
 * Get the currency symbol
 * @returns The currency symbol
 */
export function getCurrencySymbol(): string {
  const settingsStore = useSettingsStore()
  const currency = settingsStore.getCurrency || { code: 'USD', symbol: '$', name: 'US Dollar' }
  return currency?.symbol || '$'
}

/**
 * Get the currency code
 * @returns The currency code
 */
export function getCurrencyCode(): string {
  const settingsStore = useSettingsStore()
  const currency = settingsStore.getCurrency || { code: 'USD', symbol: '$', name: 'US Dollar' }
  return currency?.code || 'USD'
}

/**
 * Get the currency name
 * @returns The currency name
 */
export function getCurrencyName(): string {
  const settingsStore = useSettingsStore()
  const currency = settingsStore.getCurrency || { code: 'USD', symbol: '$', name: 'US Dollar' }
  return currency?.name || 'US Dollar'
}

