// hooks/useProducts.ts
import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import {
  createProduct,
  fetchProducts,
  fetchProductById,
  fetchMyProducts,
  updateProduct,
  deleteProduct,
  updateInventory,
  clearError,
  clearCurrentProduct,
  setFilters,
  clearFilters,
  updateProductInList,
  updateMyProductInList,
} from '../store/slices/product/productSlice'; // Updated path
import type { CreateProductData, UpdateProductData, ProductFilters, InventoryUpdateData } from '../types/product';

export const useProducts = () => {
  const dispatch = useAppDispatch();
  const { products, currentProduct, myProducts, loading, error, filters, pagination } = useAppSelector(
    (state) => state.product // Changed from state.products
  );

  // Product actions
  const createProductAction = useCallback((productData: CreateProductData) => {
    const formData = new FormData();
    
    // Append basic fields
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'images' && Array.isArray(value)) {
          value.forEach(file => formData.append('images', file));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return dispatch(createProduct(formData)).unwrap();
  }, [dispatch]);

  const fetchProductsAction = useCallback((filters: ProductFilters = {}) => {
    return dispatch(fetchProducts(filters)).unwrap();
  }, [dispatch]);

  const fetchProductByIdAction = useCallback((id: string) => {
    return dispatch(fetchProductById(id)).unwrap();
  }, [dispatch]);

  const fetchMyProductsAction = useCallback((filters: { page?: number; limit?: number; is_available?: boolean } = {}) => {
    return dispatch(fetchMyProducts(filters)).unwrap();
  }, [dispatch]);

  const updateProductAction = useCallback((id: string, productData: UpdateProductData) => {
    const formData = new FormData();
    
    // Append basic fields
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'images' && Array.isArray(value)) {
          value.forEach(file => formData.append('images', file));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return dispatch(updateProduct({ id, formData })).unwrap();
  }, [dispatch]);

  const deleteProductAction = useCallback((id: string) => {
    return dispatch(deleteProduct(id)).unwrap();
  }, [dispatch]);

  const updateInventoryAction = useCallback((id: string, data: InventoryUpdateData) => {
    return dispatch(updateInventory({ id, data })).unwrap();
  }, [dispatch]);

  // Utility actions
  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrentProductAction = useCallback(() => {
    dispatch(clearCurrentProduct());
  }, [dispatch]);

  const setFiltersAction = useCallback((newFilters: ProductFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const clearFiltersAction = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const updateProductInListAction = useCallback((product: any) => {
    dispatch(updateProductInList(product));
  }, [dispatch]);

  const updateMyProductInListAction = useCallback((product: any) => {
    dispatch(updateMyProductInList(product));
  }, [dispatch]);

  return {
    // State
    products,
    currentProduct,
    myProducts,
    loading,
    error,
    filters,
    pagination,

    // Actions
    createProduct: createProductAction,
    fetchProducts: fetchProductsAction,
    fetchProductById: fetchProductByIdAction,
    fetchMyProducts: fetchMyProductsAction,
    updateProduct: updateProductAction,
    deleteProduct: deleteProductAction,
    updateInventory: updateInventoryAction,
    
    // Utility actions
    clearError: clearErrorAction,
    clearCurrentProduct: clearCurrentProductAction,
    setFilters: setFiltersAction,
    clearFilters: clearFiltersAction,
    updateProductInList: updateProductInListAction,
    updateMyProductInList: updateMyProductInListAction,
  };
};