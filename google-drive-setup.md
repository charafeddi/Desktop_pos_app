# Google Drive API Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project"
3. Enter project name: "POS System Cloud Sync"
4. Click "Create"

## Step 2: Enable Google Drive API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

## Step 3: Create Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Desktop application"
4. Name it: "POS System Desktop App"
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

Create a `.env` file in your project root:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## Step 5: Test the Setup

1. Run your POS System
2. Go to Settings > Cloud Sync
3. Click "Generate Auth URL"
4. Follow the authentication steps
5. Your data will now sync automatically!

## How It Works

### For You (Developer):
1. Upload update files to Google Drive
2. Clients automatically check for updates
3. Data is backed up automatically

### For Clients:
1. One-time Google Drive authentication
2. Automatic data backup every 5 minutes
3. Automatic update checking
4. No website needed!

## Benefits

✅ **Free** - Google Drive gives 15GB free storage
✅ **Automatic** - No manual intervention needed
✅ **Secure** - Data encrypted in transit and at rest
✅ **Reliable** - Google's infrastructure
✅ **Version Control** - Keep multiple backups
✅ **Offline Support** - Works without internet

## File Structure in Google Drive

```
POS-System-Data/
├── pos-backup-2024-01-15.db
├── pos-backup-2024-01-16.db
├── update-v1.1.0.zip
├── update-v1.2.0.zip
└── ...
```

## Troubleshooting

### Authentication Issues
- Make sure Client ID and Secret are correct
- Check that Google Drive API is enabled
- Verify the OAuth consent screen is configured

### Sync Issues
- Check internet connection
- Verify Google Drive permissions
- Look at the app logs for error messages

### Update Issues
- Ensure update files are named correctly: `update-v1.1.0.zip`
- Check that version numbers are properly formatted
- Verify file permissions in Google Drive
