import express from "express";
import { getAllProperties, getAllOtherProperties, getPropertiesByCategory, getPropertiesByMainCategory, getSubCategoryCounts, getPropertyById, trackPropertyView, getPropertiesByUserId, getPropertiesByCustomUserId } from "../controllers/getControllers.js";
// import { getAllRentProperties } from "../controllers/buyControllers.js";
// import { getSubCategoryCounts } from "../controllers/statsController.js";
const router = express.Router();
import { verifyToken } from '../middlewares/authMiddleware.js';

// Get all properties
router.get("/all", getAllProperties);

// Track property view (increment view count)
router.post("/:id/view", trackPropertyView);

// get all properties added by other users
router.get("/allOther", verifyToken, getAllOtherProperties);

//sub-category-based properties
router.get("/category/:category", verifyToken, getPropertiesByCategory);

//main category-based properties[Residential , Commercial]
router.get("/main-category/:mainCategory", getPropertiesByMainCategory);

// Get counts of properties in each sub-category
router.get("/sub-category-counts", getSubCategoryCounts);

// Get all properties (both collections) for a specific user
router.get("/user/:userId", getPropertiesByUserId);

// Get all properties by customUserId (e.g. USR-0006)
router.get("/by-custom-user/:customUserId", getPropertiesByCustomUserId);

// Get property by ID (public access) - MOVED TO LAST
router.get("/:id", getPropertyById);



export default router;
