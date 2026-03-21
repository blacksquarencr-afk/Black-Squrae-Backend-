import Employee from "../models/employeeSchema.js";
import Role from "../models/roleSchema.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Create new employee
export const createEmployee = async (req, res) => {
  try {
    const { name, email, phone, role, reportingTo, password, department, address, giveAdminAccess, permissions } = req.body;

    // Check if employee with email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists"
      });
    }

    // Verify role exists and get role permissions
    const roleExists = await Role.findById(role);
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected"
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Handle admin access - store the flag, admin access will be handled by frontend logic
    let finalRole = role;

    // 🔥 AUTO-ASSIGN: Merge role permissions with any individual permissions
    const rolePermissions = roleExists.permissions || [];
    const individualPermissions = permissions || [];
    
    const permissionMap = new Map();
    
    // Add role permissions first
    rolePermissions.forEach(perm => {
      if (perm.module) {
        permissionMap.set(perm.module, new Set(perm.actions || []));
      }
    });
    
    // Merge individual permissions (if any provided)
    individualPermissions.forEach(perm => {
      if (perm.module) {
        if (permissionMap.has(perm.module)) {
          const existingActions = permissionMap.get(perm.module);
          (perm.actions || []).forEach(action => existingActions.add(action));
        } else {
          permissionMap.set(perm.module, new Set(perm.actions || []));
        }
      }
    });
    
    // Convert to array
    const finalPermissions = Array.from(permissionMap.entries()).map(([module, actions]) => ({
      module,
      actions: Array.from(actions)
    }));

    console.log(`✅ Creating employee with ${finalPermissions.length} permission modules from role + individual`);

    // Create new employee with merged permissions
    const newEmployee = new Employee({
      name,
      email,
      phone,
      role: finalRole,
      roleName: roleExists.name,
      reportingTo: reportingTo || null,
      password: hashedPassword,
      department,
      address,
      giveAdminAccess: giveAdminAccess || false,
      permissions: finalPermissions,
      createdBy: req.user?.id || null
    });

    const savedEmployee = await newEmployee.save();

    // Populate role and reportingTo information
    await savedEmployee.populate('role', 'name permissions');
    await savedEmployee.populate('reportingTo', 'name email role');

    // Remove password from response
    const employeeResponse = savedEmployee.toObject();
    delete employeeResponse.password;

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employeeResponse
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", roleFilter, isActive, department, city, state, country, zipCode } = req.query;

    const query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Add role filter
    if (roleFilter) {
      query.role = roleFilter;
    }

    // Add active filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Add department filter
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    // Add address filters
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    if (state) {
      query['address.state'] = { $regex: state, $options: 'i' };
    }
    if (country) {
      query['address.country'] = { $regex: country, $options: 'i' };
    }
    if (zipCode) {
      query['address.zipCode'] = zipCode;
    }

    const employees = await Employee.find(query)
      .populate('role', 'name permissions isActive')
      .populate('reportingTo', 'name email role')
      .populate('createdBy', 'name email')
      .select('-password') // Exclude password from results
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // 🔥 MERGE ROLE PERMISSIONS WITH INDIVIDUAL PERMISSIONS FOR EACH EMPLOYEE
    const employeesWithMergedPermissions = employees.map(employee => {
      const rolePermissions = employee.role?.permissions || [];
      const individualPermissions = employee.permissions || [];

      const permissionMap = new Map();

      // Add role permissions
      rolePermissions.forEach(perm => {
        if (perm.module) {
          permissionMap.set(perm.module, new Set(perm.actions || []));
        }
      });

      // Merge individual permissions
      individualPermissions.forEach(perm => {
        if (perm.module) {
          if (permissionMap.has(perm.module)) {
            const existingActions = permissionMap.get(perm.module);
            (perm.actions || []).forEach(action => existingActions.add(action));
          } else {
            permissionMap.set(perm.module, new Set(perm.actions || []));
          }
        }
      });

      // Convert to array
      const mergedPermissions = Array.from(permissionMap.entries()).map(([module, actions]) => ({
        module,
        actions: Array.from(actions)
      }));

      const employeeData = employee.toObject();
      employeeData.permissions = mergedPermissions;
      return employeeData;
    });

    const total = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      data: employeesWithMergedPermissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEmployees: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + (error.stack || error.message),
      error: error.stack || error.message
    });
  }
};

// Get employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id)
      .populate('role', 'name permissions isActive')
      .populate('reportingTo', 'name email role')
      .populate('createdBy', 'name email')
      .select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // 🔥 MERGE ROLE PERMISSIONS WITH INDIVIDUAL PERMISSIONS
    const rolePermissions = employee.role?.permissions || [];
    const individualPermissions = employee.permissions || [];

    // Create a map of module -> actions for quick lookup
    const permissionMap = new Map();

    // First, add all role permissions
    rolePermissions.forEach(perm => {
      if (perm.module) {
        permissionMap.set(perm.module, new Set(perm.actions || []));
      }
    });

    // Then, merge individual permissions
    individualPermissions.forEach(perm => {
      if (perm.module) {
        if (permissionMap.has(perm.module)) {
          const existingActions = permissionMap.get(perm.module);
          (perm.actions || []).forEach(action => existingActions.add(action));
        } else {
          permissionMap.set(perm.module, new Set(perm.actions || []));
        }
      }
    });

    // Convert map back to array format
    const mergedPermissions = Array.from(permissionMap.entries()).map(([module, actions]) => ({
      module,
      actions: Array.from(actions)
    }));

    // Add merged permissions to response
    const employeeData = employee.toObject();
    employeeData.permissions = mergedPermissions;

    res.status(200).json({
      success: true,
      data: employeeData
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, reportingTo, department, address, isActive, giveAdminAccess, adminReminderPopupEnabled, permissions } = req.body;

    console.log('📥 Received update request for employee:', id);
    console.log('📋 Permissions in request body:', permissions);
    console.log('📊 Permissions count:', permissions?.length);

    // Check if employee exists
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Check if new email conflicts with existing employees (excluding current employee)
    if (email && email !== employee.email) {
      const existingEmployee = await Employee.findOne({
        email,
        _id: { $ne: id }
      });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Employee with this email already exists"
        });
      }
    }

    // Handle admin access - store the flag, admin access will be handled by frontend logic
    let finalRole = role;
    let finalPermissions = permissions;

    // Verify role exists if role is being updated
    if (finalRole && finalRole !== employee.role.toString()) {
      const roleExists = await Role.findById(finalRole);
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid role selected"
        });
      }

      // 🔥 ROLE CHANGED: Auto-sync role permissions to employee database
      console.log(`🔄 Role changed for ${employee.name} - syncing new role permissions`);
      
      const rolePermissions = roleExists.permissions || [];
      const individualPermissions = permissions || employee.permissions || [];
      
      const permissionMap = new Map();
      
      // Add new role permissions
      rolePermissions.forEach(perm => {
        if (perm.module) {
          permissionMap.set(perm.module, new Set(perm.actions || []));
        }
      });
      
      // Merge individual permissions
      individualPermissions.forEach(perm => {
        if (perm.module) {
          if (permissionMap.has(perm.module)) {
            const existingActions = permissionMap.get(perm.module);
            (perm.actions || []).forEach(action => existingActions.add(action));
          } else {
            permissionMap.set(perm.module, new Set(perm.actions || []));
          }
        }
      });
      
      // Convert to array
      finalPermissions = Array.from(permissionMap.entries()).map(([module, actions]) => ({
        module,
        actions: Array.from(actions)
      }));
      
      console.log(`✅ New permissions merged: ${finalPermissions.length} permission modules`);
    }

    const updateData = {
      name,
      email,
      phone,
      role: finalRole,
      reportingTo: reportingTo || null,
      department,
      address,
      isActive,
      giveAdminAccess: giveAdminAccess || false,
      updatedAt: Date.now()
    };
    
    // Assign roleName string for easy readability in the database
    if (finalRole) {
      const currentRole = await Role.findById(finalRole);
      if (currentRole) updateData.roleName = currentRole.name;
    }

    // Include permissions (either merged from role change or provided directly)
    if (finalPermissions !== undefined) {
      updateData.permissions = finalPermissions;
      console.log('✅ Permissions included in update');
    }

    // Include adminReminderPopupEnabled if provided
    if (adminReminderPopupEnabled !== undefined) {
      updateData.adminReminderPopupEnabled = adminReminderPopupEnabled;
    }

    console.log('📤 Final update data with permissions count:', updateData.permissions?.length || 0);

    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('role', 'name permissions')
    .populate('reportingTo', 'name email role')
    .select('-password');

    console.log('✅ Employee updated successfully');
    console.log('📋 Updated employee permissions:', updatedEmployee.permissions);

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    await Employee.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update employee password
export const updateEmployeePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, currentPassword } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Verify current password if provided
    if (currentPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, employee.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect"
        });
      }
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await Employee.findByIdAndUpdate(id, {
      password: hashedPassword,
      updatedAt: Date.now()
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Employee login
export const employeeLogin = async (req, res) => {
  try {
    const { email, password, loginType } = req.body;

    // Check if employee exists and is active (populate full role with permissions)
    const employee = await Employee.findOne({ email, isActive: true })
      .populate('role', 'name permissions isActive')
      .populate('reportingTo', 'name email role');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or account inactive"
      });
    }

    // Check if role is active
    if (!employee.role.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your role has been deactivated. Please contact administrator."
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, employee.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // 🔒 VALIDATE ROLE MATCHES SELECTED LOGIN TYPE
    if (loginType) {
      const userRole = employee.role.name.toLowerCase();
      const selectedRole = loginType.toLowerCase();
      
      // Normalize role names for comparison
      const roleMatches = (
        (selectedRole === 'sales_head' && userRole.includes('sales head')) ||
        (selectedRole === 'team_leader' && userRole.includes('team leader')) ||
        (selectedRole === 'sales_associate' && userRole.includes('sales associate'))
      );

      if (!roleMatches) {
        // Get user-friendly role name
        let expectedRole = 'Unknown';
        if (userRole.includes('sales head')) expectedRole = 'Sales Head';
        else if (userRole.includes('team leader')) expectedRole = 'Team Leader';
        else if (userRole.includes('sales associate')) expectedRole = 'Sales Associate';

        return res.status(403).json({
          success: false,
          message: `Access denied. These credentials belong to a ${expectedRole} account. Please select the correct role to login.`,
          actualRole: employee.role.name
        });
      }
    }

    // Update last login
    await Employee.findByIdAndUpdate(employee._id, { lastLogin: Date.now() });

    // 🔥 MERGE ROLE PERMISSIONS WITH INDIVIDUAL PERMISSIONS
    const rolePermissions = employee.role?.permissions || [];
    const individualPermissions = employee.permissions || [];

    // Create a map of module -> actions for quick lookup
    const permissionMap = new Map();

    // First, add all role permissions
    rolePermissions.forEach(perm => {
      if (perm.module) {
        permissionMap.set(perm.module, new Set(perm.actions || []));
      }
    });

    // Then, merge individual permissions (these can add new modules or actions)
    individualPermissions.forEach(perm => {
      if (perm.module) {
        if (permissionMap.has(perm.module)) {
          // Merge actions for existing module
          const existingActions = permissionMap.get(perm.module);
          (perm.actions || []).forEach(action => existingActions.add(action));
        } else {
          // Add new module with its actions
          permissionMap.set(perm.module, new Set(perm.actions || []));
        }
      }
    });

    // Convert map back to array format
    const mergedPermissions = Array.from(permissionMap.entries()).map(([module, actions]) => ({
      module,
      actions: Array.from(actions)
    }));

    console.log('✅ Login - Merged permissions for employee:', employee.name);
    console.log('📋 Role permissions count:', rolePermissions.length);
    console.log('📋 Individual permissions count:', individualPermissions.length);
    console.log('📋 Final merged permissions count:', mergedPermissions.length);

    // Generate JWT token with merged permissions
    const token = jwt.sign(
      {
        id: employee._id,
        email: employee.email,
        role: employee.role._id,
        permissions: mergedPermissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response and add merged permissions
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;
    employeeResponse.permissions = mergedPermissions;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        employee: employeeResponse,
        token
      }
    });
  } catch (error) {
    console.error("Error during employee login:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get employee dashboard stats
export const getEmployeeDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ isActive: true });
    const inactiveEmployees = await Employee.countDocuments({ isActive: false });
    const totalRoles = await Role.countDocuments();

    // Get employees by department
    const employeesByDepartment = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalRoles,
        employeesByDepartment
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get current logged-in employee with fresh permissions
export const getCurrentEmployee = async (req, res) => {
  try {
    // req.employee is set by verifyEmployeeToken middleware
    const employeeId = req.employee._id;

    // Fetch fresh employee data with role permissions (populate full role with permissions)
    const employee = await Employee.findById(employeeId)
      .populate('role', 'name isActive department permissions')
      .populate('reportingTo', 'name email role')
      .select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Check if employee is still active
    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message: "Employee account is inactive"
      });
    }

    // Check if role is still active
    if (!employee.role || !employee.role.isActive) {
      return res.status(403).json({
        success: false,
        message: "Employee role is inactive"
      });
    }

    // 🔥 MERGE ROLE PERMISSIONS WITH INDIVIDUAL PERMISSIONS
    // Role permissions are the base, individual permissions override/extend them
    const rolePermissions = employee.role?.permissions || [];
    const individualPermissions = employee.permissions || [];

    // Create a map of module -> actions for quick lookup
    const permissionMap = new Map();

    // First, add all role permissions
    rolePermissions.forEach(perm => {
      if (perm.module) {
        permissionMap.set(perm.module, new Set(perm.actions || []));
      }
    });

    // Then, merge individual permissions (these can add new modules or actions)
    individualPermissions.forEach(perm => {
      if (perm.module) {
        if (permissionMap.has(perm.module)) {
          // Merge actions for existing module
          const existingActions = permissionMap.get(perm.module);
          (perm.actions || []).forEach(action => existingActions.add(action));
        } else {
          // Add new module with its actions
          permissionMap.set(perm.module, new Set(perm.actions || []));
        }
      }
    });

    // Convert map back to array format
    const mergedPermissions = Array.from(permissionMap.entries()).map(([module, actions]) => ({
      module,
      actions: Array.from(actions)
    }));

    // Create response object with merged permissions
    const employeeData = employee.toObject();
    employeeData.permissions = mergedPermissions;

    console.log('✅ Merged permissions for employee:', employee.name);
    console.log('📋 Role permissions count:', rolePermissions.length);
    console.log('📋 Individual permissions count:', individualPermissions.length);
    console.log('📋 Final merged permissions count:', mergedPermissions.length);

    res.status(200).json({
      success: true,
      data: employeeData,
      message: "Employee data retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching current employee:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get team members (employees reporting to current logged-in employee)
export const getMyTeamMembers = async (req, res) => {
  try {
    // req.employee is set by verifyEmployeeToken middleware
    const currentEmployeeId = req.employee._id;

    console.log('📊 Fetching team members for employee:', currentEmployeeId);

    // Fetch direct reports (Level 1)
    const directReports = await Employee.find({ reportingTo: currentEmployeeId })
      .populate('role', 'name permissions isActive')
      .populate('reportingTo', 'name email role')
      .select('-password');

    let teamMembers = [...directReports];
    const directReportIds = directReports.map(emp => emp._id);

    // Fetch secondary reports (Level 2 - e.g. Sales Associates reporting to Team Leaders)
    if (directReportIds.length > 0) {
      const secondaryReports = await Employee.find({ reportingTo: { $in: directReportIds } })
        .populate('role', 'name permissions isActive')
        .populate('reportingTo', 'name email role')
        .select('-password');
      
      teamMembers = [...teamMembers, ...secondaryReports];
    }

    // Sort combined team members by name
    teamMembers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    console.log(`✅ Found ${teamMembers.length} overall team members (Direct: ${directReports.length}) reporting to this employee`);

    res.status(200).json({
      success: true,
      data: teamMembers,
      count: teamMembers.length,
      message: "Team members retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};