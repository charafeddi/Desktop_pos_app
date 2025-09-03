<template>
    <!-- Modal Backdrop (hidden by default) -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <!-- Overlay -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="closeModal"
      ></div>
  
      <!-- Modal Content -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div
          class="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto"
          @click.stop
        >
          <!-- Modal Header -->
          <div class="relative bg-gray-50 px-4 py-3 sm:px-6 flex items-center justify-between rounded-t-lg">
            <h3 class="text-lg font-medium text-gray-900" id="modal-title">
              {{ isEditMode ? t('Category.Edit') : t('Category.Add') }}
            </h3>
            <button
              type="button"
              @click="closeModal"
              class="rounded-md bg-gray-50 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 p-1"
            >
              <span class="sr-only">Close</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          <!-- Modal Body -->
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <form @submit.prevent="handleSubmit">
              <div class="mb-4">
                <label for="category" class="block text-sm font-medium text-gray-700">{{ t('Category.name') }}</label>
                <input
                  type="text"
                  id="name"
                  v-model="form.category"
                  required
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
                />
              </div>
  
              <div class="mb-4">
                <label for="description" class="block text-sm font-medium text-gray-700">{{ t('Category.description') }}</label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="3"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
                ></textarea>
              </div>
  
              <div class="mb-4">
                <label for="id" class="block text-sm font-medium text-gray-700">{{ t('Category.subcategory') }}</label>
                <select 
                v-model="form.parent_id"
                id="parent_id"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
                >
                  <option value="">{{ t('Category.noParent') }}</option>
                  <option v-for="(item, index) in categories" :key="item.id" :value="item.id"> {{item.name}}</option>
                </select>
              </div>
  
              <!-- Submit Button -->
              <div class="sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {{ isEditMode ? 'Update' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCategoryStore } from '../../stores/category.store'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  editData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'submit']);

const categoryStore = useCategoryStore();
const { t } = useI18n();

const form = ref({
  category: '',
  description: '',
  parent_id: '',
});

const categories = computed(() => categoryStore.getCategories);

// Check if we're in edit mode
const isEditMode = computed(() => props.editData !== null);

// Watch for changes in editData to populate the form
watch(() => props.editData, (newData) => {
  if (newData) {
    form.value = {
      category: newData.name || '',
      description: newData.description || '',
      parent_id: newData.parent_id || '',
    };
  } else {
    // Reset form when not editing
    form.value = { category: '', description: '', parent_id: '' };
  }
}, { immediate: true });

const closeModal = () => {
  console.log('Close modal clicked');
  emit('close');
};

const handleSubmit = () => {
  // Clean and prepare the data for the backend
  const categoryData = {
    name: form.value.category.trim(),
    description: form.value.description.trim() || null,
    parent_id: form.value.parent_id?.trim() || null,
  };
  
  // If editing, include the ID
  if (isEditMode.value && props.editData) {
    categoryData.id = props.editData.id;
  }
  
  // Emit the cleaned form data to the parent component
  emit('submit', categoryData);
  // Reset the form
  form.value = { category: '', description: '', parent_id: '' };
  // Don't close modal here - let parent handle it after successful creation
};
</script>
  