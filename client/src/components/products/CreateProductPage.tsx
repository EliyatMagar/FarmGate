// pages/dashboard/CreateProductPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createProduct, clearError } from '../../store/slices/product/productSlice';
import { fetchCategoryOptions, clearError as clearCategoryError } from '../../store/slices/category/categorySlice';
import { getMyFarms } from '../../store/slices/farm/farmSlice';
import ProductForm from '../../components/products/ProductForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CategoryDebug from '../../components/debug/CategoryDebug';

const CreateProductPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { loading: productLoading, error: productError } = useAppSelector((state) => state.product);
  const { farms, loading: farmLoading } = useAppSelector((state) => state.farm);
  const { categoryOptions, loading: categoryLoading, error: categoryError } = useAppSelector((state) => state.category);
  
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  // Debug: Log when component renders
  useEffect(() => {
    console.log('🔍 CreateProductPage rendered with:', {
      farmsCount: farms.length,
      categoryOptionsCount: categoryOptions.length,
      categoryOptions: categoryOptions,
      categoryLoading,
      categoryError
    });
  }, [farms, categoryOptions, categoryLoading, categoryError]);

  useEffect(() => {
    console.log('🏠 CreateProductPage: Component mounted');
    
    const loadData = async () => {
      try {
        console.log('📡 Loading data from APIs...');
        setDataLoadError(null);
        
        // Clear any previous errors
        dispatch(clearCategoryError());
        
        const [farmsResult, categoriesResult] = await Promise.all([
          dispatch(getMyFarms()).unwrap(),
          dispatch(fetchCategoryOptions()).unwrap()
        ]);

        console.log('✅ API Results:', {
          farmsCount: farmsResult.farms?.length || 0,
          categoriesSuccess: categoriesResult.success,
          categoriesCount: categoriesResult.categories?.length || 0,
          categories: categoriesResult.categories
        });

        // Check if we got categories from API
        if (!categoriesResult.categories || categoriesResult.categories.length === 0) {
          console.warn('⚠️ NO CATEGORIES IN DATABASE - Admin needs to create categories first');
        }

      } catch (error: any) {
        console.error('❌ Failed to load data:', error);
        setDataLoadError(error.message || 'Failed to load required data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const handleCreateProduct = async (formData: FormData) => {
    try {
      console.log('🔄 Creating product...');
      
      // Log the selected category
      const categoryId = formData.get('category_id');
      console.log('📝 Selected category ID:', categoryId);
      
      const result = await dispatch(createProduct(formData)).unwrap();
      console.log('✅ Product created successfully:', result);
      
      alert('🎉 Product created successfully!');
      navigate('/dashboard/products');
    } catch (error: any) {
      console.error('❌ Failed to create product:', error);
      alert(`❌ Failed to create product: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/dashboard/products');
    }
  };

  const handleRetryLoadData = () => {
    setIsLoading(true);
    setDataLoadError(null);
    Promise.all([
      dispatch(getMyFarms()),
      dispatch(fetchCategoryOptions())
    ]).finally(() => setIsLoading(false));
  };

  // Combine loading states
  const loading = productLoading || categoryLoading || farmLoading;
  const error = productError || categoryError || dataLoadError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner text="Loading farms and categories..." />
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
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button 
                    onClick={handleRetryLoadData}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Retry
                  </button>
                  <button 
                    onClick={() => {
                      dispatch(clearError());
                      dispatch(clearCategoryError());
                      setDataLoadError(null);
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Dismiss
                  </button>
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

  // Check for farms
  if (farms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No Farms Available</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>You need to create a farm before adding products.</p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => navigate('/dashboard/farms')}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Create Farm
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-2">Create a new product listing for your farm</p>
          
          {/* Debug Component - Remove in production */}
          <div className="mt-4">
            <CategoryDebug />
          </div>
          
          {/* Data Status */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Data Status</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Farms:</strong> {farms.length} available</p>
              <p><strong>Categories:</strong> {categoryOptions.length} available</p>
              <p><strong>Ready to create product:</strong> {farms.length > 0 && categoryOptions.length > 0 ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <ProductForm
            categories={categoryOptions}
            farms={farms}
            onSubmit={handleCreateProduct}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProductPage;