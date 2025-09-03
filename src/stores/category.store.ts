import { defineStore } from "pinia";
import { ref } from 'vue';

// Define the Category interface
interface Category {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
}

// Define the store state
interface CrudState {
  categories: Category[];
  category: Category | null;
  loading: boolean;
  error: string | null;
}

export const useCategoryStore = defineStore('category', {
  state: (): CrudState => ({
    categories: [],
    category: null,
    loading: false,
    error: null,
  }),
  getters: {
    getCategories: (state) => state.categories,
    getCategoryById: (state) => state.category,
  },
  actions: {
    async create(categoryData: Omit<Category, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        console.log('Creating category with data:', categoryData);
        const newCategory = await window.electronAPI.categories.create(categoryData);
        console.log('Category created successfully:', newCategory);
        this.categories.push(newCategory);
        return newCategory;
      } catch (error: any) {
        console.error('Error creating category:', error);
        this.error = error?.message || 'Failed to create category';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async update(updatedCategory: { id: string; name: string; description: string; parent_id: string | null }) {
      this.loading = true;
      this.error = null;
      try {
        const { id, ...data } = updatedCategory;
        const result = await window.electronAPI.categories.update(parseInt(id), data);
        const index = this.categories.findIndex(cat => cat.id === id);
        if (index !== -1) {
          this.categories[index] = result;
        }
        return result;
      } catch (error: any) {
        this.error = error?.message || 'Failed to update category';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async delete(categoryId: string) {
      this.loading = true;
      this.error = null;
      try {
        await window.electronAPI.categories.delete(parseInt(categoryId));
        this.categories = this.categories.filter(cat => cat.id !== categoryId);
      } catch (error: any) {
        this.error = error?.message || 'Failed to delete category';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchCategoryByID(categoryId: string) {
      this.loading = true;
      this.error = null;
      try {
        const category = await window.electronAPI.categories.getByID(parseInt(categoryId));
        this.category = category;
        return category;
      } catch (error: any) {
        this.error = error?.message || `Failed to fetch category ${categoryId}`;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchCategories() {
      this.loading = true;
      this.error = null;
      try {
        console.log('Fetching categories...');
        const categories = await window.electronAPI.categories.getAll();
        console.log('Categories fetched:', categories);
        this.categories = categories;
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        this.error = error?.message || 'Failed to fetch categories';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
