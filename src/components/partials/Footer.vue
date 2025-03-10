<script setup lang="ts">
import { ref } from 'vue'

const currentYear = new Date().getFullYear()
const systemStatus = ref('Online')
const lastSync = ref(new Date().toLocaleString())
</script>

<template>
  <footer class="bg-white border-t border-gray-200">
    <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <!-- Left side -->
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-500">
            © {{ currentYear }} POS System. All rights reserved.
          </span>
          <span class="text-sm text-gray-500">|</span>
          <span class="text-sm text-gray-500">
            Last sync: {{ lastSync }}
          </span>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <span
              class="relative flex h-3 w-3"
              :class="systemStatus === 'Online' ? 'text-green-500' : 'text-red-500'"
            >
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                :class="systemStatus === 'Online' ? 'bg-green-400' : 'bg-red-400'"
              ></span>
              <span
                class="relative inline-flex rounded-full h-3 w-3"
                :class="systemStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'"
              ></span>
            </span>
            <span class="ml-2 text-sm text-gray-500">{{ systemStatus }}</span>
          </div>
          <span class="text-sm text-gray-500">|</span>
          <a href="#" class="text-sm text-gray-500 hover:text-gray-700">Help</a>
          <a href="#" class="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
          <a href="#" class="text-sm text-gray-500 hover:text-gray-700">Terms</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Add any additional styles here */
</style> 