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
            <a href="#" class="nav-link" :title="t('header.notifications')">
              <span class="material-icons">notifications</span>
            </a>
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
            <router-link :to="{name: 'Task'}" class="nav-link">Tasks</router-link>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link">Reports</a>
          </li>
        </ul>
        <div class="navbar-search">
          <form>
            <div class="form-group">
              <input 
                type="text" 
                name="search" 
                id="nav-search" 
                :placeholder="t('header.search')"
              >
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

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { t } = useI18n()

const isDropdownOpen = ref(false)
const dropdownTrigger = ref(null)
const dropdownMenu = ref(null)

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

// Toggle dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Toggle theme
const toggleTheme = () => {
  themeStore.toggleTheme()
}

// Handle click outside to close dropdown
const handleClickOutside = (event) => {
  if (!dropdownTrigger.value?.contains(event.target) && 
      !dropdownMenu.value?.contains(event.target)) {
    isDropdownOpen.value = false
  }
}

// Handle logout
const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Initialize theme on mount
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  themeStore.loadTheme()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 0.375rem;
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
</style>