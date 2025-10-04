/**
 * Receipt Printing Utilities
 * Handles receipt generation, formatting, and printing functionality
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Receipt Template Configuration
 */
const RECEIPT_TEMPLATE = {
  company_name: 'Your POS System',
  company_address: '123 Business Street',
  company_city: 'City, State 12345',
  company_phone: '(555) 123-4567',
  company_email: 'info@yourpos.com',
  tax_rate: 10, // Default tax rate
  print_width: 80, // Characters per line
  logo_url: null // Optional company logo
}

/**
 * Receipt Item Class
 */
class ReceiptItem {
  constructor(name, quantity, price, discount = 0, tax = 0) {
    this.name = name
    this.quantity = quantity
    this.unit_price = price
    this.discount = discount
    this.tax_amount = tax
    this.subtotal = ((quantity * price) - discount)
    this.total = this.subtotal + (this.subtotal * (tax / 100))
  }
}

/**
 * Receipt Class
 */
export class Receipt {
  constructor(config = {}) {
    this.config = { ...RECEIPT_TEMPLATE, ...config }
    this.items = []
    this.customer = null
    this.cashier = null
    this.discount_total = 0
    this.tax_total = 0
    this.subtotal = 0
    this.total = 0
    this.payment_method = 'cash'
    this.cash_received = 0
    this.change_given = 0
    this.receipt_number = this.generateReceiptNumber()
    this.date = new Date()
  }

  /**
   * Generate unique receipt number
   */
  generateReceiptNumber() {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `REC-${timestamp}-${random}`
  }

  /**
   * Add item to receipt
   */
  addItem(item) {
    this.items.push(new ReceiptItem(
      item.name,
      item.quantity,
      item.unit_price,
      item.discount || 0,
      item.tax_rate || this.config.tax_rate
    ))
    this.calculateTotals()
  }

  /**
   * Calculate receipt totals
   */
  calculateTotals() {
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0)
    this.discount_total = this.items.reduce((sum, item) => sum + item.discount, 0)
    this.tax_total = this.items.reduce((sum, item) => sum + (item.subtotal * (item.tax_amount / 100)), 0)
    this.total = this.subtotal - this.discount_total + this.tax_total
  }

  /**
   * Set customer information
   */
  setCustomer(customer) {
    this.customer = customer
  }

  /**
   * Set payment details
   */
  setPayment(payment_method, cash_received = 0) {
    this.payment_method = payment_method
    this.cash_received = cash_received
    this.change_given = this.cash_received - this.total
  }

  /**
   * Generate formatted receipt text
   */
  generateTextReceipt() {
    const { print_width, company_name, company_address, company_city, company_phone } = this.config
    const dateStr = this.date.toLocaleDateString()
    const timeStr = this.date.toLocaleTimeString()

    let receipt = `${this.centerText(company_name, print_width)}\n`
    receipt += `${this.centerText('='.repeat(Math.min(print_width, company_name.length)), print_width)}\n`
    receipt += `${this.centerText(company_address, print_width)}\n`
    receipt += `${this.centerText(company_city, print_width)}\n`
    receipt += `${this.centerText(company_phone, print_width)}\n\n`

    receipt += `${this.centerText('RECEIPT', print_width)}\n`
    receipt += `${this.centerText('=' * 7, print_width)}\n\n`

    receipt += `Receipt #: ${this.receipt_number}\n`
    receipt += `Date: ${dateStr}\n`
    receipt += `Time: ${timeStr}\n`
    receipt += `Cashier: ${this.cashier?.name || 'Unknown'}\n`

    if (this.customer) {
      receipt += `Customer: ${this.customer.name}\n`
    }

    receipt += `\n${this.centerText('-'.repeat(print_width), print_width)}\n`
    receipt += `Item Name           Qty  Price   Total\n`
    receipt += `${'-'.repeat(print_width)}\n`

    // Items
    this.items.forEach(item => {
      const name = this.truncateText(item.name, 18)
      const qty = item.quantity.toString().padStart(3)
      const price = `$${item.unit_price.toFixed(2)}`.padStart(6)
      const total = `$${item.total.toFixed(2)}`.padStart(8)
      receipt += `${name.padEnd(18)} ${qty} ${price} ${total}\n`
    })

    receipt += `\n${this.centerText('-'.repeat(print_width), print_width)}\n`
    receipt += `Subtotal:           $${this.subtotal.toFixed(2)}\n`

    if (this.discount_total > 0) {
      receipt += `Discount:           -$${this.discount_total.toFixed(2)}\n`
    }

    receipt += `Tax:                $${this.tax_total.toFixed(2)}\n`
    receipt += `${'='.repeat(print_width)}\n`
    receipt += `TOTAL:              $${this.total.toFixed(2)}\n\n`

    receipt += `Payment Method: ${this.payment_method.toUpperCase()}\n`

    if (this.payment_method === 'cash' && this.cash_received > 0) {
      receipt += `Cash Received:      $${this.cash_received.toFixed(2)}\n`
      receipt += `Change Given:       $${this.change_given.toFixed(2)}\n`
    }

    receipt += `\n${this.centerText('Thank you for your business!', print_width)}\n`
    receipt += `${this.centerText('Visit us again soon!', print_width)}\n`

    return receipt
  }

  /**
   * Generate PDF receipt
   */
  generatePDFReceipt() {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    const contentWidth = pageWidth - (2 * margin)

    // Header
    doc.setFontSize(20)
    doc.setFont(undefined, 'bold')
    doc.text(this.config.company_name, margin, 20)
    
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(this.config.company_address, margin, 30)
    doc.text(`${this.config.company_city} • ${this.config.company_phone}`, margin, 35)

    // Receipt title
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('RECEIPT', margin, 50)

    // Receipt details
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    const receiptY = 60
    doc.text(`Receipt #: ${this.receipt_number}`, margin, receiptY)
    doc.text(`Date: ${this.date.toLocaleDateString()}`, margin + contentWidth/2, receiptY)
    doc.text(`Time: ${this.date.toLocaleTimeString()}`, margin, receiptY + 5)
    doc.text(`Cashier: ${this.cashier?.name || 'Unknown'}`, margin + contentWidth/2, receiptY + 5)

    if (this.customer) {
      doc.text(`Customer: ${this.customer.name}`, margin, receiptY + 10)
    }

    // Items table
    const tableData = this.items.map(item => [
      item.name,
      item.quantity,
      `$${item.unit_price.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ])

    autoTable(doc, {
      startY: receiptY + (this.customer ? 20 : 15),
      head: [['Item', 'Qty', 'Price', 'Total']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      },
      margins: { left: margin, right: margin }
    })

    // Totals
    const tableEndY = doc.lastAutoTable.finalY || receiptY + 80
    const totalsY = tableEndY + 15

    doc.setFontSize(11)
    doc.text(`Subtotal:`, margin, totalsY)
    doc.text(`$${this.subtotal.toFixed(2)}`, margin + contentWidth - 30, totalsY)

    if (this.discount_total > 0) {
      doc.text(`Discount:`, margin, totalsY + 5)
      doc.text(`-$${this.discount_total.toFixed(2)}`, margin + contentWidth - 30, totalsY + 5)
    }

    doc.text(`Tax:`, margin, totalsY + (this.discount_total > 0 ? 10 : 5))
    doc.text(`$${this.tax_total.toFixed(2)}`, margin + contentWidth - 30, totalsY + (this.discount_total > 0 ? 10 : 5))

    // Total line
    const totalY = totalsY + (this.discount_total > 0 ? 15 : 10)
    doc.setFont(undefined, 'bold')
    doc.text(`TOTAL:`, margin, totalY)
    doc.text(`$${this.total.toFixed(2)}`, margin + contentWidth - 30, totalY)

    // Payment info
    doc.setFont(undefined, 'normal')
    doc.text(`Payment Method: ${this.payment_method.toUpperCase()}`, margin, totalY + 10)

    if (this.payment_method === 'cash' && this.cash_received > 0) {
      doc.text(`Cash Received: $${this.cash_received.toFixed(2)}`, margin, totalY + 15)
      doc.text(`Change Given: $${this.change_given.toFixed(2)}`, margin, totalY + 20)
    }

    // Footer
    doc.setFontSize(10)
    doc.text(this.centerText('Thank you for your business!', contentWidth), margin, totalY + 35)
    doc.text(this.centerText('Visit us again soon!', contentWidth), margin, totalY + 40)

    return doc
  }

  /**
   * Center text helper
   */
  centerText(text, width) {
    const spaces = Math.max(0, width - text.length)
    const leftSpaces = Math.floor(spaces / 2)
    return ' '.repeat(leftSpaces) + text + ' '.repeat(spaces - leftSpaces)
  }

  /**
   * Truncate text helper
   */
  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text
  }
}

/**
 * Print utilities for different platforms
 */
export const PrintUtils = {
  /**
   * Print receipt to desktop printer (Electron)
   */
  async printDesktopReceipt(receiptText) {
    if (window.electronAPI?.print) {
      return await window.electronAPI.print.printReceipt(receiptText)
    }
    throw new Error('Desktop printing not available')
  },

  /**
   * Print receipt to PDF file
   */
  async printPDFReceipt(receipt, outputPath = null) {
    const doc = receipt.generatePDFReceipt()
    
    if (window.electronAPI?.files?.saveFile) {
      const pdfData = doc.output('arraybuffer')
      const filename = `receipt_${receipt.receipt_number}.pdf`
      return await window.electronAPI.files.saveFile(
        Array.from(new Uint8Array(pdfData)),
        filename,
        'pdf'
      )
    }
    
    // Fallback to browser download
    doc.save(`receipt_${receipt.receipt_number}.pdf`)
    return { success: true, filename: `receipt_${receipt.receipt_number}.pdf` }
  },

  /**
   * Email receipt to customer
   */
  async emailReceipt(email, receipt, subject = 'Your Receipt') {
    if (window.electronAPI?.email) {
      const pdfDoc = receipt.generatePDFReceipt()
      const pdfData = pdfDoc.output('arraybuffer')
      
      return await window.electronAPI.email.sendReceipt({
        to: email,
        subject: subject,
        receiptNumber: receipt.receipt_number,
        pdfData: Array.from(new Uint8Array(pdfData))
      })
    }
    throw new Error('Email functionality not available')
  }
}

/**
 * Receipt factory function
 */
export function createReceiptFromSale(saleData, customer = null, cashier = null) {
  const receipt = new Receipt({
    company_name: saleData.company_name || 'POS System',
    company_address: saleData.company_address || '',
    company_city: saleData.company_city || '',
    company_phone: saleData.company_phone || '',
    tax_rate: saleData.tax_rate || 10
  })

  receipt.cashier = cashier
  receipt.setCustomer(customer)

  // Add sale items
  if (saleData.items && Array.isArray(saleData.items)) {
    saleData.items.forEach(item => {
      receipt.addItem({
        name: item.product_name || item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount_amount || 0,
        tax_rate: item.tax_rate || receipt.config.tax_rate
      })
    })
  }

  // Set payment info
  receipt.setPayment(
    saleData.payment_method || 'cash',
    saleData.cash_received || 0
  )

  return receipt
}

export default { Receipt, PrintUtils, createReceiptFromSale }
