import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useCart } from '../../hooks/useCart';
import { fetchProducts } from '../../store/slices/product/productSlice';
import ProductList from '../products/ProductList';
import LoadingSpinner from '../common/LoadingSpinner';

const BuyerProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, loading, pagination } = useAppSelector((state) => state.product);
  const { cartCount } = useCart();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [showFilters, setShowFilters] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'featured' | 'organic'>('all');

  // Mock categories - replace with actual API call
  const categories = [
    { id: '1', name: 'Vegetables', icon: '🥦' },
    { id: '2', name: 'Fruits', icon: '🍎' },
    { id: '3', name: 'Grains', icon: '🌾' },
    { id: '4', name: 'Dairy', icon: '🥛' },
    { id: '5', name: 'Meat', icon: '🍖' },
    { id: '6', name: 'Herbs', icon: '🌿' },
    { id: '7', name: 'Spices', icon: '🌶️' },
    { id: '8', name: 'Nuts', icon: '🥜' },
  ];

  useEffect(() => {
    console.log('🔄 BuyerDashboard - Component mounted');
    
    let finalSortBy = sortBy;
    let finalSortOrder: 'ASC' | 'DESC' = sortOrder;
    
    if (sortBy === 'price_per_unit DESC') {
      finalSortBy = 'price_per_unit';
      finalSortOrder = 'DESC';
    } else if (sortBy === 'price_per_unit') {
      finalSortBy = 'price_per_unit';
      finalSortOrder = 'ASC';
    }
    
    dispatch(fetchProducts({ 
      page: 1, 
      limit: 12,
      search: searchTerm || undefined,
      category_id: selectedCategory || undefined,
      min_price: priceRange.min || undefined,
      max_price: priceRange.max || undefined,
      sort_by: finalSortBy,
      sort_order: finalSortOrder
    }));
  }, [dispatch, searchTerm, selectedCategory, priceRange, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalSortBy = sortBy;
    let finalSortOrder: 'ASC' | 'DESC' = sortOrder;
    
    if (sortBy === 'price_per_unit DESC') {
      finalSortBy = 'price_per_unit';
      finalSortOrder = 'DESC';
    } else if (sortBy === 'price_per_unit') {
      finalSortBy = 'price_per_unit';
      finalSortOrder = 'ASC';
    }
    
    dispatch(fetchProducts({ 
      page: 1, 
      limit: 12,
      search: searchTerm || undefined,
      category_id: selectedCategory || undefined,
      min_price: priceRange.min || undefined,
      max_price: priceRange.max || undefined,
      sort_by: finalSortBy,
      sort_order: finalSortOrder
    }));
  };

  const handlePageChange = (page: number) => {
    let finalSortBy = sortBy;
    let finalSortOrder: 'ASC' | 'DESC' = sortOrder;
    
    if (sortBy === 'price_per_unit DESC') {
      finalSortBy = 'price_per_unit';
      finalSortOrder = 'DESC';
    } else if (sortBy === 'price_per_unit') {
      finalSortBy = 'price_per_unit';
      finalSortOrder = 'ASC';
    }
    
    dispatch(fetchProducts({ 
      page, 
      limit: 12,
      search: searchTerm || undefined,
      category_id: selectedCategory || undefined,
      min_price: priceRange.min || undefined,
      max_price: priceRange.max || undefined,
      sort_by: finalSortBy,
      sort_order: finalSortOrder
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('created_at');
    setSortOrder('DESC');
    setActiveSection('all');
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowFilters(false);
    setActiveSection('all');
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    if (value === 'price_per_unit DESC') {
      setSortOrder('DESC');
    } else if (value === 'price_per_unit') {
      setSortOrder('ASC');
    } else {
      setSortOrder('DESC');
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory) count++;
    if (priceRange.min > 0 || priceRange.max < 10000) count++;
    if (sortBy !== 'created_at') count++;
    return count;
  };

  const featuredProducts = products
    .filter((product: any) => product.rating >= 4 || product.is_organic)
    .slice(0, 8);

  const organicProducts = products
    .filter((product: any) => product.is_organic)
    .slice(0, 8);

  const getDisplayProducts = () => {
    switch (activeSection) {
      case 'featured':
        return featuredProducts;
      case 'organic':
        return organicProducts;
      default:
        return products;
    }
  };

  const displayProducts = getDisplayProducts();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="alert alert-error">
              No user data available. Please log in again.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back, {user.name || 'Buyer'}! 👋
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Discover fresh, organic products from local farmers
              </p>
            </div>
            <div className="mt-3 sm:mt-4 md:mt-0 flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/cart"
                className="bg-orange-100 text-orange-800 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-200 transition-colors flex items-center"
              >
                🛒 Cart ({cartCount})
              </Link>
              <Link
                to="/orders"
                className="bg-green-100 text-green-800 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-200 transition-colors flex items-center"
              >
                📋 Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm sm:text-base">📦</span>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{pagination?.totalProducts || products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm sm:text-base">🌱</span>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Organic</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{organicProducts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-sm sm:text-base">⭐</span>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Featured</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{featuredProducts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm sm:text-base">🏪</span>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Categories</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 sticky top-4 sm:top-6">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full bg-green-600 text-white py-2 sm:py-3 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <span>🔍</span>
                  <span>Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}</span>
                </button>
              </div>

              {/* Filters Content */}
              <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-4 sm:space-y-6`}>
                {/* Search */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Search Products</h3>
                  <form onSubmit={handleSearch} className="space-y-2">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                      Search
                    </button>
                  </form>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Categories</h3>
                  <div className="space-y-1 sm:space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                        selectedCategory === '' 
                          ? 'bg-green-100 text-green-800' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm sm:text-base ${
                          selectedCategory === category.id 
                            ? 'bg-green-100 text-green-800' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base">{category.icon}</span>
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Price Range</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <span className="self-center text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 10000 }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <button
                      onClick={() => setPriceRange({ min: 0, max: 10000 })}
                      className="w-full text-xs sm:text-sm text-green-600 hover:text-green-700"
                    >
                      Reset Price
                    </button>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Sort By</h3>
                  <div className="space-y-2">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    >
                      <option value="created_at">Newest First</option>
                      <option value="price_per_unit">Price: Low to High</option>
                      <option value="price_per_unit DESC">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Marketplace Stats</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Total Products</span>
                  <span className="font-semibold text-sm sm:text-base">{pagination?.totalProducts || products.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Organic Products</span>
                  <span className="font-semibold text-green-600 text-sm sm:text-base">{organicProducts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Featured Items</span>
                  <span className="font-semibold text-yellow-600 text-sm sm:text-base">{featuredProducts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Active Farmers</span>
                  <span className="font-semibold text-blue-600 text-sm sm:text-base">{Math.ceil(products.length / 3)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Content */}
          <div className="lg:col-span-3">
            {/* Section Tabs */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
                <button
                  onClick={() => setActiveSection('all')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                    activeSection === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🌟 All Products
                </button>
                <button
                  onClick={() => setActiveSection('featured')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                    activeSection === 'featured'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⭐ Featured
                </button>
                <button
                  onClick={() => setActiveSection('organic')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                    activeSection === 'organic'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🌱 Organic
                </button>
              </div>
            </div>

            {/* Quick Filters Bar */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setPriceRange({ min: 0, max: 10000 });
                    setSortBy('created_at');
                    setSortOrder('DESC');
                    setActiveSection('all');
                  }}
                  className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs hover:bg-green-200 transition-colors"
                >
                  🌱 All Products
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setPriceRange({ min: 0, max: 100 });
                    setSortBy('created_at');
                    setSortOrder('DESC');
                    setActiveSection('all');
                  }}
                  className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors"
                >
                  💰 Under ₹100
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setPriceRange({ min: 0, max: 10000 });
                    setSortBy('rating');
                    setSortOrder('DESC');
                    setActiveSection('all');
                  }}
                  className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-xs hover:bg-yellow-200 transition-colors"
                >
                  ⭐ Top Rated
                </button>
                <button
                  onClick={() => {
                    const organicCategory = categories.find(c => c.name === 'Vegetables')?.id || '';
                    setSelectedCategory(organicCategory);
                    setSortBy('created_at');
                    setSortOrder('DESC');
                    setActiveSection('all');
                  }}
                  className="bg-purple-100 text-purple-800 px-2 sm:px-3 py-1 rounded-full text-xs hover:bg-purple-200 transition-colors"
                >
                  🍃 Organic
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">🔍</span>
                    <span className="text-xs sm:text-sm text-green-800">
                      Showing filtered results ({getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <button
                    onClick={handleClearFilters}
                    className="text-xs sm:text-sm text-green-600 hover:text-green-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Section Title */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {activeSection === 'featured' && '⭐ Featured Products'}
                {activeSection === 'organic' && '🌱 Organic Products'}
                {activeSection === 'all' && (selectedCategory 
                  ? `${categories.find(c => c.id === selectedCategory)?.name || 'Category'} Products`
                  : '🛍️ All Products'
                )}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                {activeSection === 'featured' && 'Top-rated and premium products from our farmers'}
                {activeSection === 'organic' && 'Chemical-free, naturally grown products'}
                {activeSection === 'all' && 'Browse our complete collection of farm-fresh products'}
              </p>
            </div>

            {/* Products Grid */}
            {loading ? (
              <LoadingSpinner text="Loading products..." />
            ) : (
              <>
                {/* Products List */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {displayProducts.length} {displayProducts.length === 1 ? 'Product' : 'Products'} Found
                      </h3>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {activeSection === 'all' && `Total: ${pagination?.totalProducts || products.length} products`}
                        {activeSection !== 'all' && `Showing ${displayProducts.length} products`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 lg:p-6">
                    {displayProducts.length > 0 ? (
                      <ProductList
                        products={displayProducts}
                        showActions={false}
                        showAddToCart={true}
                      />
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📦</div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                          Try adjusting your search criteria or browse different categories.
                        </p>
                        <button
                          onClick={handleClearFilters}
                          className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagination - Only show for "all" section */}
                {activeSection === 'all' && pagination && pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-2 mt-6 sm:mt-8">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      Previous
                    </button>

                    <div className="flex space-x-1 sm:space-x-2">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 sm:px-4 py-2 border text-xs sm:text-sm font-medium rounded-md ${
                              page === pagination.currentPage
                                ? 'bg-green-600 text-white border-green-600'
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      Next
                    </button>

                    <div className="text-xs sm:text-sm text-gray-600 sm:ml-4">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Categories Grid */}
            <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Shop by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`flex flex-col items-center p-3 sm:p-4 border rounded-lg hover:shadow-md transition-all ${
                      selectedCategory === category.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-500'
                    }`}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 text-lg sm:text-xl ${
                      selectedCategory === category.id ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {category.icon}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity or Promotions */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-4 sm:p-6 text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-2">🚚 Free Delivery</h3>
                <p className="text-sm sm:text-base opacity-90">
                  Get free delivery on orders above ₹500. Fresh products delivered to your doorstep!
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow p-4 sm:p-6 text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-2">⭐ Farmer's Choice</h3>
                <p className="text-sm sm:text-base opacity-90">
                  Direct from local farmers. Support local agriculture with every purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProductsPage;