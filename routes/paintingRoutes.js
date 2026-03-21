import express from "express";
import {
  createPaintingRequest,
  getAllPaintingRequests,
  getPaintingRequestById,
} from "../controllers/paintingController.js";

const router = express.Router();

router.post("/create", createPaintingRequest);
router.get("/", getAllPaintingRequests);
router.get("/:id", getPaintingRequestById);

export default router;   // ✅ IMPORTANT