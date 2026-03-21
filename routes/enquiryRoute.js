import express from "express";
import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  assignEnquiry,
  updateEnquiryStatus,
  addCommunication,
  resolveEnquiry,
  getMyEnquiries,
  getEnquiryAnalytics,
  createWomenPropertyEnquiry,
  getWomenPropertyEnquiries,
  getMyWomenPropertyEnquiries,
  getEmployeeEnquiries,
  createPropertyManagementEnquiry
} from "../controllers/enquiryController.js";
import {
  getEnquiriesByType,
  getAnalyticsByType,
  assignEnquiryPermissions,
  getEmployeeEnquiryPermissions
} from "../controllers/enquiryRoleController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";
import { verifyEmployeeToken } from "../middlewares/roleMiddleware.js";
import { verifyAnyToken } from "../middlewares/verifyAnyToken.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// Public routes (Guest enquiries)
router.post("/create", upload.any(), createEnquiry);

// Property management enquiry route
router.post("/property-management", createPropertyManagementEnquiry);

// Women property enquiry routes
router.post("/women-property", createWomenPropertyEnquiry);
router.get("/women-property", verifyAdminToken, getWomenPropertyEnquiries);
router.get("/women-property/my-enquiries", verifyEmployeeToken, getMyWomenPropertyEnquiries);

// User/Employee routes
router.get("/my-enquiries", verifyToken, getMyEnquiries);
router.get("/employee/assigned-enquiries", verifyEmployeeToken, getEmployeeEnquiries);
router.get("/:id", verifyAnyToken, getEnquiryById);
router.post("/:id/communication", verifyAnyToken, addCommunication);
router.put("/:id/status", verifyAnyToken, updateEnquiryStatus);
router.put("/:id/resolve", verifyAnyToken, resolveEnquiry);

// Admin only routes
router.get("/", verifyAdminToken, getAllEnquiries);
router.put("/:id/assign", verifyAdminToken, assignEnquiry);
router.get("/analytics/dashboard", verifyAdminToken, getEnquiryAnalytics);

// Role-based enquiry type routes (Admin/Employee with permissions)
router.get("/type/:enquiryType", verifyToken, getEnquiriesByType);
router.get("/type/:enquiryType/analytics", verifyToken, getAnalyticsByType);

// Role management routes (Admin only)
router.put("/role/:roleId/permissions", verifyAdminToken, assignEnquiryPermissions);
router.get("/employee/:employeeId/permissions", verifyAdminToken, getEmployeeEnquiryPermissions);

export default router;