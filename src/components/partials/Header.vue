<template>
  <div class="page-header">
    <nav class="navbar">
      <!-- Left side content -->
      <div class="navbar-left">
        <ul class="navbar-nav">
          <li class="nav-item small-screens-sidebar-link">
            <a href="#" class="nav-link">
              <span class="material-icons">menu</span>
            </a>
          </li>
          <li class="nav-item nav-profile dropdown">
            <a class="nav-link dropdown-toggle" 
               href="#" 
               id="navbarDropdown" 
               @click.prevent="toggleDropdown"
               ref="dropdownTrigger">
              <img :src="userAvatar" :alt="user?.username">
              <span> {{ user?.username}}</span>
              <span class="material-icons" :class="{ 'rotate-180': isDropdownOpen }">keyboard_arrow_down</span>
            </a>
            <div class="dropdown-menu" :class="{ 'show': isDropdownOpen }" ref="dropdownMenu">
              <router-link class="dropdown-item" :to="{name:'Profile'}">
                <span class="material-icons">account_circle</span>
                {{ t('header.profile') }}
              </router-link>
              <router-link class="dropdown-item" :to="{name:'Settings'}">
                <span class="material-icons">settings</span>
                {{ t('header.settings') }}
              </router-link>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                <span class="material-icons">logout</span>
                {{ t('header.logout') }}
              </a>
            </div>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" title="Messages">
              <span class="material-icons">mail</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" :title="t('header.notifications')" @click.prevent="toggleNotifications">
              <span class="material-icons">notifications</span>
              <span v-if="unreadNotifications.length > 0" class="notification-badge">{{ unreadNotifications.length }}</span>
            </a>
            <!-- Notifications Dropdown -->
            <div v-if="showNotifications" class="notifications-dropdown">
               <div class="notifications-header">
                 <h3>{{ t('header.notifications') }}</h3>
                 <div class="header-actions">
                   <button @click="markAllAsRead" class="mark-all-read" v-if="unreadNotifications.length > 0">
                     {{ t('header.markAllRead') }}
                   </button>
                   <button @click="clearAllNotifications" class="clear-all" v-if="notifications.length > 0">
                     {{ t('header.clearAll') }}
                   </button>
                 </div>
               </div>
              <div class="notifications-list">
                <div v-if="notifications.length === 0" class="no-notifications">
                  <span class="material-icons">notifications_none</span>
                  <span>{{ t('header.noNotifications') }}</span>
                </div>
                 <div 
                   v-for="notification in notifications" 
                   :key="notification.id"
                   class="notification-item"
                   :class="{ 'unread': !notification.read }"
                 >
                   <div class="notification-main" @click="handleNotificationClick(notification)">
                     <div class="notification-icon" :class="notification.type">
                       <span class="material-icons">{{ getNotificationIcon(notification.type) }}</span>
                     </div>
                     <div class="notification-content">
                       <div class="notification-title">{{ notification.title }}</div>
                       <div class="notification-message">{{ notification.message }}</div>
                       <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
                     </div>
                     <div v-if="!notification.read" class="unread-indicator"></div>
                   </div>
                   <button @click="removeNotification(notification.id)" class="dismiss-btn" :title="t('header.dismiss')">
                     <span class="material-icons">close</span>
                   </button>
                 </div>
              </div>
               <div class="notifications-footer">
                 <router-link :to="{ name: 'Notifications' }" class="view-all">
                   {{ t('header.viewAllNotifications') }}
                 </router-link>
               </div>
            </div>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" :title="t('header.theme')" @click.prevent="toggleTheme">
              <span class="material-icons">{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Right side content -->
      <div class="navbar-right">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a href="#" class="nav-link">Projects</a>
          </li>
          <li class="nav-item">
            <router-link :to="{name: 'Todo'}" class="nav-link">Tasks</router-link>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link">Reports</a>
          </li>
        </ul>
        <div class="navbar-search">
          <form @submit.prevent="handleGlobalSearch">
            <div class="form-group">
              <input 
                type="text" 
                name="search" 
                id="nav-search" 
                v-model="searchQuery"
                :placeholder="t('header.search')"
                @input="handleSearchInput"
                @focus="showSearchResults = true"
                @blur="hideSearchResults"
                ref="searchInput"
              >
              <!-- Search Results Dropdown -->
              <div v-if="showSearchResults && searchResults.length > 0" class="search-results">
                <div class="search-results-header">
                  <span class="text-sm font-medium">{{ t('header.searchResults') }}</span>
                  <span class="text-xs text-muted">{{ searchResults.length }} {{ t('header.results') }}</span>
                </div>
                <div class="search-results-list">
                  <div 
                    v-for="result in searchResults" 
                    :key="`${result.type}-${result.id}`"
                    class="search-result-item"
                    @click="navigateToResult(result)"
                  >
                    <div class="result-icon">
                      <span class="material-icons">{{ getResultIcon(result.type) }}</span>
                    </div>
                    <div class="result-content">
                      <div class="result-title">{{ result.title }}</div>
                      <div class="result-subtitle">{{ result.subtitle }}</div>
                      <div class="result-type">{{ t(`header.${result.type}`) }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- No Results -->
              <div v-if="showSearchResults && searchQuery && searchResults.length === 0" class="search-results">
                <div class="search-no-results">
                  <span class="material-icons">search_off</span>
                  <span>{{ t('header.noResults') }}</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/utils/toastManager'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { t } = useI18n()
const { success, error, warning, info } = useToast()

const isDropdownOpen = ref(false)
const dropdownTrigger = ref(null)
const dropdownMenu = ref(null)

// Notifications
const showNotifications = ref(false)
const notifications = ref([])
const notificationIdCounter = ref(0)

// Search functionality
const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const searchInput = ref(null)

// Get user from auth store
const user = computed(() => authStore.user)

// Get theme state
const isDarkMode = computed(() => themeStore.getIsDarkMode)

// Generate avatar URL based on username
const userAvatar = computed(() => {
  return user.value?.username 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value.username)}&background=random` 
    : 'https://ui-avatars.com/api/?name=U&background=random'
})

// Unread notifications count
const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read)
})

// Toggle dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Toggle theme
const toggleTheme = () => {
  themeStore.toggleTheme()
}

// Notification methods
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showSearchResults.value = false // Close search if open
}

const addNotification = (type, title, message, action = null, autoDismiss = true, dismissDelay = 5000) => {
  const notification = {
    id: `notification-${++notificationIdCounter.value}`,
    type, // 'success', 'error', 'warning', 'info'
    title,
    message,
    action,
    read: false,
    timestamp: new Date()
  }
  
  notifications.value.unshift(notification)
  
  // Keep only last 50 notifications
  if (notifications.value.length > 50) {
    notifications.value = notifications.value.slice(0, 50)
  }
  
  // Auto-dismiss notification after specified delay
  if (autoDismiss) {
    setTimeout(() => {
      removeNotification(notification.id)
    }, dismissDelay)
  }
  
  // Show toast notification as well
  switch (type) {
    case 'success':
      success(title, message)
      break
    case 'error':
      error(title, message)
      break
    case 'warning':
      warning(title, message)
      break
    case 'info':
    default:
      info(title, message)
      break
  }
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

const removeNotification = (notificationId) => {
  const index = notifications.value.findIndex(n => n.id === notificationId)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const clearAllNotifications = () => {
  notifications.value = []
}

const dismissNotification = (notificationId) => {
  // Mark as read first, then remove after a short delay
  markAsRead(notificationId)
  setTimeout(() => {
    removeNotification(notificationId)
  }, 500) // Remove after 500ms
}

const handleNotificationClick = (notification) => {
  markAsRead(notification.id)
  
  if (notification.action) {
    // Handle notification action (navigate, execute function, etc.)
    if (notification.action.type === 'navigate') {
      router.push(notification.action.route)
    } else if (notification.action.type === 'function') {
      notification.action.function()
    }
  }
  
  // Dismiss the notification after clicking
  dismissNotification(notification.id)
  showNotifications.value = false
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

// Handle click outside to close dropdown
const handleClickOutside = (event) => {
  if (!dropdownTrigger.value?.contains(event.target) && 
      !dropdownMenu.value?.contains(event.target)) {
    isDropdownOpen.value = false
  }
  
  // Close notifications if clicking outside
  if (!event.target.closest('.notifications-dropdown') && 
      !event.target.closest('.nav-link[title*="notifications"]')) {
    showNotifications.value = false
  }
}

// Handle logout
const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Search functionality
const handleSearchInput = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  try {
    // Search across different modules
    const results = await performGlobalSearch(searchQuery.value)
    searchResults.value = results.slice(0, 8) // Limit to 8 results
    console.log('Search results set:', searchResults.value.length)
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  }
}

const handleGlobalSearch = () => {
  if (searchResults.value.length > 0) {
    navigateToResult(searchResults.value[0])
  }
}

const hideSearchResults = () => {
  // Delay hiding to allow clicking on results
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

const navigateToResult = (result) => {
  showSearchResults.value = false
  searchQuery.value = ''
  searchResults.value = []
  
  // Navigate based on result type
  switch (result.type) {
    case 'product':
      router.push({ name: 'Product', query: { search: result.id } })
      break
    case 'customer':
      router.push({ name: 'Customers', query: { search: result.id } })
      break
    case 'supplier':
      router.push({ name: 'Suplier', query: { search: result.id } })
      break
    case 'sale':
      router.push({ name: 'SalesList', query: { search: result.id } })
      break
    case 'todo':
      router.push({ name: 'Todo', query: { search: result.id } })
      break
    default:
      console.log('Unknown result type:', result.type)
  }
}

const getResultIcon = (type) => {
  const icons = {
    product: 'inventory_2',
    customer: 'person',
    supplier: 'business',
    sale: 'receipt',
    todo: 'checklist',
    category: 'category'
  }
  return icons[type] || 'search'
}

const performGlobalSearch = async (query) => {
  const results = []
  const searchTerm = query.toLowerCase()
  
  console.log('Searching for:', searchTerm)
  
  try {
    // Search products
    const products = await window.electronAPI.products.getAll() || []
    console.log('Found products:', products.length)
    const filteredProducts = products.filter(product => 
      product.name?.toLowerCase().includes(searchTerm) ||
      product.sku?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    )
    console.log('Filtered products:', filteredProducts.length)
    filteredProducts.forEach(product => {
      results.push({
        type: 'product',
        id: product.id,
        title: product.name || 'Unnamed Product',
        subtitle: `SKU: ${product.sku || 'N/A'} | Stock: ${product.stock_quantity || 0}`,
        data: product
      })
    })
    
    // Search customers
    const customers = await window.electronAPI.customers.getAll() || []
    console.log('Found customers:', customers.length)
    const filteredCustomers = customers.filter(customer => 
      customer.name?.toLowerCase().includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm) ||
      customer.phone?.toLowerCase().includes(searchTerm)
    )
    console.log('Filtered customers:', filteredCustomers.length)
    filteredCustomers.forEach(customer => {
      results.push({
        type: 'customer',
        id: customer.id,
        title: customer.name || 'Unnamed Customer',
        subtitle: customer.email || customer.phone || 'No contact info',
        data: customer
      })
    })
    
    // Search suppliers
    const suppliers = await window.electronAPI.suppliers.getAll() || []
    console.log('Found suppliers:', suppliers.length)
    const filteredSuppliers = suppliers.filter(supplier => 
      supplier.name?.toLowerCase().includes(searchTerm) ||
      supplier.email?.toLowerCase().includes(searchTerm) ||
      supplier.phone?.toLowerCase().includes(searchTerm)
    )
    console.log('Filtered suppliers:', filteredSuppliers.length)
    filteredSuppliers.forEach(supplier => {
      results.push({
        type: 'supplier',
        id: supplier.id,
        title: supplier.name || 'Unnamed Supplier',
        subtitle: supplier.email || supplier.phone || 'No contact info',
        data: supplier
      })
    })
    
    // Search todos
    const todos = await window.electronAPI.todos.getTodos() || []
    console.log('Found todos:', todos.length)
    const filteredTodos = todos.filter(todo => 
      todo.title?.toLowerCase().includes(searchTerm) ||
      todo.description?.toLowerCase().includes(searchTerm)
    )
    console.log('Filtered todos:', filteredTodos.length)
    filteredTodos.forEach(todo => {
      results.push({
        type: 'todo',
        id: todo.id,
        title: todo.title || 'Untitled Todo',
        subtitle: todo.description || 'No description',
        data: todo
      })
    })
    
    console.log('Total search results:', results.length)
    
  } catch (error) {
    console.error('Error performing global search:', error)
  }
  
  return results
}

// Initialize theme on mount
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  themeStore.loadTheme()
  
  // Add keyboard shortcut event listeners
  window.addEventListener('focus-search', handleFocusSearch)
  
  // Add demo notifications (remove in production)
  setTimeout(() => {
    addNotification('success', 'Welcome!', 'Your POS system is ready to use')
  }, 1000)
  
  setTimeout(() => {
    addNotification('info', 'New Feature', 'Bulk operations are now available for products')
  }, 3000)
  
  setTimeout(() => {
    addNotification('warning', 'Low Stock', '5 products are running low on stock')
  }, 5000)
})

// Expose addNotification for global use
window.addNotification = addNotification

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  
  // Remove keyboard shortcut event listeners
  window.removeEventListener('focus-search', handleFocusSearch)
})

// Keyboard shortcut handlers
const handleFocusSearch = () => {
  // Focus on the global search input
  if (searchInput.value) {
    searchInput.value.focus()
    showSearchResults.value = true
  }
}
</script>

<style>
.page-header {
  background: transparent;
  border-block-end: 1px solid var(--color-border);
  height: 64px;
  position: relative;
  z-index: 1000;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: 0.5rem;
  padding-inline: 1rem;
  height: 100%;
}

.navbar-left, .navbar-right {
  display: flex;
  align-items: center;
}

.navbar-nav {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-inline: 0.5rem;
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 0.375rem;
  position: relative;
}

.nav-link:hover {
  background-color: var(--color-surface);
  color: var(--color-primary);
}

.nav-link.active .material-icons-outlined{
  color: var(--color-primary);
}

.nav-profile {
  display: flex;
  align-items: center;
  position: relative;
}

.nav-profile img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-inline-end: 0.5rem;
}

.navbar-search {
  margin-inline: 1rem;
}

.navbar-search input {
  padding-block: 0.5rem;
  padding-inline: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: all 0.2s ease;
}

.navbar-search input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(83, 91, 242, 0.1);
}

.navbar-search input::placeholder {
  color: var(--color-text-secondary);
}

/* Dropdown styles */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  inset-inline-end: 0px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  z-index: 1000;
  transform-origin: top var(--transform-origin-x, right);
  transform: scale(0.95);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

/* Add a pseudo-element for the dropdown arrow */
.dropdown-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  inset-inline-end: 24px;
  width: 12px;
  height: 12px;
  background: var(--color-surface);
  border-inline-start: 1px solid var(--color-border);
  border-block-start: 1px solid var(--color-border);
  transform: rotate(45deg);
}

.dropdown-menu.show {
  transform: scale(1);
  opacity: 1;
  visibility: visible;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding-block: 0.75rem;
  padding-inline: 1rem;
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.2s ease;
  gap: 0.75rem;
}

.dropdown-item:hover,
.dropdown-item.active {
  background-color: rgba(83, 91, 242, 0.1);
  color: var(--color-primary);
}

.dropdown-item:hover .material-icons,
.dropdown-item.active .material-icons-outlined{
  color: var(--color-primary);
}

.dropdown-divider {
  border-top: 1px solid var(--color-border);
  margin: 0.5rem 0;
}

/* Material Icons adjustments */
.material-icons-outlined{
  font-size: 18px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 18px;
  color: var(--color-text);
  transition: color 0.2s ease;
}

.nav-link:hover .material-icons-outlined{
  color: var(--color-primary);
}

/* Utility icons specific size */
.nav-item:not(.nav-profile) .material-icons-outlined{
  width: 18px !important;
  height: 18px !important;
  min-width: 18px;
  min-height: 18px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Navigation link spacing */
.nav-link .material-icons-outlined {
  margin-inline-end: 0.75rem;
}

/* Profile icon adjustments */
.nav-profile .material-icons-outlined{
  width: auto;
  height: auto;
}

/* Badge styles */
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-info {
  background-color: var(--color-info);
  color: white;
}

.float-right {
  float: right;
}

.small-screens-sidebar-link{
  display:none;
}

@media (max-width: 768px) {
  .small-screens-sidebar-link{
    display:block;
  }
}

.dropdown-toggle {
  cursor: pointer;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

/* RTL specific adjustments */
[dir="rtl"] {
  --transform-origin-x: left;
}

[dir="rtl"] .rotate-180 {
  transform: rotate(-180deg);
}

[dir="rtl"] .dropdown-menu {
  text-align: right;
}

[dir="rtl"] .dropdown-item {
  flex-direction: row-reverse;
}

[dir="rtl"] .nav-link {
  flex-direction: row-reverse;
}

/* Search Results Dropdown */
.search-results {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
}

.search-results-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface);
  color: var(--color-text);
}

.search-results-list {
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--color-border);
}

.search-result-item:hover {
  background-color: var(--color-primary);
  color: white;
}

.search-result-item:hover .result-icon .material-icons {
  color: white;
}

.result-icon {
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
}

.result-icon .material-icons {
  font-size: 20px;
  color: var(--color-text-secondary);
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-type {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-weight: 600;
}

.search-no-results {
  padding: 1.5rem;
  text-align: center;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.search-no-results .material-icons {
  font-size: 2rem;
  opacity: 0.5;
}

/* Search input focus state */
.navbar-search input:focus + .search-results {
  display: block;
}

/* Notification Badge */
.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-surface);
  z-index: 10;
  min-width: 18px;
  line-height: 1;
}

/* Notifications Dropdown */
.notifications-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 400px;
  max-width: 90vw;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-height: 500px;
  overflow: hidden;
}

.notifications-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface);
}

.notifications-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.mark-all-read, .clear-all {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.mark-all-read:hover, .clear-all:hover {
  background-color: var(--color-primary);
  color: white;
}

.clear-all {
  color: var(--color-error);
}

.clear-all:hover {
  background-color: var(--color-error);
  color: white;
}

.notifications-list {
  max-height: 350px;
  overflow-y: auto;
}

.no-notifications {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.no-notifications .material-icons {
  font-size: 2rem;
  opacity: 0.5;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

.notification-item:hover {
  background-color: var(--color-background);
}

.notification-item.unread {
  background-color: rgba(59, 130, 246, 0.05);
}

.notification-main {
  display: flex;
  align-items: flex-start;
  flex: 1;
  cursor: pointer;
}

.dismiss-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  opacity: 0;
  margin-left: 0.5rem;
}

.notification-item:hover .dismiss-btn {
  opacity: 1;
}

.dismiss-btn:hover {
  background-color: var(--color-error);
  color: white;
}

.notification-icon {
  margin-right: 0.75rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
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
  font-size: 18px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.notification-message {
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.unread-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 8px;
  height: 8px;
  background-color: var(--color-primary);
  border-radius: 50%;
}

.notifications-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border);
  text-align: center;
  background: var(--color-surface);
}

.view-all {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
}

.view-all:hover {
  color: var(--color-primary);
  text-decoration: underline;
  background-color: var(--color-background);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .search-results {
    left: -1rem;
    right: -1rem;
  }
  
  .notifications-dropdown {
    right: -1rem;
    width: calc(100vw - 2rem);
  }
}
</style>