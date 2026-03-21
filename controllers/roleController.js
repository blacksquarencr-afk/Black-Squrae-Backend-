import Role from "../models/roleSchema.js";
import Employee from "../models/employeeSchema.js";

// Create new role
export const createRole = async (req, res) => {
  try {
    const { name, description, department, permissions } = req.body;

    // Check if role name already exists
    const existingRole = await Role.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "Role with this name already exists"
      });
    }

    // Create new role
    const newRole = new Role({
      name,
      description,
      department,
      permissions,
      createdBy: req.user?.id || null
    });

    const savedRole = await newRole.save();

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: savedRole
    });
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all roles
export const getAllRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", isActive } = req.query;
    
    const query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add active filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const roles = await Role.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Role.countDocuments(query);

    res.status(200).json({
      success: true,
      data: roles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRoles: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get role by ID
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id).populate('createdBy', 'name email');
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, department, permissions, isActive } = req.body;

    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    // Check if new name conflicts with existing roles (excluding current role)
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: "Role with this name already exists"
        });
      }
    }

    // Update role
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      {
        name,
        description,
        department,
        permissions,
        isActive,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('createdBy', 'name email');

    // 🔥 AUTO-SYNC: Update all employees' database records with role permissions
    console.log(`🔄 Syncing permissions to database for all employees with role: ${updatedRole.name}`);
    
    // Find all employees with this role
    const employeesWithRole = await Employee.find({ role: id });
    console.log(`📊 Found ${employeesWithRole.length} employees with this role`);

    // Update each employee's permissions in database
    if (employeesWithRole.length > 0) {
      const updatePromises = employeesWithRole.map(async (employee) => {
        // Update employee's permissions in database to exactly match the role
        await Employee.findByIdAndUpdate(
          employee._id,
          { 
            permissions: permissions,
            updatedAt: Date.now()
          }
        );

        console.log(`✅ Database updated for ${employee.name} (${employee.email}) - exactly matching role permissions`);
      });
      
      await Promise.all(updatePromises);
      console.log(`✅ All ${employeesWithRole.length} employee database records updated successfully`);
    }

    res.status(200).json({
      success: true,
      message: `Role updated successfully. ${employeesWithRole.length} employee database records updated with new permissions.`,
      data: updatedRole,
      syncInfo: {
        employeesAffected: employeesWithRole.length,
        employeeNames: employeesWithRole.map(e => e.name),
        permissionsSet: permissions.length
      }
    });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    // Check if any employees are assigned to this role
    const employeeCount = await Employee.countDocuments({ role: id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. ${employeeCount} employee(s) are assigned to this role.`
      });
    }

    await Role.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Role deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get available permissions/modules
export const getAvailablePermissions = async (req, res) => {
  try {
    const modules = [
      { value: 'dashboard', label: 'Dashboard', description: 'Access to main dashboard and analytics' },
      { value: 'properties', label: 'All Properties', description: 'View property listings and details' },
      { value: 'deals', label: 'Deals', description: 'Manage deals and transactions' },
      { value: 'site_visits', label: 'Site Visits', description: 'Manage site visit schedules and completed visits' },
      { value: 'career-applications', label: 'Client Relationship', description: 'Manage client relationships and assignments' },
      { value: 'all_leads', label: 'All Leads', description: 'View and manage all leads in the system' },
      { value: 'lead_distribution', label: 'Lead Distribution', description: 'Distribute leads to team members' },
      { value: 'sales_performance', label: 'Sales Performance', description: 'View sales performance metrics and reports' },
      { value: 'reports', label: 'Reports', description: 'Generate and view various reports' },
      { value: 'users', label: 'User Management', description: 'Manage user accounts, profiles, and user lead assignments' },
      { value: 'roles', label: 'Role Management', description: 'Create and manage user roles and permissions' },
      { value: 'employees', label: 'Employee Management', description: 'Manage employee accounts and permissions' },
      { value: 'employee_reports', label: 'Employee Reports', description: 'View and manage employee reports and performance' },
      { value: 'bought-property', label: 'Bought Property', description: 'Manage purchased properties and transactions' },
      { value: 'service-management', label: 'Service Management', description: 'Manage service enquiries, property management requests, data intelligence, painting quotation, and calculations' },
      { value: 'enquiries', label: 'Enquiries & Follow-ups', description: 'Handle customer enquiries and follow-up schedules' },
      { value: 'content-management', label: 'Content Management', description: 'Manage blog, YouTube videos, about us, career videos, and builder management' },
      { value: 'settings', label: 'Website Settings', description: 'Website banner configuration and settings' },
      { value: 'feedback-management', label: 'Help Desk', description: 'Manage feedbacks, help desk tickets, and stats' },
      { value: 'chatbot-management', label: 'Chatbot Management', description: 'Manage chatbot Q&A and configurations' }
    ];

    const actions = [
      { value: 'create', label: 'Create', description: 'Add new records' },
      { value: 'read', label: 'Read', description: 'View and access records' },
      { value: 'update', label: 'Update', description: 'Modify existing records' },
      { value: 'delete', label: 'Delete', description: 'Remove records' }
    ];

    res.status(200).json({
      success: true,
      data: {
        modules,
        actions
      }
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};