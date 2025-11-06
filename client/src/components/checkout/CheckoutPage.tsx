// components/checkout/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../hooks/useAuth';
import CheckoutForm from './CheckoutForm';
import CheckoutSummary from './CheckoutSummary';
import OrderConfirmation from './OrderConfirmation';
import { PaymentCheckout } from '../payment/PaymentCheckout';
import type { CartItem } from '../../types/cart';
import type { CheckoutFormData } from '../../types/checkout';
import type { OrderValidationResponse } from '../../types/order';

export type CheckoutStep = 'details' | 'review' | 'payment' | 'confirmation';

const CheckoutPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('details');
  const [formData, setFormData] = useState<CheckoutFormData>({
    delivery_address: '',
    delivery_date: '',
    special_instructions: '',
    payment_method: 'stripe',
    currency: 'USD'
  });
  const [validatedOrders, setValidatedOrders] = useState<any[]>([]);
  const [createdOrders, setCreatedOrders] = useState<any[]>([]);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [orderCreationLoading, setOrderCreationLoading] = useState(false);
  
  const { cart, clearCart } = useCart();
  const { validateOrder, createOrderAfterPayment, createOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (cart.items.length === 0 && currentStep !== 'confirmation') {
      navigate('/cart');
    }
  }, [cart.items.length, currentStep, navigate]);

  const handleFormSubmit = (data: CheckoutFormData) => {
    setFormData(data);
    setCurrentStep('review');
  };

  const handleBackToDetails = () => {
    setCurrentStep('details');
    setValidationError(null);
  };

  // Validate orders before proceeding to payment
// Validate orders before proceeding to payment
const handleProceedToPayment = async () => {
  try {
    setValidationLoading(true);
    setValidationError(null);

    const invalidItems = cart.items.filter(item => !item.farmer_id);
    if (invalidItems.length > 0) {
      throw new Error(`Cannot proceed to payment. ${invalidItems.length} item(s) have invalid farmer information.`);
    }

    console.log("🛒 Cart items:", cart.items);
    console.log("👨‍🌾 Farmers in cart:", [...new Set(cart.items.map(item => item.farmer_id))]);

    // Group items by farmer
    const farmerOrders = cart.items.reduce((acc: any, item: CartItem) => {
      const farmerId = item.farmer_id;
      
      if (!acc[farmerId]) {
        acc[farmerId] = {
          farmer_id: farmerId,
          farmer_name: item.farmer_name,
          items: [],
          total_amount: 0
        };
      }
      
      acc[farmerId].items.push({
        product_id: item.product_id,
        quantity: item.quantity
      });
      
      acc[farmerId].total_amount += item.price_per_unit * item.quantity;
      return acc;
    }, {});

    console.log("📦 Farmer orders to validate:", Object.values(farmerOrders));

    // Validate each farmer's order
    const validationPromises = Object.values(farmerOrders).map((farmerOrder: any) => {
      console.log(`🔍 Validating order for farmer: ${farmerOrder.farmer_id} (${farmerOrder.farmer_name})`);
      return validateOrder({
        farmer_id: farmerOrder.farmer_id,
        items: farmerOrder.items,
        delivery_address: formData.delivery_address,
        delivery_date: formData.delivery_date,
        special_instructions: formData.special_instructions,
        currency: formData.currency
      });
    });

    const validationResults: OrderValidationResponse[] = await Promise.all(validationPromises);
    const validatedData = validationResults.map(result => result.data);
    setValidatedOrders(validatedData);
    
    // If payment method is COD, create orders directly
    if (formData.payment_method === 'cod') {
      await handleCODOrder(validatedData);
    } else {
      setCurrentStep('payment');
    }
    
  } catch (error: any) {
    console.error('❌ Order validation failed:', error);
    setValidationError(error.message || 'Order validation failed. Please try again.');
  } finally {
    setValidationLoading(false);
  }
};

  // Handle COD (Cash on Delivery) orders
  const handleCODOrder = async (validatedOrdersData: any[]) => {
    try {
      setOrderCreationLoading(true);
      
      // Create orders for each validated farmer order with COD payment
      const orderCreationPromises = validatedOrdersData.map((validatedOrder) =>
        createOrder({
          farmer_id: validatedOrder.farmer.id,
          items: validatedOrder.items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity
          })),
          delivery_address: formData.delivery_address,
          delivery_date: formData.delivery_date,
          special_instructions: formData.special_instructions,
          currency: formData.currency
        })
      );

      const orderResults = await Promise.all(orderCreationPromises);
      const createdOrdersData = orderResults.map(result => result.order);
      
      setCreatedOrders(createdOrdersData);
      clearCart();
      setCurrentStep('confirmation');
      
    } catch (error: any) {
      console.error('COD order creation failed:', error);
      setValidationError(error.message || 'Failed to create COD order. Please try again.');
      throw error;
    } finally {
      setOrderCreationLoading(false);
    }
  };

// In handlePaymentSuccess function, after creating orders:
const handlePaymentSuccess = async (paymentData: any) => {
  try {
    setOrderCreationLoading(true);
    console.log('Payment successful, creating orders...', paymentData);
    
    // Create orders for each validated farmer order
    const orderCreationPromises = validatedOrders.map((validatedOrder) =>
      createOrderAfterPayment({
        farmer_id: validatedOrder.farmer.id,
        items: validatedOrder.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        delivery_address: formData.delivery_address,
        delivery_date: formData.delivery_date,
        special_instructions: formData.special_instructions,
        currency: formData.currency,
        payment_method: formData.payment_method,
        payment_status: 'paid',
        transaction_id: paymentData.paymentIntentId || null
      })
    );

    const orderResults = await Promise.all(orderCreationPromises);
    const createdOrdersData = orderResults.map(result => result.order);
    
    // If we have payment data and need to link payments to orders
    if (paymentData.payments && paymentData.payments.length > 0 && createdOrdersData.length > 0) {
      // Here you would update the payments with the actual order IDs
      // This requires calling the updatePaymentOrderId API
      console.log('📝 Orders created, would link payments here:', {
        payments: paymentData.payments,
        orders: createdOrdersData
      });
      
      // Example of how you would link them:
      // for (let i = 0; i < paymentData.payments.length; i++) {
      //   if (createdOrdersData[i]) {
      //     await updatePaymentOrderId({
      //       payment_id: paymentData.payments[i].id,
      //       order_id: createdOrdersData[i].id
      //     });
      //   }
      // }
    }
    
    setCreatedOrders(createdOrdersData);
    clearCart();
    setCurrentStep('confirmation');
    
  } catch (error: any) {
    console.error('Order creation after payment failed:', error);
    setValidationError('Payment was successful but order creation failed. Please contact support.');
  } finally {
    setOrderCreationLoading(false);
  }
};
  const handlePaymentFailure = (error: string) => {
    console.error('Payment failed:', error);
    setValidationError(`Payment failed: ${error}`);
  };

  // Format currency based on selected currency
  const formatCurrency = (amount: number): string => {
    const currency = formData.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (cart.items.length === 0 && currentStep !== 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Please add some items to your cart before checkout.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = validationLoading || orderCreationLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-center">
              {['details', 'review', 'payment', 'confirmation'].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step 
                        ? 'bg-green-600 text-white' 
                        : currentStep > step || (formData.payment_method === 'cod' && step === 'payment' && currentStep === 'confirmation')
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-xs mt-2 text-gray-600 capitalize">
                      {step === 'details' && 'Details'}
                      {step === 'review' && 'Review'}
                      {step === 'payment' && (formData.payment_method === 'cod' ? 'Confirm' : 'Payment')}
                      {step === 'confirmation' && 'Complete'}
                    </span>
                  </div>
                  
                  {index < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step || (formData.payment_method === 'cod' && step === 'payment' && currentStep === 'confirmation') 
                        ? 'bg-green-600' 
                        : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="font-medium text-gray-900">
                  {validationLoading && 'Validating your order...'}
                  {orderCreationLoading && 'Creating your order...'}
                </p>
                <p className="text-sm text-gray-600">Please don't close this window</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery Details */}
            {currentStep === 'details' && (
              <CheckoutForm 
                onSubmit={handleFormSubmit}
                initialData={formData}
                user={user}
              />
            )}

            {/* Step 2: Review Order */}
            {currentStep === 'review' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Order</h2>
                
                {/* Validation Error */}
                {validationError && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-red-500 text-lg mt-0.5">⚠️</span>
                      <div>
                        <p className="text-sm text-red-700 font-medium">Validation Error</p>
                        <p className="text-sm text-red-600 mt-1">{validationError}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {cart.items.map((item: CartItem) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.product_name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xl">📦</span>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                            <p className="text-sm text-gray-600">From: {item.farm_name || 'Unknown Farm'}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × {formatCurrency(item.price_per_unit)} per {item.unit_type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.price_per_unit * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700"><strong>Address:</strong> {formData.delivery_address}</p>
                    {formData.delivery_date && (
                      <p className="text-gray-700 mt-2">
                        <strong>Delivery Date:</strong> {new Date(formData.delivery_date).toLocaleDateString()}
                      </p>
                    )}
                    {formData.special_instructions && (
                      <p className="text-gray-700 mt-2">
                        <strong>Instructions:</strong> {formData.special_instructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">
                      <strong>Selected Method:</strong> {formData.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Credit/Debit Card (Stripe)'}
                    </p>
                    {formData.payment_method === 'cod' && (
                      <p className="text-green-600 text-sm mt-2">
                        💰 You'll pay with cash when your order is delivered
                      </p>
                    )}
                    {formData.payment_method === 'stripe' && (
                      <p className="text-blue-600 text-sm mt-2">
                        💳 You'll be redirected to secure Stripe payment
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={handleBackToDetails}
                    disabled={isLoading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    ← Back to Details
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    disabled={isLoading}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>
                          {validationLoading ? 'Validating...' : 'Creating Order...'}
                        </span>
                      </div>
                    ) : (
                      `${formData.payment_method === 'cod' ? 'Confirm COD Order' : 'Proceed to Payment'} →`
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 'payment' && formData.payment_method === 'stripe' && (
              <PaymentCheckout
                cart={cart}
                formData={formData}
                validatedOrders={validatedOrders}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
                onBack={() => setCurrentStep('review')}
                isLoading={orderCreationLoading}
              />
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 'confirmation' && (
              <OrderConfirmation 
                orders={createdOrders}
                currency={formData.currency || 'USD'}
                paymentMethod={formData.payment_method}
              />
            )}
          </div>

          {/* Right Column - Order Summary */}
          {currentStep !== 'confirmation' && (
            <div className="lg:col-span-1">
              <CheckoutSummary 
                cart={cart} 
                currency={formData.currency || 'USD'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;