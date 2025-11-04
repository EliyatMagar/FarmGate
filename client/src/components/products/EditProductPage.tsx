// components/products/EditProductPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchProductById, updateProduct, clearError, clearCurrentProduct } from '../../store/slices/product/productSlice';
import { fetchCategoryOptions } from '../../store/slices/category/categorySlice';
import { getMyFarms } from '../../store/slices/farm/farmSlice'; // Add farm import
import ProductForm from '../../components/products/ProductForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditProductPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentProduct, loading: productLoading, error: productError } = useAppSelector((state) => state.product);
  const { farms, loading: farmLoading } = useAppSelector((state) => state.farm);
  const { categoryOptions, loading: categoryLoading, error: categoryError } = useAppSelector((state) => state.category);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (id) {
          console.log('📡 Loading product, farms, and categories...');
          await Promise.all([
            dispatch(fetchProductById(id)),
            dispatch(getMyFarms()), // Fetch farms
            dispatch(fetchCategoryOptions())
          ]);
          console.log('✅ Data loaded successfully');
        }
      } catch (error) {
        console.error('❌ Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  // Debug when data changes
  useEffect(() => {
    console.log('🔄 EditProductPage: farms updated:', farms);
    console.log('🔄 EditProductPage: categoryOptions updated:', categoryOptions);
    console.log('🔄 EditProductPage: currentProduct:', currentProduct);
  }, [farms, categoryOptions, currentProduct]);

  const handleUpdateProduct = async (formData: FormData) => {
    if (!id) return;
    
    try {
      console.log('🔄 Updating product...');
      await dispatch(updateProduct({ id, formData })).unwrap();
      console.log('✅ Product updated successfully');
      navigate('/dashboard/products');
    } catch (error) {
      console.error('❌ Failed to update product:', error);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/products');
  };

  // Combine loading states
  const loading = productLoading || categoryLoading || farmLoading;
  const error = productError || categoryError;

  if (isLoading || categoryLoading || farmLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner text="Loading product data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
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
                  <button
                    onClick={handleCancel}
                    className="ml-2 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Back to Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Product Not Found</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>The product you're trying to edit doesn't exist or you don't have permission to access it.</p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Back to Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <span className="mr-2">←</span>
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-2">Update your product information</p>
          
          {/* Debug Info */}
          <div className="mt-4 space-y-2">
            {farms.length > 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Available Farms:</strong> {farms.length} farm(s) loaded.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  <strong>No Farms Available:</strong> Cannot edit product without farms.
                </p>
              </div>
            )}
            
            {categoryOptions.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">
                  <strong>Available Categories:</strong> {categoryOptions.length} category(ies) loaded from API.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  <strong>No Categories Available:</strong> Please check if categories exist in the system.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Product Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <ProductForm
            product={currentProduct}
            categories={categoryOptions}
            farms={farms}
            onSubmit={handleUpdateProduct}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;