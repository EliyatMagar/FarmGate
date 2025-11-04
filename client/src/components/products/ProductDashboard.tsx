// components/products/ProductsDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  clearError,
  setFilters
} from '../../store/slices/product/productSlice';
import { fetchCategoryOptions } from '../../store/slices/category/categorySlice';
import ProductList from '../../components/products/ProductList';
import ProductForm from '../../components/products/ProductForm';
import type { Product } from '../../types/product';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProductsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { myProducts, loading, error, filters, pagination } = useAppSelector((state) => state.product);
  const { farms } = useAppSelector((state) => state.farm);
  const { categoryOptions} = useAppSelector((state) => state.category);
  
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  useEffect(() => {
    dispatch(fetchMyProducts({ 
      page: filters.page || 1, 
      limit: filters.limit || 12,
      is_available: statusFilter === 'all' ? undefined : statusFilter === 'available'
    }));
    dispatch(fetchCategoryOptions()); // Fetch real categories from API
  }, [dispatch, filters.page, filters.limit, statusFilter]);

  const handleCreateProduct = async (formData: FormData) => {
    try {
      await dispatch(createProduct(formData)).unwrap();
      setShowForm(false);
      // Refresh the products list
      dispatch(fetchMyProducts({ page: filters.page || 1, limit: filters.limit || 12 }));
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleUpdateProduct = async (formData: FormData) => {
    if (!editingProduct) return;
    
    try {
      await dispatch(updateProduct({ id: editingProduct.id, formData })).unwrap();
      setEditingProduct(null);
      // Refresh the products list
      dispatch(fetchMyProducts({ page: filters.page || 1, limit: filters.limit || 12 }));
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      // Products list will be updated automatically via Redux
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleUpdateInventory = async (productId: string, quantity: number) => {
    try {
      await dispatch(updateInventory({ 
        id: productId, 
        data: { available_quantity: quantity, operation: 'set' }
      })).unwrap();
    } catch (error) {
      console.error('Failed to update inventory:', error);
    }
  };

  const handleToggleAvailability = async (productId: string, isAvailable: boolean) => {
    const product = myProducts.find((p: Product) => p.id === productId);
    if (!product) return;

    const formData = new FormData();
    formData.append('is_available', isAvailable.toString());

    try {
      await dispatch(updateProduct({ id: productId, formData })).unwrap();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ ...filters, page }));
  };

  const handleStatusFilterChange = (status: 'all' | 'available' | 'unavailable') => {
    setStatusFilter(status);
    dispatch(setFilters({ page: 1 })); // Reset to first page when filter changes
  };

  const filteredProducts = myProducts.filter((product: Product) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'available') return product.is_available;
    return !product.is_available;
  });

  // Calculate stats
  const totalProducts = myProducts.length;
  const availableProducts = myProducts.filter((p: Product) => p.is_available).length;
  const outOfStockProducts = myProducts.filter((p: Product) => p.available_quantity === 0).length;
  const totalInventoryValue = myProducts.reduce((sum: number, product: Product) => 
    sum + (product.price_per_unit * product.available_quantity), 0
  );

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-3">
                <button 
                  onClick={() => dispatch(clearError())}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
            <p className="text-gray-600">Manage your farm products and inventory</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 lg:mt-0 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl text-blue-600">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl text-green-600">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{availableProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <span className="text-2xl text-red-600">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl text-purple-600">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalInventoryValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Products</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sort_by || 'created_at'}
                onChange={(e) => dispatch(setFilters({ sort_by: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="created_at">Newest First</option>
                <option value="name">Name</option>
                <option value="price_per_unit">Price</option>
                <option value="available_quantity">Quantity</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {totalProducts} products
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {(showForm || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <ProductForm
                product={editingProduct || undefined}
                categories={categoryOptions}
                farms={farms}
                onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                onCancel={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Loading products..." />
          </div>
        ) : (
          <>
            <ProductList
              products={filteredProducts}
              loading={false}
              onEdit={setEditingProduct}
              onDelete={handleDeleteProduct}
              onUpdateInventory={handleUpdateInventory}
              onToggleAvailability={handleToggleAvailability}
              showActions={true}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border text-sm font-medium rounded-md ${
                        page === pagination.currentPage
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>

                <div className="text-sm text-gray-600 ml-4">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsDashboard;