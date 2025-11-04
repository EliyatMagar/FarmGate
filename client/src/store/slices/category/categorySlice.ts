// store/slices/category/categorySlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ProductCategory } from '../../../types/product';
import { categoryAPI } from '../../../api/category/categoryAPI';

interface CategoryState {
    categories: ProductCategory[];
    categoryOptions: ProductCategory[];
    currentCategory: ProductCategory | null;
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    categories: [],
    categoryOptions: [],
    currentCategory: null,
    loading: false,
    error: null,
};

// Async thunks
export const createCategory = createAsyncThunk(
    'categories/create',
    async (categoryData: FormData, { rejectWithValue }) => {
        try {
            const response = await categoryAPI.createCategory(categoryData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Category creation failed');
        }
    }
);

export const fetchCategories = createAsyncThunk(
    'categories/fetchAll',
    async (include_inactive: boolean = false, { rejectWithValue }) => {
        try {
            const response = await categoryAPI.getAllCategories(include_inactive);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch categories');
        }
    }
);

export const fetchCategoryById = createAsyncThunk(
    'categories/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await categoryAPI.getCategoryById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch category');
        }
    }
);

export const updateCategory = createAsyncThunk(
    'categories/update',
    async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
        try {
            const response = await categoryAPI.updateCategory(id, formData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Category update failed');
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'categories/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await categoryAPI.deleteCategory(id);
            return { id, ...response };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Category deletion failed');
        }
    }
);

export const fetchCategoryOptions = createAsyncThunk(
    'categories/fetchOptions',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Redux: Fetching category options...');
            const response = await categoryAPI.getCategoryOptions();
            console.log('✅ Redux: Categories received:', {
                success: response.success,
                count: response.categories?.length || 0,
                categories: response.categories
            });
            return response;
        } catch (error: any) {
            console.error('❌ Redux: Failed to fetch category options:', error);
            return rejectWithValue(error.message || 'Failed to fetch category options');
        }
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentCategory: (state) => {
            state.currentCategory = null;
        },
        clearAllCategories: (state) => {
            state.categories = [];
            state.categoryOptions = [];
            state.currentCategory = null;
            state.error = null;
        },
        resetCategories: () => initialState,
        // Add manual setter for debugging
        setCategoryOptions: (state, action) => {
            state.categoryOptions = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Category
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.category) {
                    state.categories.push(action.payload.category);
                    state.categoryOptions.push(action.payload.category);
                }
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Categories
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.categories || [];
                console.log('📦 fetchCategories.fulfilled:', {
                    received: action.payload.categories?.length || 0,
                    stored: state.categories.length
                });
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Category by ID
            .addCase(fetchCategoryById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoryById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCategory = action.payload.category;
            })
            .addCase(fetchCategoryById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Category
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                const updatedCategory = action.payload.category;
                if (updatedCategory) {
                    const index = state.categories.findIndex(c => c.id === updatedCategory.id);
                    if (index !== -1) {
                        state.categories[index] = updatedCategory;
                    }

                    const optionIndex = state.categoryOptions.findIndex(c => c.id === updatedCategory.id);
                    if (optionIndex !== -1) {
                        state.categoryOptions[optionIndex] = updatedCategory;
                    }

                    if (state.currentCategory?.id === updatedCategory.id) {
                        state.currentCategory = updatedCategory;
                    }
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete Category
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c.id !== action.payload.id);
                state.categoryOptions = state.categoryOptions.filter(c => c.id !== action.payload.id);

                if (state.currentCategory?.id === action.payload.id) {
                    state.currentCategory = null;
                }
            })
            // Fetch Category Options - FIXED
            .addCase(fetchCategoryOptions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoryOptions.fulfilled, (state, action) => {
                state.loading = false;
                
                // CRITICAL FIX: Properly handle the response
                const categories = action.payload.categories || [];
                console.log('🔄 categorySlice: Setting categoryOptions:', {
                    received: categories.length,
                    categories: categories.map(c => ({ name: c.name, id: c.id }))
                });
                
                state.categoryOptions = categories;
                state.error = null;
            })
            .addCase(fetchCategoryOptions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.categoryOptions = [];
                console.error('❌ fetchCategoryOptions rejected:', action.payload);
            });
    },
});

export const { 
    clearError, 
    clearCurrentCategory, 
    clearAllCategories,
    resetCategories,
    setCategoryOptions
} = categorySlice.actions;
export default categorySlice.reducer;