const { ipcMain } = require('electron');
const Return = require('../models/return.model');
const { ipcError } = require('../utils/ipcError');

function setupReturnHandlers() {
// Get all returns
ipcMain.handle('get-returns', async (event) => {
    try {
        const returns = await Return.getAll();
        return returns;
    } catch (error) {
        throw ipcError(error);
    }
});

// Get return by ID
ipcMain.handle('get-return-by-id', async (event, id) => {
    try {
        const returnItem = await Return.findById(id);
        if (!returnItem) {
            return { message: 'Return not found' };
        } else {
            return returnItem;
        }
    } catch (error) {
        throw ipcError(error);
    }
});

// Create new return
ipcMain.handle('create-return', async (event, returnData) => {
    try {
        const returnId = await Return.create(returnData);
        return { id: returnId, ...returnData };
    } catch (error) {
        throw ipcError(error);
    }
});

// Update return
ipcMain.handle('update-return', async (event, id, returnData) => {
    try {
        await Return.update(id, returnData);
        return { message: 'Return updated successfully' };
    } catch (error) {
        throw ipcError(error);
    }
});

// Delete return
ipcMain.handle('delete-return', async (event, id) => {
    try {
        await Return.delete(id);
        return { message: 'Return deleted successfully' };
    } catch (error) {
        throw ipcError(error);
    }
});

// Get returns by sale
ipcMain.handle('get-returns-by-sale', async (event, saleId) => {
    try {
        const returns = await Return.getReturnsBySale(saleId);
        return returns;
    } catch (error) {
        throw ipcError(error);
    }
});

// Get returns by customer
ipcMain.handle('get-returns-by-customer', async (event, customerId) => {
    try {
        const returns = await Return.getReturnsByCustomer(customerId);
        return returns;
    } catch (error) {
        throw ipcError(error);
    }
});

// Get return items
ipcMain.handle('get-return-items', async (event, returnId) => {
    try {
        const items = await Return.getItems(returnId);
        return items;
    } catch (error) {
        throw ipcError(error);
    }
});

// Search returns
ipcMain.handle('search-returns', async (event, searchParams) => {
    try {
        const returns = await Return.searchReturns(searchParams);
        return returns;
    } catch (error) {
        throw ipcError(error);
    }
});

}

module.exports = setupReturnHandlers; 