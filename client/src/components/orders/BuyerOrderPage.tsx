import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Order } from '../../types/order';

const BuyerOrdersPage: React.FC = () => {
  const { 
    orders, 
    loading, 
    error,
    fetchMyOrders, 
    updateOrderStatus,
    clearError 
  } = useOrders();
  
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const statusFilter = selectedStatus === 'all' ? undefined : selectedStatus as Order['status'];
    fetchMyOrders({ status: statusFilter });
  }, [fetchMyOrders, selectedStatus]);

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      try {
        await updateOrderStatus(orderId, { status: 'cancelled' });
      } catch (error) {
        console.error('Failed to cancel order:', error);
        alert('Failed to cancel order. Please try again.');
      }
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Order['payment_status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // FIXED: Ensure numbers are properly converted
  const formatAmount = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCancelOrder = (order: Order) => {
    return order.status === 'pending' || order.status === 'confirmed';
  };

  const getOrderActions = (order: Order) => {
    const actions = [];
    
    actions.push(
      <button
        key="view-details"
        onClick={() => toggleOrderDetails(order.id)}
        className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
      >
        <span>{expandedOrder === order.id ? '▼' : '▶'}</span>
        <span>View Details</span>
      </button>
    );

    if (canCancelOrder(order)) {
      actions.push(
        <button
          key="cancel-order"
          onClick={() => handleCancelOrder(order.id)}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Cancel Order
        </button>
      );
    }

    if (order.status === 'delivered') {
      actions.push(
        <button
          key="download-invoice"
          onClick={() => alert('Invoice download feature coming soon!')}
          className="text-sm text-green-600 hover:text-green-800"
        >
          Download Invoice
        </button>
      );
    }

    if (order.farmer_email) {
      actions.push(
        <a
          key="contact-farmer"
          href={`mailto:${order.farmer_email}?subject=Regarding Order ${order.order_number}`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Contact Farmer
        </a>
      );
    }

    actions.push(
      <Link
        key="view-order-page"
        to={`/orders/${order.id}`}
        className="text-sm text-purple-600 hover:text-purple-800"
      >
        View Order Page
      </Link>
    );

    return actions;
  };

  const statusFilters = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { value: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner text="Loading your orders..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2">Track and manage your orders</p>
            </div>
            <Link
              to="/products"
              className="mt-4 md:mt-0 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading orders</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h2>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === filter.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">
                {selectedStatus === 'all' 
                  ? "You haven't placed any orders yet."
                  : `No ${selectedStatus} orders found.`
                }
              </p>
              <Link
                to="/products"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.order_number}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                          Payment: {order.payment_status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Placed on {formatDateTime(order.created_at)}</p>
                        <p>Farmer: {order.farmer_name || 'Unknown Farmer'}</p>
                        {order.delivery_date && (
                          <p>Expected Delivery: {formatDate(order.delivery_date)}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 lg:mt-0 lg:text-right">
                      {/* FIXED: Use formatAmount to handle string numbers */}
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{formatAmount(order.total_amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-wrap gap-3">
                    {getOrderActions(order)}
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order.id && (
                  <div className="p-6">
                    {/* Delivery Information */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Delivery Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700"><strong>Address:</strong> {order.delivery_address}</p>
                        {order.delivery_date && (
                          <p className="text-gray-700 mt-1">
                            <strong>Delivery Date:</strong> {formatDate(order.delivery_date)}
                          </p>
                        )}
                        {order.special_instructions && (
                          <p className="text-gray-700 mt-1">
                            <strong>Instructions:</strong> {order.special_instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {item.images && item.images.length > 0 ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.product_name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <span className="text-gray-400">📦</span>
                                </div>
                              )}
                              <div>
                                <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                                <p className="text-sm text-gray-600">
                                  {item.quantity} × ₹{formatAmount(item.unit_price)} per {item.unit_type}
                                </p>
                                {item.farm_name && (
                                  <p className="text-xs text-gray-500">Farm: {item.farm_name}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              {/* FIXED: Use formatAmount for item total_price */}
                              <p className="font-semibold text-gray-900">
                                ₹{formatAmount(item.total_price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Order Timeline</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">Order placed</span>
                          <span className="text-gray-400">{formatDateTime(order.created_at)}</span>
                        </div>
                        {order.updated_at !== order.created_at && (
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Last updated</span>
                            <span className="text-gray-400">{formatDateTime(order.updated_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help with Your Orders?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">📞</div>
              <h4 className="font-medium text-gray-900 mb-1">Contact Support</h4>
              <p className="text-sm text-gray-600">Get help with your orders</p>
              <button className="mt-2 text-green-600 text-sm hover:text-green-700">Contact Us</button>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">📋</div>
              <h4 className="font-medium text-gray-900 mb-1">Order Policies</h4>
              <p className="text-sm text-gray-600">Learn about cancellations & returns</p>
              <button className="mt-2 text-green-600 text-sm hover:text-green-700">View Policies</button>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">⭐</div>
              <h4 className="font-medium text-gray-900 mb-1">Rate Products</h4>
              <p className="text-sm text-gray-600">Share your experience</p>
              <button className="mt-2 text-green-600 text-sm hover:text-green-700">Write Reviews</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerOrdersPage;