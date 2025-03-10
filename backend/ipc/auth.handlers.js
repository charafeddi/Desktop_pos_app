const { ipcMain } = require('electron')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Generate JWT Token
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, JWT_SECRET, {
    expiresIn: '24h'
  })
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

      // Create user
      const user = await User.create({
        ...userData,
        role: userData.role || 'cashier' // Default role is cashier
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