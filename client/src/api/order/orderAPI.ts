// api/orderAPI.ts
import type {
  OrderResponse,
  OrdersResponse,
  CreateOrderData,
  UpdateOrderStatusData,
  UpdatePaymentStatusData,
  OrderFilters,
  OrderStatistics
} from "../../types/order";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const orderAPI = {
  // Create new order
  createOrder: async (orderData: CreateOrderData): Promise<OrderResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Order creation failed');
    }

    return await response.json();
  },

  // Get buyer's orders
  getMyOrders: async (filters: OrderFilters = {}): Promise<OrdersResponse> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/orders/my-orders?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return await response.json();
  },

  // Get farmer's orders
  getFarmerOrders: async (filters: OrderFilters = {}): Promise<OrdersResponse> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/orders/farmer/orders?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch farmer orders');
    }

    return await response.json();
  },

  // Get single order by ID
  getOrderById: async (id: string): Promise<OrderResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Order not found');
    }

    return await response.json();
  },

  // Update order status (Farmer only) - FIXED: Changed to PUT method
  updateOrderStatus: async (id: string, data: UpdateOrderStatusData): Promise<OrderResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT', // CHANGED FROM PATCH TO PUT
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update order status');
    }

    return await response.json();
  },

  // Update payment status - FIXED: Changed to PUT method
  updatePaymentStatus: async (id: string, data: UpdatePaymentStatusData): Promise<OrderResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/payment-status`, {
      method: 'PUT', // CHANGED FROM PATCH TO PUT
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update payment status');
    }

    return await response.json();
  },

  // Get all orders (Admin only)
  getAllOrders: async (filters: OrderFilters = {}): Promise<OrdersResponse> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/orders/admin/all?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all orders');
    }

    return await response.json();
  },

  // Get order statistics
  getOrderStatistics: async (): Promise<{ success: boolean; statistics: OrderStatistics }> => {
    const response = await fetch(`${API_BASE_URL}/orders/statistics`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order statistics');
    }

    return await response.json();
  },
};