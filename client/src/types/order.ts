// types/order.ts
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_type: string;
  images: string[];
  quantity: number;
  unit_price: number;
  total_price: number;
  farmer_id: string;
  farm_name?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  farmer_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  delivery_address: string;
  delivery_date?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  buyer_image?: string;
  farmer_name?: string;
  farmer_email?: string;
  farmer_phone?: string;
  farmer_image?: string;
  
  items: OrderItem[];
}

export interface CreateOrderData {
  farmer_id: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
  delivery_address: string;
  delivery_date?: string;
  special_instructions?: string;
  currency?: string;
}

export interface UpdateOrderStatusData {
  status: Order['status'];
}

export interface UpdatePaymentStatusData {
  payment_status: Order['payment_status'];
  payment_method?: string;
  transaction_id?: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: Order['status'];
  payment_status?: Order['payment_status'];
  farmer_id?: string;
  buyer_id?: string;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface OrderResponse {
  success: boolean;
  order: Order;
  message?: string;
}

export interface OrderStatistics {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
  }>;
}

// NEW: Order validation response
export interface OrderValidationResponse {
  success: boolean;
  message: string;
  data: {
    farmer: {
      id: string;
      name: string;
      email: string;
    };
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      available_quantity: number;
    }>;
    total_amount: number;
    currency: string;
  };
}

// NEW: Order validation result for Redux state
export interface OrderValidationResult {
  success: boolean;
  message: string;
  data: {
    farmer: {
      id: string;
      name: string;
      email: string;
    };
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      available_quantity: number;
    }>;
    total_amount: number;
    currency: string;
  };
}