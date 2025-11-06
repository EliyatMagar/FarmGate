// components/checkout/OrderConfirmation.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../../types/order';

interface OrderConfirmationProps {
  orders: Order[];
  currency: string;
  paymentMethod?: 'stripe' | 'cod';
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ 
  orders, 
  currency, 
  paymentMethod = 'stripe' 
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Failed</h2>
        <p className="text-gray-600 mb-6">There was an issue processing your order. Please try again.</p>
        <Link
          to="/cart"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center mb-8">
        <div className="text-6xl text-green-500 mb-4">✅</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-4">
          Thank you for your order. {orders.length > 1 ? 'Your orders have' : 'Your order has'} been successfully placed.
        </p>
        <p className="text-sm text-gray-500">
          Payment Method: {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}
        </p>
      </div>

      {/* Order Summary */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Order #{order.order_number}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Farmer: {order.farmer_name || 'Unknown Farmer'}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {order.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity} × {item.product_name}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Information */}
      {orders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Delivery Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">
              <strong>Address:</strong> {orders[0].delivery_address}
            </p>
            {orders[0].delivery_date && (
              <p className="text-gray-700 mt-2">
                <strong>Delivery Date:</strong> {new Date(orders[0].delivery_date).toLocaleDateString()}
              </p>
            )}
            {orders[0].special_instructions && (
              <p className="text-gray-700 mt-2">
                <strong>Special Instructions:</strong> {orders[0].special_instructions}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You will receive an order confirmation email shortly</li>
          <li>• The farmer will confirm your order and prepare it for delivery</li>
          <li>• You can track your order status in your account dashboard</li>
          {paymentMethod === 'cod' && (
            <li>• Please have cash ready for payment upon delivery</li>
          )}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/orders"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
        >
          View My Orders
        </Link>
        <Link
          to="/products"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;