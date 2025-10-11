<template>
        <div class="page-content">
        <div class="main-wrapper">
      <!-- Profile Header with Background -->
            <div class="profile-header">
        <div class="profile-background"></div>
        <div class="profile-content-wrapper">
                <div class="row">
                    <div class="col">
                        <div class="profile-img">
                <img 
                  :src="user.avatar || defaultAvatar" 
                  alt="profile picture"
                  @error="handleImageError"
                  @load="handleImageLoad"
                >
                <div class="profile-edit-btn" @click="openEditModal">
                  <i class="fas fa-camera"></i>
                </div>
                        </div>
                        <div class="profile-name">
                <h3>{{ user.name || 'User Name' }}</h3>
                <span>{{ user.role || 'User' }}</span>
                        </div>
                        <div class="profile-menu">
                            <ul>
                                <li>
                    <a href="#" @click="activeTab = 'overview'" :class="{ active: activeTab === 'overview' }">Overview</a>
                                </li>
                  <li>
                    <a href="#" @click="activeTab = 'settings'" :class="{ active: activeTab === 'settings' }">Settings</a>
                  </li>
                  <li>
                    <a href="#" @click="activeTab = 'activity'" :class="{ active: activeTab === 'activity' }">Activity</a>
                                </li>
                            </ul>
                            <div class="profile-status">
                                <i class="active-now"></i> Active now
                            </div>
                        </div>
                    </div>
                </div>
            </div>
      </div>

      <!-- Profile Content -->
            <div class="profile-content">
        <div class="row flex flex-col lg:flex-row">
          <!-- Main Content -->
          <div class="w-full lg:w-2/3 p-4">
            <!-- Overview Tab -->
            <div v-if="activeTab === 'overview'" class="tab-content">
              <!-- User Stats Cards -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="fas fa-shopping-cart"></i>
                  </div>
                  <div class="stat-info">
                    <h4>{{ userStats.totalSales || 0 }}</h4>
                    <p>Total Sales</p>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="fas fa-dollar-sign"></i>
                  </div>
                  <div class="stat-info">
                    <h4>${{ formatCurrency(userStats.totalRevenue) }}</h4>
                    <p>Total Revenue</p>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="fas fa-calendar-day"></i>
                  </div>
                  <div class="stat-info">
                    <h4>{{ userStats.daysActive || 0 }}</h4>
                    <p>Days Active</p>
                  </div>
                </div>
              </div>

              <!-- Recent Activity -->
                        <div class="card">
                <div class="card-header">
                  <h5 class="card-title">Recent Activity</h5>
                                        </div>
                <div class="card-body">
                  <div class="activity-list" v-if="recentActivity.length > 0">
                    <div class="activity-item" v-for="activity in recentActivity" :key="activity.id">
                      <div class="activity-icon">
                        <i :class="getActivityIcon(activity.type)"></i>
                                        </div>
                      <div class="activity-content">
                        <h6>{{ activity.title }}</h6>
                        <p>{{ activity.description }}</p>
                        <span class="activity-time">{{ formatTimeAgo(activity.created_at) }}</span>
                                    </div>
                                    </div>
                                    </div>
                  <div v-else class="text-center text-muted py-4">
                    <i class="fas fa-history fa-2x mb-3"></i>
                    <p>No recent activity</p>
                                            </div>
                                        </div>
                                            </div>
                                        </div>

            <!-- Settings Tab -->
            <div v-if="activeTab === 'settings'" class="tab-content">
              <div class="card">
                <div class="card-header">
                  <h5 class="card-title">Profile Settings</h5>
                  <button class="btn btn-primary btn-sm" @click="openEditModal">
                    <i class="fas fa-edit"></i> Edit Profile
                  </button>
                                                    </div>
                <div class="card-body">
                  <div class="profile-info-display">
                    <div class="info-item">
                      <label>Full Name:</label>
                      <span>{{ user.name || 'Not provided' }}</span>
                                                </div>
                    <div class="info-item">
                      <label>Email:</label>
                      <span>{{ user.email || 'Not provided' }}</span>
                                        </div>
                    <div class="info-item">
                      <label>Phone:</label>
                      <span>{{ user.mobile_phone || 'Not provided' }}</span>
                                    </div>
                    <div class="info-item">
                      <label>Role:</label>
                      <span>{{ user.role || 'User' }}</span>
                                </div>
                    <div class="info-item">
                      <label>Member Since:</label>
                      <span>{{ formatDate(user.created_at) }}</span>
                        </div>
                  </div>
                </div>
              </div>

              <!-- Change Password -->
              <div class="card mt-4">
                <div class="card-header">
                  <h5 class="card-title">Change Password</h5>
                </div>
                <div class="card-body">
                  <form @submit.prevent="changePassword">
                    <div class="form-group">
                      <label for="currentPassword">Current Password</label>
                      <input 
                        type="password" 
                        id="currentPassword" 
                        v-model="passwordForm.currentPassword" 
                        class="form-control"
                        required
                      >
                    </div>
                    <div class="form-group">
                      <label for="newPassword">New Password</label>
                      <input 
                        type="password" 
                        id="newPassword" 
                        v-model="passwordForm.newPassword" 
                        class="form-control"
                        required
                        minlength="6"
                      >
                    </div>
                    <div class="form-group">
                      <label for="confirmPassword">Confirm New Password</label>
                      <input 
                        type="password" 
                        id="confirmPassword" 
                        v-model="passwordForm.confirmPassword" 
                        class="form-control"
                        required
                      >
                    </div>
                    <button type="submit" class="btn btn-warning" :disabled="isChangingPassword">
                      <i class="fas fa-spinner fa-spin" v-if="isChangingPassword"></i>
                      {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <!-- Activity Tab -->
            <div v-if="activeTab === 'activity'" class="tab-content">
                        <div class="card">
                <div class="card-header">
                  <h5 class="card-title">Detailed Activity Log</h5>
                                        </div>
                <div class="card-body">
                  <div class="activity-timeline" v-if="activityLog.length > 0">
                    <div class="timeline-item" v-for="activity in activityLog" :key="activity.id">
                      <div class="timeline-marker">
                        <i :class="getActivityIcon(activity.type)"></i>
                                        </div>
                      <div class="timeline-content">
                        <h6>{{ activity.title }}</h6>
                        <p>{{ activity.description }}</p>
                        <span class="timeline-date">{{ formatDateTime(activity.created_at) }}</span>
                                    </div>
                                    </div>
                  </div>
                  <div v-else class="text-center text-muted py-4">
                    <i class="fas fa-history fa-2x mb-3"></i>
                    <p>No activity log available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="w-full lg:w-1/3 p-4">
            <!-- Contact Info -->
            <div class="card">
              <div class="card-header">
                <h5 class="card-title">Contact Information</h5>
              </div>
              <div class="card-body">
                <ul class="contact-list">
                  <li>
                    <i class="fas fa-envelope"></i>
                    <span>{{ user.email || 'No email provided' }}</span>
                                            </li>
                                            <li>
                    <i class="fas fa-phone"></i>
                    <span>{{ user.mobile_phone || 'No phone provided' }}</span>
                                            </li>
                                            <li>
                    <i class="fas fa-user-tag"></i>
                    <span>{{ user.role || 'User' }}</span>
                  </li>
                  <li>
                    <i class="fas fa-calendar-plus"></i>
                    <span>Joined {{ formatDate(user.created_at) }}</span>
                                            </li>
                                        </ul>
                                    </div>
                                            </div>

            <!-- Quick Actions -->
            <div class="card mt-4">
              <div class="card-header">
                <h5 class="card-title">Quick Actions</h5>
                                        </div>
              <div class="card-body">
                <div class="quick-actions">
                  <button class="action-btn" @click="$router.push('/pos')">
                    <i class="fas fa-cash-register"></i>
                    <span>New Sale</span>
                  </button>
                  <button class="action-btn" @click="$router.push('/products')">
                    <i class="fas fa-box"></i>
                    <span>Manage Products</span>
                  </button>
                  <button class="action-btn" @click="$router.push('/customers')">
                    <i class="fas fa-users"></i>
                    <span>View Customers</span>
                  </button>
                  <button class="action-btn" @click="$router.push('/analytics')">
                    <i class="fas fa-chart-bar"></i>
                    <span>View Analytics</span>
                  </button>
                                                    </div>
                                                </div>
                                        </div>
                                    </div>
                                </div>
                        </div>
                    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">Edit Profile</h5>
          <button class="modal-close" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
                            </div>
        <div class="modal-body">
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label for="editName">Full Name</label>
              <input 
                type="text" 
                id="editName" 
                v-model="editForm.name" 
                class="form-control"
                required
              >
                        </div>
            <div class="form-group">
              <label for="editEmail">Email</label>
              <input 
                type="email" 
                id="editEmail" 
                v-model="editForm.email" 
                class="form-control"
                required
              >
                    </div>
            <div class="form-group">
              <label for="editPhone">Phone Number</label>
              <input 
                type="tel" 
                id="editPhone" 
                v-model="editForm.mobile_phone" 
                class="form-control"
              >
                </div>
            <div class="form-group">
              <label for="editRole">Role</label>
              <select id="editRole" v-model="editForm.role" class="form-control">
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeEditModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isUpdating">
                <i class="fas fa-spinner fa-spin" v-if="isUpdating"></i>
                {{ isUpdating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
        </div>
    </div>
</template>

<script lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { computed, ref, reactive, onMounted } from 'vue'

export default {
  name: 'Profile',
    setup() {
    const authStore = useAuthStore()
    const activeTab = ref('overview')
    const showEditModal = ref(false)
    const isUpdating = ref(false)
    const isChangingPassword = ref(false)
    
    // Real user statistics
    const userStats = reactive({
      totalSales: 0,
      totalRevenue: 0,
      daysActive: 0
    })
    
    // Recent activity and activity log
    const recentActivity = ref([])
    const activityLog = ref([])
    
    // Edit form for modal
    const editForm = reactive({
      name: '',
      email: '',
      mobile_phone: '',
      role: 'admin'
    })
    
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const user = computed(() => authStore.user)
    
    const defaultAvatar = '/assets/img/avatar/profile-image-1.png'

    const formatDate = (dateString) => {
      if (!dateString) return 'Not available'
      return new Date(dateString).toLocaleDateString()
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return 'Not available'
      return new Date(dateString).toLocaleString()
    }

    const formatTimeAgo = (dateString) => {
      if (!dateString) return 'Unknown'
      const now = new Date()
      const date = new Date(dateString)
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 60) return 'Just now'
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
      return `${Math.floor(diffInSeconds / 86400)} days ago`
    }

    const formatCurrency = (amount) => {
      return amount ? amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }) : '0.00'
    }

    const getActivityIcon = (type) => {
      const icons = {
        'sale': 'fas fa-shopping-cart',
        'customer': 'fas fa-user-plus',
        'product': 'fas fa-box',
        'return': 'fas fa-undo',
        'login': 'fas fa-sign-in-alt',
        'logout': 'fas fa-sign-out-alt',
        'password': 'fas fa-key',
        'profile': 'fas fa-user-edit'
      }
      return icons[type] || 'fas fa-info-circle'
    }

    const fetchUserStats = async () => {
      try {
        if (!user.value?.id) return
        
        // Fetch user statistics from backend
        const stats = await window.electronAPI.getUserStats(user.value.id)
        if (stats) {
          userStats.totalSales = stats.totalSales || 0
          userStats.totalRevenue = stats.totalRevenue || 0
          userStats.daysActive = stats.daysActive || 0
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    }

    const fetchRecentActivity = async () => {
      try {
        if (!user.value?.id) return
        
        // Fetch recent activity from backend
        const activity = await window.electronAPI.getUserActivity(user.value.id, 5)
        recentActivity.value = activity || []
      } catch (error) {
        console.error('Error fetching recent activity:', error)
      }
    }

    const fetchActivityLog = async () => {
      try {
        if (!user.value?.id) return
        
        // Fetch full activity log from backend
        const log = await window.electronAPI.getUserActivity(user.value.id, 50)
        activityLog.value = log || []
      } catch (error) {
        console.error('Error fetching activity log:', error)
      }
    }

    const openEditModal = () => {
      if (user.value) {
        editForm.name = user.value.name || ''
        editForm.email = user.value.email || ''
        editForm.mobile_phone = user.value.mobile_phone || ''
        editForm.role = user.value.role || 'admin'
      }
      showEditModal.value = true
    }

    const closeEditModal = () => {
      showEditModal.value = false
      // Reset form
      editForm.name = ''
      editForm.email = ''
      editForm.mobile_phone = ''
      editForm.role = 'admin'
    }

    const updateProfile = async () => {
      try {
        isUpdating.value = true
        
        if (!user.value?.id) {
          throw new Error('User not found')
        }

        // Update user profile via backend
        const updatedUser = await window.electronAPI.updateUserProfile(user.value.id, editForm)
        
        if (updatedUser) {
          // Update auth store with new user data
          authStore.setUser(updatedUser)
          closeEditModal()
          
          // Show success message
          // Profile updated successfully
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        // Show error message
      } finally {
        isUpdating.value = false
      }
    }

    const changePassword = async () => {
      try {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          alert('Passwords do not match')
          return
        }
        
        if (passwordForm.newPassword.length < 6) {
          alert('Password must be at least 6 characters long')
          return
        }
        
        isChangingPassword.value = true
        
        if (!user.value?.id) {
          throw new Error('User not found')
        }

        // Change password via backend
        await window.electronAPI.changeUserPassword(user.value.id, {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
        
        // Show success message
        // Password changed successfully
        
        // Reset form
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } catch (error) {
        console.error('Error changing password:', error)
        // Show error message
      } finally {
        isChangingPassword.value = false
      }
    }

    // Image handling functions
    const handleImageError = (event) => {
      // Fallback to a different image
      event.target.src = defaultAvatar
    }

    const handleImageLoad = (event) => {
      // Image loaded successfully
      console.log('Image loaded successfully:', event.target.src)
    }

    onMounted(async () => {
      await fetchUserStats()
      await fetchRecentActivity()
      
      // Fetch activity log when activity tab is selected
      if (activeTab.value === 'activity') {
        await fetchActivityLog()
      }
    })

    // Watch for tab changes to fetch activity log
    const watchTab = () => {
      if (activeTab.value === 'activity' && activityLog.value.length === 0) {
        fetchActivityLog()
      }
    }

    return {
      user,
      defaultAvatar,
      activeTab,
      userStats,
      recentActivity,
      activityLog,
      editForm,
      passwordForm,
      showEditModal,
      isUpdating,
      isChangingPassword,
      formatDate,
      formatDateTime,
      formatTimeAgo,
      formatCurrency,
      getActivityIcon,
      openEditModal,
      closeEditModal,
      updateProfile,
      changePassword,
      watchTab
    }
  }
}
</script>

<style lang="css" scoped>
.page-content {
  padding-top: 70px;
  min-height: 100vh;
}

.profile-header {
  position: relative;
  height: 350px;
  overflow: hidden;
}

.profile-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/assets/img/profile-bg.jpg') no-repeat center center;
  background-size: cover;
  z-index: -2;
}

.profile-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.profile-content-wrapper {
  position: relative;
  z-index: 2;
  padding: 40px 20px;
  color: white;
}

.profile-img {
  position: relative;
  float: left;
  margin-top: 40px;
}

.profile-img img {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.profile-edit-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-edit-btn:hover {
  background: #0056b3;
  transform: scale(1.1);
}

.profile-name {
  display: block;
  float: left;
  margin-top: 82px;
  margin-left: 30px;
  color: #fff;
}

.profile-name h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.profile-name span {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  text-transform: capitalize;
}

.profile-menu {
  float: right;
  height: 174px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.profile-menu ul {
  margin-top: auto;
  list-style: none;
  margin-bottom: 0;
  overflow: hidden;
  padding-left: 0;
  display: flex;
}

.profile-menu ul li {
  float: left;
}

.profile-menu ul li a {
  display: block;
  padding: 15px 20px;
  margin: 12px 5px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.profile-menu ul li a:hover,
.profile-menu ul li a.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
}

.profile-status {
  height: 40px;
  align-self: flex-end;
  padding: 20px 25px;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
}

.profile-status i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.profile-status i.active-now {
  background: #28a745;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.profile-content {
  margin-top: 40px;
  padding: 0 20px;
}

.card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e9ecef;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.card-body {
  padding: 25px;
}

/* Stats Cards */
.stat-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.stat-card:nth-child(1) .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card:nth-child(2) .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-info h4 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.stat-info p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 20px 0;
  border-bottom: 1px solid #e9ecef;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  background: #f8f9fa;
  color: #007bff;
}

.activity-content h6 {
  margin: 0 0 5px 0;
  font-weight: 600;
  color: #333;
}

.activity-content p {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 14px;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

/* Timeline */
.activity-timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 20px;
  top: 50px;
  width: 2px;
  height: calc(100% + 10px);
  background: #e9ecef;
}

.timeline-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  background: #007bff;
  color: white;
  z-index: 2;
  position: relative;
}

.timeline-content h6 {
  margin: 0 0 5px 0;
  font-weight: 600;
  color: #333;
}

.timeline-content p {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 14px;
}

.timeline-date {
  font-size: 12px;
  color: #999;
}

/* Contact List */
.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contact-list li {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #e9ecef;
}

.contact-list li:last-child {
  border-bottom: none;
}

.contact-list li i {
  width: 20px;
  margin-right: 15px;
  color: #007bff;
}

.contact-list li span {
  color: #333;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 15px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: #333;
}

.action-btn:hover {
  background: #007bff;
  color: white;
  transform: translateY(-2px);
}

.action-btn i {
  font-size: 24px;
  margin-bottom: 8px;
}

.action-btn span {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.btn {
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-content-wrapper {
    padding: 20px 15px;
  }
  
  .profile-img {
    float: none;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .profile-name {
    float: none;
    text-align: center;
    margin: 0;
  }
  
  .profile-menu {
    float: none;
    height: auto;
    align-items: center;
    margin-top: 20px;
  }
  
  .profile-menu ul {
    flex-direction: column;
    width: 100%;
  }
  
  .profile-menu ul li {
    width: 100%;
    text-align: center;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Profile Info Display */
.profile-info-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 600;
  color: #374151;
  min-width: 120px;
}

.info-item span {
  color: #6b7280;
  text-align: right;
}

/* Loading States */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Text utilities */
.text-center {
  text-align: center;
}

.text-muted {
  color: #6b7280;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.fa-2x {
  font-size: 2em;
}
</style>