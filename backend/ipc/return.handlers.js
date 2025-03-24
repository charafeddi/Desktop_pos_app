const { ipcMain } = require('electron');
const Return = require('../models/return.model');

function setupReturnHandlers() {
// Get all returns
ipcMain.handle('get-returns', async (event) => {
    try {
        const returns = await Return.getAll();
        return returns;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Get return by ID
ipcMain.handle('get-return-by-id', async (event, id) => {
    try {
        const returnItem = await Return.getById(id);
        if (!returnItem) {
            return { message: 'Return not found' };
        } else {
            return returnItem;
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

// Create new return
ipcMain.handle('create-return', async (event, returnData) => {
    try {
        const returnId = await Return.create(returnData);
        return { id: returnId, ...returnData };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Update return
ipcMain.handle('update-return', async (event, id, returnData) => {
    try {
        await Return.update(id, returnData);
        return { message: 'Return updated successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Delete return
ipcMain.handle('delete-return', async (event, id) => {
    try {
        await Return.delete(id);
        return { message: 'Return deleted successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
}); 

}

module.exports = setupReturnHandlers; 