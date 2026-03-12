/**
 * Report template system for generating professional PDF reports
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const TABLE_HEAD_COLOR = [66, 139, 202]
const TABLE_ALT_ROW_COLOR = [245, 245, 245]

function addReportHeader(doc, title, subtitle = 'Point of Sale System') {
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 30)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(subtitle, 14, 40)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 50)
}

function addSectionHeading(doc, text, y) {
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(text, 14, y)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
}

/**
 * Generate a professional sales report template
 */
export function generateSalesReportTemplate(doc, sales, customers, filters = {}) {
  if (!doc) throw new Error('PDF document instance is required')
  if (!sales || !Array.isArray(sales)) throw new Error('Invalid sales data provided to template')
  if (!customers || !Array.isArray(customers)) customers = []

  const customerMap = customers.reduce((map, customer) => {
    if (customer?.id && customer?.name) map[customer.id] = customer.name
    return map
  }, {})

  addReportHeader(doc, 'SALES REPORT')

  const totalRevenue = sales.reduce((sum, sale) => {
    const amount = parseFloat(sale.final_amount || sale.total_amount || 0)
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
  const totalSales = sales.length
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

  addSectionHeading(doc, 'SUMMARY', 70)
  doc.text(`Total Sales: ${totalSales}`, 14, 80)
  doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 90)
  doc.text(`Average Order Value: $${avgOrderValue.toFixed(2)}`, 14, 100)
  if (filters.startDate || filters.endDate) {
    doc.text(`Date Range: ${filters.startDate || 'Start'} to ${filters.endDate || 'End'}`, 14, 110)
  }

  const tableData = sales.map(sale => [
    sale.id || 'N/A',
    sale.sale_number || `SALE-${sale.id}`,
    sale.customer_name || customerMap[sale.customer_id] || 'Walk-in Customer',
    `$${(sale.final_amount || sale.total_amount || 0).toFixed(2)}`,
    sale.payment_method || 'N/A',
    sale.sale_status || 'completed',
    sale.created_at ? new Date(sale.created_at).toLocaleDateString() : 'N/A'
  ])

  autoTable(doc, {
    head: [['Sale ID', 'Sale #', 'Customer', 'Amount', 'Payment', 'Status', 'Date']],
    body: tableData,
    startY: 120,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: TABLE_HEAD_COLOR, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: TABLE_ALT_ROW_COLOR },
    margin: { top: 120, left: 14, right: 14 }
  })

  return doc
}

/**
 * Generate a professional products inventory report template
 */
export function generateProductsReportTemplate(doc, products) {
  if (!doc) throw new Error('PDF document instance is required')
  if (!products || !Array.isArray(products)) throw new Error('Products data is required and must be an array')

  addReportHeader(doc, 'PRODUCTS INVENTORY REPORT')

  const totalProducts = products.length
  const activeProducts = products.filter(p => p.is_active).length
  const lowStockProducts = products.filter(p => (Number(p.current_stock) || 0) <= (Number(p.min_stock_level) || 5)).length
  const totalValue = products.reduce((sum, p) => sum + ((Number(p.current_stock) || 0) * (Number(p.selling_price) || 0)), 0)

  addSectionHeading(doc, 'INVENTORY SUMMARY', 70)
  doc.text(`Total Products: ${totalProducts}`, 14, 80)
  doc.text(`Active Products: ${activeProducts}`, 14, 90)
  doc.text(`Low Stock Items: ${lowStockProducts}`, 14, 100)
  doc.text(`Total Inventory Value: $${totalValue.toFixed(2)}`, 14, 110)

  const tableData = products.map(product => [
    product.id,
    product.name || 'N/A',
    product.sku || 'N/A',
    Number(product.current_stock) || 0,
    `$${(Number(product.selling_price) || 0).toFixed(2)}`,
    product.is_active ? 'Active' : 'Inactive'
  ])

  autoTable(doc, {
    head: [['ID', 'Product Name', 'SKU', 'Stock', 'Price', 'Status']],
    body: tableData,
    startY: 130,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: TABLE_HEAD_COLOR, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: TABLE_ALT_ROW_COLOR },
    columnStyles: {
      0: { cellWidth: 15 }, 1: { cellWidth: 55 }, 2: { cellWidth: 30 },
      3: { cellWidth: 20 }, 4: { cellWidth: 25 }, 5: { cellWidth: 20 }
    },
    margin: { top: 130, left: 14, right: 14 }
  })

  return doc
}

/**
 * Generate a professional customers report template
 */
export function generateCustomersReportTemplate(doc, customers) {
  if (!doc) throw new Error('PDF document instance is required')
  if (!customers || !Array.isArray(customers)) throw new Error('Customers data is required and must be an array')

  addReportHeader(doc, 'CUSTOMERS REPORT')

  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.is_active).length

  addSectionHeading(doc, 'CUSTOMER SUMMARY', 70)
  doc.text(`Total Customers: ${totalCustomers}`, 14, 80)
  doc.text(`Active Customers: ${activeCustomers}`, 14, 90)

  const tableData = customers.map(customer => [
    customer.id,
    customer.name || 'N/A',
    customer.email || 'N/A',
    customer.phone || 'N/A',
    customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A',
    customer.is_active ? 'Active' : 'Inactive'
  ])

  autoTable(doc, {
    head: [['ID', 'Name', 'Email', 'Phone', 'Joined', 'Status']],
    body: tableData,
    startY: 110,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: TABLE_HEAD_COLOR, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: TABLE_ALT_ROW_COLOR },
    columnStyles: {
      0: { cellWidth: 15 }, 1: { cellWidth: 40 }, 2: { cellWidth: 50 },
      3: { cellWidth: 30 }, 4: { cellWidth: 25 }, 5: { cellWidth: 20 }
    },
    margin: { top: 110, left: 14, right: 14 }
  })

  return doc
}

/**
 * Generate a professional returns report template (BUG-11 fix)
 */
export function generateReturnsReportTemplate(doc, returns) {
  if (!doc) throw new Error('PDF document instance is required')
  if (!returns || !Array.isArray(returns)) throw new Error('Returns data is required and must be an array')

  addReportHeader(doc, 'RETURNS REPORT')

  const totalReturns = returns.length
  const totalRefunded = returns.reduce((sum, r) => sum + (Number(r.final_amount || r.total_amount) || 0), 0)

  addSectionHeading(doc, 'RETURNS SUMMARY', 70)
  doc.text(`Total Returns: ${totalReturns}`, 14, 80)
  doc.text(`Total Refunded: $${totalRefunded.toFixed(2)}`, 14, 90)

  const tableData = returns.map(r => [
    r.id,
    r.return_number || `RET-${r.id}`,
    r.sale_id || 'N/A',
    r.customer_name || 'N/A',
    `$${(Number(r.final_amount || r.total_amount) || 0).toFixed(2)}`,
    r.reason || 'N/A',
    r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'
  ])

  autoTable(doc, {
    head: [['ID', 'Return #', 'Sale ID', 'Customer', 'Refunded', 'Reason', 'Date']],
    body: tableData,
    startY: 110,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [220, 53, 69], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: TABLE_ALT_ROW_COLOR },
    margin: { top: 110, left: 14, right: 14 }
  })

  return doc
}

/**
 * Generate a professional analytics report template
 */
export function generateAnalyticsReportTemplate(doc, analytics) {
  if (!doc) throw new Error('PDF document instance is required')
  if (!analytics || typeof analytics !== 'object') throw new Error('Analytics data is required and must be an object')

  const kpis = analytics.kpis || {}
  const topProducts = analytics.topProducts || []

  addReportHeader(doc, 'ANALYTICS REPORT')

  addSectionHeading(doc, 'KEY PERFORMANCE INDICATORS', 70)
  let yPos = 80
  const kpiData = [
    ['Total Revenue', `$${(kpis.totalRevenue || 0).toFixed(2)}`],
    ['Average Order Value', `$${(kpis.averageOrderValue || 0).toFixed(2)}`],
    ['Total Sales', kpis.totalSales || 0],
    ['Total Customers', kpis.totalCustomers || 0],
    ['Inventory Value', `$${(kpis.inventoryValue || 0).toFixed(2)}`],
    ['Low Stock Items', kpis.lowStockItems || 0],
    ['Out of Stock Items', kpis.outOfStockItems || 0]
  ]

  kpiData.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 14, yPos)
    yPos += 10
  })

  if (topProducts.length > 0) {
    yPos += 10
    addSectionHeading(doc, 'TOP SELLING PRODUCTS', yPos)
    yPos += 10

    const productTableData = topProducts.map(product => [
      product.name || 'N/A',
      product.quantity_sold || product.total_sold || 0,
      `$${(Number(product.revenue) || 0).toFixed(2)}`
    ])

    autoTable(doc, {
      head: [['Product Name', 'Units Sold', 'Revenue']],
      body: productTableData,
      startY: yPos,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: TABLE_HEAD_COLOR, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: TABLE_ALT_ROW_COLOR },
      columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 25 }, 2: { cellWidth: 35 } },
      margin: { top: yPos, left: 14, right: 14 }
    })
  }

  return doc
}
