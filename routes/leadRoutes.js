import express from "express";
import { markLeadAsSold } from "../controllers/leadController.js";
import { verifyAdminToken } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.put("/status/:id", verifyAdminToken, markLeadAsSold);

export default router;