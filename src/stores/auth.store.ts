import { defineStore } from 'pinia'
import { electronAPI } from '@/utils/electronAPI'

// Use the exposed electronAPI from preload script

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
  state: (): AuthState => {
    // Safe localStorage access with error handling
    let user = null
    let token = null
    
    try {
      const storedUser = localStorage.getItem('auth_user')
      const storedToken = localStorage.getItem('auth_token')
      
      if (storedUser && storedUser !== 'null') {
        user = JSON.parse(storedUser)
      }
      if (storedToken && storedToken !== 'null') {
        token = storedToken
      }
    } catch (error) {
      console.error('Error loading auth state from localStorage:', error)
      // Clear invalid data
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    }
    
    return {
      user,
      token,
      loading: false
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    getCurrentUser: (state) => state.user,
    isLoading: (state) => state.loading
  },

  actions: {
    async register(userData: Partial<User> & { password: string }) {
      this.loading = true
      try {
        // Send registration request through IPC
        const response = await electronAPI.auth.register(userData)
        
        if (response && response.success) {
          this.token = response.data?.token || null
          this.user = response.data?.user || null
          // Persist auth data to localStorage
          if (this.token) localStorage.setItem('auth_token', this.token)
          if (this.user) localStorage.setItem('auth_user', JSON.stringify(this.user))
          return response.data
        } else {
          throw new Error(response?.message || 'Registration failed')
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
        const response = await electronAPI.auth.login({ email, password })
        
        if (response && response.success) {
          this.token = response.data?.token || null
          this.user = response.data?.user || null
          // Persist auth data to localStorage
          if (this.token) localStorage.setItem('auth_token', this.token)
          if (this.user) localStorage.setItem('auth_user', JSON.stringify(this.user))
          return response.data
        } else {
          throw new Error(response?.message || 'Login failed')
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      // Send logout request through IPC if needed
      electronAPI.auth.logout()
      
      // Clear auth data from localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      
      this.user = null
      this.token = null
    },

    setUser(user: User) {
      this.user = user
      localStorage.setItem('auth_user', JSON.stringify(user))
    },

    setToken(token: string) {
      this.token = token
      localStorage.setItem('auth_token', token)
    }
  }
}) 