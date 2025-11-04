// routes/productRoutes.js
import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
  updateProductInventory
} from "../controllers/productController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Farmer routes
router.post("/", isAuthenticatedUser, authorizeRoles("farmer"), createProduct);
router.get("/farmer/my-products", isAuthenticatedUser, authorizeRoles("farmer"), getMyProducts);
router.put("/:id", isAuthenticatedUser, authorizeRoles("farmer"), updateProduct);
router.delete("/:id", isAuthenticatedUser, authorizeRoles("farmer"), deleteProduct);
router.patch("/:id/inventory", isAuthenticatedUser, authorizeRoles("farmer"), updateProductInventory);

export default router;