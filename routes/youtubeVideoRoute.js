import express from "express";
import {
  addYoutubeVideo,
  getAllYoutubeVideos,
  getYoutubeVideoById,
  updateYoutubeVideo,
  deleteYoutubeVideo,
  toggleVideoStatus,
} from "../controllers/youtubeVideoController.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";
import { verifyEmployeeToken, checkPermission } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public routes - anyone can view
router.get("/", getAllYoutubeVideos);
router.get("/:id", getYoutubeVideoById);

// Protected routes - Admin or Employee with 'content-management' permissions
// Admin routes (full access)
router.post("/admin/add", verifyAdminToken, addYoutubeVideo);
router.put("/admin/update/:id", verifyAdminToken, updateYoutubeVideo);
router.delete("/admin/delete/:id", verifyAdminToken, deleteYoutubeVideo);
router.patch("/admin/toggle-status/:id", verifyAdminToken, toggleVideoStatus);

// Employee routes (role-based permissions)
router.post("/add", verifyEmployeeToken, checkPermission('content-management', 'create'), addYoutubeVideo);
router.put("/update/:id", verifyEmployeeToken, checkPermission('content-management', 'update'), updateYoutubeVideo);
router.delete("/delete/:id", verifyEmployeeToken, checkPermission('content-management', 'delete'), deleteYoutubeVideo);
router.patch("/toggle-status/:id", verifyEmployeeToken, checkPermission('content-management', 'update'), toggleVideoStatus);

export default router;
