const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    // Gmail SMTP configuration
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });

    // Rate limiting to prevent spam
    this.rateLimit = new Map();
  }

  // Check rate limit (1 email per minute per email address)
  checkRateLimit(email) {
    const now = Date.now();
    const lastSent = this.rateLimit.get(email);
    
    if (lastSent && (now - lastSent) < 60000) { // 1 minute
      throw new Error('Please wait before requesting another reset');
    }
    
    this.rateLimit.set(email, now);
  }

  // Generate secure reset token
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Send password reset email
  async sendPasswordReset(email, resetToken, userName = 'User') {
    try {
      this.checkRateLimit(email);
      
      const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset - POS System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">POS System</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0;">Point of Sale Management</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Hello ${userName},
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                You requested a password reset for your POS System account. Click the button below to reset your password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #666; margin: 0; font-size: 14px;">
                  <strong>Security Notice:</strong> This link will expire in 1 hour for security reasons.
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-top: 30px;">
                If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                This email was sent from POS System. If you have any questions, please contact support.
              </p>
            </div>
          </div>
        `
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
      
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Send welcome email (for new users)
  async sendWelcomeEmail(email, userName, tempPassword) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: email,
        subject: 'Welcome to POS System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to POS System</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0;">Point of Sale Management</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Account Created Successfully</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Hello ${userName},
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Your POS System account has been created successfully. Here are your login credentials:
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #333; margin: 0; font-weight: bold;">Email:</p>
                <p style="color: #666; margin: 5px 0 15px 0;">${email}</p>
                
                <p style="color: #333; margin: 0; font-weight: bold;">Temporary Password:</p>
                <p style="color: #666; margin: 5px 0 0 0; font-family: monospace; background: #e9ecef; padding: 8px; border-radius: 4px;">${tempPassword}</p>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>Important:</strong> Please change your password after your first login for security reasons.
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-top: 30px;">
                You can now log in to your POS System account and start managing your business.
              </p>
            </div>
          </div>
        `
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
      
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  // Test email configuration
  async testEmailConfiguration() {
    try {
      await this.transporter.verify();
      console.log('Email configuration is valid');
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      console.error('Email configuration error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
