<template>
  <div class="cloud-sync-container">
    <div class="header">
      <h2>{{ t('cloudSync.title') }}</h2>
      <p>{{ t('cloudSync.description') }}</p>
    </div>

    <!-- Authentication Section -->
    <div class="auth-section" v-if="!isAuthenticated">
      <div class="card">
        <h3>{{ t('cloudSync.authentication') }}</h3>
        <p>{{ t('cloudSync.authDescription') }}</p>
        
        <div class="auth-steps">
          <div class="step">
            <span class="step-number">1</span>
            <div class="step-content">
              <h4>{{ t('cloudSync.step1Title') }}</h4>
              <p>{{ t('cloudSync.step1Description') }}</p>
              <button @click="startAuthentication" :disabled="isLoading" class="btn-primary">
                {{ isLoading ? t('common.loading') : t('cloudSync.startAuth') }}
              </button>
            </div>
          </div>

          <div class="step" v-if="authUrl">
            <span class="step-number">2</span>
            <div class="step-content">
              <h4>{{ t('cloudSync.step2Title') }}</h4>
              <p>{{ t('cloudSync.step2Description') }}</p>
              <div class="auth-url-container">
                <input 
                  type="text" 
                  :value="authUrl" 
                  readonly 
                  class="auth-url-input"
                  @click="$event.target.select()"
                />
                <button @click="openAuthUrl" class="btn-secondary">
                  {{ t('cloudSync.openInBrowser') }}
                </button>
              </div>
            </div>
          </div>

          <div class="step" v-if="authUrl">
            <span class="step-number">3</span>
            <div class="step-content">
              <h4>{{ t('cloudSync.step3Title') }}</h4>
              <p>{{ t('cloudSync.step3Description') }}</p>
              <div class="code-input-container">
                <input 
                  type="text" 
                  v-model="authCode" 
                  :placeholder="t('cloudSync.enterCode')"
                  class="code-input"
                />
                <button @click="completeAuthentication" :disabled="!authCode || isLoading" class="btn-primary">
                  {{ t('cloudSync.completeAuth') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sync Status Section -->
    <div class="sync-section" v-if="isAuthenticated">
      <div class="card">
        <h3>{{ t('cloudSync.syncStatus') }}</h3>
        
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">{{ t('cloudSync.status') }}</span>
            <span class="status-value" :class="syncStatus.isSyncing ? 'syncing' : 'idle'">
              {{ syncStatus.isSyncing ? t('cloudSync.syncing') : t('cloudSync.idle') }}
            </span>
          </div>
          
          <div class="status-item">
            <span class="status-label">{{ t('cloudSync.lastSync') }}</span>
            <span class="status-value">
              {{ formatLastSync(syncStatus.lastSyncTime) }}
            </span>
          </div>
          
          <div class="status-item">
            <span class="status-label">{{ t('cloudSync.autoSync') }}</span>
            <span class="status-value">
              {{ syncStatus.isSyncing ? t('common.enabled') : t('common.disabled') }}
            </span>
          </div>
        </div>

        <div class="sync-actions">
          <button @click="uploadDatabase" :disabled="isLoading" class="btn-primary">
            {{ isLoading ? t('common.loading') : t('cloudSync.uploadNow') }}
          </button>
          
          <button @click="downloadDatabase" :disabled="isLoading" class="btn-secondary">
            {{ isLoading ? t('common.loading') : t('cloudSync.downloadNow') }}
          </button>
          
          <button @click="checkUpdates" :disabled="isLoading" class="btn-info">
            {{ isLoading ? t('common.loading') : t('cloudSync.checkUpdates') }}
          </button>
        </div>

        <div class="auto-sync-controls">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="autoSyncEnabled" 
              @change="toggleAutoSync"
            />
            {{ t('cloudSync.enableAutoSync') }}
          </label>
        </div>
      </div>
    </div>

    <!-- Update Section -->
    <div class="update-section" v-if="updateAvailable">
      <div class="card update-card">
        <h3>{{ t('cloudSync.updateAvailable') }}</h3>
        <div class="update-info">
          <p>{{ t('cloudSync.currentVersion') }}: <strong>{{ currentVersion }}</strong></p>
          <p>{{ t('cloudSync.newVersion') }}: <strong>{{ newVersion }}</strong></p>
          <p>{{ t('cloudSync.updateSize') }}: <strong>{{ formatFileSize(updateFile.size) }}</strong></p>
        </div>
        
        <div class="update-actions">
          <button @click="downloadUpdate" :disabled="isLoading" class="btn-success">
            {{ isLoading ? t('common.loading') : t('cloudSync.downloadUpdate') }}
          </button>
          
          <button @click="dismissUpdate" class="btn-secondary">
            {{ t('cloudSync.dismissUpdate') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="activity-section" v-if="isAuthenticated">
      <div class="card">
        <h3>{{ t('cloudSync.recentActivity') }}</h3>
        <div class="activity-list">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="activity.type">
              <i :class="getActivityIcon(activity.type)"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
            </div>
            <div class="activity-status" :class="activity.status">
              {{ t(`cloudSync.${activity.status}`) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="errorMessage" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ errorMessage }}
    </div>

    <!-- Success Messages -->
    <div v-if="successMessage" class="success-message">
      <i class="fas fa-check-circle"></i>
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Reactive state
const isLoading = ref(false)
const isAuthenticated = ref(false)
const authUrl = ref('')
const authCode = ref('')
const syncStatus = ref({
  isInitialized: false,
  isSyncing: false,
  lastSyncTime: null,
  syncInterval: 300000
})
const autoSyncEnabled = ref(false)
const updateAvailable = ref(false)
const currentVersion = ref('1.0.0')
const newVersion = ref('')
const updateFile = ref(null)
const recentActivity = ref([])
const errorMessage = ref('')
const successMessage = ref('')

// Computed properties
const formatLastSync = (timestamp) => {
  if (!timestamp) return t('cloudSync.never')
  return new Date(timestamp).toLocaleString()
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const getActivityIcon = (type) => {
  const icons = {
    upload: 'fas fa-upload',
    download: 'fas fa-download',
    sync: 'fas fa-sync',
    update: 'fas fa-download',
    error: 'fas fa-exclamation-triangle'
  }
  return icons[type] || 'fas fa-info-circle'
}

// Methods
const startAuthentication = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await window.electronAPI.cloudSync.authenticate()
    if (result.success) {
      authUrl.value = result.authUrl
      successMessage.value = t('cloudSync.authUrlGenerated')
    } else {
      errorMessage.value = result.error || t('cloudSync.authError')
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const openAuthUrl = () => {
  if (authUrl.value) {
    window.open(authUrl.value, '_blank')
  }
}

const completeAuthentication = async () => {
  if (!authCode.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await window.electronAPI.cloudSync.handleAuthCode(authCode.value)
    if (result.success) {
      isAuthenticated.value = true
      successMessage.value = t('cloudSync.authSuccess')
      await loadSyncStatus()
    } else {
      errorMessage.value = result.error || t('cloudSync.authError')
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const loadSyncStatus = async () => {
  try {
    const result = await window.electronAPI.cloudSync.getStatus()
    if (result.success) {
      syncStatus.value = result.status
      autoSyncEnabled.value = result.status.isSyncing
    }
  } catch (error) {
    console.error('Error loading sync status:', error)
  }
}

const uploadDatabase = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await window.electronAPI.cloudSync.uploadDatabase()
    if (result.success) {
      successMessage.value = t('cloudSync.uploadSuccess')
      addActivity('upload', t('cloudSync.databaseUploaded'), 'success')
      await loadSyncStatus()
    } else {
      errorMessage.value = result.error || t('cloudSync.uploadError')
      addActivity('upload', t('cloudSync.uploadFailed'), 'error')
    }
  } catch (error) {
    errorMessage.value = error.message
    addActivity('upload', t('cloudSync.uploadFailed'), 'error')
  } finally {
    isLoading.value = false
  }
}

const downloadDatabase = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await window.electronAPI.cloudSync.downloadDatabase()
    if (result.success) {
      successMessage.value = t('cloudSync.downloadSuccess')
      addActivity('download', t('cloudSync.databaseDownloaded'), 'success')
      await loadSyncStatus()
    } else {
      errorMessage.value = result.error || t('cloudSync.downloadError')
      addActivity('download', t('cloudSync.downloadFailed'), 'error')
    }
  } catch (error) {
    errorMessage.value = error.message
    addActivity('download', t('cloudSync.downloadFailed'), 'error')
  } finally {
    isLoading.value = false
  }
}

const checkUpdates = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await window.electronAPI.cloudSync.checkUpdates()
    if (result.success) {
      if (result.hasUpdate) {
        updateAvailable.value = true
        currentVersion.value = result.currentVersion
        newVersion.value = result.newVersion
        updateFile.value = result.updateFile
        successMessage.value = t('cloudSync.updateFound')
      } else {
        successMessage.value = t('cloudSync.noUpdates')
      }
    } else {
      errorMessage.value = result.error || t('cloudSync.checkUpdateError')
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const downloadUpdate = async () => {
  if (!updateFile.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await window.electronAPI.cloudSync.downloadUpdate(updateFile.value)
    if (result.success) {
      successMessage.value = t('cloudSync.updateDownloaded')
      addActivity('update', t('cloudSync.updateDownloaded'), 'success')
      updateAvailable.value = false
    } else {
      errorMessage.value = result.error || t('cloudSync.updateDownloadError')
      addActivity('update', t('cloudSync.updateDownloadFailed'), 'error')
    }
  } catch (error) {
    errorMessage.value = error.message
    addActivity('update', t('cloudSync.updateDownloadFailed'), 'error')
  } finally {
    isLoading.value = false
  }
}

const dismissUpdate = () => {
  updateAvailable.value = false
}

const toggleAutoSync = async () => {
  try {
    if (autoSyncEnabled.value) {
      await window.electronAPI.cloudSync.startAutoSync()
      successMessage.value = t('cloudSync.autoSyncEnabled')
    } else {
      await window.electronAPI.cloudSync.stopAutoSync()
      successMessage.value = t('cloudSync.autoSyncDisabled')
    }
    await loadSyncStatus()
  } catch (error) {
    errorMessage.value = error.message
    autoSyncEnabled.value = !autoSyncEnabled.value // Revert
  }
}

const addActivity = (type, title, status) => {
  const activity = {
    id: Date.now(),
    type,
    title,
    status,
    timestamp: new Date().toISOString()
  }
  recentActivity.value.unshift(activity)
  
  // Keep only last 10 activities
  if (recentActivity.value.length > 10) {
    recentActivity.value = recentActivity.value.slice(0, 10)
  }
}

// Clear messages after 5 seconds
const clearMessages = () => {
  setTimeout(() => {
    errorMessage.value = ''
    successMessage.value = ''
  }, 5000)
}

// Watch for message changes
watch(() => errorMessage.value, clearMessages)
watch(() => successMessage.value, clearMessages)

// Initialize on mount
onMounted(async () => {
  await loadSyncStatus()
  isAuthenticated.value = syncStatus.value.isInitialized
})
</script>

<style scoped>
.cloud-sync-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h2 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.header p {
  color: #718096;
  font-size: 1.1rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card h3 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.auth-steps {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-number {
  background: #4299e1;
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.step-content p {
  color: #718096;
  margin-bottom: 1rem;
}

.auth-url-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.auth-url-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.9rem;
}

.code-input-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.code-input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  width: 200px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-label {
  color: #718096;
  font-size: 0.9rem;
}

.status-value {
  font-weight: 600;
  color: #2d3748;
}

.status-value.syncing {
  color: #4299e1;
}

.status-value.idle {
  color: #68d391;
}

.sync-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.auto-sync-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2d3748;
  font-weight: 500;
}

.update-card {
  border-left: 4px solid #4299e1;
}

.update-info {
  margin-bottom: 1.5rem;
}

.update-info p {
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.update-actions {
  display: flex;
  gap: 1rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.activity-icon.upload {
  background: #4299e1;
}

.activity-icon.download {
  background: #68d391;
}

.activity-icon.sync {
  background: #ed8936;
}

.activity-icon.update {
  background: #9f7aea;
}

.activity-icon.error {
  background: #f56565;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #2d3748;
}

.activity-time {
  font-size: 0.9rem;
  color: #718096;
}

.activity-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.activity-status.success {
  background: #c6f6d5;
  color: #22543d;
}

.activity-status.error {
  background: #fed7d7;
  color: #742a2a;
}

.error-message {
  background: #fed7d7;
  color: #742a2a;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.success-message {
  background: #c6f6d5;
  color: #22543d;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #3182ce;
}

.btn-primary:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: #2d3748;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e0;
}

.btn-info {
  background: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-info:hover:not(:disabled) {
  background: #3182ce;
}

.btn-success {
  background: #68d391;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-success:hover:not(:disabled) {
  background: #48bb78;
}

@media (max-width: 768px) {
  .cloud-sync-container {
    padding: 1rem;
  }
  
  .sync-actions {
    flex-direction: column;
  }
  
  .auth-url-container {
    flex-direction: column;
  }
  
  .code-input-container {
    flex-direction: column;
  }
}
</style>
