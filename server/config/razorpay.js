// config/razorpay.js
import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Verify Razorpay webhook signature
export const verifyWebhookSignature = (body, signature) => {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return expectedSignature === signature;
};

// Utility functions for Razorpay operations
export const razorpayUtils = {
  // Create Razorpay order
  createOrder: async (orderData) => {
    try {
      const options = {
        amount: Math.round(orderData.amount * 100), // Convert to paise
        currency: orderData.currency || 'INR',
        receipt: orderData.receipt,
        notes: orderData.notes || {},
        payment_capture: 1 // Auto capture payment
      };

      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw new Error(`Failed to create Razorpay order: ${error.error.description}`);
    }
  },

  // Fetch payment details
  fetchPayment: async (paymentId) => {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Razorpay fetch payment error:', error);
      throw new Error(`Failed to fetch payment: ${error.error.description}`);
    }
  },

  // Initiate refund
  initiateRefund: async (paymentId, refundData) => {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: Math.round(refundData.amount * 100),
        notes: refundData.notes || {}
      });
      return refund;
    } catch (error) {
      console.error('Razorpay refund error:', error);
      throw new Error(`Failed to process refund: ${error.error.description}`);
    }
  },

  // Fetch refund details
  fetchRefund: async (refundId) => {
    try {
      const refund = await razorpay.refunds.fetch(refundId);
      return refund;
    } catch (error) {
      console.error('Razorpay fetch refund error:', error);
      throw new Error(`Failed to fetch refund: ${error.error.description}`);
    }
  }
};

export default razorpay;