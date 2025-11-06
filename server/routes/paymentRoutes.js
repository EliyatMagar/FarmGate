// routes/paymentRoutes.js - CORRECT VERSION
import express from "express";
import {
  createPayment,
  confirmStripePayment,
  createCODPayment,
  confirmCODPayment,
  processStripeWebhook,
  getPaymentDetails,
  initiateRefund,
  getPaymentMethods,
  getPaymentStatistics,
  getUserPayments,
  updatePaymentOrderId
} from "../controllers/paymentController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 💳 Payment creation routes
router.post("/create", isAuthenticatedUser, createPayment); // This is what your frontend is calling
router.post("/create/cod", isAuthenticatedUser, createCODPayment);

// ✅ Payment verification
router.post("/verify/stripe", confirmStripePayment);

// 🔔 Webhook
router.post("/webhook/stripe", express.raw({ type: 'application/json' }), processStripeWebhook);

// 🧾 COD confirmation
router.post("/cod/confirm", isAuthenticatedUser, authorizeRoles('farmer', 'admin'), confirmCODPayment);

// 🔍 Payment details
router.get("/details/:orderId", isAuthenticatedUser, getPaymentDetails);
router.get("/user-payments", isAuthenticatedUser, getUserPayments);

// 💸 Refunds
router.post("/refund", isAuthenticatedUser, authorizeRoles('admin'), initiateRefund);

// 💰 Payment methods
router.get("/methods", getPaymentMethods);

// 📊 Statistics
router.get("/stats", isAuthenticatedUser, authorizeRoles('admin'), getPaymentStatistics);

router.put('/update-order-id', isAuthenticatedUser, updatePaymentOrderId);

export default router;