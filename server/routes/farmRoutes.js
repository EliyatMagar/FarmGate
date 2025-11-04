import express from "express";
import {
  createFarm,
  getMyFarms,
  getFarmById,
  updateFarm,
  getAllFarms,
  getPublicFarms,
  getPendingFarms,
  verifyFarm,
  rejectFarm,
  getFarmVerificationStatus
} from "../controllers/farmController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes (for buyers) - only approved farms
router.get("/public", getPublicFarms);

// Farmer routes
router.post("/", isAuthenticatedUser, authorizeRoles("farmer"), createFarm);
router.get("/my-farms", isAuthenticatedUser, authorizeRoles("farmer"), getMyFarms);
router.get("/:id", isAuthenticatedUser, authorizeRoles("farmer"), getFarmById);
router.put("/:id", isAuthenticatedUser, authorizeRoles("farmer"), updateFarm);
router.get("/:id/verification-status", isAuthenticatedUser, authorizeRoles("farmer"), getFarmVerificationStatus);

// Admin routes for farm verification
router.get("/admin/pending", isAuthenticatedUser, authorizeRoles("admin"), getPendingFarms);
router.put("/admin/verify/:id", isAuthenticatedUser, authorizeRoles("admin"), verifyFarm);
router.put("/admin/reject/:id", isAuthenticatedUser, authorizeRoles("admin"), rejectFarm);
router.get("/admin/all", isAuthenticatedUser, authorizeRoles("admin"), getAllFarms);

export default router;