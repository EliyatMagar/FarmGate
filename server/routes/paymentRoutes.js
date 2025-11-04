import express from "express";
import {
  createPayment,
  verifyPayment,
  processWebhook,
  confirmCODPayment,
  getPaymentDetails,
  initiateRefund,
  getPaymentMethods,
  getPaymentStatistics,
} from "../controllers/paymentController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 💳 Create new Razorpay payment order
router.post("/create", isAuthenticatedUser, createPayment);

// ✅ Verify payment after successful checkout
router.post("/callback", verifyPayment);

// 🔔 Razorpay webhook listener
router.post("/webhook", processWebhook);

// 🧾 Confirm Cash on Delivery payment
router.post("/cod/confirm", isAuthenticatedUser, confirmCODPayment);

// 🔍 Get single payment details
router.get("/details/:orderId", isAuthenticatedUser, getPaymentDetails);

// 💸 Initiate refund
router.post("/refund", isAuthenticatedUser, initiateRefund);

// 💰 List available payment methods
router.get("/methods", getPaymentMethods);

// 📊 Get payment statistics (for admins)
router.get("/stats", isAuthenticatedUser, getPaymentStatistics);

export default router;
