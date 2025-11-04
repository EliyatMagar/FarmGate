import React from 'react';
import type { Cart } from '../../types/cart';

interface CheckoutSummaryProps {
  cart: Cart;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ cart }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const deliveryFee = cart.total_price > 500 ? 0 : 40;
  const tax = cart.total_price * 0.05; // 5% tax
  const finalTotal = cart.total_price + deliveryFee + tax;

  return (
    <div className="bg-white rounded-lg shadow sticky top-4">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
        
        {/* Items List */}
        <div className="mb-4 max-h-64 overflow-y-auto">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
              <div className="flex items-center space-x-3">
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
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × {formatPrice(item.price_per_unit)}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {formatPrice(item.price_per_unit * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({cart.total_items} items)</span>
            <span className="font-medium">{formatPrice(cart.total_price)}</span>
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

        {/* Free Delivery Message */}
        {deliveryFee === 0 && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-green-700 text-sm text-center">
              🎉 You qualify for free delivery!
            </p>
          </div>
        )}

        {/* Benefits */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="text-green-500">✓</span>
            <span>Fresh from local farms</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="text-green-500">✓</span>
            <span>Quality guaranteed</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="text-green-500">✓</span>
            <span>Secure payment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;