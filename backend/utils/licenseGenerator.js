/**
 * License Key Generator and Validator
 * Generates cryptographically secure license keys
 */

const crypto = require('crypto');

// Your secret keys (CHANGE THESE - keep private!)
const LICENSE_SECRET = process.env.LICENSE_SECRET || 'YOUR-SECRET-KEY-CHANGE-THIS-12345';
const ALGORITHM = 'aes-256-cbc';

/**
 * Generate a unique license key
 * Format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
 */
class LicenseGenerator {
  constructor(secret = LICENSE_SECRET) {
    this.secret = secret;
    this.key = crypto.scryptSync(secret, 'salt', 32);
  }

  /**
   * Generate a license key
   * @param {Object} data - License data
   * @param {string} data.customerEmail - Customer email
   * @param {number} data.deviceCount - Number of devices allowed
   * @param {string} data.packageType - 'basic', 'professional', 'enterprise'
   * @param {string} data.expiryDate - Optional expiry date (YYYY-MM-DD)
   * @returns {string} License key
   */
  generate(data) {
    const {
      customerEmail,
      deviceCount = 1,
      packageType = 'professional',
      expiryDate = null
    } = data;

    // Generate unique license ID
    const licenseId = this.generateLicenseId();

    // Create license data object
    const licenseData = {
      id: licenseId,
      email: customerEmail.toLowerCase(),
      devices: parseInt(deviceCount),
      package: packageType,
      expiry: expiryDate || null,
      generated: new Date().toISOString()
    };

    // Encrypt the license data
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    
    let encrypted = cipher.update(JSON.stringify(licenseData), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine IV and encrypted data
    const combined = iv.toString('hex') + ':' + encrypted;

    // Create checksum
    const checksum = crypto
      .createHash('sha256')
      .update(combined + this.secret)
      .digest('hex')
      .substring(0, 8)
      .toUpperCase();

    // Format as license key (base64 encoded)
    const fullString = combined + ':' + checksum;
    const encoded = Buffer.from(fullString, 'utf8').toString('base64');
    
    // Format as readable key: XXXX-XXXX-XXXX-XXXX-XXXX
    return this.formatLicenseKey(encoded);
  }

  /**
   * Format licenseוקע key into readable groups
   * Use all groups, not just first 5, to preserve full base64 string
   * NOTE: Do NOT uppercase - base64 is case-sensitive!
   */
  formatLicenseKey(encoded) {
    // Split into groups of 5 characters
    const groups = encoded.match(/.{1,5}/g) || [];
    // Use all groups, not just first 5, to preserve full data
    // Don't uppercase - base64 encoding is case-sensitive
    return groups.join('-');
  }

  /**
   * Generate unique license ID
   */
  generateLicenseId() {
    return 'LIC-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Validate and decode license key
   * @param {string} licenseKey - The license key to validate
   * @returns {Object|null} Decoded license data or null if invalid
   */
  validate(licenseKey) {
    try {
      // Remove formatting - DO NOT UPPERCASE! Base64 method is case-sensitive
      let cleaned = licenseKey.replace(/-/g, '');

      // Add padding if needed for base64 (must be multiple of 4)
      // But don't add if it already ends with =
      if (cleaned.length % 4 !== 0 && !cleaned.endsWith('=')) {
        const remainder = cleaned.length % 4;
        cleaned += '='.repeat(4 - remainder);
      }

      // Decode from base64
      let decoded;
      try {
        decoded = Buffer.from(cleaned, 'base64').toString('utf8');
      } catch (e) {
        return null;
      }

      const parts = decoded.split(':');

      if (parts.length !== 3) {
        return null;
      }

      const [ivHex, encrypted, checksum] = parts;

      // Verify checksum
      // Note: checksum was created with (ivHex + ':' + encrypted) + secret
      const combined = ivHex + ':' + encrypted;
      const expectedChecksum = crypto
        .createHash('sha256')
        .update(combined + this.secret)
        .digest('hex')
        .substring(0, 8)
        .toUpperCase();

      if (checksum.toUpperCase() !== expectedChecksum) {
        return null; // Invalid checksum
      }

      // Decrypt
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const licenseData = JSON.parse(decrypted);

      // Validate expiry date if set
      if (licenseData.expiry) {
        const expiry = new Date(licenseData.expiry);
        const now = new Date();
        if (now > expiry) {
          return { ...licenseData, valid: false, expired: true };
        }
      }

      return { ...licenseData, valid: true };
    } catch (error) {
      console.error('License validation error:', error);
      return null;
    }
  }

  /**
   * Get device fingerprint (unique hardware ID)
   */
  static getDeviceFingerprint() {
    const os = require('os');
    let userDataPath = '';
    
    try {
      // Try to get Electron app path, but handle case where electron is not available
      const electron = require('electron');
      if (electron && electron.app) {
        userDataPath = electron.app.getPath('userData');
      }
    } catch (e) {
      // Not in Electron context, use alternative method
      userDataPath = process.env.APPDATA || process.env.HOME || process.env.USERPROFILE || '';
    }

    // Collect system info
    const machineId = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus().length;
    
    // Create fingerprint hash
    const fingerprint = `${machineId}-${platform}-${arch}-${cpus}-${userDataPath}`;
    
    return crypto
      .createHash('sha256')
      .update(fingerprint)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();
  }
}

module.exports = LicenseGenerator;

