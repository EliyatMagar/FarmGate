import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const razorpayUtils = {
  createOrder: async (amount, currency = "INR", receipt) => {
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
      payment_capture: 1,
    };
    try {
      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new Error(
        `Failed to create Razorpay order: ${error?.error?.description || error.message}`
      );
    }
  },

  verifyPaymentSignature: (razorpayOrderId, razorpayPaymentId, signature) => {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    return expectedSignature === signature;
  },

  verifyWebhookSignature: (payload, signature) => {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest("hex");
    return expectedSignature === signature;
  },

  fetchPayment: async (paymentId) => {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      throw new Error(
        `Failed to fetch Razorpay payment: ${error?.error?.description || error.message}`
      );
    }
  },

  initiateRefund: async (paymentId, amount) => {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount * 100,
      });
      return refund;
    } catch (error) {
      throw new Error(
        `Failed to initiate Razorpay refund: ${error?.error?.description || error.message}`
      );
    }
  },

  fetchRefund: async (refundId) => {
    try {
      const refund = await razorpay.refunds.fetch(refundId);
      return refund;
    } catch (error) {
      throw new Error(
        `Failed to fetch Razorpay refund: ${error?.error?.description || error.message}`
      );
    }
  },
};
