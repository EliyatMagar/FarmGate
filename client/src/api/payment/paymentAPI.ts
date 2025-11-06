// api/paymentAPI.ts
import type {
  CreatePaymentResponse,
  ConfirmStripePaymentResponse,
  CODPaymentResponse,
  PaymentDetailsResponse,
  ConfirmCODResponse,
  PaymentMethodsResponse,
  PaymentStatisticsResponse,
  UserPaymentsResponse,
  PaymentRequestData,
  CODConfirmData,
  RefundRequestData
} from "../../types/payment";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const paymentAPI = {
  // Create new payment
  createPayment: async (paymentData: PaymentRequestData): Promise<CreatePaymentResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment creation failed');
    }

    return await response.json();
  },

  // Confirm Stripe payment
  confirmStripePayment: async (paymentIntentId: string): Promise<ConfirmStripePaymentResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/verify/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ payment_intent_id: paymentIntentId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment confirmation failed');
    }

    return await response.json();
  },

  // Create COD payment
  createCODPayment: async (codData: Omit<PaymentRequestData, 'payment_method' | 'payment_gateway'>): Promise<CODPaymentResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/create/cod`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(codData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'COD payment creation failed');
    }

    return await response.json();
  },

  // Confirm COD payment
  confirmCODPayment: async (codData: CODConfirmData): Promise<ConfirmCODResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/cod/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(codData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'COD confirmation failed');
    }

    return await response.json();
  },

  // Get payment details
  getPaymentDetails: async (orderId: string): Promise<PaymentDetailsResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/details/${orderId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment not found');
    }

    return await response.json();
  },

  // Get user payments
  getUserPayments: async (page: number = 1, limit: number = 10): Promise<UserPaymentsResponse> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/payments/user-payments?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user payments');
    }

    return await response.json();
  },

  // Initiate refund
  initiateRefund: async (paymentId: string, amount?: number, reason?: string): Promise<CreatePaymentResponse> => {
    const refundData: RefundRequestData = {
      payment_id: paymentId,
      amount: amount || 0,
      ...(reason && { reason })
    };

    const response = await fetch(`${API_BASE_URL}/payments/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(refundData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Refund initiation failed');
    }

    return await response.json();
  },

  // Get payment methods
  getPaymentMethods: async (): Promise<PaymentMethodsResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/methods`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }

    return await response.json();
  },

  // Get payment statistics
  getPaymentStatistics: async (): Promise<PaymentStatisticsResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/stats`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment statistics');
    }

    return await response.json();
  },
};