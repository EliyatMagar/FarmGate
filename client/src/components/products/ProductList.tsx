import React from 'react';
import type { Product } from '../../types/product';
import ProductCard from './ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onUpdateInventory?: (productId: string, quantity: number) => void;
  onToggleAvailability?: (productId: string, isAvailable: boolean) => void;
  showActions?: boolean;
  showAddToCart?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading = false,
  onEdit,
  onDelete,
  onUpdateInventory,
  onToggleAvailability,
  showActions = true,
  showAddToCart = false
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner text="Loading products..." />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 md:py-12 px-4">
        <div className="text-gray-400 text-4xl md:text-6xl mb-3 md:mb-4">📦</div>
        <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto">
          Get started by adding your first product.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4 lg:px-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateInventory={onUpdateInventory}
          onToggleAvailability={onToggleAvailability}
          showActions={showActions}
          showAddToCart={showAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductList;