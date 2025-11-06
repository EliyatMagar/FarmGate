// components/dashboard/BuyerDashboard.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useCart } from '../../hooks/useCart';
import { fetchProducts } from '../../store/slices/product/productSlice';
import ProductList from '../products/ProductList';
import LoadingSpinner from '../common/LoadingSpinner';

const BuyerDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, loading, pagination } = useAppSelector((state) => state.product);
  const { cartCount, cartTotal, loadCart } = useCart();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized fetch function with proper error handling
  const fetchProductsWithFilters = useCallback(async (page: number = 1) => {
    try {
      setError(null);
      await dispatch(fetchProducts({ 
        page, 
        limit: 12,
        search: searchTerm || undefined,
        category_id: selectedCategory || undefined,
        min_price: priceRange.min > 0 ? priceRange.min : undefined,
        max_price: priceRange.max < 10000 ? priceRange.max : undefined
      })).unwrap();
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to load products');
    }
  }, [dispatch, searchTerm, selectedCategory, priceRange.min, priceRange.max]);

  useEffect(() => {
    console.log('🔄 BuyerDashboard - Component mounted');
    
    const initializeDashboard = async () => {
      try {
        await fetchProductsWithFilters(1);
        await loadCart();
      } catch (err: any) {
        console.error('Dashboard initialization error:', err);
        setError('Failed to initialize dashboard');
      }
    };

    initializeDashboard();
  }, [fetchProductsWithFilters, loadCart]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProductsWithFilters(1);
  };

  const handlePageChange = (page: number) => {
    fetchProductsWithFilters(page);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: 0, max: 10000 });
    fetchProductsWithFilters(1);
  };

  // Safe array access with proper fallbacks
  const safeProducts = Array.isArray(products) ? products : [];
  
  // Mock categories for filter
  const categories = [
    { id: '1', name: 'Vegetables', icon: '🥦' },
    { id: '2', name: 'Fruits', icon: '🍎' },
    { id: '3', name: 'Grains', icon: '🌾' },
    { id: '4', name: 'Dairy', icon: '🥛' },
    { id: '5', name: 'Meat', icon: '🍖' },
    { id: '6', name: 'Herbs', icon: '🌿' },
  ];

  // Safe product filtering with proper fallbacks
  const featuredProducts = useMemo(() => {
    return safeProducts
      .filter((product: any) => (product?.rating || 0) >= 4 || product?.is_organic)
      .slice(0, 6);
  }, [safeProducts]);

  const recentProducts = useMemo(() => {
    return [...safeProducts] // Create a copy to avoid mutation
      .sort((a: any, b: any) => {
        const dateA = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [safeProducts]);

  // Safe pagination access with proper defaults
  const safePagination = useMemo(() => {
    return pagination || {
      currentPage: 1,
      totalPages: 1,
      totalProducts: safeProducts.length,
      hasPrev: false,
      hasNext: false
    };
  }, [pagination, safeProducts.length]);

  // Safe price range handlers
  const handleMinPriceChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setPriceRange(prev => ({ 
      ...prev, 
      min: Math.max(0, numValue) 
    }));
  };

  const handleMaxPriceChange = (value: string) => {
    const numValue = parseInt(value) || 10000;
    setPriceRange(prev => ({ 
      ...prev, 
      max: Math.min(10000, numValue) 
    }));
  };

  // Quick filter handlers
  const handleQuickFilter = (filterType: string) => {
    switch (filterType) {
      case 'organic':
        dispatch(fetchProducts({ is_organic: true }));
        break;
      case 'under100':
        setPriceRange({ min: 0, max: 100 });
        fetchProductsWithFilters(1);
        break;
      case 'topRated':
        dispatch(fetchProducts({ sort_by: 'rating', sort_order: 'DESC' }));
        break;
      case 'newArrivals':
        dispatch(fetchProducts({ sort_by: 'created_at', sort_order: 'DESC' }));
        break;
      default:
        break;
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchProductsWithFilters(1);
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard</p>
          <Link
            to="/login"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 font-medium inline-block"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role !== 'buyer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-2">This dashboard is for buyers only.</p>
          <p className="text-sm text-gray-500">Your role: {user?.role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Welcome Section with Stats */}
      <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">👋</span>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                    Welcome back, {user.name || 'Buyer'}!
                  </h1>
                  <p className="text-emerald-100 text-lg">
                    Discover fresh, organic products from local farmers
                  </p>
                </div>
              </div>
            </div>
            
            {/* Cart Stats */}
            <div className="mt-6 lg:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🛒</span>
                      <div>
                        <p className="text-sm text-emerald-100">Cart Items</p>
                        <p className="text-2xl font-bold text-white">{cartCount || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-12 w-px bg-white/30"></div>
                  <div className="text-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="text-sm text-emerald-100">Total</p>
                        <p className="text-2xl font-bold text-white">₹{(cartTotal || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/cart"
                    className="bg-white text-green-600 px-6 py-3 rounded-xl hover:bg-green-50 transition-all duration-300 font-semibold hover:scale-105 active:scale-95 shadow-lg"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Quick Stats & Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/products"
            className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-300 hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">🛍️</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Browse Products</h3>
                <p className="text-sm text-gray-600">Full catalog</p>
              </div>
            </div>
          </Link>

          <Link
            to="/orders"
            className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-300 hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">📋</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">My Orders</h3>
                <p className="text-sm text-gray-600">Track purchases</p>
              </div>
            </div>
          </Link>

          <Link
            to="/cart"
            className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-300 hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">🛒</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Shopping Cart</h3>
                <p className="text-sm text-gray-600">{cartCount || 0} items</p>
              </div>
            </div>
          </Link>

          <Link
            to="/farms"
            className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-300 hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">🏡</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Local Farms</h3>
                <p className="text-sm text-gray-600">Meet farmers</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Search products, farmers, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl active:scale-95"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="bg-gray-100 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium flex items-center space-x-2"
              >
                <span>🔧</span>
                <span>Filters</span>
              </button>
            </div>
          </form>

          {/* Expandable Filters */}
          <div className={`transition-all duration-500 overflow-hidden ${isFiltersOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📦 Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-3 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  💰 Price Range
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handleMinPriceChange(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-3 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                  />
                  <span className="text-gray-500 font-medium">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handleMaxPriceChange(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-3 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-end space-x-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    setIsFiltersOpen(false);
                    fetchProductsWithFilters(1);
                  }}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => handleQuickFilter('organic')}
              className="bg-green-100 text-green-800 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-green-200 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              🌱 All Organic
            </button>
            <button
              onClick={() => handleQuickFilter('under100')}
              className="bg-blue-100 text-blue-800 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-200 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              💰 Under ₹100
            </button>
            <button
              onClick={() => handleQuickFilter('topRated')}
              className="bg-yellow-100 text-yellow-800 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-yellow-200 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              ⭐ Top Rated
            </button>
            <button
              onClick={() => handleQuickFilter('newArrivals')}
              className="bg-purple-100 text-purple-800 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-purple-200 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              🆕 New Arrivals
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link
              to="/products"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center space-x-2 transition-all duration-300"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group flex flex-col items-center p-6 border-2 border-gray-100 rounded-2xl hover:border-green-300 hover:bg-green-50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-3 group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <span className="text-sm font-semibold text-gray-700 text-center">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-600 mt-1">Top-rated and organic selections</p>
            </div>
            <Link
              to="/products?featured=true"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center space-x-2 transition-all duration-300"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>
          
          {loading ? (
            <LoadingSpinner text="Loading featured products..." />
          ) : featuredProducts.length > 0 ? (
            <ProductList
              products={featuredProducts}
              showActions={false}
              showAddToCart={true}
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌟</span>
              </div>
              <p className="text-gray-500 text-lg">No featured products found</p>
              <button
                onClick={() => fetchProductsWithFilters(1)}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-600 mt-1">Freshly added products</p>
            </div>
            <Link
              to="/products?sort=newest"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center space-x-2 transition-all duration-300"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>
          
          {loading ? (
            <LoadingSpinner text="Loading new arrivals..." />
          ) : recentProducts.length > 0 ? (
            <ProductList
              products={recentProducts}
              showActions={false}
              showAddToCart={true}
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <p className="text-gray-500 text-lg">No new products available</p>
              <button
                onClick={() => fetchProductsWithFilters(1)}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* All Products Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
              <p className="text-gray-600 mt-1">
                Showing {safeProducts.length} products • <span className="font-semibold">{cartCount || 0} items in cart</span>
              </p>
            </div>
          </div>
          
          {loading ? (
            <LoadingSpinner text="Loading all products..." />
          ) : (
            <>
              <ProductList
                products={safeProducts}
                showActions={false}
                showAddToCart={true}
              />

              {/* Enhanced Pagination */}
              {safePagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Page {safePagination.currentPage} of {safePagination.totalPages} • {safePagination.totalProducts} total products
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(safePagination.currentPage - 1)}
                      disabled={!safePagination.hasPrev}
                      className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      ← Previous
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, safePagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 border text-sm font-medium rounded-xl transition-all duration-300 ${
                              page === safePagination.currentPage
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-600 shadow-lg'
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:scale-105'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(safePagination.currentPage + 1)}
                      disabled={!safePagination.hasNext}
                      className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cart Summary Sticky Banner */}
        {(cartCount || 0) > 0 && (
          <div className="sticky bottom-6 z-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-2xl p-6 border border-orange-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🛒</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Ready to Checkout?</h3>
                  <p className="text-amber-100">
                    {cartCount} items • Total: ₹{(cartTotal || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  to="/cart"
                  className="bg-white text-orange-600 px-6 py-3 rounded-xl hover:bg-orange-50 transition-all duration-300 font-semibold hover:scale-105 active:scale-95 shadow-lg"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 font-semibold hover:scale-105 active:scale-95 shadow-lg flex items-center space-x-2"
                >
                  <span>Checkout</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;