<template>
  <div class="notifications-page">
    <div class="page-header">
      <h1>{{ t('notifications.title') }}</h1>
      <p class="page-description">{{ t('notifications.description') }}</p>
    </div>

    <div class="notifications-content">
      <!-- Filter and Actions -->
      <div class="notifications-toolbar">
        <div class="filter-section">
          <button 
            v-for="filter in filters" 
            :key="filter.type"
            @click="setActiveFilter(filter.type)"
            :class="['filter-btn', { active: activeFilter === filter.type }]"
          >
            <span class="material-icons">{{ filter.icon }}</span>
            {{ filter.label }}
            <span v-if="getNotificationCount(filter.type) > 0" class="count">
              {{ getNotificationCount(filter.type) }}
            </span>
          </button>
        </div>
        
        <div class="actions-section">
          <button @click="markAllAsRead" class="action-btn" :disabled="unreadCount === 0">
            <span class="material-icons">done_all</span>
            {{ t('notifications.markAllRead') }}
          </button>
          <button @click="clearAll" class="action-btn danger" :disabled="notifications.length === 0">
            <span class="material-icons">clear_all</span>
            {{ t('notifications.clearAll') }}
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="notifications-list">
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <span class="material-icons">notifications_none</span>
          <h3>{{ t('notifications.emptyTitle') }}</h3>
          <p>{{ t('notifications.emptyDescription') }}</p>
        </div>

        <div 
          v-for="notification in filteredNotifications" 
          :key="notification.id"
          class="notification-card"
          :class="{ 'unread': !notification.read }"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon" :class="notification.type">
            <span class="material-icons">{{ getNotificationIcon(notification.type) }}</span>
          </div>
          
          <div class="notification-content">
            <div class="notification-header">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <div v-if="notification.action" class="notification-action">
              <button @click.stop="handleNotificationAction(notification)" class="action-link">
                {{ t('notifications.viewDetails') }}
              </button>
            </div>
          </div>
          
          <div class="notification-actions">
            <button @click.stop="markAsRead(notification.id)" class="action-btn small">
              <span class="material-icons">done</span>
            </button>
            <button @click.stop="deleteNotification(notification.id)" class="action-btn small danger">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

// Reactive data
const notifications = ref([])
const activeFilter = ref('all')
const notificationIdCounter = ref(0)

// Filters
const filters = [
  { type: 'all', label: 'All', icon: 'notifications' },
  { type: 'unread', label: 'Unread', icon: 'mark_email_unread' },
  { type: 'success', label: 'Success', icon: 'check_circle' },
  { type: 'error', label: 'Error', icon: 'error' },
  { type: 'warning', label: 'Warning', icon: 'warning' },
  { type: 'info', label: 'Info', icon: 'info' }
]

// Computed properties
const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') {
    return notifications.value
  } else if (activeFilter.value === 'unread') {
    return notifications.value.filter(n => !n.read)
  } else {
    return notifications.value.filter(n => n.type === activeFilter.value)
  }
})

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// Methods
const setActiveFilter = (filterType) => {
  activeFilter.value = filterType
}

const getNotificationCount = (filterType) => {
  if (filterType === 'all') return notifications.value.length
  if (filterType === 'unread') return unreadCount.value
  return notifications.value.filter(n => n.type === filterType).length
}

const markAsRead = (notificationId) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
}

const deleteNotification = (notificationId) => {
  const index = notifications.value.findIndex(n => n.id === notificationId)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const clearAll = () => {
  notifications.value = []
}

const handleNotificationAction = (notification) => {
  if (notification.action) {
    if (notification.action.type === 'navigate') {
      router.push(notification.action.route)
    } else if (notification.action.type === 'function') {
      notification.action.function()
    }
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
    product: 'inventory_2',
    sale: 'receipt',
    customer: 'person',
    supplier: 'business'
  }
  return icons[type] || 'notifications'
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return timestamp.toLocaleDateString()
}

// Load notifications from global state (if available)
onMounted(() => {
  // Try to get notifications from the global window object
  if (window.notifications) {
    notifications.value = [...window.notifications]
  }
  
  // Add some demo notifications if none exist
  if (notifications.value.length === 0) {
    notifications.value = [
      {
        id: 'demo-1',
        type: 'success',
        title: 'Welcome to POS System',
        message: 'Your POS system is ready to use. Start by adding products and making your first sale.',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
      },
      {
        id: 'demo-2',
        type: 'info',
        title: 'New Feature Available',
        message: 'Bulk operations are now available for products. You can edit multiple products at once.',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: 'demo-3',
        type: 'warning',
        title: 'Low Stock Alert',
        message: '5 products are running low on stock. Consider restocking soon.',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      }
    ]
  }
})
</script>

<style scoped>
.notifications-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: var(--color-text-secondary);
  margin: 0;
}

.notifications-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--color-surface);
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
}

.filter-section {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.filter-btn:hover {
  background: var(--color-surface);
}

.filter-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.filter-btn .count {
  background: var(--color-error);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.filter-btn.active .count {
  background: rgba(255, 255, 255, 0.2);
}

.actions-section {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.action-btn:hover:not(:disabled) {
  background: var(--color-surface);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.danger {
  color: var(--color-error);
  border-color: var(--color-error);
}

.action-btn.danger:hover:not(:disabled) {
  background: var(--color-error);
  color: white;
}

.action-btn.small {
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  justify-content: center;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-secondary);
}

.empty-state .material-icons {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.empty-state p {
  margin: 0;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.notification-card:hover {
  background: var(--color-background);
  border-color: var(--color-primary);
}

.notification-card.unread {
  border-left: 4px solid var(--color-primary);
  background: rgba(59, 130, 246, 0.05);
}

.notification-icon {
  margin-right: 1rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.notification-icon.success {
  background-color: #d1fae5;
  color: #059669;
}

.notification-icon.error {
  background-color: #fee2e2;
  color: #dc2626;
}

.notification-icon.warning {
  background-color: #fef3c7;
  color: #d97706;
}

.notification-icon.info {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.notification-icon .material-icons {
  font-size: 20px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.notification-time {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.notification-message {
  color: var(--color-text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.notification-action {
  margin-top: 0.5rem;
}

.action-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.action-link:hover {
  text-decoration: underline;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .notifications-page {
    padding: 1rem;
  }
  
  .notifications-toolbar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filter-section {
    flex-wrap: wrap;
  }
  
  .actions-section {
    justify-content: center;
  }
  
  .notification-card {
    flex-direction: column;
  }
  
  .notification-actions {
    flex-direction: row;
    margin-left: 0;
    margin-top: 1rem;
    justify-content: center;
  }
}
</style>
