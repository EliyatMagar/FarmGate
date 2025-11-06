// types/orderState.ts
import type { Order, OrderFilters, OrderStatistics, OrderValidationResponse } from './order';

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  farmerOrders: Order[];
  adminOrders: Order[];
  loading: boolean;
  error: string | null;
  filters: OrderFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  statistics: OrderStatistics | null;
  validationResult: OrderValidationResponse | null;
}