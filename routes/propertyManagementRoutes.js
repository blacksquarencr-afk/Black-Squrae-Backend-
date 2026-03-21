import express from "express";
import { createPropertyManagementRequest, getAllPropertyManagementRequests } from "../controllers/propertyManagementController.js";

const router = express.Router();

router.post("/register", createPropertyManagementRequest);
router.get("/", getAllPropertyManagementRequests);

export default router;