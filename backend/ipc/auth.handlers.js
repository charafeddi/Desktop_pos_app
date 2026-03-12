const { ipcMain } = require('electron')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const config = require('../config/env')

const JWT_SECRET = config.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in backend/.env. Check your environment configuration.');
}

// Generate JWT Token
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, JWT_SECRET, {
    expiresIn: '24h'
  })
}

// Simple in-memory rate limiter for login attempts (max 5 per 15 minutes per email)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(email) {
  const now = Date.now();
  const key = email.toLowerCase();
  const record = loginAttempts.get(key);

  if (!record || now - record.windowStart > WINDOW_MS) {
    loginAttempts.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }
  record.count++;
  return true;
}

function resetRateLimit(email) {
  loginAttempts.delete(email.toLowerCase());
}

// Register IPC handlers
function setupAuthHandlers() {
  // Register handler
  ipcMain.handle('auth:register', async (event, userData) => {
    try {
      // Validate required fields
      const { name, email, mobile_phone, password } = userData
      if (!name || !email || !mobile_phone || !password) {
        return {
          success: false,
          message: 'Please provide name, email, mobile phone and password'
        }
      }

      // Check if user exists
      const existingEmail = await User.findByEmail(email)
      if (existingEmail) {
        return {
          success: false,
          message: 'Email is already registered'
        }
      }

      const existingPhone = await User.findByMobilePhone(mobile_phone)
      if (existingPhone) {
        return {
          success: false,
          message: 'Mobile phone is already registered'
        }
      }

      // Create user — role is always 'cashier' on self-registration;
      // admins must be promoted via the admin panel.
      const user = await User.create({
        ...userData,
        role: 'cashier'
      })

      // Generate token
      const token = generateToken(user.id, user.email, user.role)

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        message: 'Error registering user'
      }
    }
  })

  // Login handler
  ipcMain.handle('auth:login', async (event, { email, password }) => {
    try {
      // Rate limiting: block after too many failed attempts
      if (!checkRateLimit(email)) {
        return {
          success: false,
          message: 'Too many login attempts. Please try again in 15 minutes.'
        }
      }

      // Find user
      const user = await User.findByEmail(email)
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        }
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password)
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password'
        }
      }

      // Successful login — reset rate limit counter
      resetRateLimit(email)

      // Generate token
      const token = generateToken(user.id, user.email, user.role)

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'Error logging in'
      }
    }
  })

  // Logout handler
  ipcMain.handle('auth:logout', async () => {
    return { success: true }
  })
}

module.exports = setupAuthHandlers 