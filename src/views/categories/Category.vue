<template>
    <div class="p-4 sm:p-6">
        <div class="inline-flex justify-center items-center">
            <h2 class="text-2xl font-bold  mb-6">Categories</h2>
            <button
                @click="openModal"
                class="mb-4 px-4 py-4 bg-indigo-600 rounded-md absolute right-0 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                {{t('Category.Add')}}
            </button>
        </div>
        <Modal
            :isOpen = "isModalOpen"
            :editData="editData"
            @close="closeModal"
            @submit="handleSubmit"
        />

      <!-- Grid Layout -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <!-- Category Card -->
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative group"
        >
          <div class="p-4">
            <!-- Icon (optional) -->
            <div class="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-blue-100 text-blue-600">
              <i :class="category.icon"></i>
            </div>
  
            <!-- Title -->
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ category.name }}</h3>
  
            <!-- Description (optional) -->
            <p class="text-gray-600 text-sm">{{ category.description }}</p>
  
            <!-- Count (optional) -->
            <div class="mt-3 flex items-center text-gray-500 text-xs">
              <span>{{ category.product_count }} items</span>
            </div>

            <div class="absolute inset-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90">
              <button
              @click.stop="editCategory(category)"
              class="p-2 text-gray-600 hover:text-blue-600 mx-2"
              title="Edit"
              >
                <span class="material-icons-outlined">edit</span>
              </button>
              <button
              @click.stop="deleteCategory(category.id)"              
              class="p-2 text-gray-600 hover:text-red-600 mx-2">
                  <span class="material-icons-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import Modal from './CategoryModal.vue'
import { useI18n }  from 'vue-i18n'
import { useCategoryStore } from '../../stores/category.store' 
import { computed, ref, onMounted } from 'vue';

const { t } = useI18n()
const isModalOpen = ref(false);
const editData = ref(null);
const categoryStore = useCategoryStore();

const categories = computed(() => categoryStore.categories);

// Load categories on component mount
onMounted(async () => {
    try {
        await categoryStore.fetchCategories();
    } catch (error) {
        console.error('Failed to fetch categories:', error);
    }
});

const openModal = () => {
    editData.value = null; // Clear any edit data when opening for new category
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    editData.value = null; // Clear edit data when closing
};

const handleSubmit = async (categoryData) => {
    try {
        if (editData.value) {
            // Update existing category
            await categoryStore.update(categoryData);
        } else {
            // Create new category
            await categoryStore.create(categoryData);
        }
        await categoryStore.fetchCategories();
        closeModal();
    } catch (error) {
        console.error('Failed to save category:', error);
    }
};

const editCategory = async (category) => {
    editData.value = category; // Set the category data for editing
    isModalOpen.value = true; // Open the modal
};

const deleteCategory = async (categoryId) => {
  try {
    console.log(categoryId);
    await categoryStore.delete(categoryId);
    await categoryStore.fetchCategories();
  } catch (error) {
    console.error("Couldn't Delete the category ", error);
  }
};
</script>
  