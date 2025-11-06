// types/checkout.ts
export interface CheckoutFormData {
  delivery_address: string;
  delivery_date: string;
  special_instructions?: string;
  payment_method: 'stripe' | 'cod';
  currency?: string;
}

export interface PaymentDetails {
  payment_method: string;
  transaction_id?: string;
  payment_status: 'pending' | 'paid' | 'failed';
}

export interface CheckoutSummary {
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  items_count: number;
}

// Add PaymentCheckoutProps
export interface PaymentCheckoutProps {
  cart: any;
  formData: CheckoutFormData;
  validatedOrders: any[]; // Changed from orderIds to validatedOrders
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentFailure: (error: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}