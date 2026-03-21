import express from "express";
import { getAllListProperties, addListProperty, getLocalities } from "../controllers/listPropertyController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Simple destination for now

// Public route - no auth needed for autocomplete
router.get("/list-property/localities", getLocalities);

// Public route - allow fetching properties without token
router.get("/list-property", getAllProperties);

// Protected routes - require authentication
router.post("/list-property", verifyToken, upload.array("photos"), addListProperty);

export default router;
