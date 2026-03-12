const { ipcMain } = require('electron');
const Invoice = require('../models/invoice.model');
const { ipcError } = require('../utils/ipcError');

function setupInvoiceHandlers() {
// Get all invoices
ipcMain.on('get-invoices', async (event) => {
    try {
        const invoices = await Invoice.getAll();
        return invoices;
    } catch (error) {
        throw ipcError(error);
    }
});

// Get invoice by ID
ipcMain.on('get-invoice-by-id', async (event, id) => {
    try {
        const invoice = await Invoice.getById(id);
        if (!invoice) {
            return { message: 'Invoice not found' };
        } else {
            return invoice;
        }
    } catch (error) {
        throw ipcError(error);
    }
});

// Create new invoice
ipcMain.on('create-invoice', async (event, invoiceData) => {
    try {
        const invoiceId = await Invoice.create(invoiceData);
        return { id: invoiceId, ...invoiceData };
    } catch (error) {
        throw ipcError(error);
    }
});

// Update invoice
ipcMain.on('update-invoice', async (event, id, invoiceData) => {
    try {
        await Invoice.update(id, invoiceData);
        return { message: 'Invoice updated successfully' };
    } catch (error) {
        throw ipcError(error);
    }
});

// Delete invoice
ipcMain.on('delete-invoice', async (event, id) => {
    try {
        await Invoice.delete(id);
        return { message: 'Invoice deleted successfully' };
    } catch (error) {
        throw ipcError(error);
    }
});

// Generate invoice PDF
ipcMain.on('generate-invoice-pdf', async (event, id) => {
    try {
        const pdfPath = await Invoice.generatePDF(id);
        return { path: pdfPath };
    } catch (error) {
        throw ipcError(error);
    }
}); 

}

module.exports = setupInvoiceHandlers; 