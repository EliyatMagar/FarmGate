import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  getPendingUsers,
  verifyUser,
} from "../controllers/userController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.post("/register", registerUser); // Removed upload.single - using fileUpload middleware
router.post("/login", loginUser);

// Authenticated
router.get("/me", isAuthenticatedUser, getProfile);

// Admin
router.get("/admin/pending", isAuthenticatedUser, authorizeRoles("admin"), getPendingUsers);
router.put("/admin/verify/:id", isAuthenticatedUser, authorizeRoles("admin"), verifyUser);

export default router;