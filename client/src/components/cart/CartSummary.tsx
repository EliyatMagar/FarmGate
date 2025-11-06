// components/cart/CartSummary.tsx
import React from 'react';
import type { Cart } from '../../types/cart';

interface CartSummaryProps {
  cart: Cart;
  onCheckout: () => void;
  currency?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({ cart, onCheckout, currency = 'USD' }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  // Calculate totals with currency-specific thresholds
  const getFreeDeliveryThreshold = () => {
    switch (currency) {
      case 'USD': return 50;
      case 'EUR': return 45;
      case 'GBP': return 40;
      case 'INR': return 500;
      default: return 50;
    }
  };

  const getDeliveryFee = () => {
    switch (currency) {
      case 'USD': return 5.99;
      case 'EUR': return 5.49;
      case 'GBP': return 4.99;
      case 'INR': return 40;
      default: return 5.99;
    }
  };

  const subtotal = parseFloat(cart.total_price.toFixed(2));
  const freeDeliveryThreshold = getFreeDeliveryThreshold();
  const baseDeliveryFee = getDeliveryFee();
  const deliveryFee = subtotal > freeDeliveryThreshold ? 0 : baseDeliveryFee;
  const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% tax
  const finalTotal = parseFloat((subtotal + deliveryFee + tax).toFixed(2));

  const isCheckoutDisabled = cart.items.some(item => !item.is_available) || cart.items.length === 0;

  return (
    <div className="bg-white rounded-lg shadow sticky top-4">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
        
        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({cart.total_items} {cart.total_items === 1 ? 'item' : 'items'})</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
              {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (5%)</span>
            <span className="font-medium">{formatPrice(tax)}</span>
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        {deliveryFee === 0 ? (
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-green-700 text-sm text-center">
              🎉 You qualify for free delivery!
            </p>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-700 text-sm text-center">
              Add {formatPrice(freeDeliveryThreshold - subtotal)} more for free delivery
            </p>
          </div>
        )}

        {/* Checkout Button */}
        <button
          onClick={onCheckout}
          disabled={isCheckoutDisabled}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium mt-6"
        >
          {isCheckoutDisabled 
            ? cart.items.length === 0 
              ? 'Cart is Empty' 
              : 'Cannot Checkout' 
            : 'Proceed to Checkout'
          }
        </button>

        {/* Security Badges */}
        <div className="mt-4 flex justify-center space-x-6 text-gray-400">
          <div className="text-center">
            <div className="text-lg">🔒</div>
            <span className="text-xs">Secure</span>
          </div>
          <div className="text-center">
            <div className="text-lg">🚚</div>
            <span className="text-xs">Fast Delivery</span>
          </div>
          <div className="text-center">
            <div className="text-lg">🌱</div>
            <span className="text-xs">Fresh</span>
          </div>
        </div>

        {/* Out of Stock Warning */}
        {cart.items.some(item => !item.is_available) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">
              ⚠️ Some items in your cart are out of stock. Please remove them to proceed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSummary;