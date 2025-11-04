// routes/orderRoutes.js
import express from "express";
import {
  createOrder,
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

// Buyer routes
router.post("/", isAuthenticatedUser, authorizeRoles("buyer"), createOrder);
router.get("/my-orders", isAuthenticatedUser, authorizeRoles("buyer"), getMyOrders);

// Farmer routes
router.get("/farmer/orders", isAuthenticatedUser, authorizeRoles("farmer"), getFarmerOrders);
router.put("/:id/status", isAuthenticatedUser, authorizeRoles("farmer"), updateOrderStatus);

// Shared routes
router.get("/statistics", isAuthenticatedUser, getOrderStatistics);
router.get("/:id", isAuthenticatedUser, getOrderById);
router.put("/:id/payment-status", isAuthenticatedUser, updatePaymentStatus);

// Admin routes
router.get("/admin/all", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

export default router;