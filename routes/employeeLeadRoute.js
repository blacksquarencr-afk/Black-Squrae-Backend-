import express from "express";
import {
  getEmployeeLeads,
  updateLeadStatus,
  getAvailableEmployees,
  assignLeadsToEmployee
} from "../controllers/leadAssignmentController.js";
import { verifyEmployeeToken } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Employee routes - require employee authentication
router.use(verifyEmployeeToken);

// Get leads assigned to logged-in employee (supports query params)
router.get("/", async (req, res) => {
  try {
    // Get employee ID from the authenticated employee
    const employeeId = req.employee._id;
    
    // Call the controller with employee ID
    req.params.employeeId = employeeId;
    await getEmployeeLeads(req, res);
  } catch (error) {
    console.error("Error fetching employee leads:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch leads",
      error: error.message 
    });
  }
});

// Alias route for backward compatibility
router.get("/my-leads", async (req, res) => {
  try {
    // Get employee ID from the authenticated employee
    const employeeId = req.employee._id;
    
    // Call the controller with employee ID
    req.params.employeeId = employeeId;
    await getEmployeeLeads(req, res);
  } catch (error) {
    console.error("Error fetching employee leads:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch leads",
      error: error.message 
    });
  }
});

// Get available employees for assignment
router.get("/available-employees", getAvailableEmployees);

// Get leads for team members reporting to this employee
router.get("/team-leads", async (req, res) => {
  try {
    const currentEmployeeId = req.employee._id;
    
    // Import models
    const { default: Employee } = await import("../models/employeeSchema.js");
    const { default: LeadAssignment } = await import("../models/leadAssignmentSchema.js");
    
    // Get employees reporting to current employee
    const reportingEmployees = await Employee.find({ 
      reportingTo: currentEmployeeId 
    }).select('_id name email');
    
    const reportingEmployeeIds = reportingEmployees.map(emp => emp._id);
    
    console.log(`Team Leader ${req.employee.name} (${currentEmployeeId}) - Team members:`, reportingEmployeeIds.length);
    
    // Get all lead assignments for these employees
    const limit = parseInt(req.query.limit) || 5000;
    const assignments = await LeadAssignment.find({
      employeeId: { $in: reportingEmployeeIds }
    })
      .populate('employeeId', 'name email phone role')
      .populate('assignedBy', 'fullName email')
      .populate('enquiryId')  // Populate enquiry data for deals display
      .sort({ assignedDate: -1 })
      .limit(limit);
    
    console.log(`Found ${assignments.length} lead assignments for team members`);
    
    res.status(200).json({
      success: true,
      data: assignments,
      count: assignments.length
    });
  } catch (error) {
    console.error("Error fetching team leads:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch team leads",
      error: error.message 
    });
  }
});

// Get follow-ups for team members reporting to this employee
router.get("/team-followups", async (req, res) => {
  try {
    const currentEmployeeId = req.employee._id;
    
    // Import models
    const { default: Employee } = await import("../models/employeeSchema.js");
    const { default: LeadAssignment } = await import("../models/leadAssignmentSchema.js");
    const { default: FollowUp } = await import("../models/followUpSchema.js");
    
    // Get employees reporting to current employee
    const reportingEmployees = await Employee.find({ 
      reportingTo: currentEmployeeId 
    }).select('_id');
    
    const reportingEmployeeIds = reportingEmployees.map(emp => emp._id);
    
    console.log(`Team Leader ${req.employee.name} - Fetching follow-ups for ${reportingEmployeeIds.length} team members`);
    
    // Get all lead assignments for these employees
    const teamLeadAssignments = await LeadAssignment.find({
      employeeId: { $in: reportingEmployeeIds }
    }).select('_id');
    
    const teamLeadIds = teamLeadAssignments.map(lead => lead._id);
    
    // Get follow-ups for these lead assignments
    const limit = parseInt(req.query.limit) || 5000;
    const followUps = await FollowUp.find({
      leadId: { $in: teamLeadIds },
      leadType: 'LeadAssignment'
    })
      .populate('leadId')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    console.log(`Found ${followUps.length} follow-ups for team members`);
    
    res.status(200).json({
      success: true,
      data: followUps,
      count: followUps.length
    });
  } catch (error) {
    console.error("Error fetching team follow-ups:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch team follow-ups",
      error: error.message 
    });
  }
});

// Get site visits for team members reporting to this employee
router.get("/team-sitevisits", async (req, res) => {
  try {
    const currentEmployeeId = req.employee._id;
    
    // Import models
    const { default: Employee } = await import("../models/employeeSchema.js");
    const { default: SiteVisit } = await import("../models/siteVisitSchema.js");
    
    // Get employees reporting to current employee
    const reportingEmployees = await Employee.find({ 
      reportingTo: currentEmployeeId 
    }).select('_id');
    
    const reportingEmployeeIds = reportingEmployees.map(emp => emp._id);
    
    console.log(`Team Leader ${req.employee.name} - Fetching site visits for ${reportingEmployeeIds.length} team members`);
    
    // Get site visits for these employees
    const limit = parseInt(req.query.limit) || 5000;
    const siteVisits = await SiteVisit.find({
      assignedTo: { $in: reportingEmployeeIds }
    })
      .populate('assignedTo', 'name email phone role')
      .populate('property')
      .sort({ visitDate: -1 })
      .limit(limit);
    
    console.log(`Found ${siteVisits.length} site visits for team members`);
    
    res.status(200).json({
      success: true,
      data: siteVisits,
      count: siteVisits.length
    });
  } catch (error) {
    console.error("Error fetching team site visits:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch team site visits",
      error: error.message 
    });
  }
});

// Assign leads to employee
router.post("/assign", assignLeadsToEmployee);

// Update lead status (employee can update their assigned leads)
router.put("/status/:assignmentId", async (req, res) => {
  try {
    // Verify the lead is assigned to this employee
    const { default: LeadAssignment } = await import("../models/leadAssignmentSchema.js");
    const assignment = await LeadAssignment.findById(req.params.assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: "Lead assignment not found" 
      });
    }
    
    // Controller will handle the complex role-based authorization for updates
    // (checking if user is the assignee, their team leader, or sales head)
    
    // Call the controller to update status
    await updateLeadStatus(req, res);
  } catch (error) {
    console.error("Error updating lead status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update lead status",
      error: error.message 
    });
  }
});

export default router;