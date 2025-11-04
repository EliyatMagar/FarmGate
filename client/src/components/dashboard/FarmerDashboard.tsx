// components/dashboard/FarmerDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchMyProducts } from '../../store/slices/product/productSlice';
import { fetchCategoryOptions } from '../../store/slices/category/categorySlice';
import { fetchFarmerOrders } from '../../store/slices/order/orderSlice';
import ProductList from '../products/ProductList';
import ProductForm from '../products/ProductForm';
import FarmerOrdersPage from '../orders/FarmerOrdersPage';
import type { Product } from '../../types/product';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  TrendingUp, 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  Users,
  ShoppingCart,
  BarChart3,
  Plus,
  Settings,
  ArrowRight
} from 'lucide-react';

const FarmerDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { farms: farmData, loading: farmsLoading } = useAppSelector((state) => state.farm);
  const { myProducts, loading: productsLoading } = useAppSelector((state) => state.product);
  const { farmerOrders, loading: ordersLoading } = useAppSelector((state) => state.order);
  const { categoryOptions } = useAppSelector((state) => state.category);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics'>('overview');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (user?.role === 'farmer') {
      dispatch(fetchMyProducts({ page: 1, limit: 100 }));
      dispatch(fetchCategoryOptions());
      dispatch(fetchFarmerOrders({ page: 1, limit: 5 }));
    }
  }, [user, dispatch]);

  // Calculate dashboard stats
  const totalProducts = myProducts.length;
  const availableProducts = myProducts.filter((p: any) => p.is_available).length;
  const outOfStockProducts = myProducts.filter((p: any) => p.available_quantity === 0).length;
  const totalInventoryValue = myProducts.reduce((sum: number, product: any) => 
    sum + (product.price_per_unit * product.available_quantity), 0
  );

  // Order statistics
  const pendingOrders = farmerOrders.filter(order => order.status === 'pending').length;
  const totalRevenue = farmerOrders
    .filter(order => order.payment_status === 'paid')
    .reduce((sum, order) => sum + order.total_amount, 0);

  // Product management handlers
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    dispatch(fetchMyProducts({ page: 1, limit: 100 }));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      processing: 'bg-purple-500',
      shipped: 'bg-indigo-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  if (!user || user?.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            {!user ? 'Please log in to access the farmer dashboard.' : `Only farmers can access this dashboard. Your role is: ${user.role}`}
          </p>
          {!user && (
            <Link
              to="/login"
              className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium"
            >
              Login to Continue
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (farmsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner text="Loading your farms..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Farmer Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome back, {user.name}! 👋</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
              <button className="p-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 rounded-2xl bg-white/60 backdrop-blur-sm p-2 border border-gray-200/50 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-white text-green-700 shadow-sm border border-green-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'products'
                  ? 'bg-white text-green-700 shadow-sm border border-green-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                {totalProducts}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'orders'
                  ? 'bg-white text-green-700 shadow-sm border border-green-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Orders</span>
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                {pendingOrders}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-white text-green-700 shadow-sm border border-green-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Farms</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{farmData.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                  <span>Active</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                  <span>{availableProducts} available</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{pendingOrders}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-orange-600 font-medium">
                  <span>Needs attention</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                  <span>All time</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setShowProductForm(true);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Plus className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Add New Product</p>
                        <p className="text-sm text-gray-500">Create a new product listing</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </button>

                  <Link
                    to="/dashboard/farmer/orders"
                    className="block w-full"
                  >
                    <div className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Manage Orders</p>
                          <p className="text-sm text-gray-500">View and process orders</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Link>

                  <button
                    onClick={() => setActiveTab('products')}
                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Manage Products</p>
                        <p className="text-sm text-gray-500">Edit inventory and pricing</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <Link
                    to="/dashboard/farmer/orders"
                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner text="Loading orders..." />
                  </div>
                ) : farmerOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-300 mb-3">
                      <ShoppingCart className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500 mb-2">No recent orders</p>
                    <p className="text-sm text-gray-400">Orders will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {farmerOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-green-200 hover:bg-green-50 transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`}></div>
                          <div>
                            <p className="font-medium text-gray-900">#{order.order_number}</p>
                            <p className="text-sm text-gray-500">{order.buyer_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{order.total_amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 capitalize">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Farms Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Your Farms</h3>
                <button className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-1">
                  <Plus className="w-4 h-4" />
                  <span>Add Farm</span>
                </button>
              </div>

              {farmData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-300 mb-3">
                    <TrendingUp className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500 mb-2">No farms found</p>
                  <p className="text-sm text-gray-400 mb-4">Create your first farm to get started</p>
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                    Create Your First Farm
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farmData.map((farm: any) => (
                    <div key={farm.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all duration-200 group">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{farm.name}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          farm.verification_status === 'verified' 
                            ? 'bg-green-100 text-green-800'
                            : farm.verification_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {farm.verification_status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{farm.location}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Active</span>
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium group-hover:underline transition-all">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            {/* Products Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                  <p className="text-gray-600">Manage your farm products and inventory</p>
                </div>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="mt-4 lg:mt-0 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Products Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Products</p>
                    <p className="text-3xl font-bold mt-2">{totalProducts}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Available</p>
                    <p className="text-3xl font-bold mt-2">{availableProducts}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Out of Stock</p>
                    <p className="text-3xl font-bold mt-2">{outOfStockProducts}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Inventory Value</p>
                    <p className="text-3xl font-bold mt-2">₹{totalInventoryValue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner text="Loading products..." />
                </div>
              ) : (
                <ProductList
                  products={myProducts}
                  loading={false}
                  onEdit={handleEditProduct}
                  showActions={true}
                />
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <FarmerOrdersPage />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Farm Analytics</h2>
              <p className="text-gray-600">Coming soon - Detailed analytics and insights</p>
            </div>
            
            {/* Placeholder for analytics content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-green-200" />
                  <h3 className="text-xl font-bold mb-2">Sales Performance</h3>
                  <p className="text-green-100">Detailed sales analytics coming soon</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-purple-200" />
                  <h3 className="text-xl font-bold mb-2">Customer Insights</h3>
                  <p className="text-purple-100">Customer behavior analytics coming soon</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {(showProductForm || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={handleCloseProductForm}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>
              <ProductForm
                product={editingProduct || undefined}
                categories={categoryOptions}
                farms={farmData}
                onSubmit={handleCloseProductForm}
                onCancel={handleCloseProductForm}
                loading={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;