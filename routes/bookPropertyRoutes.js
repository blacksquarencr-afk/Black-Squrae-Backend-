import express from "express";
import { createEnquiry, getAllEnquiries } from "../controllers/bookPropertyController.js";

const router = express.Router();

// POST - Create Enquiry
router.post("/enquiry", createEnquiry);

// GET - Get All Enquiries
router.get("/", getAllEnquiries);

export default router;