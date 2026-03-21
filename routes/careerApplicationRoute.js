import express from "express";
import {
  createCareerApplication,
  getAllCareerApplications,
  getCareerApplicationById,
  updateApplicationStatus,
  deleteCareerApplication,
  getApplicationStatistics,
  bulkUpdateApplicationStatus
} from "../controllers/careerApplicationController.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Public route - Submit career application
router.post("/apply", createCareerApplication);

// Admin routes - Protected
router.get("/", verifyAdminToken, getAllCareerApplications);
router.get("/statistics", verifyAdminToken, getApplicationStatistics);
router.get("/:id", verifyAdminToken, getCareerApplicationById);
router.put("/:id/status", verifyAdminToken, updateApplicationStatus);
router.put("/bulk/status", verifyAdminToken, bulkUpdateApplicationStatus);
router.delete("/:id", verifyAdminToken, deleteCareerApplication);

export default router;
