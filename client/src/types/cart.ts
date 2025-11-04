export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  price_per_unit: number;
  quantity: number;
  unit_type: 'kg' | 'gram' | 'piece' | 'liter' | 'box' | 'bag';
  available_quantity: number;
  min_order_quantity: number;
  images: string[];
  farmer_id: string;
  farm_name?: string;
  farmer_name?: string;
  is_available: boolean;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface AddToCartData {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}