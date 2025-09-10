<template>
  <div class="page-sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="logo-box">
      <a href="#" class="logo-text" :class="{ 'hidden': isCollapsed }">Connect</a>
      <a href="#" class="sidebar-toggle" @click.prevent="toggleSidebar">
        <span v-if="isCollapsed" class="material-icons-outlined">panorama_fish_eye</span>
        <span v-else class="material-icons-outlined">adjust</span>
      </a>
    </div>

    <div class="page-sidebar-inner slimscroll">
      <ul class="accordion-menu">
        <li class="sidebar-title" :class="{ 'hidden': isCollapsed }">
          Apps
        </li>
        <li>
          <router-link
            :to="{name: 'Dashboard'}"
            class="nav-link"
            :class="{ 'active': $route.name === 'dashboard', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">dashboard</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.dashboard') }}</span>
          </router-link>
        </li>
        <li>
          <router-link
            :to="{name: 'Product'}"
            class="nav-link"
            :class="{ 'active': $route.path === '/products', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">inventory_2</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.products') }}</span>
          </router-link>
        </li>
        <li>
          <router-link
            :to="{name: 'Analytics'}"
            class="nav-link"
            :class="{ 'active': $route.path === '/categories', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">query_stats</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.analytics') }}</span>
          </router-link>
        </li>
        <li>
          <router-link
            to="/orders"
            class="nav-link"
            :class="{ 'active': $route.path === '/orders', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">shopping_cart</span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.orders') }}</span>
          </router-link>
        </li>
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
        <li>
          <router-link
            to="/reports"
            class="nav-link"
            :class="{ 'active': $route.path === '/reports', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">
              real_estate_agent
            </span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.sales') }}</span>
          </router-link>
        </li> 
               
        <li>
          <router-link
            to="/category"
            class="nav-link"
            :class="{ 'active': $route.path === '/category', 'icon-only': isCollapsed }"
          >
            <span class="material-icons-outlined">
              category
            </span>
            <span :class="{ 'hidden': isCollapsed }">{{ t('sidebar.categories') }}</span>
          </router-link>
        </li>
      </ul>

      <!-- Bottom section with settings -->
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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['toggle-sidebar'])

function toggleSidebar() {
  emit('toggle-sidebar', !props.isCollapsed)
}
</script>

<style>
/* Keep your original styles */
.page-sidebar {
  width: 280px;
  position: relative;
  background: var(--primary-color);
  color: var(--color);
  top: 0;
  bottom: 0;
  padding: 30px;
  box-shadow: 0 0 1.25rem rgba(31,45,61,.15);
  transition: all .3s ease-in-out;
  backdrop-filter: blur(20px);
  border-right: 1px solid hsla(0, 0%, 65%, 0.158);
  z-index: 10;
}

.page-sidebar.collapsed {
  width: 80px;
  padding: 30px 15px;
}

.logo-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid hsla(0, 0%, 65%, 0.158);
  color: var(--color);
  transition: all .3s ease-in-out;
}

.collapsed .logo-box {
  padding: 15px 5px;
  justify-content: center;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  transition: opacity .3s ease-in-out;
}

.hidden {
  opacity: 0;
  width: 0;
  visibility: hidden;
}

/* Navigation menu */
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
  color: rgba(255, 255, 255, 0.6);
  transition: opacity .3s ease-in-out;
}

.nav-link {
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all .3s ease-in-out;
}

.nav-link.icon-only {
  padding: 0.75rem;
  justify-content: center;
}

.nav-link:hover,
.nav-link.active {
  color: #535bf2;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-radius: 10px;
}

/* Icon styles */
.material-icons-outlined {
  margin-right: 0.75rem;
  transition: margin .3s ease-in-out;
  font-variation-settings:
  'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 20
}

.icon-only .material-icons-outlined {
  margin-right: 0;
}

/* Bottom menu styles */
.bottom-menu {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid hsla(0, 0%, 65%, 0.158);
}

/* Sidebar toggle button */
.sidebar-toggle {
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .3s ease-in-out;
}

.sidebar-toggle:hover {
  opacity: 0.8;
}

/* Submenu styles */
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