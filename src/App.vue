<!-- Root template with authentication check -->
<template>
  <!-- Login/Register view when not authenticated -->
  <div v-if="!isAuthenticated" class="w-full h-full">
    <router-view></router-view>
  </div>
  
  <!-- Main layout when authenticated -->
  <div v-else class="main-layout">
    <!-- Sidebar component -->
    <Sidebar @toggle-sidebar="handleSidebarToggle" :is-collapsed="isSidebarCollapsed"/>
    
    <!-- Page container with header and main content -->
    <div class="page-container" :class="{ 'collapsed': isSidebarCollapsed }">
      <Header />
      <div class="main-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth.store'
import { useLanguageStore } from './stores/language.store'
import Sidebar from './components/partials/Sidebar.vue'
import Header from './components/partials/Header.vue'
import '@material-design-icons/font'

// Initialize route, router, and stores
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

// Initialize language listener when component mounts
onMounted(() => {
  languageStore.initLanguageListener()
})

// Sidebar state
const isSidebarCollapsed = ref(false)

const handleSidebarToggle = (collapsed: boolean) => {
  isSidebarCollapsed.value = collapsed
}

// Computed property to check if user is authenticated
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Logout handler function
async function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style>

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

/* Base styles */
#app {
  height: 100%;
  width: 100%;
}

/* Layout styles */
.main-layout {
  display: flex;
  height: 100%;
  width: 100%;
}

.page-container {
  flex: 1;
  margin-left: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease-in-out;
}

.page-container.collapsed {
  margin-left: 80px;
}

.main-content {
  flex: 1;
  width: 100%;
  overflow: auto;
}

/* Navigation styles */
.router-link-active {
  background-color: rgb(239 246 255);
  color: rgb(37 99 235);
}

/* Material Icons styles */
.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}

/* Material Icons sizes */
.material-icons.md-18 { font-size: 18px; }
.material-icons.md-24 { font-size: 24px; }
.material-icons.md-36 { font-size: 36px; }
.material-icons.md-48 { font-size: 48px; }

/* Material Icons colors */
.material-icons.md-dark { color: rgba(0, 0, 0, 0.54); }
.material-icons.md-dark.md-inactive { color: rgba(0, 0, 0, 0.26); }
.material-icons.md-light { color: rgba(255, 255, 255, 1); }
.material-icons.md-light.md-inactive { color: rgba(255, 255, 255, 0.3); }

/* Dropdown transitions */
.origin-top-right {
  transition: all 0.1s ease-out;
}

.origin-top-right[v-show="true"] {
  transform: scale(1);
  opacity: 1;
}

.origin-top-right[v-show="false"] {
  transform: scale(0.95);
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-container {
    margin-left: 0;
  }
}
</style>
