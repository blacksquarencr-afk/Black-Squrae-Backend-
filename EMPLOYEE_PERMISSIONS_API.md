# EMPLOYEE PERMISSIONS API - CURL COMMANDS

## Overview
Employees can retrieve their own permissions based on their assigned role. The permission system is role-based, where each role has specific modules and actions (create, read, update, delete) that employees can perform.

---

## 1. EMPLOYEE LOGIN
Get authentication token to access permission-related APIs.

### Request
```bash
curl -X POST http://localhost:5000/api/employees/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@example.com",
    "password": "password123"
  }'
```

### Response
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "65e8d3a1b2c0d1e2f3a4b5c6",
    "name": "John Doe",
    "email": "employee@example.com",
    "role": {
      "_id": "65e8d3a1b2c0d1e2f3a4b5c7",
      "name": "Sales Manager",
      "permissions": [...]
    }
  }
}
```

**Save the token for subsequent requests:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 2. GET OWN EMPLOYEE PROFILE WITH PERMISSIONS
Retrieve the current employee's full profile including role and assigned permissions.

### Request
```bash
curl -X GET http://localhost:5000/api/employees/65e8d3a1b2c0d1e2f3a4b5c6 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Using stored TOKEN variable
```bash
curl -X GET http://localhost:5000/api/employees/{employee_id} \
  -H "Authorization: Bearer $TOKEN"
```

### Response
```json
{
  "success": true,
  "data": {
    "_id": "65e8d3a1b2c0d1e2f3a4b5c6",
    "name": "John Doe",
    "email": "employee@example.com",
    "phone": "9876543210",
    "department": "Sales",
    "role": {
      "_id": "65e8d3a1b2c0d1e2f3a4b5c7",
      "name": "Sales Manager",
      "permissions": [
        {
          "module": "dashboard",
          "actions": ["read"]
        },
        {
          "module": "enquiries",
          "actions": ["read", "update"]
        },
        {
          "module": "users",
          "actions": ["read"]
        }
      ]
    },
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

---

## 3. GET AVAILABLE PERMISSION MODULES
View all available permission modules and actions in the system (no authentication required).

### Request
```bash
curl -X GET http://localhost:5000/api/role/permissions
```

### Response
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "value": "dashboard",
        "label": "Dashboard",
        "description": "Access to main dashboard and analytics"
      },
      {
        "value": "properties",
        "label": "Properties",
        "description": "Manage property listings and details"
      },
      {
        "value": "enquiries",
        "label": "Enquiries",
        "description": "Handle customer enquiries"
      },
      {
        "value": "roles",
        "label": "Role Management",
        "description": "Create and manage user roles"
      },
      {
        "value": "employees",
        "label": "Employee Management",
        "description": "Manage employee accounts"
      },
      {
        "value": "blogs",
        "label": "Blog Management",
        "description": "Manage blog posts and articles"
      },
      {
        "value": "content-management",
        "label": "Content Management",
        "description": "Manage YouTube videos and media content"
      }
    ],
    "actions": [
      {
        "value": "create",
        "label": "Create",
        "description": "Add new records"
      },
      {
        "value": "read",
        "label": "Read",
        "description": "View and access records"
      },
      {
        "value": "update",
        "label": "Update",
        "description": "Modify existing records"
      },
      {
        "value": "delete",
        "label": "Delete",
        "description": "Remove records"
      }
    ]
  }
}
```

---

## 4. GET ALL ROLES (ADMIN/MANAGERS ONLY)
Retrieve all available roles with their permissions (requires 'roles' module 'read' permission).

### Request
```bash
curl -X GET "http://localhost:5000/api/role?page=1&limit=10&search=" \
  -H "Authorization: Bearer $TOKEN"
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "65e8d3a1b2c0d1e2f3a4b5c7",
      "name": "Sales Manager",
      "description": "Sales Manager with enquiry and lead management access",
      "permissions": [
        {
          "module": "dashboard",
          "actions": ["read"]
        },
        {
          "module": "enquiries",
          "actions": ["read", "update"]
        },
        {
          "module": "users",
          "actions": ["read"]
        }
      ],
      "isActive": true,
      "createdAt": "2025-01-10T08:00:00Z"
    },
    {
      "_id": "65e8d3a1b2c0d1e2f3a4b5c8",
      "name": "Senior Agent",
      "description": "Senior sales agent with extended permissions",
      "permissions": [
        {
          "module": "dashboard",
          "actions": ["read"]
        },
        {
          "module": "enquiries",
          "actions": ["read", "create", "update"]
        },
        {
          "module": "users",
          "actions": ["read"]
        }
      ],
      "isActive": true,
      "createdAt": "2025-01-10T08:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalRoles": 2,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

## 5. GET SPECIFIC ROLE WITH PERMISSIONS (ADMIN/MANAGERS ONLY)
Get detailed information about a specific role and its permissions.

### Request
```bash
curl -X GET http://localhost:5000/api/role/65e8d3a1b2c0d1e2f3a4b5c7 \
  -H "Authorization: Bearer $TOKEN"
```

### Response
```json
{
  "success": true,
  "data": {
    "_id": "65e8d3a1b2c0d1e2f3a4b5c7",
    "name": "Sales Manager",
    "description": "Manages sales team and client enquiries",
    "permissions": [
      {
        "module": "dashboard",
        "actions": ["read"]
      },
      {
        "module": "enquiries",
        "actions": ["read", "update", "delete"]
      },
      {
        "module": "users",
        "actions": ["read", "update"]
      },
      {
        "module": "reports-complaints",
        "actions": ["read", "update"]
      }
    ],
    "isActive": true,
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": "2025-01-15T12:00:00Z"
  }
}
```

---

## 6. BASH SCRIPT - COMPLETE PERMISSION CHECK WORKFLOW

### Complete Script
```bash
#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:5000/api"
EMPLOYEE_EMAIL="employee@example.com"
EMPLOYEE_PASSWORD="password123"
EMPLOYEE_ID="65e8d3a1b2c0d1e2f3a4b5c6"

echo -e "${BLUE}=== EMPLOYEE PERMISSIONS API TEST ===${NC}\n"

# Step 1: Employee Login
echo -e "${BLUE}[1] Logging in employee...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/employees/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMPLOYEE_EMAIL\",
    \"password\": \"$EMPLOYEE_PASSWORD\"
  }")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get authentication token${NC}"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo -e "${BLUE}Token: ${TOKEN:0:50}...${NC}\n"

# Step 2: Get Employee Profile with Permissions
echo -e "${BLUE}[2] Fetching employee profile with permissions...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN")

echo $PROFILE_RESPONSE | jq '.'
echo -e "${GREEN}✓ Profile retrieved${NC}\n"

# Step 3: Extract and Display Permissions
echo -e "${BLUE}[3] Employee's Assigned Permissions:${NC}"
PERMISSIONS=$(echo $PROFILE_RESPONSE | jq '.data.role.permissions')
echo $PERMISSIONS | jq '.'
echo -e ""

# Step 4: Get Available Modules
echo -e "${BLUE}[4] Fetching available permission modules...${NC}"
MODULES_RESPONSE=$(curl -s -X GET "$BASE_URL/role/permissions")
echo $MODULES_RESPONSE | jq '.'
echo -e ""

# Step 5: Check Specific Permission
echo -e "${BLUE}[5] Checking if employee has 'enquiries' read permission...${NC}"
HAS_PERMISSION=$(echo $PERMISSIONS | jq '.[] | select(.module == "enquiries") | select(.actions[] == "read")')

if [ -z "$HAS_PERMISSION" ]; then
  echo -e "${RED}✗ Employee does NOT have enquiries read permission${NC}"
else
  echo -e "${GREEN}✓ Employee HAS enquiries read permission${NC}"
fi

echo -e "\n${GREEN}=== TEST COMPLETED ===${NC}"
```

### Run the Script
```bash
chmod +x check-employee-permissions.sh
./check-employee-permissions.sh
```

---

## 7. ERROR RESPONSES

### 401 - Unauthorized (Invalid/Missing Token)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 - Forbidden (Insufficient Permissions)
```json
{
  "success": false,
  "message": "Access denied. No permission for roles module."
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Employee not found"
}
```

---

## 8. PERMISSION MODULE REFERENCE

| Module | Actions | Description |
|--------|---------|-------------|
| `dashboard` | read | View dashboard and analytics |
| `properties` | create, read, update, delete | Manage properties |
| `users` | create, read, update, delete | Manage user accounts |
| `enquiries` | create, read, update, delete | Handle enquiries |
| `employees` | create, read, update, delete | Manage employees |
| `roles` | create, read, update, delete | Manage roles |
| `blogs` | create, read, update, delete | Manage blogs |
| `content-management` | create, read, update, delete | Manage YouTube/media |

---

## 9. COMMON USE CASES

### Get All Permissions for Current Employee
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.role.permissions'
```

### Check if Employee Can Perform Specific Action
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | select(.module=="enquiries") | .actions'
```

### Get Human-Readable Permission List
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | "\(.module): \(.actions | join(", "))"'
```

### Export Permission Summary
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '{
    employee_name: .data.name,
    role: .data.role.name,
    permissions: .data.role.permissions
  }' > employee_permissions.json
```

---

## 10. INTEGRATION WITH FRONTEND

### JavaScript/Fetch Example
```javascript
// Get employee permissions
async function getEmployeePermissions(employeeId, token) {
  try {
    const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const permissions = data.data.role.permissions;
      return permissions;
    }
  } catch (error) {
    console.error('Error fetching permissions:', error);
  }
}

// Check if user has specific permission
function hasPermission(permissions, module, action) {
  return permissions.some(perm => 
    perm.module === module && perm.actions.includes(action)
  );
}

// Usage
const permissions = await getEmployeePermissions(employeeId, token);
if (hasPermission(permissions, 'enquiries', 'read')) {
  // Show enquiries module
}
```

---

## Notes
- Replace `localhost:5000` with your actual API server URL
- All authenticated endpoints require a valid JWT token in the `Authorization` header
- Permission tokens expire based on your `JWT_EXPIRY` configuration
- Employees can only access their own profile; admins can access all employees

