<template>
    <div class="menu-bar">
        <ul class="menu-list">
            <li class="menu-item" @click="toggleDropdown('file')">
                File 
                <ul class="dropDown" v-if="activeDropdown === 'file'">
                    <li class="item-dorpdown">New</li>
                    <li class="item-dorpdown">Open</li>
                    <li class="item-dorpdown">Save</li>
                    <li class="item-dorpdown">Save As</li>
                    <li class="item-dorpdown">Exit</li>
                </ul>
            </li>
            <li class="menu-item" @click="toggleDropdown('edit')">
                Edit
                <ul class="dropDown" v-if="activeDropdown === 'edit'">
                    <li class="item-dorpdown">Cut</li>
                    <li class="item-dorpdown">Copy</li>
                    <li class="item-dorpdown">Paste</li>
                </ul>
            </li>
            <li class="menu-item" @click="toggleDropdown('view')">
                View
                <ul class="dropDown" v-if="activeDropdown === 'view'">
                    <li class="item-dorpdown">Toolbar</li>
                    <li class="item-dorpdown">Language</li>
                    <li class="item-dorpdown">Status Bar</li>
                </ul>
            </li>
            <li class="menu-item" @click="toggleDropdown('help')">
                Help
                <ul class="dropDown" v-if="activeDropdown === 'help'">
                    <li class="item-dorpdown">About</li>
                    <li class="item-dorpdown">Documentation</li>
                </ul>
            </li>
        </ul>
    </div>
</template>
<script>
export default {
    data() {
        return {
            activeDropdown: null
        }
    },
    methods: {
        toggleDropdown(dropdown) {
            this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
        },
        closeDropdownOnClickOutside(event) {
            if (!event.target.closest('.menu-item')) {
                this.activeDropdown = null;
            }
        }
    },
    mounted() {
        document.addEventListener('click', this.closeDropdownOnClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.closeDropdownOnClickOutside);
    }
}
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
       background: #424242;
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

    .item-dropdown {
        padding: 8px 12px;
        cursor: pointer;
        font-family: Arial, sans-serif;
        font-size: 14px;
    }

    .item-dropdown:hover {
        background: #333333;
    }
</style>