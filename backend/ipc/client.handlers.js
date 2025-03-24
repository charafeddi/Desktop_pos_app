const { ipcMain } = require('electron');
const Client = require('../models/client.model');

function setupClientHandlers() {
// Get all clients
ipcMain.handle('get-clients', async (event) => {
    try {
        const clients = await Client.getAll();
        return clients;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Get client by ID
ipcMain.handle('get-client-by-id', async (event, id) => {
    try {
        const client = await Client.getById(id);
        if (!client) {
            return { message: 'Client not found' };
        } else {
            return client;
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

// Create new client
ipcMain.handle('create-client', async (event, clientData) => {
    try {
        const clientId = await Client.create(clientData);
        return { id: clientId, ...clientData };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Update client
ipcMain.handle('update-client', async (event, id, clientData) => {
    try {
        await Client.update(id, clientData);
        return { message: 'Client updated successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Delete client
ipcMain.handle('delete-client', async (event, id) => {
    try {
        await Client.delete(id);
        return { message: 'Client deleted successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});

}

module.exports = setupClientHandlers; 