// hooks/usePayments.ts
import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import {
  createPayment,
  confirmStripePayment,
  createCODPayment,
  confirmCODPayment,
  getPaymentDetails,
  getUserPayments,
  initiateRefund,
  getPaymentMethods,
  getPaymentStatistics,
  clearError,
  clearCurrentPayment,
  clearUserPayments,
} from '../store/slices/payment/paymentSlice';
import type {
  PaymentRequestData,
  CODConfirmData
} from '../types/payment';

export const usePayments = () => {
  const dispatch = useAppDispatch();
  const {
    currentPayment,
    userPayments,
    loading,
    error,
    paymentMethods,
    statistics,
    userPaymentsPagination
  } = useAppSelector((state) => state.payment);

  // Payment actions
  const createPaymentAction = useCallback((paymentData: PaymentRequestData) => {
    return dispatch(createPayment(paymentData)).unwrap();
  }, [dispatch]);

  const confirmStripePaymentAction = useCallback((paymentIntentId: string) => {
    return dispatch(confirmStripePayment(paymentIntentId)).unwrap();
  }, [dispatch]);

  const createCODPaymentAction = useCallback((codData: Omit<PaymentRequestData, 'payment_method' | 'payment_gateway'>) => {
    return dispatch(createCODPayment(codData)).unwrap();
  }, [dispatch]);

  const confirmCODPaymentAction = useCallback((codData: CODConfirmData) => {
    return dispatch(confirmCODPayment(codData)).unwrap();
  }, [dispatch]);

  const getPaymentDetailsAction = useCallback((orderId: string) => {
    return dispatch(getPaymentDetails(orderId)).unwrap();
  }, [dispatch]);

  const getUserPaymentsAction = useCallback((page?: number, limit?: number) => {
    return dispatch(getUserPayments({ page, limit })).unwrap();
  }, [dispatch]);

  const initiateRefundAction = useCallback((paymentId: string, amount?: number, reason?: string) => {
    return dispatch(initiateRefund({ paymentId, amount, reason })).unwrap();
  }, [dispatch]);

  const getPaymentMethodsAction = useCallback(() => {
    return dispatch(getPaymentMethods()).unwrap();
  }, [dispatch]);

  const getPaymentStatisticsAction = useCallback(() => {
    return dispatch(getPaymentStatistics()).unwrap();
  }, [dispatch]);

  // Utility actions
  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrentPaymentAction = useCallback(() => {
    dispatch(clearCurrentPayment());
  }, [dispatch]);

  const clearUserPaymentsAction = useCallback(() => {
    dispatch(clearUserPayments());
  }, [dispatch]);

  return {
    // State
    currentPayment,
    userPayments,
    loading,
    error,
    paymentMethods,
    statistics,
    userPaymentsPagination,

    // Actions
    createPayment: createPaymentAction,
    confirmStripePayment: confirmStripePaymentAction,
    createCODPayment: createCODPaymentAction,
    confirmCODPayment: confirmCODPaymentAction,
    getPaymentDetails: getPaymentDetailsAction,
    getUserPayments: getUserPaymentsAction,
    initiateRefund: initiateRefundAction,
    getPaymentMethods: getPaymentMethodsAction,
    getPaymentStatistics: getPaymentStatisticsAction,
    
    // Utility actions
    clearError: clearErrorAction,
    clearCurrentPayment: clearCurrentPaymentAction,
    clearUserPayments: clearUserPaymentsAction,
  };
};