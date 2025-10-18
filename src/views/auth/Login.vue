<template>
  <section class=" w-full container">
    <div class="login-container">
      <div class="circle circle-one"></div>
      <div class="form-container">
        <img src="/assets/img/Mobile login-cuate.png" alt="Login Illustration" class="illustration" />
        <h1 class="opacity">LOGIN</h1>
        <form @submit.prevent="handleLogin">
          <input 
            type="text" 
            placeholder="EMAIL" 
            v-model="email"
            required
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            v-model="password"
            required
          />
          <button class="opacity" type="submit">
            <span v-if="isLoading">Loading...</span>
            <span v-else>Sign In</span>
          </button>
        </form>
        <div class="register-forget opacity">
          <a href="#" @click.prevent="goToRegister">REGISTER</a>
          <router-link to="/forgot-password">FORGOT PASSWORD</router-link>
        </div>
      </div>
      <div class="circle circle-two"></div>
    </div>
    <div class="theme-btn-container"></div>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

// Composables
const router = useRouter()

// Stores
const authStore = useAuthStore()
  
// Reactive Variables
const email = ref('')
const password = ref('')
const isLoading = ref(false)

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
  
// Methods
function setTheme(theme: any) {
  const root = document.querySelector(":root") as HTMLElement
  root.style.setProperty("--background", theme.background)
  root.style.setProperty("--color", theme.color)
  root.style.setProperty("--primary-color", theme.primaryColor)
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
  
// Lifecycle Hooks
onMounted(() => {
  displayThemeButtons()
})
  
async function handleLogin() {
  try {
    isLoading.value = true
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    isLoading.value = false
  }
}

function goToRegister() {
  router.push('/register')
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
  height: 100vh;
  background: transparent;
  color: var(--color);
  letter-spacing: 1px;
  transition: background 0.2s ease;
}

.login-container {
  position: relative;
  width: 22.2rem;
}

.form-container {
  border: 1px solid hsla(0, 0%, 65%, 0.158);
  box-shadow: 0 0 36px 1px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(20px);
  z-index: 99;
  padding: 2rem;
}

.login-container form input {
  display: block;
  padding: 14.5px;
  width: 100%;
  margin: 2rem 0;
  color: var(--color-text) !important;
  outline: none;
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 5px;
  font-weight: 500;
  letter-spacing: 0.8px;
  font-size: 15px;
  backdrop-filter: blur(15px);
}

/* Force text color for light theme */
[data-theme="light"] .login-container form input {
  color: #1f2937 !important;
  background-color: #ffffff !important;
  border-color: #d1d5db !important;
}

/* Force text color for dark theme */
[data-theme="dark"] .login-container form input {
  color: #f9fafb !important;
  background-color: #374151 !important;
  border-color: #4b5563 !important;
}

.login-container form input:focus {
  box-shadow: 0 0 16px 1px rgba(0, 0, 0, 0.2);
  animation: wobble 0.3s ease-in;
}

.login-container form button {
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
  margin-bottom: 2rem;
  transition: all 0.1s ease-in-out;
  border: none;
}

.login-container form button:hover {
  box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.circle {
  width: 8rem;
  height: 8rem;
  background: var(--primary-color);
  border-radius: 50%;
  position: absolute;
}

.illustration {
  position: absolute;
  top: -30%;
  right: -60%;
  width: 100%;
}

.circle-one {
  top: 0;
  left: 0;
  z-index: -1;
  transform: translate(-45%, -45%);
}

.circle-two {
  bottom: 0;
  right: 0;
  z-index: -1;
  transform: translate(45%, 45%);
}

.register-forget {
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
}

.opacity {
  opacity: 0.6;
}

.theme-btn-container {
  position: absolute;
  left: 0;
  bottom: 2rem;
}

.theme-btn {
  cursor: pointer;
  transition: all 0.3s ease-in;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  margin: 0.5rem;
}

.theme-btn:hover {
  width: 40px !important;
}

@keyframes wobble {
  0% {
    transform: scale(1.025);
  }
  25% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.025);
  }
  100% {
    transform: scale(1);
  }
}


</style> 