// components/checkout/CheckoutSummary.tsx
import React from 'react';
import type { Cart } from '../../types/cart';

interface CheckoutSummaryProps {
  cart: Cart;
  currency?: string;
  getCartTotal?: (currency?: string) => {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
  };
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ 
  cart, 
  currency = 'USD',
  getCartTotal 
}) => {
  // Format currency function
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Calculate totals
  const calculateTotals = () => {
    if (getCartTotal) {
      return getCartTotal(currency);
    } else {
      // Fallback calculation if getCartTotal is not provided
      const subtotal = cart.total_price;
      const shipping = subtotal > 50 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;
      
      return {
        subtotal,
        shipping,
        tax,
        total,
        currency
      };
    }
  };

  const totals = calculateTotals();

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      {/* Order Items */}
      <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between items-start space-x-3">
            {/* Product Image */}
            <div className="flex-shrink-0">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.product_name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-sm">📦</span>
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.product_name}
              </p>
              <p className="text-xs text-gray-500">
                From {item.farm_name || 'Unknown Farm'}
              </p>
              <p className="text-xs text-gray-500">
                {item.quantity} × {formatCurrency(item.price_per_unit)} per {item.unit_type}
              </p>
            </div>
            
            {/* Item Total */}
            <div className="flex-shrink-0 text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(item.price_per_unit * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">{formatCurrency(totals.subtotal)}</span>
        </div>
        
        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping)}
          </span>
        </div>
        
        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">{formatCurrency(totals.tax)}</span>
        </div>
        
        {/* Total */}
        <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3 mt-2">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">{formatCurrency(totals.total)}</span>
        </div>
      </div>

      {/* Free Shipping Banner */}
      {totals.shipping === 0 && totals.subtotal > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-green-600">🎉</span>
            <p className="text-sm text-green-700 font-medium">
              You qualify for free shipping!
            </p>
          </div>
        </div>
      )}

      {/* Shipping Progress */}
      {totals.shipping > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">
              Add {formatCurrency(50 - totals.subtotal)} more for free shipping
            </span>
            <div className="w-16 bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((totals.subtotal / 50) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Badge */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <span className="text-green-500">🔒</span>
          <span>Secure checkout</span>
        </div>
      </div>

      {/* Support Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Need help?{' '}
          <a 
            href="/contact" 
            className="text-green-600 hover:text-green-700 underline"
          >
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
};

export default CheckoutSummary;