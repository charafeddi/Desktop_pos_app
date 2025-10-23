<template>
  <div v-if="isVisible" class="confirmation-overlay" @click="handleOverlayClick">
    <div class="confirmation-dialog" @click.stop>
      <!-- Header -->
      <div class="confirmation-header">
        <div class="flex items-center">
          <div class="confirmation-icon" :class="iconClass">
            <component :is="iconComponent" class="w-6 h-6" />
          </div>
          <h3 class="confirmation-title">{{ title }}</h3>
        </div>
        <button
          v-if="closable"
          @click="handleCancel"
          class="close-button"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="confirmation-content">
        <p class="confirmation-message">{{ message }}</p>
        <p v-if="details" class="confirmation-details">{{ details }}</p>
        
        <!-- Additional content slot -->
        <div v-if="$slots.default" class="confirmation-extra">
          <slot></slot>
        </div>
      </div>

      <!-- Actions -->
      <div class="confirmation-actions">
        <button
          @click="handleCancel"
          class="cancel-button"
          :disabled="loading"
        >
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
          class="confirm-button"
          :class="confirmButtonClass"
          :disabled="loading"
        >
          <span v-if="loading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loadingText }}
          </span>
          <span v-else>{{ confirmText }}</span>
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
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'warning',
    validator: (value) => ['info', 'warning', 'error', 'success'].includes(value)
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Processing...'
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const iconClass = computed(() => {
  switch (props.type) {
    case 'error':
      return 'icon-error'
    case 'warning':
      return 'icon-warning'
    case 'success':
      return 'icon-success'
    case 'info':
    default:
      return 'icon-info'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'error':
      return 'button-danger'
    case 'warning':
      return 'button-warning'
    case 'success':
      return 'button-success'
    case 'info':
    default:
      return 'button-primary'
  }
})

const iconComponent = computed(() => {
  switch (props.type) {
    case 'error':
      return 'svg' // Error icon
    case 'warning':
      return 'svg' // Warning icon
    case 'success':
      return 'svg' // Success icon
    case 'info':
    default:
      return 'svg' // Info icon
  }
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay && props.closable) {
    emit('close')
  }
}
</script>

<style scoped>
.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.confirmation-dialog {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.confirmation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.confirmation-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.icon-info {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.icon-warning {
  background-color: #fef3c7;
  color: #d97706;
}

.icon-error {
  background-color: #fee2e2;
  color: #dc2626;
}

.icon-success {
  background-color: #d1fae5;
  color: #059669;
}

.confirmation-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.confirmation-content {
  padding: 1.5rem;
}

.confirmation-message {
  font-size: 1rem;
  color: #374151;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.confirmation-details {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.confirmation-extra {
  margin-top: 1rem;
}

.confirmation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.cancel-button {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.button-primary {
  background-color: #3b82f6;
  color: white;
}

.button-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.button-danger {
  background-color: #ef4444;
  color: white;
}

.button-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.button-warning {
  background-color: #f59e0b;
  color: white;
}

.button-warning:hover:not(:disabled) {
  background-color: #d97706;
}

.button-success {
  background-color: #10b981;
  color: white;
}

.button-success:hover:not(:disabled) {
  background-color: #059669;
}

.confirm-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Theme-aware styling */
[data-theme="dark"] .confirmation-dialog {
  background-color: #1f2937;
}

[data-theme="dark"] .confirmation-title {
  color: #f9fafb;
}

[data-theme="dark"] .confirmation-message {
  color: #d1d5db;
}

[data-theme="dark"] .confirmation-details {
  color: #9ca3af;
}

[data-theme="dark"] .close-button {
  color: #9ca3af;
}

[data-theme="dark"] .close-button:hover {
  background-color: #374151;
  color: #d1d5db;
}

[data-theme="dark"] .cancel-button {
  background-color: #374151;
  color: #d1d5db;
  border-color: #4b5563;
}

[data-theme="dark"] .cancel-button:hover:not(:disabled) {
  background-color: #4b5563;
}
</style>
