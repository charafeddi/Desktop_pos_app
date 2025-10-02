const { ipcMain } = require('electron');
const SaleItem = require('../models/saleItem.model');

function setupSaleItemHandlers() {
// Get all sale items
ipcMain.handle('get-all-sale-items', async (event) => {
    try {
        const saleItems = await SaleItem.getAll();
        return saleItems;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Get sale item by ID
ipcMain.handle('get-sale-item-by-id', async (event, id) => {
    try {
        const saleItem = await SaleItem.getById(id);
        if (!saleItem) {
            return { message: 'Sale item not found' };
        } else {
            return saleItem;
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

// Create new sale item
ipcMain.handle('create-sale-item', async (event, saleItemData) => {
    try {
        const saleItemId = await SaleItem.create(saleItemData);
        return { id: saleItemId, ...saleItemData };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Update sale item
ipcMain.handle('update-sale-item', async (event, id, saleItemData) => {
    try {
        await SaleItem.update(id, saleItemData);
        return { message: 'Sale item updated successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Delete sale item
ipcMain.handle('delete-sale-item', async (event, id) => {
    try {
        await SaleItem.delete(id);
        return { message: 'Sale item deleted successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
}); 

}

module.exports = setupSaleItemHandlers; 