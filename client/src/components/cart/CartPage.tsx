// components/cart/CartPage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

const CartPage: React.FC = () => {
  const { cart, loading, loadCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  useEffect(() => {
    // Load cart when component mounts
    loadCart();
  }, [loadCart]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: '/cart' },
        replace: true 
      });
    }
  }, [isAuthenticated, navigate]);

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    // Check if any items are out of stock
    const outOfStockItems = cart.items.filter(item => !item.is_available);
    if (outOfStockItems.length > 0) {
      alert('Some items in your cart are out of stock. Please remove them to proceed.');
      return;
    }
    
    navigate('/checkout');
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner text="Loading your cart..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to view your cart.</p>
            <Link
              to="/login"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Login to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart 🛒</h1>
            <p className="text-gray-600 mt-2">
              Review your items and proceed to checkout
            </p>
          </div>
          
          {/* Currency Selector */}
          {cart.items.length > 0 && (
            <div className="mt-4 sm:mt-0">
              <label htmlFor="currency" className="text-sm font-medium text-gray-700 mr-2">
                Currency:
              </label>
              <select
                id="currency"
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          )}
        </div>

        {cart.items.length === 0 ? (
          // Empty Cart State
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleContinueShopping}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Continue Shopping
              </button>
              <Link
                to="/products?featured=true"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Browse Featured Products
              </Link>
            </div>
          </div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                {/* Cart Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cart Items ({cart.total_items} {cart.total_items === 1 ? 'item' : 'items'})
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <CartItem 
                      key={item.id} 
                      item={item} 
                      currency={selectedCurrency}
                    />
                  ))}
                </div>

                {/* Continue Shopping */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={handleContinueShopping}
                    className="text-green-600 hover:text-green-700 font-medium flex items-center"
                  >
                    ← Continue Shopping
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-500 text-lg">💡</span>
                  <div>
                    <h3 className="font-medium text-blue-800">Shopping Tips</h3>
                    <ul className="text-blue-700 text-sm mt-1 space-y-1">
                      <li>• Minimum order quantities apply for each product</li>
                      <li>• Products are sourced directly from local farmers</li>
                      <li>• Freshness and quality guaranteed</li>
                      <li>• Free delivery on orders above certain amount</li>
                      <li>• Multiple currency support available</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummary 
                cart={cart}
                onCheckout={handleCheckout}
                currency={selectedCurrency}
              />
            </div>
          </div>
        )}

        {/* Recently Viewed or Recommended Products */}
        {cart.items.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Placeholder for recommended products */}
              <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-gray-400 text-2xl mb-2">🥦</div>
                <p className="text-sm text-gray-600">Fresh vegetables</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-gray-400 text-2xl mb-2">🍎</div>
                <p className="text-sm text-gray-600">Seasonal fruits</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-gray-400 text-2xl mb-2">🌿</div>
                <p className="text-sm text-gray-600">Organic herbs</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-gray-400 text-2xl mb-2">🥛</div>
                <p className="text-sm text-gray-600">Dairy products</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;