import express from "express";
import {
  postReview,
  getReviewCount,
  getPropertyReviews,
  updateReview,
  deleteReview,
  getMyReviews,
  markReviewHelpful,
  getReviewStats,
} from "../controllers/reviewController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/property/:propertyId/count", getReviewCount); // Get review count for a property
router.get("/property/:propertyId", getPropertyReviews); // Get all reviews for a property

// Protected routes (user authentication required)
router.post("/", verifyToken, postReview); // Post a review
router.put("/:reviewId", verifyToken, updateReview); // Update own review
router.delete("/:reviewId", verifyToken, deleteReview); // Delete own review
router.get("/my-reviews", verifyToken, getMyReviews); // Get user's own reviews
router.post("/:reviewId/helpful", verifyToken, markReviewHelpful); // Mark review as helpful/unhelpful

// Admin routes
router.get("/stats", verifyAdminToken, getReviewStats); // Get review statistics

export default router;
