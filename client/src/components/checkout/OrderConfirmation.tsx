import React from 'react';
import { Link } from 'react-router-dom';

const OrderConfirmation: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <div className="max-w-md mx-auto">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-green-600">✅</span>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
        <p className="text-lg text-gray-600 mb-6">
          Thank you for your order. Your fresh farm products are on their way!
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-left">
              <p className="text-gray-600">Order Number</p>
              <p className="font-semibold text-gray-900">#ORD-{Date.now().toString().slice(-6)}</p>
            </div>
            <div className="text-left">
              <p className="text-gray-600">Estimated Delivery</p>
              <p className="font-semibold text-gray-900">
                {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
            <div className="text-left">
              <p className="text-gray-600">Total Amount</p>
              <p className="font-semibold text-gray-900">₹0.00</p>
            </div>
            <div className="text-left">
              <p className="text-gray-600">Payment Status</p>
              <p className="font-semibold text-green-600">Paid</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="space-y-3 text-sm text-gray-600 text-left">
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>You'll receive order confirmation via email</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Farmers will prepare your fresh products</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Delivery partner will contact you before delivery</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard/orders"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? <Link to="/contact" className="text-green-600 hover:text-green-700">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;