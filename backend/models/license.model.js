const db = require('../config/database');

/**
 * License Model - Track license activations
 */
class License {
  /**
   * Create a new license record
   */
  static create(licenseData) {
    const {
      license_key,
      license_id,
      customer_email,
      customer_name,
      device_count,
      package_type,
      device_fingerprint,
      activated_at,
      expiry_date
    } = licenseData;

    try {
      const stmt = db.prepare(`
        INSERT INTO licenses (
          license_key, license_id, customer_email, customer_name,
          device_count, package_type, device_fingerprint,
          activated_at, expiry_date, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `);

      const result = stmt.run(
        license_key,
        license_id,
        customer_email,
        customer_name,
        device_count || 1,
        package_type || 'professional',
        device_fingerprint,
        activated_at || new Date().toISOString(),
        expiry_date || null
      );

      return result.lastInsertRowid;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find license by key
   */
  static findByKey(licenseKey) {
    try {
      const stmt = db.prepare('SELECT * FROM licenses WHERE license_key = ?');
      return stmt.get(licenseKey);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find license by ID
   */
  static findById(licenseId) {
    try {
      const stmt = db.prepare('SELECT * FROM licenses WHERE license_id = ?');
      return stmt.get(licenseId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find by device fingerprint
   */
  static findByDevice(deviceFingerprint) {
    try {
      const stmt = db.prepare(
        'SELECT * FROM licenses WHERE device_fingerprint = ? AND is_active = 1'
      );
      return stmt.all(deviceFingerprint);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if device count limit reached
   */
  static getActivatedDeviceCount(licenseId) {
    try {
      const stmt = db.prepare(`
        SELECT COUNT(*) as count 
        FROM licenses 
        WHERE license_id = ? AND is_active = 1
      `);
      return stmt.get(licenseId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update license
   */
  static update(id, updates) {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    });

    values.push(id);

    try {
      const stmt = db.prepare(
        `UPDATE licenses SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      );
      return stmt.run(...values);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deactivate license
   */
  static deactivate(licenseId, deviceFingerprint = null) {
    try {
      if (deviceFingerprint) {
        const stmt = db.prepare(`
          UPDATE licenses 
          SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
          WHERE license_id = ? AND device_fingerprint = ?
        `);
        return stmt.run(licenseId, deviceFingerprint);
      } else {
        const stmt = db.prepare(`
          UPDATE licenses 
          SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
          WHERE license_id = ?
        `);
        return stmt.run(licenseId);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all licenses for a customer
   */
  static findByCustomer(email) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM licenses 
        WHERE customer_email = ? 
        ORDER BY activated_at DESC
      `);
      return stmt.all(email);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = License;

