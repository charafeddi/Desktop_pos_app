import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
// Import the autoTable function directly
import 'jspdf-autotable'
import Papa from 'papaparse'

// Extend jsPDF with autoTable
jsPDF.API.autoTable = autoTable
import { 
  generateSalesReportTemplate, 
  generateProductsReportTemplate, 
  generateCustomersReportTemplate, 
  generateAnalyticsReportTemplate 
} from './reportTemplates.js'

/**
 * Export utility functions for CSV and PDF generation
 */

/**
 * Test function to create a simple PDF
 */
export async function testPDFExport() {
  try {
    console.log('Testing PDF export...')
    
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Test PDF Export', 20, 20)
    doc.text('This is a test PDF', 20, 30)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 40)
    
    const pdfOutput = doc.output('arraybuffer')
    const uint8Array = new Uint8Array(pdfOutput)
    const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
    
    const result = await saveFile(binaryString, 'test_export.pdf', 'pdf')
    console.log('Test PDF result:', result)
    return result.success
  } catch (error) {
    console.error('Test PDF error:', error)
    return false
  }
}

/**
 * Save file using Electron's native file save dialog
 * @param {string} data - File content
 * @param {string} filename - Default filename
 * @param {string} type - File type (csv, pdf)
 */
async function saveFile(data, filename, type) {
  try {
    console.log('saveFile called with:', { filename, type, dataLength: data.length })
    
    if (window.electronAPI && window.electronAPI.files) {
      console.log('Using Electron API for file save')
      const result = await window.electronAPI.files.saveFile(data, filename, type)
      console.log('Electron save result:', result)
      return result
    } else {
      console.log('Using web fallback for file save')
      // Fallback for web environment
      const blob = new Blob([data], { type: type === 'csv' ? 'text/csv' : 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log('Web fallback save completed')
      return { success: true }
    }
  } catch (error) {
    console.error('Error saving file:', error)
    console.error('Error stack:', error.stack)
    return { success: false, error: error.message }
  }
}

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Array} columns - Array of column definitions [{key, label}]
 */
export async function exportToCSV(data, filename, columns) {
  try {
    // Validate input data
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('No data to export')
      return false
    }

    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      console.error('No columns defined for export')
      return false
    }

    // Prepare data for CSV
    const csvData = data.map(item => {
      const row = {}
      columns.forEach(col => {
        const value = item[col.key]
        // Handle different data types
        if (value === null || value === undefined) {
          row[col.label] = ''
        } else if (typeof value === 'object') {
          row[col.label] = JSON.stringify(value)
        } else {
          row[col.label] = String(value)
        }
      })
      return row
    })

    // Convert to CSV
    const csv = Papa.unparse(csvData)
    
    // Save file using Electron's native dialog
    const result = await saveFile(csv, `${filename}.csv`, 'csv')
    return result.success
  } catch (error) {
    console.error('Error exporting to CSV:', error)
    return false
  }
}

/**
 * Export data to PDF format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Array} columns - Array of column definitions [{key, label}]
 * @param {string} title - Title for the PDF report
 * @param {Object} options - Additional options for PDF generation
 */
export async function exportToPDF(data, filename, columns, title, options = {}) {
  try {
    // Validate input data
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('No data to export')
      return false
    }

    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      console.error('No columns defined for export')
      return false
    }

    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text(title, 14, 22)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    
    // Add total count
    doc.setFontSize(10)
    doc.text(`Total Records: ${data.length}`, 14, 38)
    
    // Prepare table data
    const tableData = data.map(item => 
      columns.map(col => {
        const value = item[col.key]
        // Handle different data types
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value)
      })
    )
    
    // Prepare table headers
    const headers = columns.map(col => col.label)
    
    // Generate table
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 50, left: 14, right: 14 },
      columnStyles: {
        // Auto-adjust column widths
      },
      ...options
    })
    
    // Get PDF as binary data
    const pdfOutput = doc.output('arraybuffer')
    const uint8Array = new Uint8Array(pdfOutput)
    const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
    
    // Save PDF using Electron's native dialog
    const result = await saveFile(binaryString, `${filename}.pdf`, 'pdf')
    return result.success
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    return false
  }
}

/**
 * Format currency for export
 * @param {number} value - Numeric value
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0)
}

/**
 * Format date for export
 * @param {string} dateString - Date string
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Export sales data
 * @param {Array} sales - Sales data
 * @param {Array} customers - Customers data for lookup
 * @param {string} format - 'csv' or 'pdf'
 * @param {Object} filters - Date range and other filters
 */
export async function exportSales(sales, customers, format, filters = {}) {
  // Validate input data
  if (!sales || !Array.isArray(sales) || sales.length === 0) {
    console.error('No sales data to export')
    return false
  }

  // Debug: Log the sales data structure
  console.log('Sales data for export:', sales)
  console.log('Customers data for export:', customers)

  const customerMap = customers.reduce((map, customer) => {
    map[customer.id] = customer.name
    return map
  }, {})

  const columns = [
    { key: 'id', label: 'Sale ID' },
    { key: 'sale_number', label: 'Sale Number' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'created_at', label: 'Date' },
    { key: 'total_amount', label: 'Subtotal' },
    { key: 'tax_amount', label: 'Tax' },
    { key: 'discount_amount', label: 'Discount' },
    { key: 'final_amount', label: 'Total' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'sale_status', label: 'Status' }
  ]

  const exportData = sales.map(sale => ({
    ...sale,
    customer_name: customerMap[sale.customer_id] || 'Walk-in Customer',
    total_amount: formatCurrency(sale.total_amount),
    tax_amount: formatCurrency(sale.tax_amount || 0),
    discount_amount: formatCurrency(sale.discount_amount || 0),
    final_amount: formatCurrency(sale.final_amount || sale.total_amount),
    created_at: formatDate(sale.created_at)
  }))

  const filename = `sales_report_${new Date().toISOString().split('T')[0]}`

  if (format === 'csv') {
    return await exportToCSV(exportData, filename, columns)
  } else if (format === 'pdf') {
    try {
    console.log('Creating PDF for sales export...')
    // Use professional template for PDF
    const doc = new jsPDF()
    console.log('PDF document created:', doc)
    
    // Ensure autoTable is available on this instance
    if (!doc.autoTable && jsPDF.API.autoTable) {
      doc.autoTable = jsPDF.API.autoTable
      console.log('Attached autoTable to doc instance in exportUtils')
    }
    
    const templateDoc = generateSalesReportTemplate(doc, sales, customers, filters)
      console.log('Template generated successfully')
      
      // Get PDF as binary data
      const pdfOutput = templateDoc.output('arraybuffer')
      const uint8Array = new Uint8Array(pdfOutput)
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
      
      // Save PDF using Electron's native dialog
      const result = await saveFile(binaryString, `${filename}.pdf`, 'pdf')
      return result.success
    } catch (error) {
      console.error('Error in sales PDF export:', error)
      return false
    }
  }
}

/**
 * Export products data
 * @param {Array} products - Products data
 * @param {string} format - 'csv' or 'pdf'
 */
export async function exportProducts(products, format) {
  // Validate input data
  if (!products || !Array.isArray(products) || products.length === 0) {
    console.error('No products data to export')
    return false
  }

  const columns = [
    { key: 'id', label: 'Product ID' },
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'barcode', label: 'Barcode' },
    { key: 'category_id', label: 'Category ID' },
    { key: 'purchase_price', label: 'Purchase Price' },
    { key: 'selling_price', label: 'Selling Price' },
    { key: 'current_stock', label: 'Current Stock' },
    { key: 'min_stock_level', label: 'Min Stock Level' },
    { key: 'is_active', label: 'Status' }
  ]

  const exportData = products.map(product => ({
    ...product,
    purchase_price: formatCurrency(product.purchase_price),
    selling_price: formatCurrency(product.selling_price),
    is_active: product.is_active ? 'Active' : 'Inactive'
  }))

  const filename = `products_report_${new Date().toISOString().split('T')[0]}`

  if (format === 'csv') {
    return await exportToCSV(exportData, filename, columns)
  } else if (format === 'pdf') {
    try {
      console.log('Creating PDF for products export...')
      // Use professional template for PDF
      const doc = new jsPDF()
      console.log('PDF document created:', doc)
      
      // No need to attach autoTable - we'll call it directly in templates
      
      const templateDoc = generateProductsReportTemplate(doc, products)
      console.log('Template generated successfully')
      
      // Get PDF as binary data
      const pdfOutput = templateDoc.output('arraybuffer')
      const uint8Array = new Uint8Array(pdfOutput)
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
      
      // Save PDF using Electron's native dialog
      const result = await saveFile(binaryString, `${filename}.pdf`, 'pdf')
      return result.success
    } catch (error) {
      console.error('Error in products PDF export:', error)
      return false
    }
  }
}

/**
 * Export customers data
 * @param {Array} customers - Customers data
 * @param {string} format - 'csv' or 'pdf'
 */
export async function exportCustomers(customers, format) {
  // Validate input data
  if (!customers || !Array.isArray(customers) || customers.length === 0) {
    console.error('No customers data to export')
    return false
  }

  const columns = [
    { key: 'id', label: 'Customer ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'created_at', label: 'Date Added' },
    { key: 'is_active', label: 'Status' }
  ]

  const exportData = customers.map(customer => ({
    ...customer,
    created_at: formatDate(customer.created_at),
    is_active: customer.is_active ? 'Active' : 'Inactive'
  }))

  const filename = `customers_report_${new Date().toISOString().split('T')[0]}`

  if (format === 'csv') {
    return await exportToCSV(exportData, filename, columns)
  } else if (format === 'pdf') {
    try {
      console.log('Creating PDF for customers export...')
      // Use professional template for PDF
      const doc = new jsPDF()
      console.log('PDF document created:', doc)
      
      // No need to attach autoTable - we'll call it directly in templates
      
      const templateDoc = generateCustomersReportTemplate(doc, customers)
      console.log('Template generated successfully')
      
      // Get PDF as binary data
      const pdfOutput = templateDoc.output('arraybuffer')
      const uint8Array = new Uint8Array(pdfOutput)
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
      
      // Save PDF using Electron's native dialog
      const result = await saveFile(binaryString, `${filename}.pdf`, 'pdf')
      return result.success
    } catch (error) {
      console.error('Error in customers PDF export:', error)
      return false
    }
  }
}

/**
 * Export returns data
 * @param {Array} returns - Returns data
 * @param {string} format - 'csv' or 'pdf'
 */
export async function exportReturns(returns, format) {
  const columns = [
    { key: 'id', label: 'Return ID' },
    { key: 'return_number', label: 'Return Number' },
    { key: 'sale_id', label: 'Sale ID' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'total_amount', label: 'Return Amount' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Date' }
  ]

  const exportData = returns.map(returnItem => ({
    ...returnItem,
    total_amount: formatCurrency(returnItem.total_amount),
    created_at: formatDate(returnItem.created_at)
  }))

  const filename = `returns_report_${new Date().toISOString().split('T')[0]}`
  const title = 'Returns Report'

  if (format === 'csv') {
    return await exportToCSV(exportData, filename, columns)
  } else if (format === 'pdf') {
    return await exportToPDF(exportData, filename, columns, title)
  }
}

/**
 * Export analytics summary
 * @param {Object} analytics - Analytics data
 * @param {string} format - 'csv' or 'pdf'
 */
export async function exportAnalytics(analytics, format) {
  // Validate input data
  if (!analytics || typeof analytics !== 'object') {
    console.error('No analytics data to export')
    return false
  }

  const kpis = analytics.kpis || {}
  const topProducts = analytics.topProducts || []
  
  if (format === 'pdf') {
    try {
      console.log('Creating PDF for analytics export...')
      // Use professional template for PDF
      const doc = new jsPDF()
      console.log('PDF document created:', doc)
      
      // No need to attach autoTable - we'll call it directly in templates
      
      const templateDoc = generateAnalyticsReportTemplate(doc, analytics)
      console.log('Template generated successfully')
      
      // Get PDF as binary data
      const pdfOutput = templateDoc.output('arraybuffer')
      const uint8Array = new Uint8Array(pdfOutput)
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
      
      // Save PDF using Electron's native dialog
      const filename = `analytics_report_${new Date().toISOString().split('T')[0]}`
      const result = await saveFile(binaryString, `${filename}.pdf`, 'pdf')
      return result.success
    } catch (error) {
      console.error('Error in analytics PDF export:', error)
      return false
    }
  }
  
  return false
}
