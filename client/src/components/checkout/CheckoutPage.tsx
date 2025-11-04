import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../hooks/useAuth';
import CheckoutForm from './CheckoutForm';
import CheckoutSummary from './CheckoutSummary';
import OrderConfirmation from './OrderConfirmation';
import LoadingSpinner from '../common/LoadingSpinner';
import type { CartItem } from '../../types/cart';

export type CheckoutStep = 'details' | 'review' | 'payment' | 'confirmation';

// UUID validation helper function
const isValidUUID = (uuid: string): boolean => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const CheckoutPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('details');
  const [formData, setFormData] = useState({
    delivery_address: '',
    delivery_date: '',
    special_instructions: '',
    payment_method: 'upi' as const,
  });
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Debug cart items
  useEffect(() => {
    if (cart.items.length > 0 && currentStep === 'review') {
      const invalidItems = cart.items.filter(item => 
        !item.farmer_id || !isValidUUID(item.farmer_id)
      );
      
      if (invalidItems.length > 0) {
        const debugMessage = `Found ${invalidItems.length} items with invalid farmer information:\n` +
          invalidItems.map(item => 
            `- ${item.product_name}: farmer_id = "${item.farmer_id}"`
          ).join('\n');
        
        console.warn(debugMessage);
        setDebugInfo(debugMessage);
      } else {
        setDebugInfo('');
      }
    }
  }, [cart.items, currentStep]);

  useEffect(() => {
    if (cart.items.length === 0 && currentStep !== 'confirmation') {
      navigate('/cart');
    }
  }, [cart.items.length, currentStep, navigate]);

  const handleFormSubmit = (data: any) => {
    setFormData(data);
    setCurrentStep('review');
  };

  const handleBackToDetails = () => {
    setCurrentStep('details');
  };

  const handleProceedToPayment = () => {
    // Validate all items before proceeding to payment
    const invalidItems = cart.items.filter(item => 
      !item.farmer_id || !isValidUUID(item.farmer_id)
    );

    if (invalidItems.length > 0) {
      alert(`Cannot proceed to payment. ${invalidItems.length} item(s) have invalid farmer information. Please remove them from cart and try again.`);
      return;
    }

    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async () => {
    try {
      // Final validation before creating orders
      const invalidItems = cart.items.filter(item => 
        !item.farmer_id || !isValidUUID(item.farmer_id)
      );

      if (invalidItems.length > 0) {
        const productNames = invalidItems.map(item => item.product_name).join(', ');
        throw new Error(`The following items have invalid farmer information: ${productNames}. Please remove them and try again.`);
      }

      // Group items by farmer
      const farmerOrders = cart.items.reduce((acc: any, item: CartItem) => {
        const farmerId = item.farmer_id;
        
        if (!acc[farmerId]) {
          acc[farmerId] = {
            farmer_id: farmerId,
            items: []
          };
        }
        acc[farmerId].items.push({
          product_id: item.product_id,
          quantity: item.quantity
        });
        return acc;
      }, {});

      console.log('Creating orders for farmers:', Object.keys(farmerOrders));

      // Create orders for each farmer
      const orderPromises = Object.values(farmerOrders).map((farmerOrder: any) => 
        createOrder({
          farmer_id: farmerOrder.farmer_id,
          items: farmerOrder.items,
          delivery_address: formData.delivery_address,
          delivery_date: formData.delivery_date,
          special_instructions: formData.special_instructions
        })
      );

      await Promise.all(orderPromises);
      
      // Clear cart after successful order
      clearCart();
      setCurrentStep('confirmation');
    } catch (error: any) {
      console.error('Order creation failed:', error);
      alert(error.message || 'Order creation failed. Please try again.');
    }
  };

  // REMOVED handlePaymentFailure since it's not used in the current UI
  // const handlePaymentFailure = () => {
  //   alert('Payment failed. Please try again or use a different payment method.');
  // };

  const handleRemoveInvalidItems = () => {
    alert('Please remove items with missing farmer information from your cart manually.');
    navigate('/cart');
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner text="Loading checkout..." />
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Checkout Header */}
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
                        : currentStep > step
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-xs mt-2 text-gray-600 capitalize">
                      {step === 'details' && 'Details'}
                      {step === 'review' && 'Review'}
                      {step === 'payment' && 'Payment'}
                      {step === 'confirmation' && 'Complete'}
                    </span>
                  </div>
                  
                  {index < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Debug Warning */}
        {debugInfo && currentStep === 'review' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Some items have invalid farmer information
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>These items cannot be ordered. Please remove them from your cart.</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">Debug Details</summary>
                    <pre className="mt-2 text-xs whitespace-pre-wrap">{debugInfo}</pre>
                  </details>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleRemoveInvalidItems}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Remove Problematic Items
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 'details' && (
              <CheckoutForm 
                onSubmit={handleFormSubmit}
                initialData={formData}
                user={user}
              />
            )}

            {currentStep === 'review' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Order</h2>
                
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {cart.items.map((item: CartItem) => {
                      const isValid = item.farmer_id && isValidUUID(item.farmer_id);
                      return (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-4 border rounded-lg ${
                            isValid ? 'border-gray-200' : 'border-red-300 bg-red-50'
                          }`}
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
                              <p className="text-sm text-gray-600">Farmer: {item.farmer_name || 'Unknown Farmer'}</p>
                              <p className="text-sm text-gray-600">
                                {item.quantity} × ₹{item.price_per_unit} per {item.unit_type}
                              </p>
                              {!isValid && (
                                <p className="text-xs text-red-600 mt-1">
                                  ⚠️ Missing valid farmer information
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₹{(item.price_per_unit * item.quantity).toFixed(2)}
                            </p>
                            {!isValid && (
                              <button 
                                onClick={() => {
                                  // You'll need to implement remove from cart functionality
                                  alert('Please remove this item from your cart page');
                                }}
                                className="text-xs text-red-600 hover:text-red-800 mt-2"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={handleBackToDetails}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    ← Back to Details
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    disabled={!!debugInfo} // Disable if there are invalid items
                    className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                      debugInfo 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Proceed to Payment →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment</h2>
                
                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handlePaymentSuccess}
                      className="p-4 border-2 border-green-500 rounded-lg text-left hover:bg-green-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-lg">💳</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">UPI Payment</h4>
                          <p className="text-sm text-gray-600">Pay using UPI apps</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={handlePaymentSuccess}
                      className="p-4 border-2 border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-lg">🏦</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Net Banking</h4>
                          <p className="text-sm text-gray-600">Bank transfer</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={handlePaymentSuccess}
                      className="p-4 border-2 border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 text-lg">📱</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Wallet</h4>
                          <p className="text-sm text-gray-600">Paytm, PhonePe, etc.</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={handlePaymentSuccess}
                      className="p-4 border-2 border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 text-lg">💳</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Card</h4>
                          <p className="text-sm text-gray-600">Credit/Debit Card</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Test Payment Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-700 text-sm">
                    <strong>Note:</strong> This is a demo. Click any payment method to simulate successful payment.
                  </p>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep('review')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    ← Back to Review
                  </button>
                  {/* Removed the Simulate Payment Failure button since handlePaymentFailure was removed */}
                </div>
              </div>
            )}

            {currentStep === 'confirmation' && (
              <OrderConfirmation />
            )}
          </div>

          {/* Order Summary Sidebar */}
          {currentStep !== 'confirmation' && (
            <div className="lg:col-span-1">
              <CheckoutSummary cart={cart} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;