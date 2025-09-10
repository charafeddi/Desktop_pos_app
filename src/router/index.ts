import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import '@/types/router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pos',
    name: 'POS',
    component: () => import('@/views/pos/POS.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/views/analytics/Analytics.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin', 'manager'] }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/views/inventory/Inventory.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/Settings.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin'] }
  },
  {
    path: '/task',
    name: 'Task',
    component: () => import('@/views/task/task.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/product',
    name: 'Product',
    component: () => import('@/views/product/Product.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/product-types',
    name: 'ProductTypes',
    component: () => import('@/views/product/ProductTypes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/product-units',
    name: 'ProductUnits',
    component: () => import('@/views/product/ProductUnits.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/product-form-popup',
    name: 'ProductFormPopup',
    component: () => import('@/views/product/components/ProductFormPopup.vue'),
    meta: {
        title: 'Product Form'
    }
  },
  {
    path:'/profile',
    name:'Profile',
    component: () => import('@/views/profile/Profile.vue'),
    meta:{
      title: 'Profile',
      requiresAuth: true
    }
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('@/views/categories/Category.vue'),
    meta:{
      tilte: 'Category',
      requiresAuth: true
    }
  }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, _, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresRole = to.matched.some(record => record.meta.requiresRole)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login') 
  } else if (requiresRole && !authStore.user?.role) {
    next('/') 
  } else if (requiresRole && 
    !to.meta.requiresRole?.includes(authStore.user?.role)) {
    next('/')
  } else {
    next()
  }
})

export default router 