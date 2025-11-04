import React, { useState } from 'react';
import type { Product } from '../../types/product';
import ProductImageGallery from './ProductImageGallery';
import InventoryManager from './InventoryManager';
import AvailabilityToggle from './AvailabilityToggle';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onUpdateInventory?: (productId: string, quantity: number) => void;
  onToggleAvailability?: (productId: string, isAvailable: boolean) => void;
  showActions?: boolean;
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onUpdateInventory,
  onToggleAvailability,
  showActions = true,
  showAddToCart = true
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [quantity, setQuantity] = useState(product.min_order_quantity);
  const { addToCart, isProductInCart, getCartItemByProductId, incrementItemQuantity } = useCart();

  const cartItem = getCartItemByProductId(product.id);
  const isInCart = isProductInCart(product.id);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setIsDeleting(true);
      try {
        await onDelete?.(product.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleAddToCart = () => {
    if (quantity < product.min_order_quantity) {
      alert(`Minimum order quantity is ${product.min_order_quantity}`);
      return;
    }

    if (quantity > product.available_quantity) {
      alert(`Only ${product.available_quantity} units available`);
      return;
    }

    if (isInCart && cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity <= product.available_quantity) {
        incrementItemQuantity(cartItem.id);
        alert(`Added ${quantity} more to cart!`);
      } else {
        alert(`Cannot add more than available quantity`);
      }
    } else {
      const productWithFarmerId = {
        ...product,
        farmer_id: product.farmer_id
      };
      addToCart(productWithFarmerId, quantity);
      alert(`Added to cart successfully!`);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= product.min_order_quantity && newQuantity <= product.available_quantity) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getQualityBadgeColor = (grade?: string) => {
    switch (grade) {
      case 'organic': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'economy': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow h-full flex flex-col w-full max-w-[400px] mx-auto">
      {/* Product Images */}
      <div className="flex-shrink-0 aspect-square">
        <ProductImageGallery images={product.images} name={product.name} />
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 flex-1 min-w-0 break-words">
            {product.name}
          </h3>
          {product.is_organic && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
              🌱
            </span>
          )}
        </div>

        {/* Category */}
        {product.category_name && (
          <p className="text-xs text-gray-600 mb-2 truncate">
            {product.category_name}
          </p>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-xs mb-3 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        {/* Quality Grade */}
        {product.quality_grade && (
          <div className="mb-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getQualityBadgeColor(product.quality_grade)}`}>
              {product.quality_grade.charAt(0).toUpperCase() + product.quality_grade.slice(1)}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-baseline flex-wrap">
            <span className="text-lg sm:text-xl font-bold text-green-600">
              {formatPrice(product.price_per_unit)}
            </span>
            <span className="text-gray-500 text-xs ml-1">/ {product.unit_type}</span>
          </div>
          {isInCart && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              🛒 ({cartItem?.quantity})
            </span>
          )}
        </div>

        {/* Inventory Info */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Available:</span>
            <span className={`font-medium ${
              product.available_quantity > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.available_quantity} {product.unit_type}
            </span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Min Order:</span>
            <span className="font-medium">{product.min_order_quantity} {product.unit_type}</span>
          </div>
        </div>

        {/* Add to Cart Section */}
        {showAddToCart && product.is_available && product.available_quantity > 0 && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Qty:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= product.min_order_quantity}
                  className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-300"
                >
                  -
                </button>
                <span className="w-6 text-center text-xs font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.available_quantity}
                  className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.is_available || product.available_quantity === 0}
              className="w-full bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-xs font-medium"
            >
              {isInCart ? 'Add More' : 'Add to Cart'} 🛒
            </button>
          </div>
        )}

        {/* Out of Stock Message */}
        {showAddToCart && (!product.is_available || product.available_quantity === 0) && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-xs text-center">
              {!product.is_available ? 'Product unavailable' : 'Out of Stock'}
            </p>
          </div>
        )}

        {/* Dates */}
        <div className="space-y-1 text-xs text-gray-500 mb-3">
          {product.harvest_date && (
            <div className="truncate">Harvest: {new Date(product.harvest_date).toLocaleDateString()}</div>
          )}
          {product.expiry_date && (
            <div className="truncate">Expires: {new Date(product.expiry_date).toLocaleDateString()}</div>
          )}
        </div>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center mb-3 flex-wrap">
            <div className="flex items-center mr-2">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-xs sm:text-sm ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-600">
              ({product.rating.toFixed(1)}) • {product.total_reviews}
            </span>
          </div>
        )}

        {/* Farmer Actions */}
        {showActions && (
          <div className="space-y-2 mt-auto">
            {/* Availability Toggle */}
            <AvailabilityToggle
              isAvailable={product.is_available}
              onToggle={(isAvailable) => onToggleAvailability?.(product.id, isAvailable)}
            />

            {/* Inventory Manager */}
            <InventoryManager
              currentQuantity={product.available_quantity}
              unitType={product.unit_type}
              onUpdate={(quantity) => onUpdateInventory?.(product.id, quantity)}
            />

            {/* Edit & Delete Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit?.(product)}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 disabled:bg-red-400 transition-colors text-xs font-medium"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;