<template>
  <section class="container">
    <div class="register-container">
      <div class="circle circle-one"></div>
      <div class="form-container">
        <img :src="illustration" alt="Login Illustration" class="illustration" />
        <h1 class="opacity">REGISTER</h1>
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <input 
              type="text" 
              placeholder="Full Name" 
              v-model="formData.name"
              required
            />
          </div>
          <div class="form-group">
            <input 
              type="email" 
              placeholder="Email" 
              v-model="formData.email"
              required
            />
          </div>
          <div class="form-group">
            <input 
              type="tel" 
              placeholder="Mobile Phone" 
              v-model="formData.mobile_phone"
              required
            />
          </div>
          <div class="form-group">
            <select 
              v-model="formData.role"
              required
              class="form-select"
            >
              <option value="" disabled>Select Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
          <div class="password-group">
            <div class="form-group">
              <input 
                type="password" 
                placeholder="Password" 
                v-model="formData.password"
                required
              />
            </div>
            <div class="form-group">
              <input 
                type="password" 
                placeholder="Confirm Password" 
                v-model="confirmPassword"
                required
              />
            </div>
          </div>
          <div class="error-message" v-if="error">
            {{ error }}
          </div>
          <button class="opacity" type="submit" :disabled="isLoading">
            <span v-if="isLoading">Registering...</span>
            <span v-else>CREATE ACCOUNT</span>
          </button>
        </form>
        <div class="register-forget opacity">
          <a href="#" @click.prevent="goToLogin">ALREADY HAVE AN ACCOUNT?</a>
        </div>
      </div>
      <div class="circle circle-two"></div>
    </div>
    <div class="theme-btn-container"></div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import illustration from '../../assets/img/Sign up-cuate.png'

const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  name: '',
  email: '',
  mobile_phone: '',
  password: '',
  role: ''
})

const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')

const themes = [
  {
    background: "#1A1A2E",
    color: "#FFFFFF",
    primaryColor: "#0F3460"
  },
  {
    background: "#461220",
    color: "#FFFFFF",
    primaryColor: "#E94560"
  },
  {
    background: "#192A51",
    color: "#FFFFFF",
    primaryColor: "#967AA1"
  },
  {
    background: "#F7B267",
    color: "#000000",
    primaryColor: "#F4845F"
  },
  {
    background: "#F25F5C",
    color: "#000000",
    primaryColor: "#642B36"
  },
  {
    background: "#231F20",
    color: "#FFF",
    primaryColor: "#BB4430"
  }
]

function setTheme(theme) {
  const root = document.querySelector(":root")
  if (root) {
    root.style.setProperty("--background", theme.background)
    root.style.setProperty("--color", theme.color)
    root.style.setProperty("--primary-color", theme.primaryColor)
  }
}

function displayThemeButtons() {
  const btnContainer = document.querySelector(".theme-btn-container")
  if (btnContainer) {
    themes.forEach((theme) => {
      const div = document.createElement("div")
      div.className = "theme-btn"
      div.style.cssText = `background: ${theme.background}; width: 25px; height: 25px`
      div.addEventListener("click", () => setTheme(theme))
      btnContainer.appendChild(div)
    })
  }
}

onMounted(() => {
  displayThemeButtons()
})

async function handleRegister() {
  try {
    error.value = ''
    isLoading.value = true
    
    if (formData.password !== confirmPassword.value) {
      error.value = 'Passwords do not match'
      return
    }

    if (!formData.role) {
      error.value = 'Please select a role'
      return
    }

    // Create a clean object with only the data we want to send
    const registrationData = {
      name: formData.name,
      email: formData.email,
      mobile_phone: formData.mobile_phone,
      password: formData.password,
      role: formData.role
    }

    await authStore.register(registrationData)
    router.push('/dashboard')
  } catch (err) {
    const errorMessage = err && typeof err === 'object' && 'message' in err ? err.message : ''
    error.value = errorMessage || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
:root {
  --background: #1a1a2e;
  --color: #ffffff;
  --primary-color: #0f3460;
}

* {
  box-sizing: border-box;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--background);
  color: var(--color);
  letter-spacing: 1px;
  transition: background 0.2s ease;
  padding: 2rem;
}

.register-container {
  position: relative;
  width: 100%;
  max-width: 40rem;
}

.form-container {
  border: 1px solid hsla(0, 0%, 65%, 0.158);
  box-shadow: 0 0 36px 1px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(20px);
  z-index: 99;
  padding: 2rem;
}

.register-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  width: 100%;
}

.register-container form input {
  display: block;
  padding: 14.5px;
  width: 100%;
  color: var(--color);
  outline: none;
  background-color: #9191911f;
  border: 1px solid transparent;
  border-radius: 5px;
  font-weight: 500;
  letter-spacing: 0.8px;
  font-size: 15px;
  backdrop-filter: blur(15px);
  transition: all 0.3s ease;
}

.register-container form input:focus {
  box-shadow: 0 0 16px 1px rgba(0, 0, 0, 0.2);
  animation: wobble 0.3s ease-in;
}

.register-container form button {
  background-color: var(--primary-color);
  color: var(--color);
  display: block;
  padding: 13px;
  border-radius: 5px;
  outline: none;
  font-size: 18px;
  letter-spacing: 1.5px;
  font-weight: bold;
  width: 100%;
  cursor: pointer;
  margin: 2rem 0;
  transition: all 0.1s ease-in-out;
  border: none;
  grid-column: 1 / -1;
}

.register-container form button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-container form button:not(:disabled):hover {
  box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.error-message {
  color: #ff4757;
  font-size: 14px;
  margin: 1rem 0;
  text-align: center;
  grid-column: 1 / -1;
}

.circle {
  width: 8rem;
  height: 8rem;
  background: var(--primary-color);
  border-radius: 50%;
  position: absolute;
  z-index: -1;
}

.circle-one {
  top: -20px;
  left: -20px;
}

.circle-two {
  bottom: -20px;
  right: -20px;
}

.illustration {
  position: absolute;
  top: -14%;
  right: -30%;
  width: 100%;
  max-width: 400px;
  z-index: -1;
}

.register-forget {
  text-align: center;
}

.register-forget a {
  text-decoration: none;
  font-size: 14px;
}

.register-forget a:hover {
  text-decoration: underline;
}

.theme-btn-container {
  position: fixed;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
}

.theme-btn {
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.theme-btn:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .register-container {
    width: 95%;
  }
  
  .illustration {
    display: none;
  }
}

.field-error {
  color: #ff4757;
  font-size: 12px;
  margin-top: 4px;
  text-align: left;
  min-height: 20px;
}

.register-container form input.valid {
  border-color: #28a745;
}

.register-container form input.valid:focus {
  box-shadow: 0 0 16px 1px rgba(40, 167, 69, 0.2);
}

.register-container form input.error {
  border-color: #ff4757;
}

.register-container form input.error:focus {
  box-shadow: 0 0 16px 1px rgba(255, 71, 87, 0.2);
}

.password-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  grid-column: 1 / -1;
}

.password-group .form-group {
  margin: 0;
}

.form-select {
  display: block;
  padding: 14.5px;
  width: 100%;
  color: var(--color);
  outline: none;
  background-color: #9191911f;
  border: 1px solid transparent;
  border-radius: 5px;
  font-weight: 500;
  letter-spacing: 0.8px;
  font-size: 15px;
  backdrop-filter: blur(15px);
  transition: all 0.3s ease;
  cursor: pointer;
}

.form-select:focus {
  box-shadow: 0 0 16px 1px rgba(0, 0, 0, 0.2);
}

.form-select option {
  background: var(--background);
  background-color: #9191911f;
  color: var(--color);
}
</style> 