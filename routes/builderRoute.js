import express from "express";
import multer from "multer";
import {
    createBuilder,
    getAllBuilders,
    getBuilderById,
    updateBuilder,
    deleteBuilder,
    searchBuilders,
    deactivateBuilder,
} from "../controllers/builderController.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";
import { verifyEmployeeToken } from "../middlewares/roleMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

// Middleware: Allow Admin OR Employee token
const verifyAdminOrEmployee = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    // Try admin token first
    try {
        await verifyAdminToken(req, res, () => { req._authType = 'admin'; next(); });
        return;
    } catch (e) {}

    // Try employee token
    try {
        await verifyEmployeeToken(req, res, () => { req._authType = 'employee'; next(); });
        return;
    } catch (e) {}

    return res.status(401).json({ message: "Invalid token" });
};

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/builders/");
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.originalname}`;
        cb(null, filename);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
});

// Public Routes (No Authentication Required)
// Get all builders with pagination
router.get("/all", getAllBuilders);

// Search builders
router.get("/search", searchBuilders);

// Get builder by ID
router.get("/:builderId", getBuilderById);

// Protected Routes (Admin or Employee Authentication Required)
// Create a new builder
router.post("/create", verifyAdminOrEmployee, upload.single("builderImage"), createBuilder);

// Update builder
router.put("/:builderId", verifyAdminOrEmployee, upload.single("builderImage"), updateBuilder);

// Delete builder
router.delete("/:builderId", verifyAdminOrEmployee, deleteBuilder);

// Deactivate builder (soft delete)
router.patch("/:builderId/deactivate", verifyAdminOrEmployee, deactivateBuilder);

export default router;
