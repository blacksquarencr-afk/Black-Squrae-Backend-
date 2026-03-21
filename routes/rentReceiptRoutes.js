import express from "express";
import {
  createRentReceipt,
  getAllRentReceipts,
  getRentReceiptById,
  deleteRentReceipt
} from "../controllers/rentReceiptController.js";

const router = express.Router();

// Create
router.post("/create", createRentReceipt);

// Get all
router.get("/", getAllRentReceipts);

// Get single
router.get("/:id", getRentReceiptById);

// Delete
router.delete("/:id", deleteRentReceipt);

export default router;