// types/payment.ts
export interface Payment {
  id: string;
  order_id: string | null; // Allow null for temporary payments
  buyer_id: string;
  payment_method: 'cod' | 'stripe';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled' | 'processing';
  amount: number;
  currency: string;
  transaction_id?: string;
  payment_gateway: 'stripe' | 'none';
  payment_gateway_order_id?: string;
  payment_gateway_payment_id?: string;
  payment_gateway_response?: any;
  refund_amount: number;
  refund_reason?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  billing_address?: any;
  payment_date?: string;
  refund_date?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
  order_number?: string;
  buyer_info?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PaymentRequestData {
  order_id?: string | null; // Make order_id optional and allow null
  total_amount: number;
  buyer_id: string;
  payment_method: Payment['payment_method'];
  payment_gateway?: Payment['payment_gateway'];
  currency?: string;
}

export interface CODConfirmData {
  order_id: string;
  confirmed_by: string;
}

export interface RefundRequestData {
  payment_id: string;
  amount: number;
  reason?: string;
}

// Different response types for different endpoints
export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment: Payment;
    gatewayData?: any;
  };
}

export interface ConfirmStripePaymentResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export interface CODPaymentResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export interface PaymentDetailsResponse {
  success: boolean;
  data: Payment;
}

export interface ConfirmCODResponse {
  success: boolean;
  message: string;
}

export interface PaymentMethodsResponse {
  success: boolean;
  methods: Array<{
    name: string;
    type: string;
    gateways?: string[];
  }>;
}

export interface PaymentStatisticsResponse {
  success: boolean;
  data: {
    total_payments: number;
    successful_payments: number;
    failed_payments: number;
    pending_payments: number;
    cod_payments: number;
    total_amount: number;
    successful_amount: number;
  };
}

export interface UserPaymentsResponse {
  success: boolean;
  data: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Union type for all payment responses
export type PaymentResponse = 
  | CreatePaymentResponse 
  | ConfirmStripePaymentResponse 
  | CODPaymentResponse 
  | PaymentDetailsResponse 
  | ConfirmCODResponse;