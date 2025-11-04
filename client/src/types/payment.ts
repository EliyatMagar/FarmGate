// src/types/payment.ts
export interface Payment {
  id: string;
  order_id: string;
  buyer_id: string;
  farmer_id?: string;
  amount: number;
  payment_method: "razorpay" | "cod";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  transaction_id?: string;
  payment_gateway_order_id?: string;
  payment_gateway_payment_id?: string;
  payment_gateway_response?: any;
  refund_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentRequestData {
  order_id: string;
  amount: number;
  currency?: string;
}

export interface VerifyPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface CODConfirmData {
  order_id: string;
}

export interface PaymentResponse {
  success: boolean;
  payment: Payment;
  razorpayOrder?: {
    id: string;
    amount: number;
    currency: string;
  };
  message?: string;
}

export interface PaymentDetailsResponse {
  success: boolean;
  payment: Payment;
}

export interface RefundResponse {
  success: boolean;
  refund: {
    id: string;
    amount: number;
    status: string;
  };
}

export interface PaymentStatisticsResponse {
  success: boolean;
  statistics: {
    total_payments: number;
    total_refunds: number;
    total_amount: number;
    total_refunded: number;
    revenue_by_month: Array<{
      month: string;
      revenue: number;
    }>;
  };
}
