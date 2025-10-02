const { ipcMain } = require('electron');
const Sale = require('../models/sale.model');

function setupSaleHandlers() {
// Get all sales
ipcMain.handle('get-sales', async (event) => {
    try {
        const sales = await Sale.getAll();
        return sales;
    } catch (error) {
        throw new Error(error.message);
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
        throw new Error(error.message);
    }
});

// Get sale items
ipcMain.handle('get-sale-items', async (event, saleId) => {
    try {
        const items = await Sale.getItems(saleId);
        return items;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Create new sale
ipcMain.handle('create-sale', async (event, saleData) => {
    try {
        const saleId = await Sale.create(saleData);
        return { id: saleId, ...saleData };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Update sale
ipcMain.handle('update-sale', async (event, id, saleData) => {
    try {
        await Sale.update(id, saleData);
        return { message: 'Sale updated successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Delete sale
ipcMain.handle('delete-sale', async (event, id) => {
    try {
        await Sale.delete(id);
        return { message: 'Sale deleted successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
}); 

}

module.exports = setupSaleHandlers; 