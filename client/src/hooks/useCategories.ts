// hooks/useCategories.ts
import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import {
  createCategory,
  fetchCategories,
  fetchCategoryById,
  updateCategory,
  deleteCategory,
  fetchCategoryOptions,
  clearError,
  clearCurrentCategory,
} from '../store/slices/category/categorySlice';
import type { ProductCategory, CreateCategoryData, UpdateCategoryData } from '../types/product';

export const useCategories = () => {
  const dispatch = useAppDispatch();
  const { categories, categoryOptions, currentCategory, loading, error } = useAppSelector(
    (state) => state.category // Make sure this matches your store structure
  );

  // Category actions
  const createCategoryAction = useCallback((categoryData: CreateCategoryData) => {
    const formData = new FormData();
    
    Object.entries(categoryData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return dispatch(createCategory(formData)).unwrap();
  }, [dispatch]);

  const fetchCategoriesAction = useCallback((include_inactive: boolean = false) => {
    return dispatch(fetchCategories(include_inactive)).unwrap();
  }, [dispatch]);

  const fetchCategoryByIdAction = useCallback((id: string) => {
    return dispatch(fetchCategoryById(id)).unwrap();
  }, [dispatch]);

  const updateCategoryAction = useCallback((id: string, categoryData: UpdateCategoryData) => {
    const formData = new FormData();
    
    Object.entries(categoryData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return dispatch(updateCategory({ id, formData })).unwrap();
  }, [dispatch]);

  const deleteCategoryAction = useCallback((id: string) => {
    return dispatch(deleteCategory(id)).unwrap();
  }, [dispatch]);

  const fetchCategoryOptionsAction = useCallback(() => {
    return dispatch(fetchCategoryOptions()).unwrap();
  }, [dispatch]);

  // Utility actions
  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrentCategoryAction = useCallback(() => {
    dispatch(clearCurrentCategory());
  }, [dispatch]);

  // Helper functions with proper typing
  const getCategoryById = useCallback((id: string): ProductCategory | undefined => {
    return categories.find((category: ProductCategory) => category.id === id);
  }, [categories]);

  const getSubcategories = useCallback((parentId: string): ProductCategory[] => {
    return categories.filter((category: ProductCategory) => category.parent_id === parentId);
  }, [categories]);

  const getRootCategories = useCallback((): ProductCategory[] => {
    return categories.filter((category: ProductCategory) => !category.parent_id);
  }, [categories]);

  return {
    // State
    categories,
    categoryOptions,
    currentCategory,
    loading,
    error,

    // Actions
    createCategory: createCategoryAction,
    fetchCategories: fetchCategoriesAction,
    fetchCategoryById: fetchCategoryByIdAction,
    updateCategory: updateCategoryAction,
    deleteCategory: deleteCategoryAction,
    fetchCategoryOptions: fetchCategoryOptionsAction,
    
    // Utility actions
    clearError: clearErrorAction,
    clearCurrentCategory: clearCurrentCategoryAction,

    // Helper functions
    getCategoryById,
    getSubcategories,
    getRootCategories,
  };
};