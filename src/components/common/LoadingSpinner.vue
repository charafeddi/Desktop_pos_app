<template>
  <div v-if="isVisible" class="loading-overlay" :class="{ 'loading-overlay-fullscreen': fullscreen }">
    <div class="loading-content">
      <!-- Spinner -->
      <div class="spinner-container">
        <div class="spinner" :class="sizeClass"></div>
      </div>
      
      <!-- Message -->
      <div v-if="message" class="loading-message">
        <p class="text-lg font-medium">{{ message }}</p>
        <p v-if="details" class="text-sm opacity-75 mt-1">{{ details }}</p>
      </div>
      
      <!-- Progress Bar (if percentage provided) -->
      <div v-if="percentage !== undefined" class="loading-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${Math.min(100, Math.max(0, percentage))}%` }"
          ></div>
        </div>
        <p class="progress-text">{{ Math.round(percentage) }}%</p>
      </div>
      
      <!-- Cancel Button (if cancellable) -->
      <div v-if="cancellable" class="loading-actions">
        <button
          @click="handleCancel"
          class="cancel-button"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  details: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  percentage: {
    type: Number,
    default: undefined
  },
  cancellable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cancel'])

const sizeClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'spinner-small'
    case 'large':
      return 'spinner-large'
    default:
      return 'spinner-medium'
  }
})

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.loading-overlay-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.loading-content {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  min-width: 200px;
  max-width: 400px;
}

.spinner-container {
  margin-bottom: 1rem;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner-medium {
  width: 40px;
  height: 40px;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border-width: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-message {
  margin-bottom: 1rem;
}

.loading-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.loading-actions {
  margin-top: 1rem;
}

.cancel-button {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #dc2626;
}

/* Theme-aware styling */
[data-theme="dark"] .loading-content {
  background-color: #1f2937;
  color: #f9fafb;
}

[data-theme="dark"] .spinner {
  border-color: #374151;
  border-top-color: #60a5fa;
}

[data-theme="dark"] .progress-bar {
  background-color: #374151;
}

[data-theme="dark"] .progress-fill {
  background-color: #60a5fa;
}

[data-theme="dark"] .progress-text {
  color: #9ca3af;
}
</style>
