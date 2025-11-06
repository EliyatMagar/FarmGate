// components/payment/PaymentCheckout.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { usePayments } from '../../hooks/usePayments';
import { useAuth } from '../../hooks/useAuth';
import { StripePaymentElement } from './StripePaymentElemtent';
import type { Cart } from '../../types/cart';
import type { CheckoutFormData } from '../../types/checkout';
import type { Payment } from '../../types/payment';

interface PaymentCheckoutProps {
  cart: Cart;
  formData: CheckoutFormData;
  validatedOrders: any[];
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentFailure: (error: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

interface PaymentResult {
  success: boolean;
  paymentData: Payment;
  farmerId: string;
  totalAmount: number;
}

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  cart,
  formData,
  validatedOrders,
  onPaymentSuccess,
  onPaymentFailure,
  onBack,
  isLoading = false,
}) => {
  const { 
    createPayment, 
    createCODPayment,
    confirmStripePayment: confirmStripePaymentAction,
    loading: paymentLoading, 
    error,
    clearError 
  } = usePayments();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [paymentElementReady, setPaymentElementReady] = useState(false);

  // Calculate total amount from validated orders
  const totalAmount = validatedOrders.reduce((total, order) => total + order.total_amount, 0);

  // Format currency based on selected currency
  const formatCurrency = (amount: number): string => {
    const currency = formData.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Initialize payment for Stripe
  const initializeStripePayment = useCallback(async () => {
    if (!user?.id || formData.payment_method !== 'stripe' || clientSecret) return;

    try {
      console.log('🔄 Creating Stripe payment intent...');
      
      const paymentResponse = await createPayment({
        order_id: 'temp',
        total_amount: totalAmount,
        buyer_id: user.id,
        payment_method: 'stripe',
        payment_gateway: 'stripe',
        currency: formData.currency || 'USD'
      });

      const gatewayData = paymentResponse.data.gatewayData;
      const secret = gatewayData?.client_secret;
      
      if (!secret) {
        throw new Error('Failed to initialize payment. No client secret received.');
      }

      setClientSecret(secret);
      setStripeError(null);

    } catch (error: any) {
      console.error('Failed to initialize Stripe payment:', error);
      setStripeError(error.message);
      onPaymentFailure(error.message);
    }
  }, [createPayment, totalAmount, user?.id, formData.currency, formData.payment_method, clientSecret, onPaymentFailure]);

  // Initialize payment when component mounts
  useEffect(() => {
    if (formData.payment_method === 'stripe' && validatedOrders.length > 0) {
      initializeStripePayment();
    }
  }, [formData.payment_method, validatedOrders.length, initializeStripePayment]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleStripePayment = async (): Promise<PaymentResult[]> => {
    if (!clientSecret) {
      throw new Error('Payment session expired. Please refresh the page and try again.');
    }

    console.log('🔄 Processing Stripe payment...');

    try {
      // Get payment intent ID from client secret
      const paymentIntentId = clientSecret.split('_secret_')[0];
      
      let paymentData: Payment;
      
      if (paymentIntentId) {
        const confirmationResponse = await confirmStripePaymentAction(paymentIntentId);
        paymentData = confirmationResponse.data;
      } else {
        throw new Error('Unable to retrieve payment information');
      }

      return [{
        success: true,
        paymentData: paymentData,
        farmerId: 'combined',
        totalAmount: totalAmount
      }];

    } catch (error: any) {
      console.error('❌ Stripe payment failed:', error);
      throw new Error(error.message || 'Payment failed. Please try again.');
    }
  };

  const handleCODPayment = async (): Promise<PaymentResult[]> => {
    const paymentResults: PaymentResult[] = [];

    for (const validatedOrder of validatedOrders) {
      console.log(`🔄 Creating COD payment for farmer: ${validatedOrder.farmer.name}`);
      
      const paymentResponse = await createCODPayment({
        order_id: 'temp',
        total_amount: validatedOrder.total_amount,
        buyer_id: user?.id || '',
        currency: formData.currency || 'USD'
      });
      
      let paymentData: Payment;
      
      if (paymentResponse.data && (paymentResponse.data as any).payment) {
        paymentData = (paymentResponse.data as any).payment;
      } else {
        paymentData = paymentResponse.data as Payment;
      }
      
      paymentResults.push({
        success: true,
        paymentData: paymentData,
        farmerId: validatedOrder.farmer.id,
        totalAmount: validatedOrder.total_amount
      });
    }

    return paymentResults;
  };

  const handlePayment = async () => {
    if (!user?.id) {
      onPaymentFailure('Please log in to complete payment');
      return;
    }

    if (validatedOrders.length === 0) {
      onPaymentFailure('No validated orders found to process payment');
      return;
    }

    if (formData.payment_method === 'stripe' && !paymentElementReady) {
      onPaymentFailure('Payment form is not ready. Please wait for the form to load.');
      return;
    }

    try {
      setIsProcessing(true);
      clearError();
      setStripeError(null);

      console.log(`🔄 Processing ${validatedOrders.length} farmer order(s) with ${formData.payment_method}`);

      let paymentResults: PaymentResult[];

      if (formData.payment_method === 'stripe') {
        paymentResults = await handleStripePayment();
      } else {
        paymentResults = await handleCODPayment();
      }

      const successfulPayments = paymentResults.filter(result => result.success);
      
      console.log(`✅ ${successfulPayments.length}/${validatedOrders.length} payments successful`);
      
      onPaymentSuccess({
        payments: successfulPayments.map(result => result.paymentData),
        farmerOrders: validatedOrders.map(order => ({
          farmerId: order.farmer.id,
          totalAmount: order.total_amount,
          items: order.items
        })),
        paymentMethod: formData.payment_method,
        totalAmount: totalAmount,
        currency: formData.currency || 'USD',
        paymentIntentId: formData.payment_method === 'stripe' ? clientSecret?.split('_secret_')[0] : null
      });

    } catch (error: any) {
      console.error('❌ Payment processing failed:', error);
      onPaymentFailure(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonText = () => {
    if (isProcessing || isLoading) return 'Processing Payment...';
    if (paymentLoading) return 'Initializing...';
    
    if (formData.payment_method === 'cod') {
      return `Confirm COD Order - ${formatCurrency(totalAmount)}`;
    }
    
    return `Pay ${formatCurrency(totalAmount)}`;
  };

  const isPaymentButtonDisabled = isProcessing || paymentLoading || isLoading || 
    (formData.payment_method === 'stripe' && (!clientSecret || !paymentElementReady));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Secure Payment</h2>
      
      {/* Payment Method Display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Payment Method</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-lg">
                {formData.payment_method === 'cod' ? '💰' : '💳'}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {formData.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Credit/Debit Card (Stripe)'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {formData.payment_method === 'cod' 
                  ? 'Pay with cash when your order is delivered'
                  : 'Secure online payment via Stripe'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Breakdown</h3>
        <div className="space-y-3">
          {validatedOrders.map((order) => (
            <div key={order.farmer.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{order.farmer.name}</p>
                <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
              </div>
              <span className="font-semibold text-gray-900">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Payment Element */}
      {formData.payment_method === 'stripe' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
          
          {!clientSecret && !stripeError && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-blue-700">
                  Initializing payment gateway...
                </p>
              </div>
            </div>
          )}

          {stripeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <span className="text-red-500 text-lg mt-0.5">⚠️</span>
                <div>
                  <p className="text-sm text-red-700 font-medium">Payment Gateway Error</p>
                  <p className="text-sm text-red-600 mt-1">{stripeError}</p>
                </div>
              </div>
            </div>
          )}

          {clientSecret && (
            <StripePaymentElement
              clientSecret={clientSecret}
              onReady={() => setPaymentElementReady(true)}
              onError={(error) => {
                setStripeError(error);
                onPaymentFailure(error);
              }}
            />
          )}
        </div>
      )}

      {/* Payment Summary */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Order Total:</span>
            <span className="font-semibold text-lg">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Farmers:</span>
            <span className="text-gray-600">{validatedOrders.length} farmers</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Items:</span>
            <span className="text-gray-600">{cart.total_items} items</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Method:</span>
            <span className="text-gray-600 font-medium">
              {formData.payment_method === 'cod' ? 'Cash on Delivery' : 'Stripe'}
            </span>
          </div>
        </div>
      </div>

      {/* Security & Notices */}
      <div className="space-y-4 mb-6">
        {formData.payment_method === 'cod' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 text-lg mt-0.5">💰</span>
              <div>
                <p className="text-sm text-blue-700 font-medium">Cash on Delivery</p>
                <p className="text-sm text-blue-600 mt-1">
                  Pay with cash when your order is delivered. No online payment required.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-green-500 text-lg mt-0.5">🔒</span>
            <div>
              <p className="text-sm text-green-700 font-medium">Secure Payment</p>
              <p className="text-sm text-green-600 mt-1">
                {formData.payment_method === 'stripe' 
                  ? 'Your payment information is encrypted and secure. We never store your card details.'
                  : 'Your order information is secure. Payment will be collected upon delivery.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-red-500 text-lg mt-0.5">⚠️</span>
            <div>
              <p className="text-sm text-red-700 font-medium">Payment Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing || isLoading}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 order-2 sm:order-1"
        >
          ← Back to Review
        </button>
        
        <button
          type="button"
          onClick={handlePayment}
          disabled={isPaymentButtonDisabled}
          className={`px-8 py-3 rounded-lg transition-all font-medium text-center order-1 sm:order-2 ${
            isPaymentButtonDisabled
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            {(isProcessing || isLoading) && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{getButtonText()}</span>
          </div>
        </button>
      </div>

      {/* Loading State */}
      {(isProcessing || paymentLoading || isLoading) && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {formData.payment_method === 'cod' ? 'Preparing your order...' : 'Processing secure payment...'}
          </p>
        </div>
      )}
    </div>
  );
};