const { ipcMain } = require('electron');
const cloudSyncService = require('../services/cloudSync.service');

class CloudSyncHandlers {
    constructor() {
        this.setupHandlers();
    }

    setupHandlers() {
        // Initialize cloud sync
        ipcMain.handle('cloud-sync:initialize', async () => {
            try {
                const result = await cloudSyncService.initialize();
                return result;
            } catch (error) {
                console.error('Error initializing cloud sync:', error);
                return { success: false, error: error.message };
            }
        });

        // Authenticate with Google Drive
        ipcMain.handle('cloud-sync:authenticate', async () => {
            try {
                const result = await cloudSyncService.authenticate();
                return result;
            } catch (error) {
                console.error('Error authenticating:', error);
                return { success: false, error: error.message };
            }
        });

        // Handle authentication code
        ipcMain.handle('cloud-sync:handle-auth-code', async (event, code) => {
            try {
                const result = await cloudSyncService.handleAuthCode(code);
                return result;
            } catch (error) {
                console.error('Error handling auth code:', error);
                return { success: false, error: error.message };
            }
        });

        // Upload database to cloud
        ipcMain.handle('cloud-sync:upload-database', async () => {
            try {
                const result = await cloudSyncService.uploadDatabase();
                return result;
            } catch (error) {
                console.error('Error uploading database:', error);
                return { success: false, error: error.message };
            }
        });

        // Download latest database from cloud
        ipcMain.handle('cloud-sync:download-database', async () => {
            try {
                const result = await cloudSyncService.downloadLatestDatabase();
                return result;
            } catch (error) {
                console.error('Error downloading database:', error);
                return { success: false, error: error.message };
            }
        });

        // Check for updates
        ipcMain.handle('cloud-sync:check-updates', async () => {
            try {
                const result = await cloudSyncService.checkForUpdates();
                return result;
            } catch (error) {
                console.error('Error checking for updates:', error);
                return { success: false, error: error.message };
            }
        });

        // Download update
        ipcMain.handle('cloud-sync:download-update', async (event, updateFile) => {
            try {
                const result = await cloudSyncService.downloadUpdate(updateFile);
                return result;
            } catch (error) {
                console.error('Error downloading update:', error);
                return { success: false, error: error.message };
            }
        });

        // Start auto-sync
        ipcMain.handle('cloud-sync:start-auto-sync', async () => {
            try {
                await cloudSyncService.startAutoSync();
                return { success: true, message: 'Auto-sync started' };
            } catch (error) {
                console.error('Error starting auto-sync:', error);
                return { success: false, error: error.message };
            }
        });

        // Stop auto-sync
        ipcMain.handle('cloud-sync:stop-auto-sync', async () => {
            try {
                cloudSyncService.stopAutoSync();
                return { success: true, message: 'Auto-sync stopped' };
            } catch (error) {
                console.error('Error stopping auto-sync:', error);
                return { success: false, error: error.message };
            }
        });

        // Get sync status
        ipcMain.handle('cloud-sync:get-status', async () => {
            try {
                const status = cloudSyncService.getSyncStatus();
                return { success: true, status: status };
            } catch (error) {
                console.error('Error getting sync status:', error);
                return { success: false, error: error.message };
            }
        });
    }
}

module.exports = CloudSyncHandlers;
