// api/category/categoryAPI.ts
import type { CategoriesResponse, CategoryResponse, ProductCategory } from "../../types/product";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const categoryAPI = {
  createCategory: async (formData: FormData): Promise<CategoryResponse> => {
    console.log('🔄 Creating category...');
    
    for (let [key, value] of formData.entries()) {
      console.log(`📦 Create FormData: ${key} =`, value);
    }

    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const responseText = await response.text();
    console.log('📡 Create Response status:', response.status);
    console.log('📡 Create Response:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || 'Category creation failed' };
      }
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    try {
      const data = JSON.parse(responseText);
      console.log('✅ Category created successfully:', data);
      return data;
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error('Invalid response from server');
    }
  },

  getAllCategories: async (include_inactive: boolean = false): Promise<CategoriesResponse> => {
    const response = await fetch(`${API_BASE_URL}/categories?include_inactive=${include_inactive}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'Failed to fetch categories' };
      }
      throw new Error(errorData.message || 'Failed to fetch categories');
    }

    return await response.json();
  },

  getCategoryById: async (id: string): Promise<CategoryResponse> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'Category not found' };
      }
      throw new Error(errorData.message || 'Category not found');
    }

    return await response.json();
  },

  updateCategory: async (id: string, formData: FormData): Promise<CategoryResponse> => {
    console.log('🔄 Updating category:', id);
    
    for (let [key, value] of formData.entries()) {
      console.log(`📦 Update FormData: ${key} =`, value);
    }

    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    const responseText = await response.text();
    console.log('📡 Update Response status:', response.status);
    console.log('📡 Update Response text:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { 
          message: responseText || `HTTP error! status: ${response.status}` 
        };
      }
      console.error('❌ Update failed:', errorData);
      throw new Error(errorData.message || `Category update failed (${response.status})`);
    }

    try {
      const data = JSON.parse(responseText);
      console.log('✅ Category updated successfully:', data);
      return data;
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error('Invalid response from server');
    }
  },

  deleteCategory: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'Category deletion failed' };
      }
      throw new Error(errorData.message || 'Category deletion failed');
    }

    return await response.json();
  },

  getCategoryOptions: async (): Promise<{ success: boolean; categories: ProductCategory[] }> => {
    console.log('📡 Fetching category options from:', `${API_BASE_URL}/categories/options`);
    
    const response = await fetch(`${API_BASE_URL}/categories/options`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch category options');
    }

    const data = await response.json();
    console.log('📦 Category API Raw Response:', data);
    
    // Log each category ID from real data
    if (data.categories && data.categories.length > 0) {
      console.log('🔍 Category IDs from API:');
      data.categories.forEach((category: ProductCategory, index: number) => {
        console.log(`  ${index + 1}. ${category.name}: ${category.id} (type: ${typeof category.id})`);
      });
    } else {
      console.log('📭 No categories found in database');
    }

    return data;
  },
};