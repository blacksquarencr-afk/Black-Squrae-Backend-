import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getProductsByCategory
} from "../controllers/categoryController.js";

const router = express.Router();

// Public routes
router.get("/tree", getCategoryTree);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.get("/:categoryId/products", getProductsByCategory);

// Admin routes
router.post("/", verifyToken, createCategory);
router.put("/:id", verifyToken, updateCategory);
router.delete("/:id", verifyToken, deleteCategory);

export default router;