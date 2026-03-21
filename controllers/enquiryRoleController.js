import Enquiry from "../models/enquirySchema.js";
import Employee from "../models/employeeSchema.js";
import Role from "../models/roleSchema.js";

// Check enquiry type permissions
const checkEnquiryTypePermission = async (employeeId, enquiryType) => {
  try {
    const employee = await Employee.findById(employeeId).populate('role');
    if (!employee || !employee.role) {
      return false;
    }

    const moduleMap = {
      'home_loan': 'home_loan_enquiries',
      'interior_design': 'interior_design_enquiries',
      'property_valuation': 'property_valuation_enquiries',
      'vastu_calculation': 'vastu_calculation_enquiries',
      'rent_agreement': 'rent_agreement_enquiries'
    };

    const requiredModule = moduleMap[enquiryType] || 'enquiries';
    
    const hasPermission = employee.role.permissions.some(perm => 
      perm.module === requiredModule && perm.actions.includes('read')
    );

    return hasPermission;
  } catch (error) {
    return false;
  }
};

// Get enquiries by type (Role-based access)
export const getEnquiriesByType = async (req, res) => {
  try {
    const { enquiryType } = req.params;
    const { page = 1, limit = 20, status, priority } = req.query;
    const employeeId = req.employee?._id;
    const isAdmin = !!req.admin;

    // Check permissions for specific enquiry type
    if (!isAdmin && employeeId) {
      const hasPermission = await checkEnquiryTypePermission(employeeId, enquiryType);
      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied for ${enquiryType} enquiries` 
        });
      }
    }

    const filter = { enquiryType };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // If employee, only show assigned enquiries
    if (!isAdmin && employeeId) {
      filter.assignedToEmployee = employeeId;
    }

    const enquiries = await Enquiry.find(filter)
      .populate("userId", "fullName email phone")
      .populate("assignedToEmployee", "name email")
      .populate("assignedBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Enquiry.countDocuments(filter);

    res.status(200).json({
      message: `${enquiryType} enquiries fetched successfully`,
      enquiries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch enquiries", 
      error: error.message 
    });
  }
};

// Get enquiry analytics by type (Admin/Role-based)
export const getAnalyticsByType = async (req, res) => {
  try {
    const { enquiryType } = req.params;
    const employeeId = req.employee?._id;
    const isAdmin = !!req.admin;

    // Check permissions
    if (!isAdmin && employeeId) {
      const hasPermission = await checkEnquiryTypePermission(employeeId, enquiryType);
      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied for ${enquiryType} analytics` 
        });
      }
    }

    const filter = { enquiryType };
    if (!isAdmin && employeeId) {
      filter.assignedToEmployee = employeeId;
    }

    const totalEnquiries = await Enquiry.countDocuments(filter);
    
    const statusCounts = await Enquiry.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const priorityCounts = await Enquiry.aggregate([
      { $match: filter },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    const monthlyTrends = await Enquiry.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      message: `${enquiryType} analytics fetched successfully`,
      analytics: {
        enquiryType,
        totalEnquiries,
        statusBreakdown: statusCounts,
        priorityBreakdown: priorityCounts,
        monthlyTrends
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch analytics", 
      error: error.message 
    });
  }
};

// Assign role-specific permissions for enquiry types
export const assignEnquiryPermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { enquiryTypes, actions } = req.body; // ['home_loan', 'interior_design'] and ['read', 'update']

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    const moduleMap = {
      'home_loan': 'home_loan_enquiries',
      'interior_design': 'interior_design_enquiries',
      'property_valuation': 'property_valuation_enquiries',
      'vastu_calculation': 'vastu_calculation_enquiries',
      'rent_agreement': 'rent_agreement_enquiries'
    };

    // Remove existing enquiry-specific permissions
    role.permissions = role.permissions.filter(perm => 
      !Object.values(moduleMap).includes(perm.module)
    );

    // Add new permissions
    enquiryTypes.forEach(type => {
      const module = moduleMap[type];
      if (module) {
        role.permissions.push({
          module,
          actions: actions || ['read']
        });
      }
    });

    await role.save();

    res.status(200).json({
      message: "Enquiry permissions assigned successfully",
      role
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to assign permissions", 
      error: error.message 
    });
  }
};

// Get employee's enquiry permissions
export const getEmployeeEnquiryPermissions = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId).populate('role');
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const enquiryPermissions = employee.role?.permissions.filter(perm => 
      perm.module.includes('_enquiries') || perm.module === 'enquiries'
    ) || [];

    const accessibleEnquiryTypes = [];
    const moduleTypeMap = {
      'home_loan_enquiries': 'home_loan',
      'interior_design_enquiries': 'interior_design',
      'property_valuation_enquiries': 'property_valuation',
      'vastu_calculation_enquiries': 'vastu_calculation',
      'rent_agreement_enquiries': 'rent_agreement'
    };

    enquiryPermissions.forEach(perm => {
      const enquiryType = moduleTypeMap[perm.module];
      if (enquiryType && perm.actions.includes('read')) {
        accessibleEnquiryTypes.push({
          type: enquiryType,
          actions: perm.actions
        });
      }
    });

    res.status(200).json({
      message: "Employee enquiry permissions fetched successfully",
      employee: {
        name: employee.name,
        email: employee.email,
        role: employee.role?.name
      },
      enquiryPermissions: accessibleEnquiryTypes
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch permissions", 
      error: error.message 
    });
  }
};

export { checkEnquiryTypePermission };