import express from "express";
import {
  createDataRequest,
  getAllDataRequests,
  getDataRequestById,
} from "../controllers/dataIntelligenceController.js";

const router = express.Router();

// Public - anyone can submit
router.post("/create", createDataRequest);

// Admin routes
router.get("/", getAllDataRequests);
router.get("/:id", getDataRequestById);

export default router;   // ✅ VERY IMPORTANT