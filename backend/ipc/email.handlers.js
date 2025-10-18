const { ipcMain } = require('electron');
const emailService = require('../services/email.service');
const passwordResetModel = require('../models/passwordReset.model');
const userModel = require('../models/user.model');
const crypto = require('crypto');

class EmailHandlers {
  constructor() {
    this.setupHandlers();
  }

  setupHandlers() {
    // Send password reset email
    ipcMain.handle('email:send-password-reset', async (event, email) => {
      try {
        console.log('Password reset requested for email:', email);

        // Find user by email
        const user = await userModel.findByEmail(email);
        if (!user) {
          return { 
            success: false, 
            error: 'No account found with this email address' 
          };
        }

        // Generate reset token
        const resetToken = emailService.generateResetToken();
        
        // Set expiration time (1 hour from now)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        // Store token in database
        await passwordResetModel.createToken(user.id, email, resetToken, expiresAt);

        // Send email
        const result = await emailService.sendPasswordReset(email, resetToken, user.name);

        console.log('Password reset email sent successfully');
        return { 
          success: true, 
          message: 'Password reset email sent successfully',
          messageId: result.messageId
        };

      } catch (error) {
        console.error('Error sending password reset email:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
    });

    // Verify reset token
    ipcMain.handle('email:verify-reset-token', async (event, token) => {
      try {
        console.log('Verifying reset token:', token);

        const tokenData = await passwordResetModel.findByToken(token);
        
        if (!tokenData) {
          return { 
            success: false, 
            error: 'Invalid or expired reset token' 
          };
        }

        return { 
          success: true, 
          user: {
            id: tokenData.user_id,
            name: tokenData.user_name,
            email: tokenData.user_email
          }
        };

      } catch (error) {
        console.error('Error verifying reset token:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
    });

    // Reset password with token
    ipcMain.handle('email:reset-password', async (event, token, newPassword) => {
      try {
        console.log('Resetting password with token');

        // Verify token
        const tokenData = await passwordResetModel.findByToken(token);
        
        if (!tokenData) {
          return { 
            success: false, 
            error: 'Invalid or expired reset token' 
          };
        }

        // Update user password
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await userModel.updatePassword(tokenData.user_id, hashedPassword);

        // Mark token as used
        await passwordResetModel.markAsUsed(token);

        console.log('Password reset successfully');
        return { 
          success: true, 
          message: 'Password reset successfully' 
        };

      } catch (error) {
        console.error('Error resetting password:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
    });

    // Send welcome email for new users
    ipcMain.handle('email:send-welcome', async (event, email, userName, tempPassword) => {
      try {
        console.log('Sending welcome email to:', email);

        const result = await emailService.sendWelcomeEmail(email, userName, tempPassword);

        console.log('Welcome email sent successfully');
        return { 
          success: true, 
          message: 'Welcome email sent successfully',
          messageId: result.messageId
        };

      } catch (error) {
        console.error('Error sending welcome email:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
    });

    // Test email configuration
    ipcMain.handle('email:test-configuration', async (event) => {
      try {
        console.log('Testing email configuration');

        const result = await emailService.testEmailConfiguration();

        return result;

      } catch (error) {
        console.error('Error testing email configuration:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
    });

    // Clean up expired tokens
    ipcMain.handle('email:cleanup-tokens', async (event) => {
      try {
        console.log('Cleaning up expired tokens');

        const result = await passwordResetModel.cleanupExpiredTokens();

        console.log('Expired tokens cleaned up:', result.deletedCount);
        return { 
          success: true, 
          deletedCount: result.deletedCount 
        };

      } catch (error) {
        console.error('Error cleaning up tokens:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
    });

    // Get token statistics
    ipcMain.handle('email:get-token-stats', async (event) => {
      try {
        const stats = await passwordResetModel.getTokenStats();
        return { 
          success: true, 
          stats 
        };

      } catch (error) {
        console.error('Error getting token stats:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
    });

    console.log('Email handlers setup complete');
  }
}

module.exports = EmailHandlers;
