const { ipcMain } = require('electron');
const Sale = require('../models/sale.model');
const { ipcError } = require('../utils/ipcError');

function setupSaleHandlers() {
// Get all sales
ipcMain.handle('get-sales', async (event) => {
    try {
        const sales = await Sale.getAll();
        return sales;
    } catch (error) {
        throw ipcError(error);
    }
});

// Get sale by ID
ipcMain.handle('get-sale-by-id', async (event, id) => {
    try {
        const sale = await Sale.findById(id);
        if (!sale) {
            return { message: 'Sale not found' };
        } else {
            return sale;
        }
    } catch (error) {
        throw ipcError(error);
    }
});

// Get sale items
ipcMain.handle('get-sale-items', async (event, saleId) => {
    try {
        const items = await Sale.getItems(saleId);
        return items;
    } catch (error) {
        throw ipcError(error);
    }
});

// Create new sale
ipcMain.handle('create-sale', async (event, saleData) => {
    try {
        const result = await Sale.create(saleData);
        return { ...result, ...saleData };
    } catch (error) {
        throw ipcError(error);
    }
});

// Update sale
ipcMain.handle('update-sale', async (event, id, saleData) => {
    try {
        await Sale.update(id, saleData);
        return { message: 'Sale updated successfully' };
    } catch (error) {
        throw ipcError(error);
    }
});

// Delete sale
ipcMain.handle('delete-sale', async (event, id) => {
    try {
        await Sale.delete(id);
        return { message: 'Sale deleted successfully' };
    } catch (error) {
        throw ipcError(error);
    }
}); 

}

module.exports = setupSaleHandlers; 
