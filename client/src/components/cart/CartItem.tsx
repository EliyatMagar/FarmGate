import React from 'react';
import { Link } from 'react-router-dom';
import type { CartItem as CartItemType } from '../../types/cart';
import { useCart } from '../../hooks/useCart';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { removeFromCart, incrementItemQuantity, decrementItemQuantity } = useCart(); // Removed updateQuantity

  const handleIncrement = () => {
    if (item.quantity < item.available_quantity) {
      incrementItemQuantity(item.id);
    } else {
      alert(`Only ${item.available_quantity} units available`);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > item.min_order_quantity) {
      decrementItemQuantity(item.id);
    } else if (item.quantity === 1) {
      removeFromCart(item.id);
    } else {
      alert(`Minimum order quantity is ${item.min_order_quantity}`);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Remove this item from cart?')) {
      removeFromCart(item.id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // In CartItem.tsx - update the itemTotal calculation
const itemTotal = parseFloat((item.price_per_unit * item.quantity).toFixed(2));

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <Link to={`/products/${item.product_id}`}>
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.product_name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📦</span>
              </div>
            )}
          </Link>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link 
            to={`/products/${item.product_id}`}
            className="hover:text-green-600 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {item.product_name}
            </h3>
          </Link>
          
          {item.farm_name && (
            <p className="text-sm text-gray-600 mt-1">
              From: {item.farm_name}
            </p>
          )}

          <div className="flex items-center space-x-4 mt-2">
            <span className="text-lg font-bold text-green-600">
              {formatPrice(item.price_per_unit)}
            </span>
            <span className="text-gray-500 text-sm">/ {item.unit_type}</span>
          </div>

          {/* Stock Status */}
          <div className="mt-2">
            {item.is_available ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
          {/* Quantity Selector */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDecrement}
              disabled={item.quantity <= item.min_order_quantity}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              -
            </button>
            <span className="w-8 text-center font-medium text-lg">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={item.quantity >= item.available_quantity}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              +
            </button>
          </div>

          {/* Item Total and Remove */}
          <div className="flex flex-col items-end space-y-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(itemTotal)}
            </span>
            <button
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Quantity Limits Info */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
        <span>Min: {item.min_order_quantity} {item.unit_type}</span>
        <span>Available: {item.available_quantity} {item.unit_type}</span>
        {item.quantity > item.available_quantity && (
          <span className="text-red-500 font-medium">
            Only {item.available_quantity} available
          </span>
        )}
      </div>
    </div>
  );
};

export default CartItem;