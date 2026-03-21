import express from "express";
import {
  submitFeedback,
  getAllFeedbacks,
  getFeedbackById,
  getMyFeedbacks,
  assignFeedback,
  updateFeedbackStatus,
  addInternalNote,
  resolveFeedback,
  getMyAssignedFeedbacks,
  getFeedbackStats,
  deleteFeedback
} from "../controllers/feedbackController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyEmployeeToken, checkPermission } from "../middlewares/roleMiddleware.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Middleware to accept both admin and employee tokens
const verifyAdminOrEmployee = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided."
    });
  }

  // Try admin auth first
  try {
    await verifyAdminToken(req, res, () => {
      // Admin authenticated successfully
      req.isAdmin = true;
      next();
    });
  } catch (adminError) {
    // Try employee auth
    try {
      await verifyEmployeeToken(req, res, next);
    } catch (employeeError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token."
      });
    }
  }
};

// ============= USER ROUTES =============
// Submit feedback (requires user authentication)
router.post("/submit", verifyToken, submitFeedback);

// Get user's own feedbacks
router.get("/my-feedbacks", verifyToken, getMyFeedbacks);

// ============= EMPLOYEE ROUTES =============
// Get feedbacks assigned to the logged-in employee
router.get(
  "/assigned",
  verifyEmployeeToken,
  checkPermission("feedback-management", "read"),
  getMyAssignedFeedbacks
);

// Update feedback status (assigned employee or admin)
router.patch(
  "/:id/status",
  verifyAdminOrEmployee,
  updateFeedbackStatus
);

// Add internal note
router.post(
  "/:id/notes",
  verifyAdminOrEmployee,
  addInternalNote
);

// Resolve feedback
router.post(
  "/:id/resolve",
  verifyAdminOrEmployee,
  resolveFeedback
);

// ============= ADMIN ROUTES (Admin or Employee with permissions) =============
// Get feedback statistics (MUST be before /:id route)
router.get(
  "/stats/overview",
  verifyAdminOrEmployee,
  getFeedbackStats
);

// Get all feedbacks (with filters)
router.get(
  "/all",
  verifyAdminOrEmployee,
  getAllFeedbacks
);

// Get feedback by ID
router.get(
  "/:id",
  verifyAdminOrEmployee,
  getFeedbackById
);

// Assign feedback to employee
router.post(
  "/:id/assign",
  verifyAdminOrEmployee,
  assignFeedback
);

// Delete feedback
router.delete(
  "/:id",
  verifyAdminOrEmployee,
  deleteFeedback
);

export default router;
