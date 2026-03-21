import express from "express";
import {
    createContact,
    getAllContacts,
    getMyContacts,
    updateContact,
    deleteContact,
    assignContactToEmployee,
    assignMultipleContactsToEmployee,
    getEmployeeContacts,
    getAllContactAssignments,
    updateContactAssignmentStatus,
    unassignContact
} from "../controllers/contactController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create new inquiry (public)
router.post("/", createContact);

// Get all inquiries (admin)
router.get("/", getAllContacts);

// Get logged-in user's inquiries
router.get("/me", verifyToken, getMyContacts);

// Update logged-in user's inquiry
router.put("/:id", verifyToken, updateContact);

// Delete logged-in user's inquiry
router.delete("/:id", deleteContact);

// ========== ASSIGNMENT ROUTES ==========

// Assign single contact to employee
router.post("/assign/single", verifyToken, assignContactToEmployee);

// Assign multiple contacts to employee
router.post("/assign/multiple", verifyToken, assignMultipleContactsToEmployee);

// Get contacts assigned to employee
router.get("/assignments/employee/:employeeId", verifyToken, getEmployeeContacts);

// Get all contact assignments (admin)
router.get("/assignments/all", verifyToken, getAllContactAssignments);

// Update assignment status
router.put("/assignments/:assignmentId/status", verifyToken, updateContactAssignmentStatus);

// Unassign contact
router.delete("/assignments/:assignmentId", verifyToken, unassignContact);

export default router;
