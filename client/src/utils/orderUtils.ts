// utils/orderUtils.ts
import type { Order } from '../types/order';

export const getOrderStatusColor = (status: Order['status']): string => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPaymentStatusColor = (status: Order['payment_status']): string => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const formatOrderNumber = (orderNumber: string): string => {
  return orderNumber.replace('ORD-', '');
};

export const calculateOrderProgress = (status: Order['status']): number => {
  const progressMap = {
    pending: 20,
    confirmed: 40,
    processing: 60,
    shipped: 80,
    delivered: 100,
    cancelled: 0,
  };
  return progressMap[status] || 0;
};