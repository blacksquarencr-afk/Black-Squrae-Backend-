import express from "express";
import { 
    getAllListProperties, 
    addListProperty, 
    updateListProperty, 
    deleteListProperty, 
    getLocalities, 
    verifyListProperty, 
    unverifyListProperty,
    getMyListings 
} from "../controllers/list-property-controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Logging middleware for debugging
router.use((req, res, next) => {
    console.log(`🌐 List Property Route: ${req.method} ${req.path}`);
    console.log(`🌐 Full URL: ${req.originalUrl}`);
    console.log(`🌐 Query params:`, req.query);
    next();
});

// ⚠️ IMPORTANT: More specific routes MUST come before general routes

// Public endpoint - must be first
router.get("/list-property/localities", getLocalities);

// Admin-only routes for verification (MUST be before the generic :id route)
router.put("/list-property/:id/verify", verifyAdminToken, verifyListProperty);
router.put("/list-property/:id/unverify", verifyAdminToken, unverifyListProperty);

// User's own listings (MUST be before the general /list-property route)
router.get("/list-property/my-listings", verifyToken, getMyListings);

// Public/authenticated endpoints
router.get("/list-property", getAllListProperties);
router.post("/list-property", verifyToken, upload.any(), addListProperty);
router.post("/list-property/create", verifyToken, upload.any(), addListProperty);
router.put("/list-property/:id", verifyToken, upload.any(), updateListProperty);
router.delete("/list-property/:id", verifyToken, deleteListProperty);

export default router;
