// components/orders/FarmerOrderDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Order, UpdateOrderStatusData } from '../../types/order';

const FarmerOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentOrder,
    loading,
    error,
    fetchOrderById,
    updateOrderStatus,
    clearError,
    clearCurrentOrder
  } = useOrders();

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }

    return () => {
      clearCurrentOrder();
    };
  }, [id, fetchOrderById, clearCurrentOrder]);

  useEffect(() => {
    if (error || statusUpdateError || successMessage) {
      const timer = setTimeout(() => {
        clearError();
        setStatusUpdateError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, statusUpdateError, successMessage, clearError]);

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!id || !currentOrder) return;

    setUpdatingStatus(true);
    setStatusUpdateError(null);
    setSuccessMessage(null);

    try {
      const updateData: UpdateOrderStatusData = { status: newStatus };
      await updateOrderStatus(id, updateData);
      setSuccessMessage(`Order status updated to ${newStatus} successfully!`);
      
      // Refetch the order to get updated data
      await fetchOrderById(id);
    } catch (err: any) {
      console.error('Status update error:', err);
      setStatusUpdateError(err.message || 'Failed to update order status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      processing: { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
      shipped: { color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: Order['payment_status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    };

    const config = statusConfig[paymentStatus];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextStatusOptions = (currentStatus: Order['status']): Order['status'][] => {
    const statusFlow: Record<Order['status'], Order['status'][]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };

    return statusFlow[currentStatus] || [];
  };

  if (loading && !currentOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner text="Loading order details..." />
      </div>
    );
  }

  if (!currentOrder && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard/farmer/orders')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return null;
  }

  const nextStatusOptions = getNextStatusOptions(currentOrder.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center">
                  <button
                    onClick={() => navigate('/dashboard/farmer/orders')}
                    className="text-gray-400 hover:text-gray-600 mr-4 transition-colors"
                  >
                    ← Back to Orders
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Order #{currentOrder.order_number}
                    </h1>
                    <p className="text-gray-600">Placed on {formatDate(currentOrder.created_at)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                {getStatusBadge(currentOrder.status)}
                {getPaymentStatusBadge(currentOrder.payment_status)}
              </div>
            </div>
          </div>

          {/* Success Alert */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-green-400">✅</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <p className="text-sm text-green-700 mt-1">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alerts */}
          {(error || statusUpdateError) && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error || statusUpdateError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Details & Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-4">
                  {currentOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                      {item.images && item.images.length > 0 && (
                        <img
                          src={item.images[0]}
                          alt={item.product_name}
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.product_name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.quantity} {item.unit_type} × ₹{item.unit_price}
                        </p>
                        {item.farm_name && (
                          <p className="text-sm text-gray-400">From: {item.farm_name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{item.total_price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total Amount</span>
                    <span>₹{currentOrder.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Delivery Address:</span>
                    <p className="text-sm text-gray-900 mt-1">{currentOrder.delivery_address}</p>
                  </div>
                  {currentOrder.delivery_date && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Delivery Date:</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(currentOrder.delivery_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {currentOrder.special_instructions && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Special Instructions:</span>
                      <p className="text-sm text-gray-900 mt-1">{currentOrder.special_instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Management Sidebar */}
            <div className="space-y-6">
              {/* Buyer Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Information</h2>
                <div className="flex items-center space-x-3">
                  {currentOrder.buyer_image && (
                    <img
                      src={currentOrder.buyer_image}
                      alt={currentOrder.buyer_name}
                      className="h-12 w-12 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{currentOrder.buyer_name}</h3>
                    <p className="text-sm text-gray-500">{currentOrder.buyer_email}</p>
                    {currentOrder.buyer_phone && (
                      <p className="text-sm text-gray-500">{currentOrder.buyer_phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Status Management */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Current status: <span className="font-medium capitalize">{currentOrder.status}</span>
                </p>

                {nextStatusOptions.length > 0 ? (
                  <div className="space-y-2">
                    {nextStatusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        disabled={updatingStatus}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {updatingStatus ? 'Updating...' : `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No further status updates available
                  </p>
                )}

                {/* Status Flow Indicator */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Order Status Flow</h3>
                  <div className="flex items-center justify-between text-xs">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status, index) => (
                      <div key={status} className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            currentOrder.status === status
                              ? 'bg-green-600'
                              : index <= ['pending', 'confirmed', 'processing', 'shipped', 'delivered'].indexOf(currentOrder.status)
                              ? 'bg-green-600'
                              : 'bg-gray-300'
                          }`}
                        />
                        <span className="mt-1 text-gray-600 capitalize">{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-500">{formatDate(currentOrder.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      currentOrder.status !== 'pending' ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Confirmed</p>
                      <p className="text-sm text-gray-500">
                        {currentOrder.status !== 'pending' ? formatDate(currentOrder.updated_at) : 'Pending'}
                      </p>
                    </div>
                  </div>
                  {currentOrder.status === 'delivered' && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                        <p className="text-sm text-gray-500">{formatDate(currentOrder.updated_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerOrderDetailsPage;