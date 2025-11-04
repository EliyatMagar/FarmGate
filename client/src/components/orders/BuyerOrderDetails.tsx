import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Order } from '../../types/order';

const BuyerOrdersDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentOrder, 
    loading, 
    error,
    fetchOrderById,
    updateOrderStatus,
  } = useOrders();

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  const handleCancelOrder = async () => {
    if (currentOrder && window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      try {
        await updateOrderStatus(currentOrder.id, { status: 'cancelled' });
      } catch (error) {
        console.error('Failed to cancel order:', error);
        alert('Failed to cancel order. Please try again.');
      }
    }
  };

  const canCancelOrder = (order: Order) => {
    return order.status === 'pending' || order.status === 'confirmed';
  };

  // FIXED: Ensure numbers are properly converted
  const formatAmount = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading && !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner text="Loading order details..." />
        </div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-400 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error ? 'Error Loading Order' : 'Order Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The order you're looking for doesn't exist or you don't have permission to view it."}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Go Back
              </button>
              <Link
                to="/orders"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{currentOrder.order_number}</h1>
              <p className="text-gray-600 mt-1">Placed on {formatDate(currentOrder.created_at)}</p>
            </div>
            <Link
              to="/orders"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status</h2>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentOrder.status)}`}>
                    {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Last updated: {formatDate(currentOrder.updated_at)}
                  </p>
                </div>
                {canCancelOrder(currentOrder) && (
                  <button
                    onClick={handleCancelOrder}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              {/* Status Description */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {currentOrder.status === 'pending' && 'Your order has been placed and is waiting for farmer confirmation.'}
                  {currentOrder.status === 'confirmed' && 'The farmer has confirmed your order and is preparing it for delivery.'}
                  {currentOrder.status === 'processing' && 'Your order is being processed and packed by the farmer.'}
                  {currentOrder.status === 'shipped' && 'Your order has been shipped and is on its way to you.'}
                  {currentOrder.status === 'delivered' && 'Your order has been successfully delivered. Thank you for your purchase!'}
                  {currentOrder.status === 'cancelled' && 'This order has been cancelled.'}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400">📦</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × ₹{formatAmount(item.unit_price)} per {item.unit_type}
                        </p>
                        {item.farm_name && (
                          <p className="text-sm text-gray-600">Farm: {item.farm_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{formatAmount(item.total_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Information</h2>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700">Delivery Address</h4>
                  <p className="text-gray-600 mt-1">{currentOrder.delivery_address}</p>
                </div>
                {currentOrder.delivery_date && (
                  <div>
                    <h4 className="font-medium text-gray-700">Expected Delivery</h4>
                    <p className="text-gray-600 mt-1">{formatDate(currentOrder.delivery_date)}</p>
                  </div>
                )}
                {currentOrder.special_instructions && (
                  <div>
                    <h4 className="font-medium text-gray-700">Special Instructions</h4>
                    <p className="text-gray-600 mt-1">{currentOrder.special_instructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Total</span>
                  <span className="font-medium">₹{formatAmount(currentOrder.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-3">
                  <span>Total Amount</span>
                  <span>₹{formatAmount(currentOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Farmer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Farmer Information</h2>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{currentOrder.farmer_name}</p>
                <p className="text-sm text-gray-600">{currentOrder.farmer_email}</p>
                {currentOrder.farmer_phone && (
                  <p className="text-sm text-gray-600">{currentOrder.farmer_phone}</p>
                )}
                <div className="mt-3">
                  <a
                    href={`mailto:${currentOrder.farmer_email}?subject=Regarding Order ${currentOrder.order_number}`}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-center block"
                  >
                    Contact Farmer
                  </a>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-4">
                Have questions about your order? Contact our support team.
              </p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerOrdersDetailsPage;