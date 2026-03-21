import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.js";
import {
  uploadImage,
  uploadMultipleImages,
  deleteImage
} from "../controllers/imageUploadController.js";

const router = express.Router();

// Upload single image
router.post("/single", verifyToken, upload.single("image"), uploadImage);

// Upload multiple images (max 10)
router.post("/multiple", verifyToken, upload.array("images", 10), uploadMultipleImages);

// Delete image
router.delete("/:filename", verifyToken, deleteImage);

export default router;
