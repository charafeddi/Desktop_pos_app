<template>
    <div class="menu-bar">
        <ul class="menu-list">
            <li class="menu-item" @click="toggleDropdown('file')">
                {{ t('menu.file') }} 
                <ul class="dropDown" v-if="activeDropdown === 'file'">
                    <li class="item-dropdown" @click="handleNew">{{ t('menu.new') }}</li>
                    <li class="item-dropdown" @click="handleOpen">{{ t('menu.open') }}</li>
                    <li class="item-dropdown" @click="handleSave">{{ t('menu.save') }}</li>
                    <li class="item-dropdown" @click="handleSaveAs">{{ t('menu.save_as') }}</li>
                    <li class="item-dropdown" @click="handleExit">{{ t('menu.exit') }}</li>
                </ul>
            </li>
            <li class="menu-item" @click="toggleDropdown('edit')">
                {{ t('menu.edit') }}
                <ul class="dropDown" v-if="activeDropdown === 'edit'">
                    <li class="item-dropdown" @click="handleCut">{{ t('menu.cut') }}</li>
                    <li class="item-dropdown" @click="handleCopy">{{ t('menu.copy') }}</li>
                    <li class="item-dropdown" @click="handlePaste">{{ t('menu.paste') }}</li>
                </ul>
            </li>
            <li class="menu-item" @click="toggleDropdown('view')">
                {{ t('menu.view') }}
                <ul class="dropDown" v-if="activeDropdown === 'view' || activeDropdown === 'language'">
                    <li class="item-dropdown" @click="handleToolbar">{{ t('menu.toolbar') }}</li>
                    <li class="menu-item submenu-item" @click.stop="toggleDropdown('language')">
                        {{ t('menu.language') }}
                        <svg v-if="activeDropdown === 'language'" class="inline ml-1 arrow-down" width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                            <path d="M0.646447 2.64645C0.451184 2.84171 0.451184 3.15829 0.646447 3.35355L3.81802 6.52513C3.82669 6.53379 3.83592 6.54181 3.84562 6.54915C3.86101 6.56051 3.87787 6.57067 3.89618 6.57907C3.93289 6.59527 3.97341 6.60659 4.01661 6.61176C4.02549 6.61305 4.03448 6.6137 4.04355 6.6137C4.05468 6.6137 4.06571 6.61289 4.07659 6.61125C4.12408 6.60395 4.16807 6.58873 4.20615 6.56667L7.17701 4.88873C7.37794 4.76044 7.42537 4.48425 7.29708 4.28332C7.16879 4.08239 6.89260 4.03495 6.69167 4.16324L4.5 5.46602L2.30833 4.16324C2.10740 4.03495 1.83121 4.08239 1.70292 4.28332C1.57463 4.48425 1.62206 4.76044 1.82299 4.88873L4.79385 6.56667C4.83193 6.58873 4.87592 6.60395 4.92341 6.61125C4.91404 6.61289 4.90481 6.6137 4.89587 6.6137Z"/>
                        </svg>
                        <svg v-else class="inline ml-1 arrow-right" width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                            <path d="M3.35355 0.646447C3.15829 0.451184 2.84171 0.451184 2.64645 0.646447C2.45118 0.84171 2.45118 1.15829 2.64645 1.35355L4.29289 3L2.64645 4.64645C2.45118 4.84171 2.45118 5.15829 2.64645 5.35355C2.84171 5.54882 3.15829 5.54882 3.35355 5.35355L6.70711 2L3.35355 0.646447ZM7.35355 2.64645C7.15829 2.45118 6.84171 2.45118 6.64645 2.64645L3.29289 6L0.853553 8.43934C0.65829 8.6346 0.658291 8.95118 0.853553 9.14645C1.04882 9.34171 1.3654 9.34171 1.56066 9.14645L3.64645 7.06066L5.73223 9.14645C5.92749 9.34171 6.24407 9.34171 6.43933 9.14645C6.6346 8.95118 6.6346 8.6346 6.43933 8.43934L4.35355 6.35355L7.35355 3.35355C7.54882 3.15829 7.54882 2.84171 7.35355 2.64645Z"/>
                        </svg>
                        <ul class="dropDown language-dropdown" v-if="activeDropdown === 'language'">
                            <li class="item-dropdown" @click="changeLanguage('en')" :class="{ active: currentLocale === 'en' }">
                                {{ t('menu.english') }}
                            </li>
                            <li class="item-dropdown" @click="changeLanguage('fr')" :class="{ active: currentLocale === 'fr' }">
                                {{ t('menu.french') }}
                            </li>
                        </ul>
                    </li>
                    <li class="item-dropdown" @click="handleStatusBar">{{ t('menu.status_bar') }}</li>
                </ul>
            </li>
            <li class="menu-item" @click="toggleDropdown('help')">
                {{ t('menu.help') }}
                <ul class="dropDown" v-if="activeDropdown === 'help'">
                    <li class="item-dropdown" @click="handleAbout">{{ t('menu.about') }}</li>
                    <li class="item-dropdown" @click="handleDocumentation">{{ t('menu.documentation') }}</li>
                </ul>
            </li>
        </ul>
    </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const activeDropdown = ref(null)
const currentLocale = ref(locale.value)

const toggleDropdown = (dropdown) => {
    if (dropdown === 'language') {
        // For language dropdown, just toggle it (parent view dropdown remains open)
        activeDropdown.value = activeDropdown.value === 'language' ? 'view' : 'language'
    } else {
        activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
    }
}

const changeLanguage = (lang) => {
    locale.value = lang
    currentLocale.value = lang
    activeDropdown.value = null // Close language dropdown after selection
    // Store language preference in localStorage
    localStorage.setItem('language', lang)
}

// File menu actions
const handleNew = () => {
    // Navigate to POS for new sale
    router.push('/pos')
    activeDropdown.value = null
}

const handleOpen = () => {
    // Navigate to sales list to view/open saved sales
    router.push('/sales')
    activeDropdown.value = null
}

const handleSave = () => {
    // Save current document (if in POS, save current sale)
    if (router.currentRoute.value.path === '/pos') {
        // Trigger save functionality in POS component
        window.dispatchEvent(new CustomEvent('save-current-sale'))
    }
    activeDropdown.value = null
}

const handleSaveAs = () => {
    // Save as new document
    if (router.currentRoute.value.path === '/pos') {
        // Trigger save as functionality in POS component
        window.dispatchEvent(new CustomEvent('save-as-sale'))
    }
    activeDropdown.value = null
}

const handleExit = async () => {
    try {
        // Logout user
        authStore.logout()
        // Close the Electron app
        if (window.electronAPI && window.electronAPI.closeApp) {
            await window.electronAPI.closeApp()
        } else {
            // Fallback: redirect to login
            router.push('/login')
        }
    } catch (error) {
        console.error('Error during exit:', error)
        // Fallback: redirect to login
        router.push('/login')
    }
    activeDropdown.value = null
}

// Edit menu actions
const handleCut = () => {
    // Implement cut functionality
    document.execCommand('cut')
    activeDropdown.value = null
}

const handleCopy = () => {
    // Implement copy functionality
    document.execCommand('copy')
    activeDropdown.value = null
}

const handlePaste = () => {
    // Implement paste functionality
    document.execCommand('paste')
    activeDropdown.value = null
}

// View menu actions
const handleToolbar = () => {
    // Toggle toolbar visibility
    window.dispatchEvent(new CustomEvent('toggle-toolbar'))
    activeDropdown.value = null
}

const handleStatusBar = () => {
    // Toggle status bar visibility
    window.dispatchEvent(new CustomEvent('toggle-status-bar'))
    activeDropdown.value = null
}

// Help menu actions
const handleAbout = () => {
    // Show about dialog
    alert('POS System v1.0.0\nDeveloped for Point of Sale Management')
    activeDropdown.value = null
}

const handleDocumentation = () => {
    // Open documentation (could be a local file or web URL)
    window.open('https://github.com/your-repo/pos-system', '_blank')
    activeDropdown.value = null
}

// Memoize selector for better performance
const MENU_SELECTORS = '.menu-bar, .menu-list, .menu-item, .dropDown'

const closeDropdownOnClickOutside = (event) => {
    if (!event.target.closest(MENU_SELECTORS)) {
        activeDropdown.value = null
    }
}

onMounted(() => {
    // Load saved language preference once
    const savedLang = localStorage.getItem('language')
    if (savedLang && ['en', 'fr'].includes(savedLang)) {
        locale.value = savedLang
        currentLocale.value = savedLang
    }
    document.addEventListener('click', closeDropdownOnClickOutside, { passive: true })
})

onBeforeUnmount(() => {
    document.removeEventListener('click', closeDropdownOnClickOutside)
})
</script>
<style lang="css">
    .menu-bar {
       position: relative;
       top: 0;
       left: 0;
       width: 100%;
       height: 30px;
       border-bottom: 1px solid #424242;
       z-index: 1000;
       padding:0;
       margin:0;
    }

    .menu-list {
        display: flex;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .menu-item {
        position: relative;
        padding: 8px 12px;
        cursor: pointer;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 14px;
        transition: background 0.2s;
    }
    .menu-item:hover {
       color: #424242;
    }

    .dropDown {
        position: absolute;
        top: 100%;
        left: 0;
        background: #1d1d1d;
        border: 1px solid #424242;
        list-style: none;
        padding: 0;
        margin: 0;
        min-width: 150px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 1001;
    }

    /* Submenu item styling */
    .submenu-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    /* Language submenu dropdown */
    .submenu-item .dropDown,
    .language-dropdown {
        left: 100%;
        top: 0;
        margin-left: 1px;
        z-index: 1002;
        min-width: 120px;
    }

    .language-dropdown {
        background: #2a2a2a;
        border: 2px solid transparent;
    }

    .item-dropdown {
        padding: 8px 12px;
        cursor: pointer;
        font-family: Arial, sans-serif;
        font-size: 14px;
    }

    .item-dropdown:hover {
        background: #333333;
    }

    .item-dropdown.active {
        background: #4a90e2;
        color: white;
    }

    .item-dropdown.active:hover {
        background: #357abd;
    }

    .arrow-down, .arrow-right {
        transition: transform 0.2s;
    }

    .menu-item .arrow-down {
        transform: rotate(90deg);
    }

    .menu-item .arrow-right {
        transform: rotate(0deg);
    }

</style>