const { ipcMain } = require('electron');
const UserModel = require('../models/user.model');
const SaleModel = require('../models/sale.model');

// Get user statistics
ipcMain.handle('get-user-stats', async (event, userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get total sales count for user
    const totalSales = await SaleModel.getSalesCountByUser(userId);
    
    // Get total revenue for user
    const totalRevenue = await SaleModel.getTotalRevenueByUser(userId);
    
    // Calculate days active (days since first sale or registration)
    const user = await UserModel.findById(userId);
    const firstSale = await SaleModel.getFirstSaleByUser(userId);
    
    let daysActive = 0;
    if (firstSale) {
      const startDate = new Date(firstSale.created_at);
      const currentDate = new Date();
      daysActive = Math.ceil((currentDate - startDate) / (1000 * 60 * 60 * 24));
    } else if (user) {
      const startDate = new Date(user.created_at);
      const currentDate = new Date();
      daysActive = Math.ceil((currentDate - startDate) / (1000 * 60 * 60 * 24));
    }

    return {
      totalSales: totalSales || 0,
      totalRevenue: totalRevenue || 0,
      daysActive: Math.max(daysActive, 0)
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
});

// Get user activity log
ipcMain.handle('get-user-activity', async (event, userId, limit = 10) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get recent sales by user
    const sales = await SaleModel.getRecentSalesByUser(userId, limit);
    
    // Format activity items
    const activities = sales.map(sale => ({
      id: `sale_${sale.id}`,
      type: 'sale',
      title: 'Sale Completed',
      description: `Processed sale #${sale.invoice_number || sale.id} for $${sale.total_amount}`,
      created_at: sale.created_at
    }));

    // Sort by date (most recent first)
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error getting user activity:', error);
    throw error;
  }
});

// Update user profile
ipcMain.handle('update-user-profile', async (event, userId, profileData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!profileData) {
      throw new Error('Profile data is required');
    }

    // Get current user data to preserve existing values
    const currentUser = await UserModel.findById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Prepare update data with fallbacks to current values
    const updateData = {
      name: profileData.name || currentUser.name,
      email: profileData.email || currentUser.email,
      mobile_phone: profileData.mobile_phone || currentUser.mobile_phone,
      role: profileData.role || currentUser.role,
      is_active: currentUser.is_active // Preserve current active status
    };

    // Validate required fields
    if (!updateData.name || !updateData.email) {
      throw new Error('Name and email are required');
    }

    // Check if email is already taken by another user
    const existingUser = await UserModel.findByEmail(updateData.email);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Email is already taken by another user');
    }

    console.log('Updating user profile:', { userId, updateData });

    // Update user profile
    const updatedUser = await UserModel.update(userId, updateData);

    if (!updatedUser) {
      throw new Error('Failed to update user profile');
    }

    // Return updated user data
    const user = await UserModel.findById(userId);
    return user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
});

// Change user password
ipcMain.handle('change-user-password', async (event, userId, passwordData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      throw new Error('Current password and new password are required');
    }

    // Verify current password
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // For now, we'll use a simple password check
    // In a real app, you'd use proper password hashing
    if (user.password !== passwordData.currentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const updatedUser = await UserModel.update(userId, {
      password: passwordData.newPassword
    });

    if (!updatedUser) {
      throw new Error('Failed to change password');
    }

    return { success: true };
  } catch (error) {
    console.error('Error changing user password:', error);
    throw error;
  }
});

// Export setup function for consistency with other handlers
function setupUserProfileHandlers() {
  // Handlers are already registered above
  console.log('User profile handlers setup complete');
}

module.exports = setupUserProfileHandlers;
