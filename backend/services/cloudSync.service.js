const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { google } = require('googleapis');

class CloudSyncService {
    constructor() {
        this.isInitialized = false;
        this.drive = null;
        this.folderId = null;
        this.clientId = process.env.GOOGLE_CLIENT_ID || 'your-client-id';
        this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret';
        this.redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
        this.scopes = ['https://www.googleapis.com/auth/drive.file'];
        
        // Sync settings
        this.syncInterval = 5 * 60 * 1000; // 5 minutes
        this.lastSyncTime = null;
        this.isSyncing = false;
    }

    async initialize() {
        try {
            if (this.isInitialized) return true;

            // Check if we have stored credentials
            const credentialsPath = path.join(process.env.APPDATA || process.env.HOME, 'POS-System', 'credentials.json');
            
            if (fs.existsSync(credentialsPath)) {
                const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
                this.oauth2Client = new google.auth.OAuth2(
                    this.clientId,
                    this.clientSecret,
                    this.redirectUri
                );
                this.oauth2Client.setCredentials(credentials);
                this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
                
                // Find or create POS System folder
                this.folderId = await this.findOrCreateFolder();
                this.isInitialized = true;
                
                console.log('Cloud sync initialized successfully');
                return true;
            } else {
                console.log('No credentials found. User needs to authenticate.');
                return false;
            }
        } catch (error) {
            console.error('Error initializing cloud sync:', error);
            return false;
        }
    }

    async authenticate() {
        try {
            this.oauth2Client = new google.auth.OAuth2(
                this.clientId,
                this.clientSecret,
                this.redirectUri
            );

            const authUrl = this.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.scopes,
            });

            return {
                success: true,
                authUrl: authUrl,
                message: 'Please visit the URL to authorize the application'
            };
        } catch (error) {
            console.error('Error generating auth URL:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async handleAuthCode(code) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            
            // Save credentials
            const credentialsPath = path.join(process.env.APPDATA || process.env.HOME, 'POS-System');
            if (!fs.existsSync(credentialsPath)) {
                fs.mkdirSync(credentialsPath, { recursive: true });
            }
            
            fs.writeFileSync(
                path.join(credentialsPath, 'credentials.json'),
                JSON.stringify(tokens, null, 2)
            );

            this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
            this.folderId = await this.findOrCreateFolder();
            this.isInitialized = true;

            return {
                success: true,
                message: 'Authentication successful'
            };
        } catch (error) {
            console.error('Error handling auth code:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async findOrCreateFolder() {
        try {
            // Search for existing folder
            const response = await this.drive.files.list({
                q: "name='POS-System-Data' and mimeType='application/vnd.google-apps.folder'",
                fields: 'files(id, name)'
            });

            if (response.data.files.length > 0) {
                return response.data.files[0].id;
            }

            // Create new folder
            const folderMetadata = {
                name: 'POS-System-Data',
                mimeType: 'application/vnd.google-apps.folder'
            };

            const folder = await this.drive.files.create({
                resource: folderMetadata,
                fields: 'id'
            });

            return folder.data.id;
        } catch (error) {
            console.error('Error finding/creating folder:', error);
            throw error;
        }
    }

    async uploadDatabase() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
                if (!this.isInitialized) return { success: false, error: 'Not initialized' };
            }

            const dbPath = path.join(process.env.APPDATA || process.env.HOME, 'POS-System', 'data', 'pos.db');
            if (!fs.existsSync(dbPath)) {
                return { success: false, error: 'Database file not found' };
            }

            const fileMetadata = {
                name: `pos-backup-${new Date().toISOString().split('T')[0]}.db`,
                parents: [this.folderId]
            };

            const media = {
                mimeType: 'application/octet-stream',
                body: fs.createReadStream(dbPath)
            };

            const file = await this.drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id'
            });

            return {
                success: true,
                fileId: file.data.id,
                message: 'Database uploaded successfully'
            };
        } catch (error) {
            console.error('Error uploading database:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async downloadLatestDatabase() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
                if (!this.isInitialized) return { success: false, error: 'Not initialized' };
            }

            // Get list of database files
            const response = await this.drive.files.list({
                q: `'${this.folderId}' in parents and name contains 'pos-backup'`,
                orderBy: 'createdTime desc',
                fields: 'files(id, name, createdTime)'
            });

            if (response.data.files.length === 0) {
                return { success: false, error: 'No backup files found' };
            }

            const latestFile = response.data.files[0];
            const fileContent = await this.drive.files.get({
                fileId: latestFile.id,
                alt: 'media'
            });

            const dbPath = path.join(process.env.APPDATA || process.env.HOME, 'POS-System', 'data', 'pos.db');
            fs.writeFileSync(dbPath, fileContent.data);

            return {
                success: true,
                message: 'Database downloaded successfully',
                fileName: latestFile.name
            };
        } catch (error) {
            console.error('Error downloading database:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async checkForUpdates() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
                if (!this.isInitialized) return { success: false, error: 'Not initialized' };
            }

            // Check for update files
            const response = await this.drive.files.list({
                q: `'${this.folderId}' in parents and name contains 'update'`,
                orderBy: 'createdTime desc',
                fields: 'files(id, name, createdTime, size)'
            });

            if (response.data.files.length === 0) {
                return { success: true, hasUpdate: false };
            }

            const latestUpdate = response.data.files[0];
            const localVersion = this.getLocalVersion();
            const remoteVersion = this.extractVersionFromFileName(latestUpdate.name);

            if (this.compareVersions(remoteVersion, localVersion) > 0) {
                return {
                    success: true,
                    hasUpdate: true,
                    updateFile: latestUpdate,
                    currentVersion: localVersion,
                    newVersion: remoteVersion
                };
            }

            return { success: true, hasUpdate: false };
        } catch (error) {
            console.error('Error checking for updates:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async downloadUpdate(updateFile) {
        try {
            const fileContent = await this.drive.files.get({
                fileId: updateFile.id,
                alt: 'media'
            });

            const updatePath = path.join(process.cwd(), 'updates');
            if (!fs.existsSync(updatePath)) {
                fs.mkdirSync(updatePath, { recursive: true });
            }

            const filePath = path.join(updatePath, updateFile.name);
            fs.writeFileSync(filePath, fileContent.data);

            return {
                success: true,
                filePath: filePath,
                message: 'Update downloaded successfully'
            };
        } catch (error) {
            console.error('Error downloading update:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getLocalVersion() {
        try {
            const versionPath = path.join(__dirname, '..', '..', 'version.json');
            if (fs.existsSync(versionPath)) {
                const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
                return versionData.version;
            }
        } catch (error) {
            console.error('Error reading local version:', error);
        }
        return '1.0.0';
    }

    extractVersionFromFileName(fileName) {
        const match = fileName.match(/v(\d+\.\d+\.\d+)/);
        return match ? match[1] : '1.0.0';
    }

    compareVersions(version1, version2) {
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            
            if (v1part > v2part) return 1;
            if (v1part < v2part) return -1;
        }
        return 0;
    }

    async startAutoSync() {
        if (this.isSyncing) return;
        
        this.isSyncing = true;
        console.log('Starting auto-sync...');
        
        // Initial sync
        await this.uploadDatabase();
        
        // Set up interval
        this.syncIntervalId = setInterval(async () => {
            try {
                await this.uploadDatabase();
                this.lastSyncTime = new Date();
                console.log('Auto-sync completed at:', this.lastSyncTime);
            } catch (error) {
                console.error('Auto-sync error:', error);
            }
        }, this.syncInterval);
    }

    stopAutoSync() {
        if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId);
            this.syncIntervalId = null;
        }
        this.isSyncing = false;
        console.log('Auto-sync stopped');
    }

    getSyncStatus() {
        return {
            isInitialized: this.isInitialized,
            isSyncing: this.isSyncing,
            lastSyncTime: this.lastSyncTime,
            syncInterval: this.syncInterval
        };
    }
}

module.exports = new CloudSyncService();
