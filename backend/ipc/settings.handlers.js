const { ipcMain } = require('electron');
const SettingsModel = require('../models/settings.model');

function setupSettingsHandlers() {
    console.log('Setting up Settings IPC handlers...');

    // Get company information
    ipcMain.handle('settings:get-company-info', async (event) => {
        try {
            console.log('Getting company information...');
            const companyInfo = SettingsModel.getCompanyInfo();
            console.log('Company info retrieved:', companyInfo);
            return companyInfo;
        } catch (error) {
            console.error('Error getting company info:', error);
            throw error;
        }
    });

    // Save company information
    ipcMain.handle('settings:save-company-info', async (event, companyInfo) => {
        try {
            console.log('Saving company information:', companyInfo);
            
            // Validate required fields
            if (!companyInfo.name || !companyInfo.email) {
                throw new Error('Company name and email are required');
            }

            const savedCompanyInfo = SettingsModel.saveCompanyInfo(companyInfo);
            console.log('Company info saved successfully:', savedCompanyInfo);
            return savedCompanyInfo;
        } catch (error) {
            console.error('Error saving company info:', error);
            throw error;
        }
    });

    // Get tax rates
    ipcMain.handle('settings:get-tax-rates', async (event) => {
        try {
            console.log('Getting tax rates...');
            const taxRates = SettingsModel.getTaxRates();
            console.log('Tax rates retrieved:', taxRates);
            return taxRates;
        } catch (error) {
            console.error('Error getting tax rates:', error);
            throw error;
        }
    });

    // Save tax rates
    ipcMain.handle('settings:save-tax-rates', async (event, taxRates) => {
        try {
            console.log('Saving tax rates:', taxRates);
            const savedTaxRates = SettingsModel.saveTaxRates(taxRates);
            console.log('Tax rates saved successfully:', savedTaxRates);
            return savedTaxRates;
        } catch (error) {
            console.error('Error saving tax rates:', error);
            throw error;
        }
    });

    // Get printer settings
    ipcMain.handle('settings:get-printer-settings', async (event) => {
        try {
            console.log('Getting printer settings...');
            const printerSettings = SettingsModel.getPrinterSettings();
            console.log('Printer settings retrieved:', printerSettings);
            return printerSettings;
        } catch (error) {
            console.error('Error getting printer settings:', error);
            throw error;
        }
    });

    // Save printer settings
    ipcMain.handle('settings:save-printer-settings', async (event, printerSettings) => {
        try {
            console.log('Saving printer settings:', printerSettings);
            const savedPrinterSettings = SettingsModel.savePrinterSettings(printerSettings);
            console.log('Printer settings saved successfully:', savedPrinterSettings);
            return savedPrinterSettings;
        } catch (error) {
            console.error('Error saving printer settings:', error);
            throw error;
        }
    });

    // Get all settings
    ipcMain.handle('settings:get-all', async (event) => {
        try {
            console.log('Getting all settings...');
            const allSettings = SettingsModel.getAll();
            console.log('All settings retrieved:', allSettings.length, 'items');
            return allSettings;
        } catch (error) {
            console.error('Error getting all settings:', error);
            throw error;
        }
    });

    // Set multiple settings
    ipcMain.handle('settings:set-multiple', async (event, settings) => {
        try {
            console.log('Setting multiple settings:', settings);
            const result = SettingsModel.setMultiple(settings);
            console.log('Multiple settings saved successfully:', result);
            return result;
        } catch (error) {
            console.error('Error setting multiple settings:', error);
            throw error;
        }
    });

    // Get setting by key
    ipcMain.handle('settings:get-by-key', async (event, key) => {
        try {
            console.log('Getting setting by key:', key);
            const setting = SettingsModel.getByKey(key);
            console.log('Setting retrieved:', setting);
            return setting;
        } catch (error) {
            console.error('Error getting setting by key:', error);
            throw error;
        }
    });

    // Set setting by key
    ipcMain.handle('settings:set-by-key', async (event, key, value) => {
        try {
            console.log('Setting value by key:', key, value);
            const setting = SettingsModel.setValue(key, value);
            console.log('Setting saved successfully:', setting);
            return setting;
        } catch (error) {
            console.error('Error setting value by key:', error);
            throw error;
        }
    });

    // Delete setting by key
    ipcMain.handle('settings:delete-by-key', async (event, key) => {
        try {
            console.log('Deleting setting by key:', key);
            const deleted = SettingsModel.deleteByKey(key);
            console.log('Setting deleted:', deleted);
            return deleted;
        } catch (error) {
            console.error('Error deleting setting by key:', error);
            throw error;
        }
    });

    console.log('Settings IPC handlers setup complete');
}

module.exports = setupSettingsHandlers;
