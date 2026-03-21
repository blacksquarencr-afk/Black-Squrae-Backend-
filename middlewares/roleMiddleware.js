import jwt from "jsonwebtoken";
import Employee from "../models/employeeSchema.js";
import Role from "../models/roleSchema.js";

// Middleware to verify JWT token and extract employee info
// export const verifyEmployeeToken = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Access denied. No token provided."
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Fetch employee with current role permissions
//     const employee = await Employee.findById(decoded.id)
//       .populate('role', 'name permissions isActive')
//       .select('-password');

//     // if (!employee || !employee.isActive) {
//     if (!employee) {

//       return res.status(401).json({
//         success: false,
//         message: "Access denied. Employee account inactive."
//       });
//     }

//     // if (!employee.role || !employee.role.isActive) {
//       return res.status(401).json({
//         success: false,
//         message: "Access denied. Role inactive or not assigned."
//       });
//     }

//     req.employee = employee;
//     req.permissions = employee.role.permissions;
//     next();
//   } catch (error) {
//     console.error("Token verification error:", error);
//     res.status(401).json({
//       success: false,
//       message: "Invalid token."
//     });
//   }
// };

export const verifyEmployeeToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch employee with role permissions populated
    const employee = await Employee.findById(decoded.id)
      .populate('role', 'name permissions isActive')
      .select('-password');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Employee not found."
      });
    }

    // Check if employee is active
    if (!employee.isActive) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Employee account is inactive."
      });
    }

    // Check if role is active
    if (!employee.role || !employee.role.isActive) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Role is inactive or not assigned."
      });
    }

    // 🔥 MERGE ROLE PERMISSIONS WITH INDIVIDUAL PERMISSIONS
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

    // Attach employee and merged permissions to request
    req.employee = employee;
    req.permissions = mergedPermissions;

    console.log(`✅ Employee ${employee.name} authenticated with ${mergedPermissions.length} permission modules`);

    next();

  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token."
    });
  }
};




// Middleware to check if employee has permission for a specific module and action
// export const checkPermission = (module, action) => {
//   return (req, res, next) => {
//     try {
//       const permissions = req.permissions;
      
//       if (!permissions || !Array.isArray(permissions)) {
//         return res.status(403).json({
//           success: false,
//           message: "Access denied. No permissions assigned."
//         });
//       }

//       // Find permission for the requested module
//       const modulePermission = permissions.find(perm => perm.module === module);
      
//       if (!modulePermission) {
//         return res.status(403).json({
//           success: false,
//           message: `Access denied. No permission for ${module} module.`
//         });
//       }

//       // Check if the required action is allowed
//       if (!modulePermission.actions.includes(action)) {
//         return res.status(403).json({
//           success: false,
//           message: `Access denied. No ${action} permission for ${module} module.`
//         });
//       }

//       next();
//     } catch (error) {
//       console.error("Permission check error:", error);
//       res.status(500).json({
//         success: false,
//         message: "Error checking permissions."
//       });
//     }
//   };
// };
// export const checkPermission = (module, action) => {
//   return (req, res, next) => {
//     try {

//       // ===== Allow Admin Full Access =====
//       if (req.employee?.role?.name?.toLowerCase() === "admin") {
//         return next();
//       }

//       const permissions = req.permissions;

//       if (!permissions || !Array.isArray(permissions)) {
//         return res.status(403).json({
//           success: false,
//           message: "Access denied. No permissions assigned."
//         });
//       }

//       // Find permission for the requested module
//       const modulePermission = permissions.find(
//         perm => perm.module === module
//       );

//       if (!modulePermission) {
//         return res.status(403).json({
//           success: false,
//           message: `Access denied. No permission for ${module} module.`
//         });
//       }

//       // Check if the required action is allowed
//       if (!modulePermission.actions.includes(action)) {
//         return res.status(403).json({
//           success: false,
//           message: `Access denied. No ${action} permission for ${module} module.`
//         });
//       }

//       next();

//     } catch (error) {
//       console.error("Permission check error:", error);
//       res.status(500).json({
//         success: false,
//         message: "Error checking permissions."
//       });
//     }
//   };
// };

export const checkPermission = (module, action) => {
  return (req, res, next) => {
    try {
      // Check if employee has admin access flag - bypass permission check
      if (req.employee?.giveAdminAccess === true) {
        console.log(`✅ Admin access granted for ${req.employee.name} to ${module}:${action}`);
        return next();
      }

      const permissions = req.permissions;

      if (!permissions || !Array.isArray(permissions)) {
        console.log(`❌ No permissions found for employee ${req.employee?.name}`);
        return res.status(403).json({
          success: false,
          message: "Access denied. No permissions assigned."
        });
      }

      // Find permission for the requested module
      const modulePermission = permissions.find(perm => perm.module === module);

      if (!modulePermission) {
        console.log(`❌ No permission for module ${module} for employee ${req.employee?.name}`);
        return res.status(403).json({
          success: false,
          message: `Access denied. No permission for ${module} module.`
        });
      }

      // Check if the required action is allowed
      if (!modulePermission.actions.includes(action)) {
        console.log(`❌ No ${action} permission for module ${module} for employee ${req.employee?.name}`);
        return res.status(403).json({
          success: false,
          message: `Access denied. No ${action} permission for ${module} module.`
        });
      }

      console.log(`✅ Permission granted for ${req.employee?.name} to ${module}:${action}`);
      next();

    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking permissions."
      });
    }
  };
};


// Middleware to check if employee has any of the specified permissions
export const checkAnyPermission = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      // Check if employee has admin access flag - bypass permission check
      if (req.employee?.giveAdminAccess === true) {
        console.log(`✅ Admin access granted for ${req.employee.name}`);
        return next();
      }

      const permissions = req.permissions;
      
      if (!permissions || !Array.isArray(permissions)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. No permissions assigned."
        });
      }

      // Check if employee has any of the required permissions
      const hasPermission = requiredPermissions.some(required => {
        const modulePermission = permissions.find(perm => perm.module === required.module);
        return modulePermission && modulePermission.actions.includes(required.action);
      });

      if (!hasPermission) {
        console.log(`❌ Insufficient permissions for employee ${req.employee?.name}`);
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions."
        });
      }

      console.log(`✅ Permission granted for ${req.employee?.name}`);
      next();
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({
        success: false,
        message: "Error checking permissions."
      });
    }
  };
};

// Middleware to check if employee is admin or has specific role
export const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const employee = req.employee;
      
      if (!employee || !employee.role) {
        return res.status(403).json({
          success: false,
          message: "Access denied. No role assigned."
        });
      }

      const roleName = employee.role.name.toLowerCase();
      const hasAllowedRole = allowedRoles.some(role => role.toLowerCase() === roleName);

      if (!hasAllowedRole) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient role privileges."
        });
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);
      res.status(500).json({
        success: false,
        message: "Error checking role."
      });
    }
  };
};

// Middleware to check if employee can access user data (either own data or has permission)
export const checkDataAccess = (req, res, next) => {
  try {
    const requestedEmployeeId = req.params.id || req.params.employeeId;
    const currentEmployeeId = req.employee._id.toString();
    
    // Allow access to own data
    if (requestedEmployeeId === currentEmployeeId) {
      return next();
    }

    // Check if employee has permission to access other employees' data
    const permissions = req.permissions;
    const hasEmployeePermission = permissions.some(perm => 
      perm.module === 'employees' && perm.actions.includes('read')
    );

    if (!hasEmployeePermission) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Can only access your own data."
      });
    }

    next();
  } catch (error) {
    console.error("Data access check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking data access."
    });
  }
};

// Utility function to get user permissions (merged from role + individual)
export const getEmployeePermissions = async (employeeId) => {
  try {
    const employee = await Employee.findById(employeeId)
      .populate('role', 'name permissions isActive');
    
    if (!employee || !employee.role || !employee.role.isActive) {
      return null;
    }

    // 🔥 MERGE ROLE PERMISSIONS WITH INDIVIDUAL PERMISSIONS
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

    return mergedPermissions;
  } catch (error) {
    console.error("Error getting employee permissions:", error);
    return null;
  }
};

export default {
  verifyEmployeeToken,
  checkPermission,
  checkAnyPermission,
  checkRole,
  checkDataAccess,
  getEmployeePermissions
};