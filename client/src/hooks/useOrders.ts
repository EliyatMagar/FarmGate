// hooks/useOrders.ts
import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import {
  createOrder,
  fetchMyOrders,
  fetchFarmerOrders,
  fetchOrderById,
  fetchAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  fetchOrderStatistics,
  clearError,
  clearCurrentOrder,
  setFilters,
  clearFilters,
  updateOrderInList,
  updateFarmerOrderInList,
  updateAdminOrderInList,
} from '../store/slices/order/orderSlice';
import type {
  CreateOrderData,
  UpdateOrderStatusData,
  UpdatePaymentStatusData,
  OrderFilters
} from '../types/order';

export const useOrders = () => {
  const dispatch = useAppDispatch();
  const {
    orders,
    currentOrder,
    farmerOrders,
    adminOrders,
    loading,
    error,
    filters,
    pagination,
    statistics
  } = useAppSelector((state) => state.order);

  // Order actions
  const createOrderAction = useCallback((orderData: CreateOrderData) => {
    return dispatch(createOrder(orderData)).unwrap();
  }, [dispatch]);

  const fetchMyOrdersAction = useCallback((filters: OrderFilters = {}) => {
    return dispatch(fetchMyOrders(filters)).unwrap();
  }, [dispatch]);

  const fetchFarmerOrdersAction = useCallback((filters: OrderFilters = {}) => {
    return dispatch(fetchFarmerOrders(filters)).unwrap();
  }, [dispatch]);

  const fetchOrderByIdAction = useCallback((id: string) => {
    return dispatch(fetchOrderById(id)).unwrap();
  }, [dispatch]);

  const fetchAllOrdersAction = useCallback((filters: OrderFilters = {}) => {
    return dispatch(fetchAllOrders(filters)).unwrap();
  }, [dispatch]);

  const updateOrderStatusAction = useCallback((id: string, data: UpdateOrderStatusData) => {
    return dispatch(updateOrderStatus({ id, data })).unwrap();
  }, [dispatch]);

  const updatePaymentStatusAction = useCallback((id: string, data: UpdatePaymentStatusData) => {
    return dispatch(updatePaymentStatus({ id, data })).unwrap();
  }, [dispatch]);

  const fetchOrderStatisticsAction = useCallback(() => {
    return dispatch(fetchOrderStatistics()).unwrap();
  }, [dispatch]);

  // Utility actions
  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrentOrderAction = useCallback(() => {
    dispatch(clearCurrentOrder());
  }, [dispatch]);

  const setFiltersAction = useCallback((newFilters: OrderFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const clearFiltersAction = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const updateOrderInListAction = useCallback((order: any) => {
    dispatch(updateOrderInList(order));
  }, [dispatch]);

  const updateFarmerOrderInListAction = useCallback((order: any) => {
    dispatch(updateFarmerOrderInList(order));
  }, [dispatch]);

  const updateAdminOrderInListAction = useCallback((order: any) => {
    dispatch(updateAdminOrderInList(order));
  }, [dispatch]);

  return {
    // State
    orders,
    currentOrder,
    farmerOrders,
    adminOrders,
    loading,
    error,
    filters,
    pagination,
    statistics,

    // Actions
    createOrder: createOrderAction,
    fetchMyOrders: fetchMyOrdersAction,
    fetchFarmerOrders: fetchFarmerOrdersAction,
    fetchOrderById: fetchOrderByIdAction,
    fetchAllOrders: fetchAllOrdersAction,
    updateOrderStatus: updateOrderStatusAction,
    updatePaymentStatus: updatePaymentStatusAction,
    fetchOrderStatistics: fetchOrderStatisticsAction,
    
    // Utility actions
    clearError: clearErrorAction,
    clearCurrentOrder: clearCurrentOrderAction,
    setFilters: setFiltersAction,
    clearFilters: clearFiltersAction,
    updateOrderInList: updateOrderInListAction,
    updateFarmerOrderInList: updateFarmerOrderInListAction,
    updateAdminOrderInList: updateAdminOrderInListAction,
  };
};