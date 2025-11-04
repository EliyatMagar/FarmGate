import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Product, ProductFilters, InventoryUpdateData } from '../../../types/product';
import {productAPI} from '../../../api/product/productAPI'

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  myProducts: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  myProducts: [],
  loading: false,
  error: null,
  filters: {},
  pagination: null,
};

// Async thunks
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData: FormData, { rejectWithValue }) => {
    try {
      const response = await productAPI.createProduct(productData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Product creation failed');
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try {
      const response = await productAPI.getAllProducts(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProductById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch product');
    }
  }
);

export const fetchMyProducts = createAsyncThunk(
  'products/fetchMyProducts',
  async (filters: { page?: number; limit?: number; is_available?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await productAPI.getMyProducts(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch your products');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await productAPI.updateProduct(id, formData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Product update failed');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await productAPI.deleteProduct(id);
      return { id, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Product deletion failed');
    }
  }
);

export const updateInventory = createAsyncThunk(
  'products/updateInventory',
  async ({ id, data }: { id: string; data: InventoryUpdateData }, { rejectWithValue }) => {
    try {
      const response = await productAPI.updateProductInventory(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Inventory update failed');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    updateProductInList: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    updateMyProductInList: (state, action: PayloadAction<Product>) => {
      const index = state.myProducts.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.myProducts[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.myProducts.unshift(action.payload.product);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch My Products
      .addCase(fetchMyProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.myProducts = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload.product;
        
        // Update in products list
        const productIndex = state.products.findIndex(p => p.id === updatedProduct.id);
        if (productIndex !== -1) {
          state.products[productIndex] = updatedProduct;
        }
        
        // Update in myProducts list
        const myProductIndex = state.myProducts.findIndex(p => p.id === updatedProduct.id);
        if (myProductIndex !== -1) {
          state.myProducts[myProductIndex] = updatedProduct;
        }
        
        // Update current product if it's the one being updated
        if (state.currentProduct?.id === updatedProduct.id) {
          state.currentProduct = updatedProduct;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.myProducts = state.myProducts.filter(p => p.id !== action.payload.id);
        state.products = state.products.filter(p => p.id !== action.payload.id);
        
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = null;
        }
      })
      // Update Inventory
      .addCase(updateInventory.fulfilled, (state, action) => {
        const updatedProduct = action.payload.product;
        
        // Update in products list
        const productIndex = state.products.findIndex(p => p.id === updatedProduct.id);
        if (productIndex !== -1) {
          state.products[productIndex] = updatedProduct;
        }
        
        // Update in myProducts list
        const myProductIndex = state.myProducts.findIndex(p => p.id === updatedProduct.id);
        if (myProductIndex !== -1) {
          state.myProducts[myProductIndex] = updatedProduct;
        }
        
        // Update current product if it's the one being updated
        if (state.currentProduct?.id === updatedProduct.id) {
          state.currentProduct = updatedProduct;
        }
      });
  },
});

export const {
  clearError,
  clearCurrentProduct,
  setFilters,
  clearFilters,
  updateProductInList,
  updateMyProductInList,
} = productSlice.actions;

export default productSlice.reducer;