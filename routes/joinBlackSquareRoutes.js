import express from "express";
import {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus
} from "../controllers/joinBlackSquareController.js";

const router = express.Router();

// Create
router.post("/create", createApplication);

// Get all
router.get("/", getAllApplications);

// Get single
router.get("/:id", getApplicationById);

// Update status
router.put("/:id/status", updateApplicationStatus);

export default router;