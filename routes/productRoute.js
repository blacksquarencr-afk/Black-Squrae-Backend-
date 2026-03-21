import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeatured,
  bulkUpdateProducts
} from "../controllers/productController.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin routes
router.post("/", verifyToken, createProduct);
router.put("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);
router.patch("/:id/toggle-featured", verifyToken, toggleFeatured);
router.post("/bulk-update", verifyToken, bulkUpdateProducts);

export default router;