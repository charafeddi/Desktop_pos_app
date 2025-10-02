/**
 * Report template system for generating professional PDF reports
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
// Import the autoTable function directly
import 'jspdf-autotable'

// Extend jsPDF with autoTable
jsPDF.API.autoTable = autoTable

/**
 * Generate a professional sales report template
 * @param {Object} doc - jsPDF document instance
 * @param {Array} sales - Sales data
 * @param {Array} customers - Customers data for lookup
 * @param {Object} filters - Date range and other filters
 */
export function generateSalesReportTemplate(doc, sales, customers, filters = {}) {
  try {
    console.log('Template: Sales data received:', sales)
    console.log('Template: Customers data received:', customers)
    console.log('Template: doc received:', doc)
    
    // Validate inputs
    if (!doc) {
      throw new Error('PDF document instance is required')
    }
    if (!sales || !Array.isArray(sales)) {
      throw new Error('Invalid sales data provided to template')
    }
    
    if (!customers || !Array.isArray(customers)) {
      console.warn('No customers data provided, using empty map')
      customers = []
    }
    
    const customerMap = customers.reduce((map, customer) => {
      if (customer && customer.id && customer.name) {
        map[customer.id] = customer.name
      }
      return map
    }, {})
    
    console.log('Template: Customer map created:', customerMap)

  // Header
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('SALES REPORT', 14, 30)

  // Company info (you can customize this)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Point of Sale System', 14, 40)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 50)

  // Report summary
  const totalRevenue = sales.reduce((sum, sale) => {
    const amount = parseFloat(sale.final_amount || sale.total_amount || 0)
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
  const totalSales = sales.length
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('SUMMARY', 14, 70)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Sales: ${totalSales}`, 14, 80)
  doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 90)
  doc.text(`Average Order Value: $${avgOrderValue.toFixed(2)}`, 14, 100)

  // Date range if specified
  if (filters.startDate || filters.endDate) {
    doc.text(`Date Range: ${filters.startDate || 'Start'} to ${filters.endDate || 'End'}`, 14, 110)
  }

  // Sales table
  const columns = [
    { key: 'id', label: 'Sale ID', width: 20 },
    { key: 'customer_name', label: 'Customer', width: 40 },
    { key: 'total_amount', label: 'Amount', width: 30 },
    { key: 'created_at', label: 'Date', width: 30 }
  ]

  const tableData = sales.map(sale => {
    console.log('Template: Processing sale:', sale)
    return [
      sale.id || 'N/A',
      sale.customer_name || customerMap[sale.customer_id] || 'Walk-in Customer',
      `$${(sale.final_amount || sale.total_amount || 0).toFixed(2)}`,
      sale.created_at ? new Date(sale.created_at).toLocaleDateString() : 'N/A'
    ]
  })
  
  console.log('Template: Table data created:', tableData)
  console.log('Template: About to call autoTable, doc:', doc)
  console.log('Template: doc.autoTable available:', typeof doc.autoTable)
  console.log('Template: jsPDF.API.autoTable available:', typeof jsPDF.API.autoTable)

  // Use autoTable directly instead of attaching to doc
  console.log('Template: Calling autoTable directly')

  autoTable(doc, {
    head: [columns.map(col => col.label)],
    body: tableData,
    startY: 120,
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 }
    },
    margin: { top: 120, left: 14, right: 14 }
  })

  console.log('Template: autoTable completed successfully')
  return doc
  } catch (error) {
    console.error('Error in generateSalesReportTemplate:', error)
    throw error
  }
}

/**
 * Generate a professional products report template
 * @param {Object} doc - jsPDF document instance
 * @param {Array} products - Products data
 */
export function generateProductsReportTemplate(doc, products) {
  try {
    // Validate inputs
    if (!doc) {
      throw new Error('PDF document instance is required')
    }
    if (!products || !Array.isArray(products)) {
      throw new Error('Products data is required and must be an array')
    }
    
    console.log('Products template: doc received:', doc)
    console.log('Products template: products received:', products.length, 'products')
    
    // Header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('PRODUCTS INVENTORY REPORT', 14, 30)

  // Company info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Point of Sale System', 14, 40)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 50)

  // Summary
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.is_active).length
  const lowStockProducts = products.filter(p => p.current_stock <= (p.min_stock || 5)).length
  const totalValue = products.reduce((sum, product) => sum + (product.current_stock * product.selling_price), 0)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('INVENTORY SUMMARY', 14, 70)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Products: ${totalProducts}`, 14, 80)
  doc.text(`Active Products: ${activeProducts}`, 14, 90)
  doc.text(`Low Stock Items: ${lowStockProducts}`, 14, 100)
  doc.text(`Total Inventory Value: $${totalValue.toFixed(2)}`, 14, 110)

  // Products table
  const columns = [
    { key: 'id', label: 'ID', width: 15 },
    { key: 'name', label: 'Product Name', width: 50 },
    { key: 'sku', label: 'SKU', width: 25 },
    { key: 'current_stock', label: 'Stock', width: 20 },
    { key: 'selling_price', label: 'Price', width: 25 },
    { key: 'status', label: 'Status', width: 20 }
  ]

  const tableData = products.map(product => [
    product.id,
    product.name,
    product.sku || 'N/A',
    product.current_stock,
    `$${product.selling_price.toFixed(2)}`,
    product.is_active ? 'Active' : 'Inactive'
  ])

  console.log('Products template: Creating table with', tableData.length, 'rows')
  console.log('Products template: About to call autoTable, doc:', doc)
  console.log('Products template: doc.autoTable available:', typeof doc.autoTable)
  console.log('Products template: jsPDF.API.autoTable available:', typeof jsPDF.API.autoTable)

  // Use autoTable directly instead of attaching to doc
  console.log('Products template: Calling autoTable directly')
  
  autoTable(doc, {
    head: [columns.map(col => col.label)],
    body: tableData,
    startY: 130,
    styles: {
      fontSize: 7,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 20 }
    },
    margin: { top: 130, left: 14, right: 14 }
  })

  console.log('Products template: autoTable completed successfully')
  return doc
  } catch (error) {
    console.error('Error in generateProductsReportTemplate:', error)
    throw error
  }
}

/**
 * Generate a professional customers report template
 * @param {Object} doc - jsPDF document instance
 * @param {Array} customers - Customers data
 */
export function generateCustomersReportTemplate(doc, customers) {
  try {
    // Validate inputs
    if (!doc) {
      throw new Error('PDF document instance is required')
    }
    if (!customers || !Array.isArray(customers)) {
      throw new Error('Customers data is required and must be an array')
    }
    
    console.log('Customers template: doc received:', doc)
    console.log('Customers template: customers received:', customers.length, 'customers')
    
    // Header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('CUSTOMERS REPORT', 14, 30)

  // Company info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Point of Sale System', 14, 40)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 50)

  // Summary
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.is_active).length

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('CUSTOMER SUMMARY', 14, 70)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Customers: ${totalCustomers}`, 14, 80)
  doc.text(`Active Customers: ${activeCustomers}`, 14, 90)

  // Customers table
  const columns = [
    { key: 'id', label: 'ID', width: 15 },
    { key: 'name', label: 'Name', width: 40 },
    { key: 'email', label: 'Email', width: 50 },
    { key: 'phone', label: 'Phone', width: 30 },
    { key: 'created_at', label: 'Joined', width: 25 },
    { key: 'status', label: 'Status', width: 20 }
  ]

  const tableData = customers.map(customer => [
    customer.id,
    customer.name,
    customer.email || 'N/A',
    customer.phone || 'N/A',
    new Date(customer.created_at).toLocaleDateString(),
    customer.is_active ? 'Active' : 'Inactive'
  ])

  console.log('Customers template: Creating table with', tableData.length, 'rows')
  console.log('Customers template: About to call autoTable, doc:', doc)
  console.log('Customers template: doc.autoTable available:', typeof doc.autoTable)
  console.log('Customers template: jsPDF.API.autoTable available:', typeof jsPDF.API.autoTable)

  // Use autoTable directly instead of attaching to doc
  console.log('Customers template: Calling autoTable directly')
  
  autoTable(doc, {
    head: [columns.map(col => col.label)],
    body: tableData,
    startY: 110,
    styles: {
      fontSize: 7,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 40 },
      2: { cellWidth: 50 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 20 }
    },
    margin: { top: 110, left: 14, right: 14 }
  })

  console.log('Customers template: autoTable completed successfully')
  return doc
  } catch (error) {
    console.error('Error in generateCustomersReportTemplate:', error)
    throw error
  }
}

/**
 * Generate a professional analytics report template
 * @param {Object} doc - jsPDF document instance
 * @param {Object} analytics - Analytics data
 */
export function generateAnalyticsReportTemplate(doc, analytics) {
  try {
    // Validate inputs
    if (!doc) {
      throw new Error('PDF document instance is required')
    }
    if (!analytics || typeof analytics !== 'object') {
      throw new Error('Analytics data is required and must be an object')
    }
    
    console.log('Analytics template: doc received:', doc)
    console.log('Analytics template: analytics received:', analytics)
    
    const kpis = analytics.kpis || {}
    const topProducts = analytics.topProducts || []

    // Header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('ANALYTICS REPORT', 14, 30)

  // Company info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Point of Sale System', 14, 40)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 50)

  // KPIs Section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('KEY PERFORMANCE INDICATORS', 14, 70)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  let yPos = 80
  const kpiData = [
    ['Total Revenue', `$${kpis.totalRevenue?.toFixed(2) || '0.00'}`],
    ['Average Order Value', `$${kpis.averageOrderValue?.toFixed(2) || '0.00'}`],
    ['Total Sales', kpis.totalSales || 0],
    ['Total Customers', kpis.totalCustomers || 0],
    ['Inventory Value', `$${kpis.inventoryValue?.toFixed(2) || '0.00'}`],
    ['Low Stock Items', kpis.lowStockItems || 0],
    ['Out of Stock Items', kpis.outOfStockItems || 0]
  ]

  kpiData.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 14, yPos)
    yPos += 10
  })

  // Top Products Section
  if (topProducts.length > 0) {
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOP SELLING PRODUCTS', 14, yPos)
    yPos += 10

    const productColumns = [
      { key: 'name', label: 'Product Name', width: 60 },
      { key: 'quantity_sold', label: 'Sold', width: 20 },
      { key: 'revenue', label: 'Revenue', width: 30 }
    ]

    const productTableData = topProducts.map(product => [
      product.name,
      product.quantity_sold || product.total_sold || 0,
      `$${product.revenue?.toFixed(2) || '0.00'}`
    ])

      console.log('Analytics template: Creating products table with', productTableData.length, 'rows')
      console.log('Analytics template: About to call autoTable, doc:', doc)
      console.log('Analytics template: doc.autoTable available:', typeof doc.autoTable)
      console.log('Analytics template: jsPDF.API.autoTable available:', typeof jsPDF.API.autoTable)

      // Use autoTable directly instead of attaching to doc
      console.log('Analytics template: Calling autoTable directly')
      
      autoTable(doc, {
        head: [productColumns.map(col => col.label)],
        body: productTableData,
        startY: yPos,
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 20 },
          2: { cellWidth: 30 }
        },
        margin: { top: yPos, left: 14, right: 14 }
      })
    }

    console.log('Analytics template: autoTable completed successfully')
    console.log('Analytics template: Report generated successfully')
    return doc
  } catch (error) {
    console.error('Error in generateAnalyticsReportTemplate:', error)
    throw error
  }
}
