// import express from "express";
// import {
//   createBlog,
//   getAllBlogs,
//   getBlogById,
//   updateBlog,
//   deleteBlog,
//   getFeaturedBlogs,
//   getBlogsByType,
//   getMyBlogs,
//   toggleFeatured
// } from "../controllers/blogController.js";
// import { verifyEmployeeToken, checkPermission } from "../middlewares/roleMiddleware.js";
// import { upload } from "../middlewares/multer.js";

// const router = express.Router();

// // Public routes (no authentication required)
// router.get("/featured", getFeaturedBlogs);
// router.get("/type/:type", getBlogsByType);
// router.get("/:id", getBlogById); // Get by ID or slug

// // Protected routes (require employee authentication and blog management permission)
// router.post(
//   "/",
//   verifyEmployeeToken,
//   checkPermission('blog_management', 'create'),
//   upload.fields([
//     { name: 'featuredImage', maxCount: 1 },
//     { name: 'images', maxCount: 10 }
//   ]),
//   createBlog
// );

// router.get(
//   "/",
//   getAllBlogs
// );

// router.get(
//   "/my/blogs",
//   verifyEmployeeToken,
//   checkPermission('blog_management', 'read'),
//   getMyBlogs
// );

// router.put(
//   "/:id",
//   verifyEmployeeToken,
//   checkPermission('blog_management', 'update'),
//   upload.fields([
//     { name: 'featuredImage', maxCount: 1 },
//     { name: 'images', maxCount: 10 }
//   ]),
//   updateBlog
// );

// router.delete(
//   "/:id",
//   verifyEmployeeToken,
//   checkPermission('blog_management', 'delete'),
//   deleteBlog
// );

// router.patch(
//   "/:id/featured",
//   verifyEmployeeToken,
//   checkPermission('blog_management', 'update'),
//   toggleFeatured
// );

// export default router;


import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getFeaturedBlogs,
  getBlogsByType,
  getMyBlogs,
  toggleFeatured
} from "../controllers/blogController.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/featured", getFeaturedBlogs);
router.get("/type/:type", getBlogsByType);
router.get("/:id", getBlogById);

// Protected routes - Only Admin can manage blogs

router.post(
  "/",
  verifyAdminToken,
  upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  createBlog
);

router.get(
  "/",
  getAllBlogs
);

router.get(
  "/my/blogs",
  verifyAdminToken,
  getMyBlogs
);

router.put(
  "/:id",
  verifyAdminToken,
  upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  updateBlog
);

router.delete(
  "/:id",
  verifyAdminToken,
  deleteBlog
);

router.patch(
  "/:id/featured",
  verifyAdminToken,
  toggleFeatured
);

export default router;

