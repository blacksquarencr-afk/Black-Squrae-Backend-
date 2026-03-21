# How to Grant Feedback Management Access to Admin

## Issue
Getting "Access Denied. You don't have permission to view feedbacks" error when trying to access feedback endpoints as admin.

## Solution

The admin employee needs the `feedback-management` module permission added to their role.

---

## Method 1: Using API to Update Role

### Step 1: Find Admin's Role ID

```bash
# Get all roles
curl -X GET "https://backend.blacksquare.estate/api/admin/roles" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Step 2: Update Role to Add Feedback Permission

```bash
curl -X PUT "https://backend.blacksquare.estate/api/admin/roles/{ROLE_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Admin",
    "description": "Administrator with full access",
    "permissions": [
      {
        "module": "dashboard",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "properties",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "users",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "employees",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "roles",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "feedback-management",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "feedback",
        "actions": ["create", "read", "update", "delete"]
      }
    ]
  }'
```

---

## Method 2: Using MongoDB Directly

### Connect to MongoDB

```bash
# Connect to your MongoDB
mongosh "mongodb://your-connection-string"

# Or if local
mongosh
```

### Update Role with Feedback Permissions

```javascript
// Switch to your database
use your_database_name

// Find the admin role
db.roles.find({ name: "Admin" })

// Update the admin role to add feedback-management permission
db.roles.updateOne(
  { name: "Admin" },
  {
    $push: {
      permissions: {
        $each: [
          {
            module: "feedback-management",
            actions: ["create", "read", "update", "delete"]
          },
          {
            module: "feedback",
            actions: ["create", "read", "update", "delete"]
          }
        ]
      }
    }
  }
)

// Verify the update
db.roles.findOne({ name: "Admin" })
```

---

## Method 3: Create New Role with Feedback Access

```bash
curl -X POST "https://backend.blacksquare.estate/api/admin/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Super Admin",
    "description": "Super Administrator with complete access including feedback management",
    "permissions": [
      {
        "module": "dashboard",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "dashboard_banner",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "properties",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "users",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "categories",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "recent",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "bought-property",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "settings",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "security",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "reports-complaints",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "service-management",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "enquiries",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "home_loan_enquiries",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "interior_design_enquiries",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "property_valuation_enquiries",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "vastu_calculation_enquiries",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "rent_agreement_enquiries",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "roles",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "employees",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "employee_reports",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "blog_management",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "blog",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "blogs",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "content-management",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "chatbot-management",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "feedback-management",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "module": "feedback",
        "actions": ["create", "read", "update", "delete"]
      }
    ]
  }'
```

---

## Quick Fix: Direct MongoDB Update

**Fastest solution if you have MongoDB access:**

```javascript
// Connect to MongoDB
mongosh

// Use your database
use your_database_name

// Add feedback permissions to ALL existing roles (if needed)
db.roles.updateMany(
  {},
  {
    $addToSet: {
      permissions: {
        $each: [
          {
            module: "feedback-management",
            actions: ["create", "read", "update", "delete"]
          },
          {
            module: "feedback",
            actions: ["create", "read", "update", "delete"]
          }
        ]
      }
    }
  }
)

// Or update just the Admin role
db.roles.updateOne(
  { name: /admin/i },
  {
    $addToSet: {
      permissions: {
        $each: [
          {
            module: "feedback-management",
            actions: ["create", "read", "update", "delete"]
          }
        ]
      }
    }
  }
)
```

---

## Verify Permissions

After updating, verify the admin has the permissions:

```bash
# Get role details
curl -X GET "https://backend.blacksquare.estate/api/admin/roles/{ROLE_ID}" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "role_id",
    "name": "Admin",
    "permissions": [
      {
        "module": "feedback-management",
        "actions": ["create", "read", "update", "delete"]
      }
    ]
  }
}
```

---

## Test Feedback Access

After adding permissions, test the feedback endpoints:

```bash
# Test: Get all feedbacks
curl -X GET "https://backend.blacksquare.estate/api/feedback/all" \
  -H "Authorization: Bearer YOUR_ADMIN_EMPLOYEE_TOKEN"

# Should return feedbacks instead of permission error
```

---

## Important Notes

1. **Employee Token Required**: Feedback management endpoints require an **employee token**, not a regular user token
2. **Module Names**: Both `feedback-management` and `feedback` modules should be added for full access
3. **Actions**: Include all actions: `["create", "read", "update", "delete"]`
4. **Re-login**: After updating permissions, the admin may need to log out and log back in to refresh the token

---

## Still Not Working?

### Check These:

1. **Using Correct Token**
   - Feedback endpoints need EMPLOYEE token
   - Regular user tokens won't work

2. **Token Format**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Check Employee's Role**
   ```bash
   # Get employee details to see their role
   curl -X GET "https://backend.blacksquare.estate/api/employees/me" \
     -H "Authorization: Bearer YOUR_EMPLOYEE_TOKEN"
   ```

4. **Verify Role Has Permissions**
   ```javascript
   // In MongoDB
   db.employees.findOne({ email: "admin@email.com" }).populate('role')
   ```

---

## Contact Support

If the issue persists after following these steps, provide:
- Employee email/ID
- Role name
- Exact error message
- Which endpoint you're trying to access
