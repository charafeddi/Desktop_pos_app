const License = require('../models/license.model');
const LicenseGenerator = require('../utils/licenseGenerator');

/**
 * License Activation IPC Handlers
 */
function setupLicenseHandlers(ipcMain) {
  const licenseGen = new LicenseGenerator();

  // Get device fingerprint
  ipcMain.handle('license:get-fingerprint', async () => {
    try {
      return {
        success: true,
        fingerprint: LicenseGenerator.getDeviceFingerprint()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error generating fingerprint'
      };
    }
  });

  // Validate license key
  ipcMain.handle('license:validate', async (event, licenseKey) => {
    try {
      // Validate the key structure
      const decoded = licenseGen.validate(licenseKey);
      
      if (!decoded || !decoded.valid) {
        return {
          success: false,
          valid: false,
          message: decoded?.expired ? 'License has expired' : 'Invalid license key'
        };
      }

      // Check if already activated on this device
      const deviceFingerprint = LicenseGenerator.getDeviceFingerprint();
      const existingLicense = License.findByDevice(deviceFingerprint);
      
      // Check device count limit
      const activatedCount = License.getActivatedDeviceCount(decoded.id);
      if (activatedCount && activatedCount.count >= decoded.devices) {
        return {
          success: false,
          valid: false,
          message: `License limit reached. Maximum ${decoded.devices} device(s) allowed.`
        };
      }

      return {
        success: true,
        valid: true,
        data: {
          licenseId: decoded.id,
          packageType: decoded.package,
          deviceCount: decoded.devices,
          expiryDate: decoded.expiry,
          canActivate: true
        }
      };
    } catch (error) {
      console.error('License validation error:', error);
      return {
        success: false,
        valid: false,
        message: 'Error validating license'
      };
    }
  });

  // Activate license
  ipcMain.handle('license:activate', async (event, { licenseKey, customerEmail, customerName }) => {
    try {
      // Validate license key
      const decoded = licenseGen.validate(licenseKey);
      
      if (!decoded || !decoded.valid) {
        return {
          success: false,
          message: decoded?.expired ? 'License has expired' : 'Invalid license key'
        };
      }

      // Get device fingerprint
      let deviceFingerprint;
      try {
        deviceFingerprint = LicenseGenerator.getDeviceFingerprint();
      } catch (err) {
        console.error('Error getting device fingerprint:', err);
        return {
          success: false,
          message: 'Error generating device fingerprint'
        };
      }

      // Check if already activated on this device
      const existing = License.findByDevice(deviceFingerprint);
      if (existing && existing.some(l => l.license_id === decoded.id && l.is_active)) {
        return {
          success: false,
          message: 'License already activated on this device'
        };
      }

      // Check device count limit
      const activatedCount = License.getActivatedDeviceCount(decoded.id);
      if (activatedCount && activatedCount.count >= decoded.devices) {
        return {
          success: false,
          message: `License device limit reached. Maximum ${decoded.devices} device(s) allowed.`
        };
      }

      // Create license record
      const licenseId = License.create({
        license_key: licenseKey,
        license_id: decoded.id,
        customer_email: customerEmail || decoded.email,
        customer_name: customerName || 'Customer',
        device_count: decoded.devices,
        package_type: decoded.package,
        device_fingerprint: deviceFingerprint,
        activated_at: new Date().toISOString(),
        expiry_date: decoded.expiry
      });

      // Save license info to settings
      const Settings = require('../models/settings.model');
      Settings.setValue('license_key', licenseKey);
      Settings.setValue('license_activated', 'true');
      Settings.setValue('license_id', decoded.id);
      Settings.setValue('license_package', decoded.package);

      return {
        success: true,
        message: 'License activated successfully',
        data: {
          licenseId: decoded.id,
          packageType: decoded.package,
          deviceCount: decoded.devices
        }
      };
    } catch (error) {
      console.error('License activation error:', error);
      return {
        success: false,
        message: 'Error activating license: ' + error.message
      };
    }
  });

  // Check license status
  ipcMain.handle('license:check', async () => {
    try {
      const Settings = require('../models/settings.model');
      const licenseKey = Settings.getValue('license_key');
      
      if (!licenseKey) {
        return {
          success: true,
          activated: false,
          message: 'No license found'
        };
      }

      // Validate license
      const decoded = licenseGen.validate(licenseKey);
      if (!decoded || !decoded.valid) {
        return {
          success: true,
          activated: false,
          message: decoded?.expired ? 'License expired' : 'Invalid license'
        };
      }

      // Check if device matches
      let deviceFingerprint;
      try {
        deviceFingerprint = LicenseGenerator.getDeviceFingerprint();
      } catch (err) {
        console.error('Error getting device fingerprint:', err);
        return {
          success: false,
          activated: false,
          message: 'Error checking device fingerprint'
        };
      }
      const license = License.findByDevice(deviceFingerprint);
      const isActivated = license && license.some(l => 
        l.license_key === licenseKey && l.is_active
      );

      return {
        success: true,
        activated: isActivated,
        valid: decoded.valid,
        data: {
          licenseId: decoded.id,
          packageType: decoded.package,
          deviceCount: decoded.devices,
          expiryDate: decoded.expiry
        }
      };
    } catch (error) {
      console.error('License check error:', error);
      return {
        success: false,
        activated: false,
        message: 'Error checking license'
      };
    }
  });

  // Deactivate license
  ipcMain.handle('license:deactivate', async () => {
    try {
      const Settings = require('../models/settings.model');
      const licenseId = Settings.getValue('license_id');
      let deviceFingerprint;
      try {
        deviceFingerprint = LicenseGenerator.getDeviceFingerprint();
      } catch (err) {
        console.error('Error getting device fingerprint:', err);
        deviceFingerprint = null;
      }

      if (licenseId) {
        License.deactivate(licenseId, deviceFingerprint);
      }

      // Clear license from settings
      Settings.setValue('license_key', '');
      Settings.setValue('license_activated', 'false');
      Settings.setValue('license_id', '');
      Settings.setValue('license_package', '');

      return {
        success: true,
        message: 'License deactivated successfully'
      };
    } catch (error) {
      console.error('License deactivation error:', error);
      return {
        success: false,
        message: 'Error deactivating license'
      };
    }
  });
}

module.exports = setupLicenseHandlers;

