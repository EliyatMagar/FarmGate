// src/hooks/usePayments.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  createPayment,
  verifyPayment,
  confirmCODPayment,
  fetchPaymentStatistics,
  clearPaymentError,
  clearCurrentPayment,
} from "../store/slices/payment/paymentSlice";
import type {
  PaymentRequestData,
  VerifyPaymentData,
  CODConfirmData,
} from '../types/payment';

export const usePayments = () => {
  const dispatch = useAppDispatch();
  const { payments, currentPayment, loading, error, statistics } = useAppSelector(
    (state) => state.payment
  );

  const createPaymentAction = useCallback(
    (data: PaymentRequestData) => dispatch(createPayment(data)).unwrap(),
    [dispatch]
  );

  const verifyPaymentAction = useCallback(
    (data: VerifyPaymentData) => dispatch(verifyPayment(data)).unwrap(),
    [dispatch]
  );

  const confirmCODPaymentAction = useCallback(
    (data: CODConfirmData) => dispatch(confirmCODPayment(data)).unwrap(),
    [dispatch]
  );

  const fetchPaymentStatisticsAction = useCallback(
    () => dispatch(fetchPaymentStatistics()).unwrap(),
    [dispatch]
  );

  const clearErrorAction = useCallback(() => {
    dispatch(clearPaymentError());
  }, [dispatch]);

  const clearCurrentPaymentAction = useCallback(() => {
    dispatch(clearCurrentPayment());
  }, [dispatch]);

  return {
    payments,
    currentPayment,
    loading,
    error,
    statistics,
    createPayment: createPaymentAction,
    verifyPayment: verifyPaymentAction,
    confirmCODPayment: confirmCODPaymentAction,
    fetchPaymentStatistics: fetchPaymentStatisticsAction,
    clearError: clearErrorAction,
    clearCurrentPayment: clearCurrentPaymentAction,
  };
};
