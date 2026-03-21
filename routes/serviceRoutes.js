// routes/serviceRoutes.js
import express from "express";
import { createServiceRequest, getAllServiceRequests } from "../controllers/requestController.js";

const router = express.Router();

router.post("/register", createServiceRequest);
router.get("/", getAllServiceRequests);

export default router;