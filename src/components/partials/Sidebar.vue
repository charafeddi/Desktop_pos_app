<template>
  <div class="page-sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- Logo and Toggle Section -->
    <div class="logo-box">
      <a href="#" class="logo-text" :class="{ 'hidden': isCollapsed }">Connect</a>
      <a href="#" class="sidebar-toggle" @click.prevent="toggleSidebar">
        <span v-if="isCollapsed" class="material-icons-outlined">panorama_fish_eye</span>
        <span v-else class="material-icons-outlined">adjust</span>
      </a>
    </div>

    <!-- Main Navigation -->
    <div class="page-sidebar-inner slimscroll">
      <ul class="accordion-menu">
        <li class="sidebar-title" :class="{ 'hidden': isCollapsed }">
          Apps
        </li>
        
        <!-- Dashboard -->
        <li>
          <router-link
            :to="{ name: 'Dashboard' }"
            class="nav-link"
            :class="{ 'active': $route.name === 'Dashboard', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">dashboard</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.dashboard') }}</span>
          </router-link>
        </li>
        
        <!-- Products -->
        <li>
          <router-link
            :to="{ name: 'Product' }"
            class="nav-link"
            :class="{ 'active': $route.path === '/products', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">inventory_2</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.products') }}</span>
          </router-link>
        </li>
        
        <!-- Analytics -->
        <li v-if="canAccessAnalytics">
          <router-link
            :to="{ name: 'Analytics' }"
            class="nav-link"
            :class="{ 'active': $route.path === '/analytics', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">query_stats</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.analytics') }}</span>
          </router-link>
        </li>
        
        <!-- Customers -->
        <li>
          <router-link
            to="/customers"
            class="nav-link"
            :class="{ 'active': $route.path === '/customers', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">people</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.customers') }}</span>
          </router-link>
        </li>
        
        <!-- Sales -->
        <li>
          <router-link
            to="/sales"
            class="nav-link"
            :class="{ 'active': $route.path === '/sales', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">real_estate_agent</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.sales') }}</span>
          </router-link>
        </li>
        
        <!-- Returns -->
        <li>
          <router-link
            to="/returns"
            class="nav-link"
            :class="{ 'active': $route.path === '/returns', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">assignment_return</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.returns') }}</span>
          </router-link>
        </li>
        
        <!-- Categories -->
        <li>
          <router-link
            to="/category"
            class="nav-link"
            :class="{ 'active': $route.path === '/category', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">category</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.categories') }}</span>
          </router-link>
        </li>
        
        <!-- Suppliers -->
        <li>
          <router-link
            :to="{ name: 'Supplier' }"
            class="nav-link"
            :class="{ 'active': $route.path === '/supplier', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">local_shipping</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.supplier') }}</span>
          </router-link>
        </li>
        
        <!-- Inventory -->
        <li>
          <router-link
            :to="{ name: 'Inventory' }"
            class="nav-link"
            :class="{ 'active': $route.path === '/inventory', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">inventory</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.inventory') }}</span>
          </router-link>
        </li>
      </ul>

      <!-- Bottom Settings Menu -->
      <ul class="accordion-menu mt-auto bottom-menu">
        <li>
          <router-link
            to="/settings"
            class="nav-link"
            :class="{ 'active': $route.path === '/settings', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">settings</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.settings') }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { computed } from 'vue'

// Props and Emits
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['toggle-sidebar'])

// Composables
const { t } = useI18n()
const authStore = useAuthStore()

// Computed properties
const canAccessAnalytics = computed(() => {
  const userRole = authStore.user?.role
  const allowedRoles = ['admin', 'manager']
  return userRole && allowedRoles.includes(userRole)
})

// Methods
const toggleSidebar = () => {
  emit('toggle-sidebar', !props.isCollapsed)
}
</script>

<style scoped>
/* ===== MAIN SIDEBAR CONTAINER ===== */
.page-sidebar {
  width: 280px;
  position: relative;
  background: var(--color-surface);
  color: var(--color-text);
  top: 0;
  bottom: 0;
  padding: 30px;
  box-shadow: 0 0 1.25rem rgba(31, 45, 61, 0.15);
  transition: all 0.3s ease-in-out;
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--color-border);
  z-index: 10;
}

[data-theme="dark"] .page-sidebar {
  box-shadow: 0 0 1.25rem rgba(0, 0, 0, 0.3);
}

.page-sidebar.collapsed {
  width: 80px;
  padding: 30px 15px;
}

/* ===== LOGO SECTION ===== */
.logo-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  transition: all 0.3s ease-in-out;
}

.collapsed .logo-box {
  padding: 15px 5px;
  justify-content: center;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  transition: opacity 0.3s ease-in-out;
}

.sidebar-toggle {
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-in-out;
  color: var(--color-text);
}

.sidebar-toggle:hover {
  opacity: 0.8;
  color: var(--color-primary);
}

/* ===== NAVIGATION MENU ===== */
.page-sidebar-inner {
  display: flex;
  flex-direction: column;
  height: calc(100% - 70px);
}

.accordion-menu {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.accordion-menu ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.sidebar-title {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: opacity 0.3s ease-in-out;
}

.nav-link {
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.3s ease-in-out;
  margin: 0.25rem 0;
}

.nav-link.icon-only {
  padding: 0.75rem;
  justify-content: center;
}

.nav-link:hover,
.nav-link.active {
  color: white;
  background: var(--color-primary);
  border-radius: 10px;
}

/* ===== ICONS ===== */
.material-icons-outlined {
  margin-right: 0.75rem;
  transition: margin 0.3s ease-in-out;
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 20;
}

.icon-only .material-icons-outlined {
  margin-right: 0;
}

/* ===== UTILITY CLASSES ===== */
.hidden {
  opacity: 0;
  width: 0;
  visibility: hidden;
}

/* ===== BOTTOM MENU ===== */
.bottom-menu {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

/* ===== SUBMENU (for future use) ===== */
.sub-menu {
  list-style: none;
  padding-left: 3rem;
  margin: 0;
  display: none;
}

.sub-menu.active {
  display: block;
}

.sub-menu li a {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
</style>