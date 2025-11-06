// utils/paymentUtils.js
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeUtils = {
  createPaymentIntent: async (amount, currency = "usd", metadata = {}) => {
    try {
      console.log('Creating payment intent with:', { amount, currency });
      
      // Convert amount to smallest currency unit (cents for USD)
      let stripeAmount;
      
      switch (currency.toLowerCase()) {
        case 'usd':
        case 'aud':
        case 'cad':
        case 'sgd':
        case 'hkd':
          stripeAmount = Math.round(amount * 100); // Convert to cents
          break;
        case 'jpy':
        case 'krw':
          stripeAmount = Math.round(amount); // These currencies don't have subunits
          break;
        default:
          stripeAmount = Math.round(amount * 100); // Default: convert to smallest unit
      }

      console.log('Final Stripe amount:', stripeAmount);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: stripeAmount,
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          ...metadata,
          original_amount: amount,
          currency: currency
        },
      });
      
      console.log('✅ Payment intent created:', paymentIntent.id);
      return paymentIntent;
    } catch (error) {
      console.error('❌ Stripe Payment Intent Error:', error);
      throw new Error(`Failed to create Stripe payment intent: ${error.message}`);
    }
  },

  confirmPayment: async (paymentIntentId) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      throw new Error(`Failed to confirm Stripe payment: ${error.message}`);
    }
  },

  createRefund: async (paymentIntentId, amount, currency = "usd") => {
    try {
      let refundAmount;
      
      switch (currency.toLowerCase()) {
        case 'usd':
        case 'aud':
        case 'cad':
        case 'sgd':
        case 'hkd':
          refundAmount = Math.round(amount * 100);
          break;
        case 'jpy':
        case 'krw':
          refundAmount = Math.round(amount);
          break;
        default:
          refundAmount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: refundAmount,
      });
      return refund;
    } catch (error) {
      throw new Error(`Failed to create Stripe refund: ${error.message}`);
    }
  },

  constructWebhookEvent: (payload, signature) => {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  },
};