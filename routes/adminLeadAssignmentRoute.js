import express from "express";
import {
  assignLeadsToEmployee,
  getEmployeeLeads,
  getAllLeadAssignments,
  updateLeadStatus,
  unassignLeads,
  getAvailableEmployees,
  getSoldLeadAssignments,
  getChatbotLeads,
  updateChatbotLeadStatus,
  bulkAutoAssignToTeamLeaders,
  assignAllUnassignedEnquiries
} from "../controllers/leadAssignmentController.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";
import { verifyEmployeeToken } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Combined middleware: Allow both Admin and Employee (Team Leaders)
const verifyAdminOrEmployee = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  console.log('🔐 verifyAdminOrEmployee middleware called');
  console.log('📋 Token exists:', !!token);
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Try to decode and verify the token
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    
    console.log('✅ Token decoded:', { id: decoded.id, role: decoded.role });
    
    // Check if it's an admin token
    if (decoded.role === 'admin') {
      console.log('👑 Admin token detected');
      const { default: Admin } = await import('../models/adminAuthSchema.js');
      const admin = await Admin.findById(decoded.id);
      
      if (admin) {
        req.user = admin;
        req.admin = admin;
        console.log('✅ Admin authenticated:', admin.email);
        return next();
      }
    }
    
    // Otherwise, try employee authentication
    console.log('👤 Checking employee authentication...');
    const { default: Employee } = await import('../models/employeeSchema.js');
    const employee = await Employee.findById(decoded.id)
      .populate('role', 'name permissions isActive')
      .select('-password');
    
    if (employee && employee.isActive) {
      req.employee = employee;
      req.permissions = employee.role?.permissions || [];
      console.log('✅ Employee authenticated:', employee.name, '- Role:', employee.role?.name);
      return next();
    }
    
    console.log('❌ Authentication failed: No valid admin or employee found');
    return res.status(401).json({ 
      message: "Authentication failed. Please login again.",
      error: "Invalid token or inactive account"
    });
    
  } catch (error) {
    console.error('❌ Token verification error:', error);
    return res.status(401).json({ 
      message: "Authentication failed. Please login again.",
      error: error.message
    });
  }
};

// Admin routes - require admin or employee authentication
router.use(verifyAdminOrEmployee);

// Assign leads to employee
router.post("/assign", assignLeadsToEmployee);

// Get all lead assignments (admin view)
router.get("/all", getAllLeadAssignments);

// Get sold lead assignments
router.get("/sold", getSoldLeadAssignments);

// Get chatbot leads
router.get("/chatbot", getChatbotLeads);

// Update chatbot lead status
router.put("/chatbot/status/:leadId", updateChatbotLeadStatus);

// Get available employees for assignment
router.get("/available-employees", getAvailableEmployees);

// Get leads for specific employee
router.get("/employee/:employeeId", getEmployeeLeads);

// Update lead status
router.put("/status/:assignmentId", updateLeadStatus);

// Unassign leads
router.post("/unassign", unassignLeads);

// Bulk auto-assign to Team Leaders (Round Robin)
router.post("/auto-assign-tl", bulkAutoAssignToTeamLeaders);

// One-time migration: Assign all existing unassigned enquiries
router.post("/migrate-assign-all", assignAllUnassignedEnquiries);

export default router;