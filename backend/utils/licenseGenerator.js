/**
 * License Key Generator and Validator
 * Generates cryptographically secure license keys
 */

const crypto = require('crypto');

// License secret must be set via environment variable — no fallback allowed
const LICENSE_SECRET = process.env.LICENSE_SECRET;
if (!LICENSE_SECRET) {
  throw new Error('LICENSE_SECRET environment variable must be set. Check your backend/.env file.');
}

// A stable, app-specific KDF salt stored in env.
// SCRYPT_SALT defaults to a known value for backward-compatibility with
// licenses already issued. Change SCRYPT_SALT only when rotating all licenses.
const SCRYPT_SALT = process.env.SCRYPT_SALT || 'pos-app-license-v1';

const ALGORITHM = 'aes-256-cbc';

/**
 * Generate a unique license key
 * Format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
 */
class LicenseGenerator {
  constructor(secret = LICENSE_SECRET) {
    this.secret = secret;
    // Derive a 64-byte master key; first 32 bytes = encryption key,
    // last 32 bytes = checksum key so the two operations use distinct keys (LOW-03).
    const masterKey = crypto.scryptSync(secret, SCRYPT_SALT, 64);
    this.encryptionKey = masterKey.slice(0, 32);
    this.checksumKey  = masterKey.slice(32, 64);
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
    const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv);
    
    let encrypted = cipher.update(JSON.stringify(licenseData), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine IV and encrypted data
    const combined = iv.toString('hex') + ':' + encrypted;

    // Create HMAC checksum using a separate derived key (not the encryption key)
    const checksum = crypto
      .createHmac('sha256', this.checksumKey)
      .update(combined)
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

      // Verify HMAC checksum using the dedicated checksum key
      const combined = ivHex + ':' + encrypted;
      const expectedChecksum = crypto
        .createHmac('sha256', this.checksumKey)
        .update(combined)
        .digest('hex')
        .substring(0, 8)
        .toUpperCase();

      if (checksum.toUpperCase() !== expectedChecksum) {
        return null; // Invalid checksum
      }

      // Decrypt
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, iv);
      
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
   * Get device fingerprint (unique hardware ID).
   * Combines hostname, platform, CPU model, total memory, and the first
   * non-internal MAC address so the fingerprint is harder to spoof than
   * hostname alone.
   */
  static getDeviceFingerprint() {
    const os = require('os');

    let userDataPath = '';
    try {
      const electron = require('electron');
      if (electron && electron.app) {
        userDataPath = electron.app.getPath('userData');
      }
    } catch (e) {
      userDataPath = process.env.APPDATA || process.env.HOME || process.env.USERPROFILE || '';
    }

    // CPU model string (consistent across reboots, unlike uptime/load)
    const cpuModel = os.cpus()[0]?.model || 'unknown-cpu';
    const cpuCount = os.cpus().length;

    // First non-internal MAC address (stable hardware identifier)
    let macAddress = 'no-mac';
    const interfaces = os.networkInterfaces();
    outer: for (const iface of Object.values(interfaces)) {
      if (!iface) continue;
      for (const entry of iface) {
        if (!entry.internal && entry.mac && entry.mac !== '00:00:00:00:00:00') {
          macAddress = entry.mac;
          break outer;
        }
      }
    }

    // Total memory in GB (rounded) — stable across reboots
    const totalMemGB = Math.round(os.totalmem() / (1024 ** 3));

    const fingerprint = [
      os.hostname(),
      os.platform(),
      os.arch(),
      cpuModel,
      cpuCount,
      totalMemGB,
      macAddress,
      userDataPath,
    ].join('|');

    return crypto
      .createHash('sha256')
      .update(fingerprint)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();
  }
}

module.exports = LicenseGenerator;

