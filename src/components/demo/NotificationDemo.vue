<template>
  <div class="notification-demo">
    <h2>🔔 Notification System Demo</h2>
    <p>Test the notification system by clicking the buttons below:</p>
    
    <div class="demo-buttons">
      <button @click="testSuccess" class="btn btn-success">
        ✅ Success Notification
      </button>
      
      <button @click="testError" class="btn btn-error">
        ❌ Error Notification
      </button>
      
      <button @click="testWarning" class="btn btn-warning">
        ⚠️ Warning Notification
      </button>
      
      <button @click="testInfo" class="btn btn-info">
        ℹ️ Info Notification
      </button>
      
      <button @click="testProductNotification" class="btn btn-primary">
        📦 Product Notification
      </button>
      
      <button @click="testSaleNotification" class="btn btn-secondary">
        💰 Sale Notification
      </button>
    </div>
    
    <div class="demo-info">
      <h3>How to Use:</h3>
      <ul>
        <li><strong>Toast Notifications:</strong> Appear in the top-right corner and auto-dismiss</li>
        <li><strong>Bell Icon:</strong> Click the bell icon in the header to see all notifications</li>
        <li><strong>Badge:</strong> Red badge shows unread notification count</li>
        <li><strong>Mark as Read:</strong> Click on notifications to mark them as read</li>
      </ul>
      
      <h3>In Your Code:</h3>
      <pre><code>// Add a notification programmatically
window.addNotification('success', 'Title', 'Message')

// Or with action
window.addNotification('info', 'New Product', 'Product created successfully', {
  type: 'navigate',
  route: { name: 'Product' }
})</code></pre>
    </div>
  </div>
</template>

<script setup>
const testSuccess = () => {
  window.addNotification('success', 'Success!', 'Operation completed successfully')
}

const testError = () => {
  window.addNotification('error', 'Error!', 'Something went wrong. Please try again.')
}

const testWarning = () => {
  window.addNotification('warning', 'Warning!', 'Please check your input before proceeding.')
}

const testInfo = () => {
  window.addNotification('info', 'Information', 'This is an informational message.')
}

const testProductNotification = () => {
  window.addNotification('product', 'New Product Added', 'iPhone 13 Pro Max has been added to inventory', {
    type: 'navigate',
    route: { name: 'Product' }
  })
}

const testSaleNotification = () => {
  window.addNotification('sale', 'Sale Completed', 'Total: $299.99 - Payment: Cash', {
    type: 'navigate',
    route: { name: 'SalesList' }
  })
}
</script>

<style scoped>
.notification-demo {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.demo-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-error {
  background-color: #ef4444;
  color: white;
}

.btn-warning {
  background-color: #f59e0b;
  color: white;
}

.btn-info {
  background-color: #3b82f6;
  color: white;
}

.btn-primary {
  background-color: #8b5cf6;
  color: white;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.demo-info {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: var(--color-surface);
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
}

.demo-info h3 {
  margin-top: 0;
  color: var(--color-text);
}

.demo-info ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.demo-info li {
  margin: 0.5rem 0;
  color: var(--color-text-secondary);
}

.demo-info pre {
  background-color: var(--color-background);
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.demo-info code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  color: var(--color-text);
}
</style>
