// routes/emailConfigRoutes.js
import express from "express";
import {
  configureEmailSettings,
  getEmailSettings,
  updateEmailSettings,
  removeEmailSettings
} from "../controllers/emailConfigController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Farmer email configuration routes
router.post("/configure", isAuthenticatedUser, authorizeRoles("farmer"), configureEmailSettings);
router.get("/settings", isAuthenticatedUser, authorizeRoles("farmer"), getEmailSettings);
router.put("/settings", isAuthenticatedUser, authorizeRoles("farmer"), updateEmailSettings);
router.delete("/settings", isAuthenticatedUser, authorizeRoles("farmer"), removeEmailSettings);

export default router;