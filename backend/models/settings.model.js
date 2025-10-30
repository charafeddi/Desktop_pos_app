const db = require('../config/database');

class SettingsModel {
    /**
     * Get a setting by key
     * @param {string} key - The setting key
     * @returns {object|null} - The setting object or null if not found
     */
    static getByKey(key) {
        try {
            const stmt = db.prepare('SELECT * FROM settings WHERE key = ?');
            const setting = stmt.get(key);
            return setting;
        } catch (error) {
            console.error('Error getting setting by key:', error);
            throw error;
        }
    }

    /**
     * Get setting value by key
     * @param {string} key - The setting key
     * @returns {string|null} - The setting value or null if not found
     */
    static getValue(key) {
        try {
            const setting = this.getByKey(key);
            return setting ? setting.value : null;
        } catch (error) {
            console.error('Error getting setting value:', error);
            throw error;
        }
    }

    /**
     * Set a setting value
     * @param {string} key - The setting key
     * @param {string} value - The setting value
     * @returns {object} - The created/updated setting
     */
    static setValue(key, value) {
        try {
            const currentTime = new Date().toISOString();
            
            // Check if setting exists
            const existing = this.getByKey(key);
            
            if (existing) {
                // Update existing setting
                const stmt = db.prepare(`
                    UPDATE settings 
                    SET value = ?, updated_at = ? 
                    WHERE key = ?
                `);
                stmt.run(value, currentTime, key);
            } else {
                // Create new setting
                const stmt = db.prepare(`
                    INSERT INTO settings (key, value, created_at, updated_at) 
                    VALUES (?, ?, ?, ?)
                `);
                stmt.run(key, value, currentTime, currentTime);
            }
            
            return this.getByKey(key);
        } catch (error) {
            console.error('Error setting value:', error);
            throw error;
        }
    }

    /**
     * Set multiple settings at once
     * @param {object} settings - Object with key-value pairs
     * @returns {object} - Result object with success count
     */
    static setMultiple(settings) {
        try {
            const currentTime = new Date().toISOString();
            let successCount = 0;
            
            db.exec('BEGIN TRANSACTION');
            
            try {
                for (const [key, value] of Object.entries(settings)) {
                    const existing = this.getByKey(key);
                    
                    if (existing) {
                        const stmt = db.prepare(`
                            UPDATE settings 
                            SET value = ?, updated_at = ? 
                            WHERE key = ?
                        `);
                        stmt.run(value, currentTime, key);
                    } else {
                        const stmt = db.prepare(`
                            INSERT INTO settings (key, value, created_at, updated_at) 
                            VALUES (?, ?, ?, ?)
                        `);
                        stmt.run(key, value, currentTime, currentTime);
                    }
                    successCount++;
                }
                
                db.exec('COMMIT');
                return { success: true, count: successCount };
            } catch (error) {
                db.exec('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('Error setting multiple values:', error);
            throw error;
        }
    }

    /**
     * Get all settings
     * @returns {array} - Array of all settings
     */
    static getAll() {
        try {
            const stmt = db.prepare('SELECT * FROM settings ORDER BY key');
            const settings = stmt.all();
            return settings;
        } catch (error) {
            console.error('Error getting all settings:', error);
            throw error;
        }
    }

    /**
     * Delete a setting by key
     * @param {string} key - The setting key
     * @returns {boolean} - True if deleted, false if not found
     */
    static deleteByKey(key) {
        try {
            const stmt = db.prepare('DELETE FROM settings WHERE key = ?');
            const result = stmt.run(key);
            return result.changes > 0;
        } catch (error) {
            console.error('Error deleting setting:', error);
            throw error;
        }
    }

    /**
     * Get company information
     * @returns {object} - Company information object
     */
    static getCompanyInfo() {
        try {
            const companyInfoStr = this.getValue('company_info');
            if (companyInfoStr) {
                return JSON.parse(companyInfoStr);
            }
            
            // Return default company info if not found
            return {
                name: 'My Store',
                address: '123 Main St',
                phone: '(555) 123-4567',
                email: 'contact@mystore.com',
                taxId: 'TAX-123456'
            };
        } catch (error) {
            console.error('Error getting company info:', error);
            // Return default on error
            return {
                name: 'My Store',
                address: '123 Main St',
                phone: '(555) 123-4567',
                email: 'contact@mystore.com',
                taxId: 'TAX-123456'
            };
        }
    }

    /**
     * Save company information
     * @param {object} companyInfo - Company information object
     * @returns {object} - The saved company info
     */
    static saveCompanyInfo(companyInfo) {
        try {
            const companyInfoStr = JSON.stringify(companyInfo);
            this.setValue('company_info', companyInfoStr);
            return companyInfo;
        } catch (error) {
            console.error('Error saving company info:', error);
            throw error;
        }
    }

    /**
     * Get tax rates
     * @returns {object} - Tax rates object
     */
    static getTaxRates() {
        try {
            const taxRatesStr = this.getValue('tax_rates');
            if (taxRatesStr) {
                return JSON.parse(taxRatesStr);
            }
            
            // Return default tax rates if not found
            return {
                defaultRate: 0.1,
                exemptCategories: []
            };
        } catch (error) {
            console.error('Error getting tax rates:', error);
            return {
                defaultRate: 0.1,
                exemptCategories: []
            };
        }
    }

    /**
     * Save tax rates
     * @param {object} taxRates - Tax rates object
     * @returns {object} - The saved tax rates
     */
    static saveTaxRates(taxRates) {
        try {
            const taxRatesStr = JSON.stringify(taxRates);
            this.setValue('tax_rates', taxRatesStr);
            return taxRates;
        } catch (error) {
            console.error('Error saving tax rates:', error);
            throw error;
        }
    }

    /**
     * Get printer settings
     * @returns {object} - Printer settings object
     */
    static getPrinterSettings() {
        try {
            const printerSettingsStr = this.getValue('printer_settings');
            if (printerSettingsStr) {
                return JSON.parse(printerSettingsStr);
            }
            
            // Return default printer settings if not found
            return {
                defaultPrinter: '',
                paperSize: 'A4',
                copies: 1
            };
        } catch (error) {
            console.error('Error getting printer settings:', error);
            return {
                defaultPrinter: '',
                paperSize: 'A4',
                copies: 1
            };
        }
    }

    /**
     * Save printer settings
     * @param {object} printerSettings - Printer settings object
     * @returns {object} - The saved printer settings
     */
    static savePrinterSettings(printerSettings) {
        try {
            const printerSettingsStr = JSON.stringify(printerSettings);
            this.setValue('printer_settings', printerSettingsStr);
            return printerSettings;
        } catch (error) {
            console.error('Error saving printer settings:', error);
            throw error;
        }
    }

    /**
     * Get currency settings
     * @returns {object} - Currency settings object
     */
    static getCurrency() {
        try {
            const currencyStr = this.getValue('currency');
            if (currencyStr) {
                return JSON.parse(currencyStr);
            }
            
            // Return default currency if not found
            return {
                code: 'USD',
                symbol: '$',
                name: 'US Dollar'
            };
        } catch (error) {
            console.error('Error getting currency:', error);
            return {
                code: 'USD',
                symbol: '$',
                name: 'US Dollar'
            };
        }
    }

    /**
     * Save currency settings
     * @param {object} currency - Currency settings object
     * @returns {object} - The saved currency settings
     */
    static saveCurrency(currency) {
        try {
            console.log('saveCurrency called with:', currency);
            const currencyStr = JSON.stringify(currency);
            console.log('Serialized currency string:', currencyStr);
            
            const result = this.setValue('currency', currencyStr);
            console.log('setValue returned:', result);
            
            // Return the original currency object to match expected format
            const savedResult = {
                code: currency.code,
                symbol: currency.symbol,
                name: currency.name
            };
            
            console.log('Returning saved currency:', savedResult);
            return savedResult;
        } catch (error) {
            console.error('Error saving currency:', error);
            throw error;
        }
    }
}

module.exports = SettingsModel;
