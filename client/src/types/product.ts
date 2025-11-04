// types/product.ts
export interface Product {
  id: string;
  farmer_id: string;
  farm_id: string;
  category_id: string;
  name: string;
  description?: string;
  price_per_unit: number;
  unit_type: 'kg' | 'gram' | 'piece' | 'liter' | 'box' | 'bag';
  available_quantity: number;
  min_order_quantity: number;
  quality_grade?: 'organic' | 'premium' | 'standard' | 'economy';
  harvest_date?: string;
  expiry_date?: string;
  images: string[];
  is_organic: boolean;
  is_available: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  farm_name?: string;
  farm_location?: string;
  farm_certification?: string;
  farmer_name?: string;
  farmer_image?: string;
  category_name?: string;
  category_image?: string;
  related_products?: Product[];
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  
  // Additional fields
  level?: number;
  path?: string[];
  children?: ProductCategory[];
  parent_name?: string;
  product_count?: number;
  subcategories?: ProductCategory[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parent_id?: string;
  image?: File;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  parent_id?: string;
  is_active?: boolean;
  image?: File;
}

export interface CreateProductData {
  farm_id: string;
  category_id: string;
  name: string;
  description?: string;
  price_per_unit: number;
  unit_type: 'kg' | 'gram' | 'piece' | 'liter' | 'box' | 'bag';
  available_quantity: number;
  min_order_quantity?: number;
  quality_grade?: 'organic' | 'premium' | 'standard' | 'economy';
  harvest_date?: string;
  expiry_date?: string;
  is_organic?: boolean;
  images?: File[];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price_per_unit?: number;
  unit_type?: 'kg' | 'gram' | 'piece' | 'liter' | 'box' | 'bag';
  available_quantity?: number;
  min_order_quantity?: number;
  quality_grade?: 'organic' | 'premium' | 'standard' | 'economy';
  harvest_date?: string;
  expiry_date?: string;
  is_organic?: boolean;
  is_available?: boolean;
  images?: File[];
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category_id?: string;
  farm_id?: string;
  farmer_id?: string;
  quality_grade?: string;
  is_organic?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface ProductResponse {
  success: boolean;
  product: Product;
  message?: string;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CategoryResponse {
  success: boolean;
  category: ProductCategory;
  message?: string;
}

export interface CategoriesResponse {
  success: boolean;
  categories: ProductCategory[];
  count: number;
}

export interface InventoryUpdateData {
  available_quantity: number;
  operation?: 'set' | 'add' | 'subtract';
}