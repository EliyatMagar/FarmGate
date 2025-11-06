import express from "express";
import {
  createOrder,
  createOrderAfterPayment,
  validateOrder,
  getMyOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
  getOrderStatistics
} from "../controllers/orderController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Order validation before payment
router.post("/validate", isAuthenticatedUser, authorizeRoles("buyer"), validateOrder);

// Create order after successful payment
router.post("/create-after-payment", isAuthenticatedUser, authorizeRoles("buyer"), createOrderAfterPayment);

// Create order (without payment - for backward compatibility)
router.post("/", isAuthenticatedUser, authorizeRoles("buyer"), createOrder);

// Get buyer's orders
router.get("/my-orders", isAuthenticatedUser, authorizeRoles("buyer"), getMyOrders);

// Get farmer's orders
router.get("/farmer/orders", isAuthenticatedUser, authorizeRoles("farmer"), getFarmerOrders);

// Get order statistics
router.get("/statistics", isAuthenticatedUser, getOrderStatistics);

// Get single order by ID
router.get("/:id", isAuthenticatedUser, getOrderById);

// Update order status (Farmer only)
router.put("/:id/status", isAuthenticatedUser, authorizeRoles("farmer"), updateOrderStatus);

// Update payment status
router.put("/:id/payment-status", isAuthenticatedUser, updatePaymentStatus);

// Get all orders (Admin only)
router.get("/admin/all", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

export default router;