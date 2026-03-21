import express from "express";
import {
  createFollowUp,
  createFollowUpFromLead,
  getAllFollowUps,
  getFollowUpsByLead,
  getMyFollowUps,
  getMyUpdatedFollowUps,
  updateFollowUpStatus,
  addFollowUpComment,
  getFollowUpStats,
  updateLeadDetails,
  deleteFollowUp
} from "../controllers/followUpController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// OPTIONS handler for preflight requests
router.options("/:followUpId/details", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

// All routes require authentication
router.use(verifyToken);

// Create new follow-up (agents, managers, admins)
router.post("/create", createFollowUp);

// Create follow-up from lead data (simplified)
router.post("/create-from-lead", createFollowUpFromLead);

// Get my follow-ups (agent view)
router.get("/my-followups", getMyFollowUps);

// Get recently updated follow-ups (agent view - sorted by update time)
router.get("/my-updated-followups", getMyUpdatedFollowUps);

// Get follow-ups for a specific lead
router.get("/lead/:leadType/:leadId", getFollowUpsByLead);

// Add comment to follow-up
router.post("/:followUpId/comment", addFollowUpComment);

// Update follow-up status (agent can update their own)
router.put("/:followUpId/status", updateFollowUpStatus);

// Update lead details within follow-up (MUST be before admin middleware)
router.put("/:followUpId/details", updateLeadDetails);
router.patch("/:followUpId/details", updateLeadDetails); // Also support PATCH method

// Test route to verify PUT is working
router.put("/test-put", (req, res) => {
  res.json({ success: true, message: "PUT request working!" });
});

// Admin/Manager only routes
router.use(verifyAdminToken);

// Get all follow-ups with filters (admin/manager view)
router.get("/all", getAllFollowUps);

// Get follow-up statistics
router.get("/stats", getFollowUpStats);

// Delete follow-up (admin only)
router.delete("/:followUpId", deleteFollowUp);

export default router;