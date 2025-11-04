// src/api/payment/paymentAPI.ts
import type {
  PaymentResponse,
  PaymentDetailsResponse,
  RefundResponse,
  PaymentStatisticsResponse,
  PaymentRequestData,
  VerifyPaymentData,
  CODConfirmData
} from "../../types/payment";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export const paymentAPI = {
  // Create Razorpay payment order
  createPayment: async (paymentData: PaymentRequestData): Promise<PaymentResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create payment");
    }

    return await response.json();
  },

  // Verify Razorpay payment
  verifyPayment: async (verifyData: VerifyPaymentData): Promise<PaymentResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(verifyData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Payment verification failed");
    }

    return await response.json();
  },

  // Confirm COD payment (Farmer)
  confirmCODPayment: async (codData: CODConfirmData): Promise<PaymentResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/confirm-cod`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(codData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "COD confirmation failed");
    }

    return await response.json();
  },

  // Get payment details
  getPaymentDetails: async (paymentId: string): Promise<PaymentDetailsResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch payment details");
    }

    return await response.json();
  },

  // Refund a payment
  initiateRefund: async (paymentId: string, amount?: number): Promise<RefundResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Refund failed");
    }

    return await response.json();
  },

  // Get payment statistics
  getPaymentStatistics: async (): Promise<PaymentStatisticsResponse> => {
    const response = await fetch(`${API_BASE_URL}/payments/stats`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch payment statistics");
    }

    return await response.json();
  },
};
