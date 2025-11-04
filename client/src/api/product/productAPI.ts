
// productAPI.ts
import type {
  UpdateProductData,
  ProductFilters,
  InventoryUpdateData,
  ProductResponse,
  ProductsResponse,
  CategoryResponse,
  CategoriesResponse
} from '../../types/product'

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Helper function to calculate pagination
const calculatePagination = (
  data: any[],
  filters: ProductFilters,
  totalCount?: number
) => {
  const currentPage = filters.page || 1;
  const limit = filters.limit || 10;
  const total = totalCount || data.length;
  
  return {
    currentPage,
    totalPages: Math.ceil(total / limit),
    totalProducts: total,
    hasNext: currentPage < Math.ceil(total / limit),
    hasPrev: currentPage > 1,
  };
};

export const productAPI = {
  // ✅ Products
  createProduct: async (formData: FormData): Promise<ProductResponse> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await handleResponse(response);
    return {
      success: true,
      product: data.product || data,
      message: data.message || "Product created successfully"
    };
  },

  getAllProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/products?${queryParams.toString()}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await handleResponse(response);
    
    // Extract pagination from headers or calculate it
    const totalCountHeader = response.headers.get('X-Total-Count');
    const totalCount = totalCountHeader ? parseInt(totalCountHeader) : undefined;
    
    const products = data.products || data || [];
    
    return {
      success: true,
      products,
      pagination: calculatePagination(products, filters, totalCount)
    };
  },

  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await handleResponse(response);
    return {
      success: true,
      product: data.product || data,
      message: data.message
    };
  },

  getMyProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/products/farmer/my-products?${queryParams.toString()}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await handleResponse(response);
    
    // Extract pagination from headers or calculate it
    const totalCountHeader = response.headers.get('X-Total-Count');
    const totalCount = totalCountHeader ? parseInt(totalCountHeader) : undefined;
    
    const products = data.products || data || [];
    
    return {
      success: true,
      products,
      pagination: calculatePagination(products, filters, totalCount)
    };
  },

  updateProduct: async (id: string, formData: FormData): Promise<ProductResponse> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    const data = await handleResponse(response);
    return {
      success: true,
      product: data.product || data,
      message: data.message || "Product updated successfully"
    };
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message?: string; id?: string }> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await handleResponse(response);
    return {
      success: true,
      message: data.message || "Product deleted successfully",
      id
    };
  },

  updateProductInventory: async (
    id: string,
    data: InventoryUpdateData
  ): Promise<ProductResponse> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}/inventory`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const responseData = await handleResponse(response);
    return {
      success: true,
      product: responseData.product || responseData,
      message: responseData.message || "Inventory updated successfully"
    };
  },

  // ✅ Categories
  createCategory: async (formData: FormData): Promise<CategoryResponse> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await handleResponse(response);
    return {
      success: true,
      category: data.category || data,
      message: data.message || "Category created successfully"
    };
  },

  getAllCategories: async (
    filters: Record<string, string | number | boolean> = {}
  ): Promise<CategoriesResponse> => {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/categories?${queryParams.toString()}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await handleResponse(response);
    const categories = data.categories || data || [];
    
    return {
      success: true,
      categories,
      count: categories.length
    };
  },

  getCategoryById: async (id: string): Promise<CategoryResponse> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await handleResponse(response);
    return {
      success: true,
      category: data.category || data,
      message: data.message
    };
  },

  updateCategory: async (id: string, formData: FormData): Promise<CategoryResponse> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    const data = await handleResponse(response);
    return {
      success: true,
      category: data.category || data,
      message: data.message || "Category updated successfully"
    };
  },

  deleteCategory: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await handleResponse(response);
    return {
      success: true,
      message: data.message || "Category deleted successfully"
    };
  },

  // ✅ Search and Filters
  searchProducts: async (
    query: string,
    filters: ProductFilters = {}
  ): Promise<ProductsResponse> => {
    const queryParams = new URLSearchParams({ search: query });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/products/search?${queryParams.toString()}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await handleResponse(response);
    
    const products = data.products || data || [];
    
    return {
      success: true,
      products,
      pagination: calculatePagination(products, filters)
    };
  },

  getFeaturedProducts: async (limit: number = 10): Promise<ProductsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/products/featured?limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await handleResponse(response);
    const products = data.products || data || [];
    
    return {
      success: true,
      products,
      pagination: calculatePagination(products, { limit })
    };
  },

  getPopularProducts: async (limit: number = 10): Promise<ProductsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/products/popular?limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await handleResponse(response);
    const products = data.products || data || [];
    
    return {
      success: true,
      products,
      pagination: calculatePagination(products, { limit })
    };
  },

  // ✅ Reviews
  getProductReviews: async (productId: string): Promise<{ success: boolean; reviews: any[] }> => {
    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/reviews`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await handleResponse(response);
    return {
      success: true,
      reviews: data.reviews || data || []
    };
  },

  addProductReview: async (
    productId: string,
    reviewData: Record<string, unknown>
  ): Promise<{ success: boolean; review: any; message?: string }> => {
    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/reviews`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(reviewData),
      }
    );

    const data = await handleResponse(response);
    return {
      success: true,
      review: data.review || data,
      message: data.message || "Review added successfully"
    };
  },

  // ✅ Related Products
  getRelatedProducts: async (
    productId: string,
    limit: number = 5
  ): Promise<ProductsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/related?limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await handleResponse(response);
    const products = data.products || data || [];
    
    return {
      success: true,
      products,
      pagination: calculatePagination(products, { limit })
    };
  },

  // ✅ Product Stats
  getProductStats: async (): Promise<{ success: boolean; stats: Record<string, any> }> => {
    const response = await fetch(`${API_BASE_URL}/products/stats`, {
      method: "GET",
      credentials: "include",
    });

    const data = await handleResponse(response);
    return {
      success: true,
      stats: data.stats || data
    };
  },

  // ✅ Bulk Operations
  bulkUpdateProducts: async (
    productIds: string[],
    updateData: Partial<UpdateProductData>
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await fetch(`${API_BASE_URL}/products/bulk-update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product_ids: productIds, ...updateData }),
    });

    const data = await handleResponse(response);
    return {
      success: true,
      message: data.message || "Products updated successfully"
    };
  },

  bulkDeleteProducts: async (
    productIds: string[]
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await fetch(`${API_BASE_URL}/products/bulk-delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product_ids: productIds }),
    });

    const data = await handleResponse(response);
    return {
      success: true,
      message: data.message || "Products deleted successfully"
    };
  },
};