const { ipcMain } = require('electron');
const Customer = require('../models/client.model');

function setupClientHandlers() {
// Get all customers
ipcMain.handle('get-customers', async (event) => {
    try {
        const customers = await Customer.getAll();
        return customers;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Get customer by ID
ipcMain.handle('get-customer-by-id', async (event, id) => {
    try {
        const customer = await Customer.findById(id);
        if (!customer) {
            return { message: 'Customer not found' };
        } else {
            return customer;
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

// Create new customer
ipcMain.handle('create-customer', async (event, customerData) => {
    try {
        const customerId = await Customer.create(customerData);
        return { id: customerId, ...customerData };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Update customer
ipcMain.handle('update-customer', async (event, id, customerData) => {
    try {
        await Customer.update(id, customerData);
        // Return the updated customer row so frontend state can update reactively
        const updated = await Customer.findById(id);
        return updated;
    } catch (error) {
        throw new Error(error.message);
    }
});

// Delete customer
ipcMain.handle('delete-customer', async (event, id) => {
    try {
        await Customer.delete(id);
        return { message: 'Customer deleted successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
});

// Toggle customer status
ipcMain.handle('toggle-customer-status', async (event, id) => {
    try {
        await Customer.toggleStatus(id);
        const updated = await Customer.findById(id);
        return updated;
    } catch (error) {
        throw new Error(error.message);
    }
}); 

}

module.exports = setupClientHandlers;