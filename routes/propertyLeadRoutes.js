import express from "express";
import { createLead, getLeads } from "../controllers/propertyLeadController.js";

const router = express.Router();

router.post("/create", createLead);
router.get("/all", getLeads);

export default router;
