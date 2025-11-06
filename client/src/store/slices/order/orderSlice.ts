// store/slices/order/orderSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { 
  Order, 
  OrderFilters, 
  CreateOrderData, 
  UpdateOrderStatusData, 
  UpdatePaymentStatusData, 
  OrderValidationResponse,
  OrderResponse,
  OrdersResponse
} from '../../../types/order';
import { orderAPI } from '../../../api/order/orderAPI';
import type { OrderState } from '../../../types/orderState';

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  farmerOrders: [],
  adminOrders: [],
  loading: false,
  error: null,
  filters: {},
  pagination: null,
  statistics: null,
  validationResult: null,
};

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData: CreateOrderData, { rejectWithValue }) => {
    try {
      const response: OrderResponse = await orderAPI.createOrder(orderData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Order creation failed');
    }
  }
);

export const validateOrder = createAsyncThunk(
  'orders/validate',
  async (orderData: CreateOrderData, { rejectWithValue }) => {
    try {
      const response: OrderValidationResponse = await orderAPI.validateOrder(orderData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Order validation failed');
    }
  }
);

export const createOrderAfterPayment = createAsyncThunk(
  'orders/createAfterPayment',
  async (orderData: CreateOrderData & {
    payment_method?: string;
    payment_status?: string;
    transaction_id?: string;
  }, { rejectWithValue }) => {
    try {
      const response: OrderResponse = await orderAPI.createOrderAfterPayment(orderData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Order creation after payment failed');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (filters: OrderFilters = {}, { rejectWithValue }) => {
    try {
      const response: OrdersResponse = await orderAPI.getMyOrders(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const fetchFarmerOrders = createAsyncThunk(
  'orders/fetchFarmerOrders',
  async (filters: OrderFilters = {}, { rejectWithValue }) => {
    try {
      const response: OrdersResponse = await orderAPI.getFarmerOrders(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch farmer orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response: OrderResponse = await orderAPI.getOrderById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch order');
    }
  }
);

export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAll',
  async (filters: OrderFilters = {}, { rejectWithValue }) => {
    try {
      const response: OrdersResponse = await orderAPI.getAllOrders(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch all orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, data }: { id: string; data: UpdateOrderStatusData }, { rejectWithValue }) => {
    try {
      const response: OrderResponse = await orderAPI.updateOrderStatus(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'orders/updatePaymentStatus',
  async ({ id, data }: { id: string; data: UpdatePaymentStatusData }, { rejectWithValue }) => {
    try {
      const response: OrderResponse = await orderAPI.updatePaymentStatus(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update payment status');
    }
  }
);

export const fetchOrderStatistics = createAsyncThunk(
  'orders/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrderStatistics();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch order statistics');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearValidationResult: (state) => {
      state.validationResult = null;
    },
    setFilters: (state, action: PayloadAction<OrderFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    updateOrderInList: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    updateFarmerOrderInList: (state, action: PayloadAction<Order>) => {
      const index = state.farmerOrders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.farmerOrders[index] = action.payload;
      }
    },
    updateAdminOrderInList: (state, action: PayloadAction<Order>) => {
      const index = state.adminOrders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.adminOrders[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload.order);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Validate Order
      .addCase(validateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.validationResult = action.payload;
      })
      .addCase(validateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.validationResult = null;
      })
      // Create Order After Payment
      .addCase(createOrderAfterPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderAfterPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload.order);
        state.validationResult = null;
      })
      .addCase(createOrderAfterPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Farmer Orders
      .addCase(fetchFarmerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarmerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.farmerOrders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFarmerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch All Orders (Admin)
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.adminOrders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload.order;
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(o => o.id === updatedOrder.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        
        // Update in farmer orders list
        const farmerOrderIndex = state.farmerOrders.findIndex(o => o.id === updatedOrder.id);
        if (farmerOrderIndex !== -1) {
          state.farmerOrders[farmerOrderIndex] = updatedOrder;
        }
        
        // Update in admin orders list
        const adminOrderIndex = state.adminOrders.findIndex(o => o.id === updatedOrder.id);
        if (adminOrderIndex !== -1) {
          state.adminOrders[adminOrderIndex] = updatedOrder;
        }
        
        // Update current order if it's the one being updated
        if (state.currentOrder?.id === updatedOrder.id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update Payment Status
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload.order;
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(o => o.id === updatedOrder.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        
        // Update in farmer orders list
        const farmerOrderIndex = state.farmerOrders.findIndex(o => o.id === updatedOrder.id);
        if (farmerOrderIndex !== -1) {
          state.farmerOrders[farmerOrderIndex] = updatedOrder;
        }
        
        // Update in admin orders list
        const adminOrderIndex = state.adminOrders.findIndex(o => o.id === updatedOrder.id);
        if (adminOrderIndex !== -1) {
          state.adminOrders[adminOrderIndex] = updatedOrder;
        }
        
        // Update current order if it's the one being updated
        if (state.currentOrder?.id === updatedOrder.id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch Order Statistics
      .addCase(fetchOrderStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload.statistics;
      });
  },
});

export const {
  clearError,
  clearCurrentOrder,
  clearValidationResult,
  setFilters,
  clearFilters,
  updateOrderInList,
  updateFarmerOrderInList,
  updateAdminOrderInList,
} = orderSlice.actions;

export default orderSlice.reducer;