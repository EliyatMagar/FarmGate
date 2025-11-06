// components/payment/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePayments } from '../../hooks/usePayments';

export const PaymentSuccess: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { confirmStripePayment } = usePayments();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Extract payment intent ID from URL query params
        const urlParams = new URLSearchParams(location.search);
        const paymentIntentId = urlParams.get('payment_intent');

        if (paymentIntentId) {
          // Confirm payment with backend
          await confirmStripePayment(paymentIntentId);
          setStatus('success');
          setMessage('Payment completed successfully!');
        } else {
          setStatus('error');
          setMessage('Payment information not found.');
        }
      } catch (error: any) {
        console.error('Payment confirmation error:', error);
        setStatus('error');
        setMessage(error.message || 'Payment confirmation failed.');
      }
    };

    handlePaymentSuccess();
  }, [location, confirmStripePayment]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Processing Payment...</h2>
          <p className="text-gray-600 mt-2">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-600">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Payment Failed</h2>
          <p className="text-gray-600 mt-2">{message}</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-green-600">✅</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Payment Successful!</h2>
        <p className="text-gray-600 mt-2">Your payment has been processed successfully.</p>
        <div className="mt-6 space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};