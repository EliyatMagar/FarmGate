export interface CheckoutFormData {
  delivery_address: string;
  delivery_date: string;
  special_instructions?: string;
  payment_method: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
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