// routes/categoryRoutes.js
import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryOptions
} from "../controllers/categoryController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/options", getCategoryOptions);
router.get("/:id", getCategoryById);

// Admin routes
router.post("/", isAuthenticatedUser, authorizeRoles("admin"), createCategory);
router.put("/:id", isAuthenticatedUser, authorizeRoles("admin"), updateCategory);
router.delete("/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteCategory);

export default router;