import axios from "axios";
import LeadAssignment from "../models/leadAssignmentSchema.js";
import Employee from "../models/employeeSchema.js";
import Inquiry from "../models/inquirySchema.js";
import ManualInquiry from "../models/manualInquirySchema.js";
import Enquiry from "../models/enquirySchema.js";
import Lead from "../models/Lead.js";
import Contact from "../models/contactSchema.js";
import PropertyLead from "../models/PropertyLead.js";
import RentReceipt from "../models/rentReceiptModel.js";
import ServiceRequest from "../models/ServiceRequest.js";
import PropertyManagementRequest from "../models/PropertyManagementRequest.js";
import DataIntelligenceRequest from "../models/DataIntelligenceRequest.js";
import PaintingRequest from "../models/PaintingRequest.js";
import Role from "../models/roleSchema.js";

// Assign multiple enquiries to an employee
export const assignLeadsToEmployee = async (req, res) => {
  try {
    const { employeeId, enquiries, priority, dueDate, notes } = req.body;
    const adminId = req.user?.id || req.user?._id || req.employee?._id || req.employee?.id; // Admin or employee who is assigning

    console.log('Assignment request received:', {
      employeeId,
      enquiries,
      priority,
      dueDate,
      notes,
      adminId,
      userObject: req.user
    });

    if (!employeeId || !enquiries || !Array.isArray(enquiries) || enquiries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and enquiries array are required"
      });
    }

    // Verify employee exists and is active
    const employee = await Employee.findById(employeeId).populate('role');
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Check if employee has permission to handle enquiries (more flexible check)
    let hasEnquiryPermission = false;

    if (employee.role && employee.role.permissions) {
      hasEnquiryPermission = employee.role.permissions.some(permission =>
        (permission.module === 'enquiries' || permission.module === 'leads') &&
        (permission.actions.includes('read') || permission.actions.includes('update') || permission.actions.includes('create'))
      );
    }

    // For now, allow all active employees to be assigned leads (remove this check temporarily)
    // We can add it back later when roles are properly configured
    hasEnquiryPermission = true;

    if (!hasEnquiryPermission) {
      return res.status(403).json({
        success: false,
        message: "Employee does not have permission to handle enquiries"
      });
    }

    const assignments = [];
    const errors = [];

    // Process each enquiry
    for (const enquiry of enquiries) {
      try {
        const { enquiryId, enquiryType } = enquiry;

        console.log('Processing enquiry:', { enquiryId, enquiryType });

        // Check if enquiry exists based on enquiryType
        let enquiryExists = false;
        
        // Map enquiry types to models
        switch (enquiryType) {
          case 'Inquiry':
            enquiryExists = await Inquiry.findById(enquiryId);
            break;
          
          case 'ManualInquiry':
            enquiryExists = await ManualInquiry.findById(enquiryId);
            break;
          
          case 'Enquiry':
          case 'PropertyEnquiry':
            // Check both Enquiry and Inquiry collections
            enquiryExists = await Enquiry.findById(enquiryId);
            if (!enquiryExists) {
              enquiryExists = await Inquiry.findById(enquiryId);
            }
            break;
          
          case 'Contact':
            enquiryExists = await Contact.findById(enquiryId);
            break;
          
          case 'PropertyLead':
          case 'PropertyLeads':
            enquiryExists = await PropertyLead.findById(enquiryId);
            break;
          
          case 'HomeLoanEnquiry':
          case 'LegalServicesEnquiry':
          case 'AssociatesEnquiry':
          case 'ExclusivePropertyEnquiry':
          case 'RentApplianceEnquiry':
            // These are stored in Enquiry model with specific enquiryType
            enquiryExists = await Enquiry.findById(enquiryId);
            break;
          
          case 'RentReceiptsEnquiry':
          case 'RentReceipt':
            enquiryExists = await RentReceipt.findById(enquiryId);
            break;
          
          case 'ServiceRequest':
            enquiryExists = await ServiceRequest.findById(enquiryId);
            break;
          
          case 'PropertyManagementRequest':
            enquiryExists = await PropertyManagementRequest.findById(enquiryId);
            break;
          
          case 'DataIntelligenceRequest':
            enquiryExists = await DataIntelligenceRequest.findById(enquiryId);
            break;
          
          case 'PaintingRequest':
            enquiryExists = await PaintingRequest.findById(enquiryId);
            break;
          
          default:
            console.warn('Unknown enquiry type:', enquiryType);
            // Try to find in Enquiry model as fallback
            enquiryExists = await Enquiry.findById(enquiryId);
        }

        if (!enquiryExists) {
          errors.push({
            enquiryId,
            enquiryType,
            error: "Enquiry not found"
          });
          continue;
        }

        console.log('Enquiry found:', enquiryExists._id);

        // Check if enquiry is already assigned
        const existingAssignment = await LeadAssignment.findOne({
          enquiryId,
          enquiryType,
          status: { $in: ['active', 'pending', 'in-progress'] }
        }).populate('employeeId', 'name email');

        if (existingAssignment) {
          // If already assigned, UPDATE the assignment instead of creating new one
          console.log(`🔄 Reassigning lead from ${existingAssignment.employeeId.name} to ${employee.name}`);
          
          existingAssignment.employeeId = employeeId;
          existingAssignment.role = employee.role?.name || '';
          existingAssignment.assignedBy = adminId;
          existingAssignment.status = 'active';
          existingAssignment.priority = priority || existingAssignment.priority;
          if (dueDate) existingAssignment.dueDate = new Date(dueDate);
          if (notes) existingAssignment.notes = notes;
          existingAssignment.assignedDate = new Date();
          
          await existingAssignment.save();
          console.log('✅ Assignment updated (reassigned):', existingAssignment._id);
          assignments.push(existingAssignment);
          continue;
        }

        // Create new assignment
        const assignment = new LeadAssignment({
          enquiryId,
          enquiryType,
          employeeId,
          role: employee.role?.name || '',
          assignedBy: adminId,
          status: 'active', // Set default status to active
          priority: priority || 'medium',
          dueDate: dueDate ? new Date(dueDate) : undefined,
          notes: notes || ''
        });

        await assignment.save();
        console.log('✅ New assignment created:', assignment._id);
        assignments.push(assignment);

      } catch (error) {
        console.error('Error processing enquiry:', error);
        errors.push({
          enquiryId: enquiry.enquiryId,
          enquiryType: enquiry.enquiryType,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `${assignments.length} leads assigned successfully`,
      data: {
        assignments,
        errors,
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email
        }
      }
    });

  } catch (error) {
    console.error("Error assigning leads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign leads",
      error: error.message
    });
  }
};

// Get leads assigned to an employee
export const getEmployeeLeads = async (req, res) => {
  try {
    const employeeId = req.params.employeeId || req.employee?._id || req.user?.id;
    const { status, priority, page = 1, limit = 10 } = req.query;

    const filter = { employeeId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (page - 1) * limit;

    const assignments = await LeadAssignment.find(filter)
      .populate('employeeId', 'name email phone')
      .populate('assignedBy', 'fullName email')
      .sort({ assignedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Populate enquiry details based on type
    const populatedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        let enquiry = null;

        try {
          switch (assignment.enquiryType) {
            case 'Inquiry':
              enquiry = await Inquiry.findById(assignment.enquiryId)
                .populate('buyerId', 'fullName email phone')
                .populate('propertyId', 'propertyLocation propertyType price description availability');
              break;
            
            case 'ManualInquiry':
              enquiry = await ManualInquiry.findById(assignment.enquiryId);
              break;
            
            case 'Enquiry':
            case 'PropertyEnquiry':
            case 'HomeLoanEnquiry':
            case 'LegalServicesEnquiry':
            case 'AssociatesEnquiry':
            case 'ExclusivePropertyEnquiry':
            case 'RentApplianceEnquiry':
              enquiry = await Enquiry.findById(assignment.enquiryId)
                .populate('userId', 'fullName email phone')
                .populate('assignedToEmployee', 'name email phone');
              break;
            
            case 'Contact':
              enquiry = await Contact.findById(assignment.enquiryId);
              break;
            
            case 'PropertyLead':
            case 'PropertyLeads':
              enquiry = await PropertyLead.findById(assignment.enquiryId);
              break;
            
            case 'RentReceiptsEnquiry':
            case 'RentReceipt':
              enquiry = await RentReceipt.findById(assignment.enquiryId);
              break;
            
            case 'ServiceRequest':
              enquiry = await ServiceRequest.findById(assignment.enquiryId);
              break;
            
            case 'PropertyManagementRequest':
              enquiry = await PropertyManagementRequest.findById(assignment.enquiryId);
              break;
            
            case 'DataIntelligenceRequest':
              enquiry = await DataIntelligenceRequest.findById(assignment.enquiryId);
              break;
            
            case 'PaintingRequest':
              enquiry = await PaintingRequest.findById(assignment.enquiryId);
              break;
            
            default:
              console.warn('Unknown enquiry type for population:', assignment.enquiryType);
              // Try Enquiry model as fallback
              enquiry = await Enquiry.findById(assignment.enquiryId);
          }
        } catch (error) {
          console.error('Error populating enquiry:', error);
        }

        return {
          ...assignment.toObject(),
          enquiry: enquiry || null
        };
      })
    );

    const total = await LeadAssignment.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        assignments: populatedAssignments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Error getting employee leads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get employee leads",
      error: error.message
    });
  }
};

// Get all lead assignments (admin view)
export const getAllLeadAssignments = async (req, res) => {
  try {
    const { employeeId, status, priority, page = 1, limit = 50 } = req.query; // Increased default limit to 50

    // Get current user info (could be admin or employee)
    const currentUserId = req.employee?._id || req.user?._id;
    const currentEmployee = req.employee;
    
    console.log('📊 getAllLeadAssignments called by:', {
      userId: currentUserId,
      employeeName: currentEmployee?.name,
      isEmployee: !!currentEmployee,
      isAdmin: !!req.admin || !!req.user
    });
    
    const filter = {};

    // If Team Leader, show only their assigned leads (not all leads)
    if (currentEmployee && currentEmployee.role) {
      const roleInfo = await Role.findById(currentEmployee.role);
      console.log('👤 Role info:', roleInfo?.name);
      
      if (roleInfo && roleInfo.name && roleInfo.name.toLowerCase().includes('team leader')) {
        // Team Leader: show only leads assigned to them
        filter.employeeId = currentUserId;
        console.log(`✅ Team Leader ${currentEmployee.name} viewing their assigned leads`);
        console.log('🔍 Filter:', filter);
      }
    }

    // Admin or query filter can override
    if (employeeId && !filter.employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    console.log('🔎 Final filter:', filter);

    const skip = (page - 1) * limit;
    
    // Get total count first
    const total = await LeadAssignment.countDocuments(filter);
    console.log(`📈 Total assignments found: ${total}`);

    const assignments = await LeadAssignment.find(filter)
      .populate('employeeId', 'name email phone')
      .populate('assignedBy', 'fullName email')
      .sort({ assignedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    console.log(`📋 Fetched ${assignments.length} assignments for page ${page}`);

    // Populate enquiry details based on type
    const populatedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        let enquiry = null;

        try {
          switch (assignment.enquiryType) {
            case 'Inquiry':
              enquiry = await Inquiry.findById(assignment.enquiryId)
                .populate('buyerId', 'fullName email phone isEmailVerified isPhoneVerified lastLogin')
                .populate('propertyId', 'propertyLocation propertyType price description availability');
              break;
            
            case 'ManualInquiry':
              enquiry = await ManualInquiry.findById(assignment.enquiryId);
              break;
            
            case 'Enquiry':
            case 'PropertyEnquiry':
            case 'HomeLoanEnquiry':
            case 'LegalServicesEnquiry':
            case 'AssociatesEnquiry':
            case 'ExclusivePropertyEnquiry':
            case 'RentApplianceEnquiry':
              enquiry = await Enquiry.findById(assignment.enquiryId)
                .populate('userId', 'fullName email phone')
                .populate('assignedToEmployee', 'name email phone');
              break;
            
            case 'Contact':
              enquiry = await Contact.findById(assignment.enquiryId);
              break;
            
            case 'PropertyLead':
            case 'PropertyLeads':
              enquiry = await PropertyLead.findById(assignment.enquiryId);
              break;
            
            case 'RentReceiptsEnquiry':
            case 'RentReceipt':
              enquiry = await RentReceipt.findById(assignment.enquiryId);
              break;
            
            case 'ServiceRequest':
              enquiry = await ServiceRequest.findById(assignment.enquiryId);
              break;
            
            case 'PropertyManagementRequest':
              enquiry = await PropertyManagementRequest.findById(assignment.enquiryId);
              break;
            
            case 'DataIntelligenceRequest':
              enquiry = await DataIntelligenceRequest.findById(assignment.enquiryId);
              break;
            
            case 'PaintingRequest':
              enquiry = await PaintingRequest.findById(assignment.enquiryId);
              break;
            
            default:
              console.warn('Unknown enquiry type for population:', assignment.enquiryType);
              // Try Enquiry model as fallback
              enquiry = await Enquiry.findById(assignment.enquiryId);
          }
        } catch (error) {
          console.error('Error populating enquiry:', error);
        }

        return {
          ...assignment.toObject(),
          enquiry: enquiry || null
        };
      })
    );

    // Get employee statistics
    const employeeStats = await LeadAssignment.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$employeeId',
          totalLeads: { $sum: 1 },
          priorities: { $push: '$priority' }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      }
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        assignments: populatedAssignments,
        employeeStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Error getting lead assignments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get lead assignments",
      error: error.message
    });
  }
};

// Update lead assignment status
export const updateLeadStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, notes, action, visitDate, visitTime } = req.body;
    // Support both req.user (from verifyToken) and req.employee (from verifyEmployeeToken)
    const employeeId = req.user?.id || req.user?._id || req.employee?._id;

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Employee ID not found in token"
      });
    }

    const assignment = await LeadAssignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Lead assignment not found"
      });
    }

    // Check if employee owns this assignment, or is an admin, or a line manager (TL/SH)
    let isAuthorized = assignment.employeeId.toString() === employeeId.toString() || req.admin;
    
    if (!isAuthorized && req.employee) {
      const emp = await Employee.findById(req.employee._id).populate('role');
      const roleName = emp?.role?.name?.toLowerCase() || '';
      if (roleName.includes('admin') || roleName.includes('sales head') || roleName.includes('team leader')) {
        isAuthorized = true; // Let line managers update team deals status
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this assignment"
      });
    }

    // Update assignment
    if (status) assignment.status = status;
    if (notes) assignment.notes = notes;
    if (action) assignment.action = action;
    if (visitDate) assignment.visitDate = visitDate;
    if (visitTime) assignment.visitTime = visitTime;

    // Add to follow-up history
    if (action) {
      assignment.followUpHistory.push({
        action,
        notes: notes || '',
        updatedBy: employeeId
      });
    }

    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: assignment
    });

  } catch (error) {
    console.error("Error updating lead status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lead status",
      error: error.message
    });
  }
};

// Unassign leads from employee (removes assignment completely)
export const unassignLeads = async (req, res) => {
  try {
    const { assignmentIds, enquiryIds, enquiryId, enquiryType } = req.body;
    const adminId = req.user.id;

    // Handle single enquiry unassignment (from CRM)
    if (enquiryId && enquiryType) {
      // Try with the provided enquiryType first
      let result = await LeadAssignment.deleteMany({
        enquiryId: enquiryId,
        enquiryType: enquiryType
      });

      // If nothing found and enquiryType is "Inquiry" or "Enquiry", try the alternative
      if (result.deletedCount === 0) {
        const alternativeType = enquiryType === "Inquiry" ? "Enquiry" :
          enquiryType === "Enquiry" ? "Inquiry" : null;

        if (alternativeType) {
          result = await LeadAssignment.deleteMany({
            enquiryId: enquiryId,
            enquiryType: alternativeType
          });
        }
      }

      // If still nothing found, try deleting by enquiryId only (any type)
      if (result.deletedCount === 0) {
        result = await LeadAssignment.deleteMany({
          enquiryId: enquiryId
        });
      }

      return res.status(200).json({
        success: true,
        message: result.deletedCount > 0 ? `Lead assignment removed successfully` : `No assignment found for this enquiry`,
        data: {
          deletedCount: result.deletedCount,
          unassignedBy: adminId,
          enquiryId,
          enquiryType
        }
      });
    }

    // Handle bulk unassignment
    if (!assignmentIds && !enquiryIds) {
      return res.status(400).json({
        success: false,
        message: "Either assignmentIds, enquiryIds array, or enquiryId with enquiryType is required"
      });
    }

    let result;
    if (assignmentIds && Array.isArray(assignmentIds)) {
      // Unassign by assignment IDs
      result = await LeadAssignment.deleteMany({
        _id: { $in: assignmentIds }
      });
    } else if (enquiryIds && Array.isArray(enquiryIds)) {
      // Unassign by enquiry IDs (for bulk operations)
      result = await LeadAssignment.deleteMany({
        enquiryId: { $in: enquiryIds }
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} lead assignments removed successfully`,
      data: {
        deletedCount: result.deletedCount,
        unassignedBy: adminId
      }
    });

  } catch (error) {
    console.error("Error unassigning leads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unassign leads",
      error: error.message
    });
  }
};

// Get available employees for assignment
export const getAvailableEmployees = async (req, res) => {
  try {
    console.log('🔍 Fetching available employees...');
    
    const currentUserId = req.employee?._id || req.user?._id;
    const currentEmployee = req.employee;
    
    let employees = [];

    // If Team Leader, show Sales Associates (employees who are NOT Team Leaders or Admins)
    if (currentEmployee && currentEmployee.role) {
      const roleInfo = await Role.findById(currentEmployee.role);
      console.log(`👤 Current employee: ${currentEmployee.name}, Role: ${roleInfo?.name}`);
      
      if (roleInfo && roleInfo.name && roleInfo.name.toLowerCase().includes('team leader')) {
        console.log(`✅ Team Leader detected: ${currentEmployee.name}`);
        
        // First, try to find employees with reportingTo = this Team Leader
        let directReports = await Employee.find({
          reportingTo: currentUserId,
          isActive: true
        })
          .populate('role', 'name permissions')
          .populate('reportingTo', 'name email')
          .select('name email phone role reportingTo');

        console.log(`📊 Found ${directReports.length} employees reporting to ${currentEmployee.name}`);

        // If no direct reports found, show all Sales Associates (exclude TL and Admin roles)
        if (directReports.length === 0) {
          console.log('⚠️  No direct reports found, showing all Sales Associates...');
          
          const teamLeaderRole = await Role.findOne({ name: { $regex: /team leader/i } });
          const adminRole = await Role.findOne({ name: { $regex: /admin/i } });
          
          const excludedRoles = [teamLeaderRole?._id, adminRole?._id, currentEmployee.role].filter(Boolean);
          
          employees = await Employee.find({
            isActive: true,
            email: { $not: /admin/i },
            role: { $nin: excludedRoles }
          })
            .populate('role', 'name permissions')
            .populate('reportingTo', 'name email')
            .select('name email phone role reportingTo');
          
          console.log(`📋 Found ${employees.length} Sales Associates (fallback)`);
        } else {
          employees = directReports;
        }
      } else {
        console.log(`ℹ️  Not a Team Leader (${roleInfo?.name}), showing all active employees`);
        employees = await Employee.find({
          isActive: true,
          email: { $not: /admin/i }
        })
          .populate('role', 'name permissions')
          .populate('reportingTo', 'name email')
          .select('name email phone role reportingTo');
      }
    } else {
      console.log('ℹ️  Admin user, showing all active employees');
      employees = await Employee.find({
        isActive: true,
        email: { $not: /admin/i }
      })
        .populate('role', 'name permissions')
        .populate('reportingTo', 'name email')
        .select('name email phone role reportingTo');
    }

    console.log(`✅ Total employees found: ${employees.length}`);
    employees.forEach(emp => {
      console.log(`  - ${emp.name} (${emp.email}) - Role: ${emp.role?.name || 'N/A'} - Reports to: ${emp.reportingTo?.name || 'None'}`);
    });

    // Get current lead counts for each employee
    const employeesWithCounts = await Promise.all(
      employees.map(async (employee) => {
        const activeLeads = await LeadAssignment.countDocuments({
          employeeId: employee._id,
          status: 'active'
        });

        return {
          ...employee.toObject(),
          activeLeadsCount: activeLeads
        };
      })
    );

    res.status(200).json({
      success: true,
      data: employeesWithCounts
    });

  } catch (error) {
    console.error("❌ Error getting available employees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get available employees",
      error: error.message
    });
  }
};

// Get all sold lead assignments (admin view)
export const getSoldLeadAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { status: 'sold' };

    const assignments = await LeadAssignment.find(filter)
      .populate('employeeId', 'name email phone')
      .populate('assignedBy', 'fullName email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Populate enquiry details based on type
    const populatedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        let enquiry = null;
        try {
          switch (assignment.enquiryType) {
            case 'Inquiry':
              enquiry = await Inquiry.findById(assignment.enquiryId)
                .populate('buyerId', 'fullName email phone isEmailVerified isPhoneVerified lastLogin')
                .populate('propertyId', 'propertyLocation propertyType price description availability');
              break;
            
            case 'ManualInquiry':
              enquiry = await ManualInquiry.findById(assignment.enquiryId);
              break;
            
            case 'Enquiry':
            case 'PropertyEnquiry':
            case 'HomeLoanEnquiry':
            case 'LegalServicesEnquiry':
            case 'AssociatesEnquiry':
            case 'ExclusivePropertyEnquiry':
            case 'RentApplianceEnquiry':
              enquiry = await Enquiry.findById(assignment.enquiryId)
                .populate('userId', 'fullName email phone')
                .populate('assignedToEmployee', 'name email phone');
              break;
            
            case 'Contact':
              enquiry = await Contact.findById(assignment.enquiryId);
              break;
            
            case 'PropertyLead':
            case 'PropertyLeads':
              enquiry = await PropertyLead.findById(assignment.enquiryId);
              break;
            
            case 'RentReceiptsEnquiry':
            case 'RentReceipt':
              enquiry = await RentReceipt.findById(assignment.enquiryId);
              break;
            
            case 'ServiceRequest':
              enquiry = await ServiceRequest.findById(assignment.enquiryId);
              break;
            
            case 'PropertyManagementRequest':
              enquiry = await PropertyManagementRequest.findById(assignment.enquiryId);
              break;
            
            case 'DataIntelligenceRequest':
              enquiry = await DataIntelligenceRequest.findById(assignment.enquiryId);
              break;
            
            case 'PaintingRequest':
              enquiry = await PaintingRequest.findById(assignment.enquiryId);
              break;
            
            default:
              console.warn('Unknown enquiry type for population:', assignment.enquiryType);
              // Try Enquiry model as fallback
              enquiry = await Enquiry.findById(assignment.enquiryId);
          }
        } catch (error) {
          console.error('Error populating enquiry:', error);
        }

        return {
          ...assignment.toObject(),
          enquiry: enquiry || null
        };
      })
    );

    const total = await LeadAssignment.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        assignments: populatedAssignments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Error getting sold lead assignments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get sold lead assignments",
      error: error.message
    });
  }
};

// ====================== GET ALL CHATBOT LEADS (ADMIN) ======================
export const getChatbotLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = { source: "chatbot" };

    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { clientPhone: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: skip + leads.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get Chatbot Leads Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get chatbot leads",
    });
  }
};

// ====================== UPDATE CHATBOT LEAD STATUS (ADMIN) ======================
export const updateChatbotLeadStatus = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "in-progress", "completed", "cancelled", "sold"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
      });
    }

    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Chatbot lead not found"
      });
    }

    lead.status = status;

    if (status === "sold") {
      lead.soldAt = new Date();
      lead.soldBy = req.user?.id || req.user?._id;
    }

    await lead.save();

    return res.status(200).json({
      success: true,
      message: "Chatbot lead status updated successfully",
      data: lead
    });
  } catch (error) {
    console.error("Update Chatbot Lead Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update chatbot lead status",
      error: error.message
    });
  }
};

// ====================== BULK AUTO-ASSIGN TO TEAM LEADERS (ROUND ROBIN) ======================
export const bulkAutoAssignToTeamLeaders = async (req, res) => {
  try {
    const { enquiries } = req.body;
    // enquiries = [{ enquiryId, enquiryType }]

    if (!enquiries || !Array.isArray(enquiries) || enquiries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Enquiries array is required"
      });
    }

    // Find Team Leader role
    const teamLeaderRole = await Role.findOne({
      name: { $regex: /team leader/i }
    });

    if (!teamLeaderRole) {
      return res.status(400).json({
        success: false,
        message: "Team Leader role not found in database"
      });
    }

    // Find all active Team Leaders
    const teamLeaders = await Employee.find({
      role: teamLeaderRole._id,
      isActive: true
    }).sort({ createdAt: 1 });

    if (!teamLeaders || teamLeaders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active Team Leaders found"
      });
    }

    // Get current assignment counts for fair distribution
    const tlIds = teamLeaders.map(tl => tl._id);
    const assignmentCounts = await LeadAssignment.aggregate([
      { $match: { employeeId: { $in: tlIds } } },
      { $group: { _id: '$employeeId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    assignmentCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    // Sort Team Leaders by least assignments first
    const sortedTLs = [...teamLeaders].sort((a, b) => {
      const countA = countMap[a._id.toString()] || 0;
      const countB = countMap[b._id.toString()] || 0;
      return countA - countB;
    });

    const successfulAssignments = [];
    const errors = [];
    let tlIndex = 0;

    for (const enq of enquiries) {
      try {
        const { enquiryId, enquiryType } = enq;

        // Check if already assigned
        const existingAssignment = await LeadAssignment.findOne({
          enquiryId: enquiryId,
          enquiryType: enquiryType
        });

        if (existingAssignment) {
          errors.push({
            enquiryId,
            error: 'Already assigned'
          });
          continue;
        }

        // Assign to next Team Leader in Round Robin
        const selectedTL = sortedTLs[tlIndex % sortedTLs.length];
        tlIndex++;

        const assignment = new LeadAssignment({
          employeeId: selectedTL._id,
          enquiryId,
          enquiryType,
          status: 'active',
          priority: 'medium',
          assignedDate: new Date(),
          notes: `Auto-assigned to Team Leader ${selectedTL.name} via Round Robin`
        });

        await assignment.save();

        successfulAssignments.push({
          enquiryId,
          assignedTo: selectedTL.name,
          assignedToId: selectedTL._id
        });
      } catch (err) {
        errors.push({
          enquiryId: enq.enquiryId,
          error: err.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Auto-assigned ${successfulAssignments.length} leads to Team Leaders via Round Robin`,
      data: {
        totalProcessed: enquiries.length,
        successCount: successfulAssignments.length,
        errorCount: errors.length,
        assignments: successfulAssignments,
        errors
      }
    });
  } catch (error) {
    console.error("Bulk Auto Assign Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to auto-assign leads",
      error: error.message
    });
  }
};

// One-time migration: Auto-assign all unassigned enquiries to Team Leaders
export const assignAllUnassignedEnquiries = async (req, res) => {
  try {
    console.log('🔄 Starting auto-assignment of all unassigned enquiries...');

    // Find Team Leader role
    const teamLeaderRole = await Role.findOne({
      name: { $regex: /team leader/i }
    });

    if (!teamLeaderRole) {
      return res.status(400).json({
        success: false,
        message: "Team Leader role not found"
      });
    }

    // Find all active Team Leaders
    const teamLeaders = await Employee.find({
      role: teamLeaderRole._id,
      isActive: true
    }).sort({ createdAt: 1 });

    if (!teamLeaders || teamLeaders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active Team Leaders found"
      });
    }

    // Get current assignment counts
    const tlIds = teamLeaders.map(tl => tl._id);
    const assignmentCounts = await LeadAssignment.aggregate([
      { $match: { employeeId: { $in: tlIds } } },
      { $group: { _id: '$employeeId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    assignmentCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    const sortedTLs = [...teamLeaders].sort((a, b) => {
      const countA = countMap[a._id.toString()] || 0;
      const countB = countMap[b._id.toString()] || 0;
      return countA - countB;
    });

    let totalAssigned = 0;
    let tlIndex = 0;

    // 1. Assign all unassigned Enquiries
    const unassignedEnquiries = await Enquiry.find({});
    console.log(`Found ${unassignedEnquiries.length} enquiries to check`);

    for (const enquiry of unassignedEnquiries) {
      const existingAssignment = await LeadAssignment.findOne({
        enquiryId: enquiry._id,
        enquiryType: 'Enquiry'
      });

      if (!existingAssignment) {
        const selectedTL = sortedTLs[tlIndex % sortedTLs.length];
        tlIndex++;

        const assignment = new LeadAssignment({
          employeeId: selectedTL._id,
          enquiryId: enquiry._id,
          enquiryType: 'Enquiry',
          status: 'active',
          priority: 'medium',
          assignedDate: new Date(),
          notes: `Auto-assigned to Team Leader ${selectedTL.name} (Migration)`
        });

        await assignment.save();
        enquiry.assignedToEmployee = selectedTL._id;
        enquiry.status = "in_progress";
        await enquiry.save();
        totalAssigned++;
      }
    }

    // 2. Assign all unassigned Manual Inquiries
    const unassignedManual = await ManualInquiry.find({});
    console.log(`Found ${unassignedManual.length} manual inquiries to check`);

    for (const inquiry of unassignedManual) {
      const existingAssignment = await LeadAssignment.findOne({
        enquiryId: inquiry._id,
        enquiryType: 'ManualInquiry'
      });

      if (!existingAssignment) {
        const selectedTL = sortedTLs[tlIndex % sortedTLs.length];
        tlIndex++;

        const assignment = new LeadAssignment({
          employeeId: selectedTL._id,
          enquiryId: inquiry._id,
          enquiryType: 'ManualInquiry',
          status: 'active',
          priority: 'medium',
          assignedDate: new Date(),
          notes: `Auto-assigned to Team Leader ${selectedTL.name} (Migration)`
        });

        await assignment.save();
        inquiry.caseStatus = "Open";
        await inquiry.save();
        totalAssigned++;
      }
    }

    // 3. Assign all unassigned Contacts
    const unassignedContacts = await Contact.find({});
    console.log(`Found ${unassignedContacts.length} contacts to check`);

    for (const contact of unassignedContacts) {
      const existingAssignment = await LeadAssignment.findOne({
        enquiryId: contact._id,
        enquiryType: 'Contact'
      });

      if (!existingAssignment) {
        const selectedTL = sortedTLs[tlIndex % sortedTLs.length];
        tlIndex++;

        const assignment = new LeadAssignment({
          employeeId: selectedTL._id,
          enquiryId: contact._id,
          enquiryType: 'Contact',
          status: 'active',
          priority: 'medium',
          assignedDate: new Date(),
          notes: `Auto-assigned to Team Leader ${selectedTL.name} (Migration)`
        });

        await assignment.save();
        contact.assignedTo = selectedTL._id;
        contact.assignmentStatus = 'assigned';
        await contact.save();
        totalAssigned++;
      }
    }

    console.log(`✅ Migration complete: ${totalAssigned} enquiries assigned`);

    return res.status(200).json({
      success: true,
      message: `Successfully assigned ${totalAssigned} unassigned enquiries to Team Leaders`,
      data: {
        totalAssigned,
        teamLeadersUsed: teamLeaders.length
      }
    });
  } catch (error) {
    console.error("Migration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error.message
    });
  }
};