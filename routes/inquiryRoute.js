import express from "express";
import multer from "multer";
import fs from "fs";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyEmployeeToken } from "../middlewares/roleMiddleware.js";
import { addInquiry, deleteInquiry, getEnquiries, createManualInquiry, getAllManualInquiries, getManualInquiryById, updateManualInquiry, deleteManualInquiry, assignInquiry, updateInquiryStatus, bulkUploadManualInquiries, bulkFixManualInquiries } from "../controllers/inquiryController.js";

// Ensure uploads directory exists
const uploadsDir = "uploads/inquiries";
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/inquiries/");
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const sanitizedName = file.originalname
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .toLowerCase();
        cb(null, `${timestamp}-${sanitizedName}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel", // .xls
            "text/csv" // .csv
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only Excel files (.xlsx, .xls) and CSV files are allowed"));
        }
    }
});

const router = express.Router();

// Add inquiry (works for both logged-in users and guests)
router.post("/add", addInquiry);

// Get enquiries with filters
router.get("/get-enquiries", getEnquiries);

// Assign inquiry to employee
router.post("/assign/:id", assignInquiry);

// Update inquiry status
router.put("/status/:id", updateInquiryStatus);

// Delete inquiry
router.delete("/delete/:id", verifyToken, deleteInquiry);


//  Create (with authentication)
router.post("/create", verifyEmployeeToken, createManualInquiry);

//  Get All
router.get("/all", getAllManualInquiries);

//  Get by ID
router.get("/:id", getManualInquiryById);

//  Update
router.put("/update/:id", updateManualInquiry);

//  Delete
router.delete("/delete/:id", deleteManualInquiry);

// Bulk Upload Manual Inquiries
router.post("/bulk-upload", upload.single("file"), bulkUploadManualInquiries);

// Bulk Fix Manual Inquiries
router.post("/bulk-fix", bulkFixManualInquiries);

export default router;
