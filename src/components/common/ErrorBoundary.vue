<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <!-- Error Icon -->
      <div class="error-icon">
        <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
      </div>
      
      <!-- Error Message -->
      <div class="error-message">
        <h2 class="error-title">{{ errorTitle }}</h2>
        <p class="error-description">{{ errorDescription }}</p>
        
        <!-- Error Details (in development) -->
        <details v-if="isDevelopment" class="error-details">
          <summary class="error-details-summary">Technical Details</summary>
          <div class="error-details-content">
            <pre class="error-stack">{{ errorStack }}</pre>
          </div>
        </details>
      </div>
      
      <!-- Error Actions -->
      <div class="error-actions">
        <button
          @click="handleRetry"
          class="retry-button"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Try Again
        </button>
        
        <button
          @click="handleReport"
          class="report-button"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          Report Issue
        </button>
        
        <button
          @click="handleGoHome"
          class="home-button"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          Go Home
        </button>
      </div>
    </div>
  </div>
  
  <!-- Render children if no error -->
  <slot v-else></slot>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  fallbackTitle: {
    type: String,
    default: 'Something went wrong'
  },
  fallbackDescription: {
    type: String,
    default: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
  }
})

const emit = defineEmits(['error', 'retry'])

const router = useRouter()
const hasError = ref(false)
const errorTitle = ref(props.fallbackTitle)
const errorDescription = ref(props.fallbackDescription)
const errorStack = ref('')
const isDevelopment = ref(import.meta.env.DEV)

// Error handling
const handleError = (error, errorInfo) => {
  console.error('Error Boundary caught an error:', error, errorInfo)
  
  hasError.value = true
  errorTitle.value = props.fallbackTitle
  errorDescription.value = props.fallbackDescription
  errorStack.value = error.stack || error.toString()
  
  // Emit error event for parent components
  emit('error', error, errorInfo)
  
  // Log error for debugging
  if (isDevelopment.value) {
    console.group('🚨 Error Boundary Details')
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Stack Trace:', error.stack)
    console.groupEnd()
  }
}

// Actions
const handleRetry = () => {
  hasError.value = false
  errorTitle.value = props.fallbackTitle
  errorDescription.value = props.fallbackDescription
  errorStack.value = ''
  
  emit('retry')
}

const handleReport = () => {
  // In a real application, this would open a bug report form or send error details
  const errorReport = {
    title: errorTitle.value,
    description: errorDescription.value,
    stack: errorStack.value,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }
  
  console.log('Error Report:', errorReport)
  
  // For now, just show an alert
  alert('Error report generated. Please contact support with the details shown in the console.')
}

const handleGoHome = () => {
  router.push('/')
}

// Global error handler
const globalErrorHandler = (event) => {
  handleError(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
}

const unhandledRejectionHandler = (event) => {
  handleError(new Error(event.reason), {
    type: 'unhandledRejection',
    promise: event.promise
  })
}

// Lifecycle
onMounted(() => {
  window.addEventListener('error', globalErrorHandler)
  window.addEventListener('unhandledrejection', unhandledRejectionHandler)
})

onUnmounted(() => {
  window.removeEventListener('error', globalErrorHandler)
  window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
})

// Expose error handling method for programmatic use
defineExpose({
  handleError
})
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f9fafb;
}

.error-content {
  max-width: 600px;
  text-align: center;
  background-color: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.error-icon {
  color: #ef4444;
  margin-bottom: 1.5rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.error-description {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.error-details {
  margin: 2rem 0;
  text-align: left;
}

.error-details-summary {
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  background-color: #f3f4f6;
  margin-bottom: 1rem;
}

.error-details-content {
  background-color: #1f2937;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
}

.error-stack {
  color: #f9fafb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-button,
.report-button,
.home-button {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.retry-button {
  background-color: #3b82f6;
  color: white;
}

.retry-button:hover {
  background-color: #2563eb;
}

.report-button {
  background-color: #6b7280;
  color: white;
}

.report-button:hover {
  background-color: #4b5563;
}

.home-button {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.home-button:hover {
  background-color: #e5e7eb;
}

/* Theme-aware styling */
[data-theme="dark"] .error-boundary {
  background-color: #111827;
}

[data-theme="dark"] .error-content {
  background-color: #1f2937;
}

[data-theme="dark"] .error-title {
  color: #f9fafb;
}

[data-theme="dark"] .error-description {
  color: #9ca3af;
}

[data-theme="dark"] .error-details-summary {
  color: #d1d5db;
  background-color: #374151;
}

[data-theme="dark"] .home-button {
  background-color: #374151;
  color: #d1d5db;
  border-color: #4b5563;
}

[data-theme="dark"] .home-button:hover {
  background-color: #4b5563;
}

/* Responsive design */
@media (max-width: 640px) {
  .error-content {
    padding: 2rem 1rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .retry-button,
  .report-button,
  .home-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
