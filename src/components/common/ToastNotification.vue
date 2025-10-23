<template>
  <div class="toast-container">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="getToastClasses(toast.type)"
        class="toast-item"
      >
        <div class="flex items-center">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <component :is="getToastIcon(toast.type)" class="w-5 h-5" />
          </div>
          
          <!-- Message -->
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium">{{ toast.message }}</p>
            <p v-if="toast.details" class="text-xs mt-1 opacity-90">{{ toast.details }}</p>
          </div>
          
          <!-- Close Button -->
          <div class="ml-4 flex-shrink-0">
            <button
              @click="removeToast(toast.id)"
              class="inline-flex text-current hover:opacity-75 focus:outline-none"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div v-if="toast.duration > 0" class="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg" :style="{ width: `${toast.progress}%` }"></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Toast types
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

const toasts = ref([])
let toastIdCounter = 0
const progressIntervals = new Map()

// Toast management
const addToast = (type, message, details = '', duration = 5000) => {
  const id = `toast-${++toastIdCounter}`
  const toast = {
    id,
    type,
    message,
    details,
    duration,
    progress: 100
  }
  
  toasts.value.push(toast)
  
  // Auto-remove if duration > 0
  if (duration > 0) {
    startProgressTimer(id, duration)
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
  
  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
  
  // Clear progress timer
  const interval = progressIntervals.get(id)
  if (interval) {
    clearInterval(interval)
    progressIntervals.delete(id)
  }
}

const startProgressTimer = (id, duration) => {
  const startTime = Date.now()
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, duration - elapsed)
    const progress = (remaining / duration) * 100
    
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      toast.progress = progress
    }
    
    if (progress <= 0) {
      clearInterval(interval)
      progressIntervals.delete(id)
    }
  }, 50)
  
  progressIntervals.set(id, interval)
}

// Toast styling
const getToastClasses = (type) => {
  const baseClasses = 'relative overflow-hidden rounded-lg shadow-lg border p-4 mb-3 max-w-sm'
  
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return `${baseClasses} bg-green-50 border-green-200 text-green-800`
    case TOAST_TYPES.ERROR:
      return `${baseClasses} bg-red-50 border-red-200 text-red-800`
    case TOAST_TYPES.WARNING:
      return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-800`
    case TOAST_TYPES.INFO:
      return `${baseClasses} bg-blue-50 border-blue-200 text-blue-800`
    default:
      return `${baseClasses} bg-gray-50 border-gray-200 text-gray-800`
  }
}

const getToastIcon = (type) => {
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return 'svg' // Success icon
    case TOAST_TYPES.ERROR:
      return 'svg' // Error icon
    case TOAST_TYPES.WARNING:
      return 'svg' // Warning icon
    case TOAST_TYPES.INFO:
      return 'svg' // Info icon
    default:
      return 'svg' // Default icon
  }
}

// Cleanup on unmount
onUnmounted(() => {
  progressIntervals.forEach(interval => clearInterval(interval))
  progressIntervals.clear()
})

// Expose methods for global use
defineExpose({
  addToast,
  removeToast,
  TOAST_TYPES
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
}

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Theme-aware styling */
[data-theme="dark"] .toast-container .bg-green-50 {
  background-color: #064e3b;
  border-color: #065f46;
  color: #6ee7b7;
}

[data-theme="dark"] .toast-container .bg-red-50 {
  background-color: #7f1d1d;
  border-color: #991b1b;
  color: #fca5a5;
}

[data-theme="dark"] .toast-container .bg-yellow-50 {
  background-color: #78350f;
  border-color: #92400e;
  color: #fcd34d;
}

[data-theme="dark"] .toast-container .bg-blue-50 {
  background-color: #1e3a8a;
  border-color: #1e40af;
  color: #93c5fd;
}

[data-theme="dark"] .toast-container .bg-gray-50 {
  background-color: #374151;
  border-color: #4b5563;
  color: #d1d5db;
}
</style>
