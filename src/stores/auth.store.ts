import { defineStore } from 'pinia'
const { ipcRenderer } = window.require('electron')

interface User {
  id: string
  name: string
  email: string
  mobile_phone: string
  role: string
  email_verified_at?: Date
  mobile_phone_verified_at?: Date
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    isLoading: (state) => state.loading
  },

  actions: {
    async register(userData: Partial<User> & { password: string }) {
      this.loading = true
      try {
        // Send registration request through IPC
        const response = await ipcRenderer.invoke('auth:register', userData)
        
        if (response.success) {
          this.token = response.data.token
          this.user = response.data.user
          return response.data
        } else {
          throw new Error(response.message || 'Registration failed')
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(email: string, password: string) {
      this.loading = true
      try {
        // Send login request through IPC
        const response = await ipcRenderer.invoke('auth:login', { email, password })
        
        if (response.success) {
          this.token = response.data.token
          this.user = response.data.user
          return response.data
        } else {
          throw new Error(response.message || 'Login failed')
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      // Send logout request through IPC if needed
      ipcRenderer.invoke('auth:logout')
      
      this.user = null
      this.token = null
    },

    setUser(user: User) {
      this.user = user
    },

    setToken(token: string) {
      this.token = token
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'auth',
        storage: localStorage,
        paths: ['token', 'user']
      }
    ]
  }
}) 