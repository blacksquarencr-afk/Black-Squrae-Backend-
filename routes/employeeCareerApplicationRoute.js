import express from "express";
import {
  getAllCareerApplications,
  getCareerApplicationById,
  updateApplicationStatus,
  getApplicationStatistics,
  createCareerApplication
} from "../controllers/careerApplicationController.js";
import { 
  verifyEmployeeToken, 
  checkPermission 
} from "../middlewares/roleMiddleware.js";

const router = express.Router();

// All routes require employee authentication
router.use(verifyEmployeeToken);

// Get all career applications - requires 'career-applications' read permission
router.get("/", checkPermission('career-applications', 'read'), getAllCareerApplications);

// Get application statistics - requires 'career-applications' read permission
router.get("/statistics", checkPermission('career-applications', 'read'), getApplicationStatistics);

// Get single application by ID - requires 'career-applications' read permission
router.get("/:id", checkPermission('career-applications', 'read'), getCareerApplicationById);

// Create/submit career application - requires 'career-applications' create permission
router.post("/", checkPermission('career-applications', 'create'), createCareerApplication);

// Update application status - requires 'career-applications' update permission
router.put("/:id/status", checkPermission('career-applications', 'update'), updateApplicationStatus);

export default router;
