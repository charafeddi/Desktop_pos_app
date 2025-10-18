const db = require('../config/database');

class PasswordResetModel {
  constructor() {
    this.initTable();
  }

  // Initialize password reset tokens table
  initTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    try {
      db.exec(createTableQuery);
      console.log('Password reset tokens table initialized');
    } catch (err) {
      console.error('Error creating password_reset_tokens table:', err);
    }
  }

  // Create a new password reset token
  createToken(userId, email, token, expiresAt) {
    try {
      const query = `
        INSERT INTO password_reset_tokens (user_id, email, token, expires_at)
        VALUES (?, ?, ?, ?)
      `;
      
      const stmt = db.prepare(query);
      const result = stmt.run(userId, email, token, expiresAt);
      return { id: result.lastInsertRowid, userId, email, token, expiresAt };
    } catch (err) {
      throw err;
    }
  }

  // Find token by token string
  findByToken(token) {
    try {
      const query = `
        SELECT prt.*, u.name as user_name, u.email as user_email
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        WHERE prt.token = ? AND prt.used = FALSE AND prt.expires_at > datetime('now')
      `;
      
      const stmt = db.prepare(query);
      return stmt.get(token);
    } catch (err) {
      throw err;
    }
  }

  // Mark token as used
  markAsUsed(token) {
    try {
      const query = `
        UPDATE password_reset_tokens 
        SET used = TRUE 
        WHERE token = ?
      `;
      
      const stmt = db.prepare(query);
      const result = stmt.run(token);
      return { changes: result.changes };
    } catch (err) {
      throw err;
    }
  }

  // Clean up expired tokens
  cleanupExpiredTokens() {
    try {
      const query = `
        DELETE FROM password_reset_tokens 
        WHERE expires_at < datetime('now') OR used = TRUE
      `;
      
      const stmt = db.prepare(query);
      const result = stmt.run();
      return { deletedCount: result.changes };
    } catch (err) {
      throw err;
    }
  }

  // Get all tokens for a user (for admin purposes)
  getTokensByUserId(userId) {
    try {
      const query = `
        SELECT * FROM password_reset_tokens 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `;
      
      const stmt = db.prepare(query);
      return stmt.all(userId);
    } catch (err) {
      throw err;
    }
  }

  // Get token statistics
  getTokenStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_tokens,
          COUNT(CASE WHEN used = TRUE THEN 1 END) as used_tokens,
          COUNT(CASE WHEN used = FALSE AND expires_at > datetime('now') THEN 1 END) as active_tokens,
          COUNT(CASE WHEN expires_at < datetime('now') THEN 1 END) as expired_tokens
        FROM password_reset_tokens
      `;
      
      const stmt = db.prepare(query);
      return stmt.get();
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new PasswordResetModel();
