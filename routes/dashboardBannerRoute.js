// import express from "express";
// import { updateDashboardBanner, getDashboardBanner, deleteDashboardBanner } from "../controllers/dashboardBannerController.js";
// import { verifyEmployeeToken, checkPermission } from "../middlewares/roleMiddleware.js";
// import { upload } from "../middlewares/multer.js";

// const router = express.Router();

// // Public route - Get dashboard banner
// router.get("/", getDashboardBanner);

// // Protected routes - Admin/Employee only
// router.post(
//   "/",
//   verifyEmployeeToken,
//   checkPermission("dashboard_banner", "create"),
//   upload.single("image"),
//   updateDashboardBanner
// );

// router.put(
//   "/",
//   verifyEmployeeToken,
//   checkPermission("dashboard_banner", "update"),
//   upload.single("image"),
//   updateDashboardBanner
// );

// router.delete(
//   "/",
//   verifyEmployeeToken,
//   checkPermission("dashboard_banner", "delete"),
//   deleteDashboardBanner
// );

// export default router;


import express from "express";
import { updateDashboardBanner, getDashboardBanner, deleteDashboardBanner } from "../controllers/dashboardBannerController.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// Public route - Anyone can view banner
router.get("/", getDashboardBanner);

// Protected routes - Only Admin can manage banners

router.post(
  "/",
  verifyAdminToken,
  upload.single("image"),
  updateDashboardBanner
);

router.put(
  "/",
  verifyAdminToken,
  upload.single("image"),
  updateDashboardBanner
);

router.delete(
  "/",
  verifyAdminToken,
  deleteDashboardBanner
);

export default router;
