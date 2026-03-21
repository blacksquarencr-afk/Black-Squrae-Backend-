# Employee Get Own Permissions - Curl Commands Reference

## 📋 Overview
This guide shows how employees can retrieve their own permissions based on their assigned role using curl commands.

**Example Employee:** Bhavesh Gupta  
**Role:** Associate Team Leader – Sales & Business Development  
**Permissions:** career-applications (create, read, update)

---

## 🔑 Quick Setup

### Set Environment Variables
```bash
# Configuration
export API_URL="http://localhost:5000/api"
export EMAIL="bhaveshkumar0503@gmail.com"
export PASSWORD="your_password_here"

# After login, set these
export TOKEN="your_jwt_token_here"
export EMPLOYEE_ID="698a0ecdc9667991a86aae26"
export ROLE_ID="698a1805c9667991a86ab61a"
```

---

## 1️⃣ Step 1: Employee Login

### Basic Login
```bash
curl -X POST "http://localhost:5000/api/employees/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bhaveshkumar0503@gmail.com",
    "password": "your_password_here"
  }'
```

### Response (Success)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "698a0ecdc9667991a86aae26",
    "name": "Bhavesh Gupta",
    "email": "bhaveshkumar0503@gmail.com",
    "department": "Sales"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Save Token for Next Steps
```bash
# Run login and extract token
RESPONSE=$(curl -s -X POST "http://localhost:5000/api/employees/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bhaveshkumar0503@gmail.com",
    "password": "your_password_here"
  }')

TOKEN=$(echo $RESPONSE | jq -r '.token')
EMPLOYEE_ID=$(echo $RESPONSE | jq -r '.data._id')

echo "Token: $TOKEN"
echo "Employee ID: $EMPLOYEE_ID"
```

---

## 2️⃣ Step 2: Get Own Profile with Permissions

### Get Own Employee Profile (with Role & Permissions)
```bash
curl -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Response (With All Permissions)
```json
{
  "success": true,
  "data": {
    "_id": "698a0ecdc9667991a86aae26",
    "name": "Bhavesh Gupta",
    "email": "bhaveshkumar0503@gmail.com",
    "phone": "9289669764",
    "department": "Sales",
    "role": {
      "_id": "698a1805c9667991a86ab61a",
      "name": "Associate Team Leader – Sales & Business Development",
      "permissions": [
        {
          "module": "career-applications",
          "actions": ["create", "read", "update"],
          "_id": "698a1805c9667991a86ab61b"
        }
      ],
      "isActive": true
    },
    "isActive": true,
    "joinDate": "2026-02-09T16:43:57.463Z",
    "createdAt": "2026-02-09T16:43:57.464Z"
  }
}
```

---

## 3️⃣ Step 3: Extract & Display Permissions

### Extract Only Permissions
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions'
```

**Output:**
```json
[
  {
    "module": "career-applications",
    "actions": ["create", "read", "update"],
    "_id": "698a1805c9667991a86ab61b"
  }
]
```

### Extract Role Name & Permissions
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '{
    role_name: .data.role.name,
    role_id: .data.role._id,
    permissions: .data.role.permissions
  }'
```

**Output:**
```json
{
  "role_name": "Associate Team Leader – Sales & Business Development",
  "role_id": "698a1805c9667991a86ab61a",
  "permissions": [
    {
      "module": "career-applications",
      "actions": ["create", "read", "update"],
      "_id": "698a1805c9667991a86ab61b"
    }
  ]
}
```

---

## 4️⃣ Step 4: Check Specific Permission

### Does Employee Have 'career-applications' Read Permission?
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | 
      select(.module == "career-applications") | 
      select(.actions[] == "read")'
```

**Output (if has permission):**
```json
{
  "module": "career-applications",
  "actions": ["create", "read", "update"],
  "_id": "698a1805c9667991a86ab61b"
}
```

### Check if Has Multiple Permissions
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | 
      select(.actions | contains(["create", "read", "update"]))'
```

### Verify Has All Required Permissions
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq 'def has_all_perms: .data.role.permissions[] | 
      select(.module == "career-applications") | 
      .actions | (contains(["create"]) and contains(["read"]) and contains(["update"]));
      if has_all_perms then "✓ YES" else "✗ NO" end'
```

---

## 5️⃣ Step 5: Get Available Permission Modules

### Get All Available Permission Modules
```bash
curl -X GET "http://localhost:5000/api/role/permissions" \
  -H "Content-Type: application/json"
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "module": "career-applications",
      "description": "Career application management",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "enquiries",
      "description": "Property enquiry management",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "employees",
      "description": "Employee management",
      "actions": ["create", "read", "update", "delete"]
    }
  ]
}
```

---

## 🎯 Complete Workflow - One Command

### Get Full Permission Report (All in One)
```bash
#!/bin/bash

# Configuration
EMAIL="bhaveshkumar0503@gmail.com"
PASSWORD="your_password_here"
API_URL="http://localhost:5000/api"

echo "=== STEP 1: Login ==="
LOGIN=$(curl -s -X POST "$API_URL/employees/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo $LOGIN | jq -r '.token')
EMPLOYEE_ID=$(echo $LOGIN | jq -r '.data._id')
EMPLOYEE_NAME=$(echo $LOGIN | jq -r '.data.name')

echo "✓ Logged in as: $EMPLOYEE_NAME"
echo "✓ Token: ${TOKEN:0:50}..."
echo ""

echo "=== STEP 2: Fetch Your Permissions ==="
PROFILE=$(curl -s -X GET "$API_URL/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN")

ROLE_NAME=$(echo $PROFILE | jq -r '.data.role.name')
PERMISSIONS=$(echo $PROFILE | jq '.data.role.permissions')

echo "Role: $ROLE_NAME"
echo ""
echo "Permissions:"
echo $PERMISSIONS | jq '.'
echo ""

echo "=== STEP 3: Permission Summary ==="
echo $PERMISSIONS | jq -r '.[] | "Module: \(.module)\nActions: \(.actions | join(", "))"'
```

---

## 📊 Permission Check Examples

### Example 1: Check if Can Create Career Applications
```bash
PERMISSIONS=$(curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.role.permissions')

CAN_CREATE=$(echo $PERMISSIONS | jq 'any(.module == "career-applications" and (.actions[] == "create"))')
echo "Can create: $CAN_CREATE"
```

### Example 2: List All Allowed Actions
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '.data.role.permissions[] | "\(.module): \(.actions | join(", "))"'
```

**Output:**
```
career-applications: create, read, update
```

### Example 3: Export Permissions to JSON File
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '{
    name: .data.name,
    email: .data.email,
    role: .data.role.name,
    permissions: .data.role.permissions,
    exported_at: now | todate
  }' > employee_permissions_$(date +%s).json

echo "✓ Exported to: employee_permissions_$(date +%s).json"
```

---

## 🔍 Common Queries with jq

### Get Module Names Only
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '.data.role.permissions[].module'
```

### Get All Actions for a Module
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | select(.module == "career-applications") | .actions'
```

### Count Total Permissions
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions | length'
```

### Check if ANY Module Exists
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq 'if (.data.role.permissions | length) > 0 then "Has permissions" else "No permissions" end'
```

---

## 🚨 Error Responses

### 401 Unauthorized (Invalid Token)
```json
{
  "success": false,
  "message": "Invalid token."
}
```

### 404 Employee Not Found
```json
{
  "success": false,
  "message": "Employee not found"
}
```

### 403 Access Denied (Accessing Other Employee's Data)
```json
{
  "success": false,
  "message": "Access denied. Can only access your own data."
}
```

---

## 💡 Tips & Best Practices

1. **Always Save Token**: Save the JWT token from login for subsequent requests
2. **Token Expiration**: Tokens have an expiration time; login again if expired
3. **Use jq**: Install `jq` to parse JSON responses easily
4. **Environment Variables**: Use env vars for security (don't hardcode credentials)
5. **HTTPS**: Always use HTTPS in production
6. **Caching**: Cache permission data locally for better performance
7. **Error Handling**: Always check `success` field in response

---

## 🔗 Related Endpoints

| Operation | Endpoint | Method | Auth |
|-----------|----------|--------|------|
| Login | `/api/employees/login` | POST | No |
| Get Own Profile | `/api/employees/:id` | GET | Yes |
| Get Available Modules | `/api/role/permissions` | GET | No |
| Get All Roles | `/api/role` | GET | Yes (admin) |
| Get Specific Role | `/api/role/:id` | GET | Yes (admin) |

---

## 📝 Example: Full Permission Check Script

Create a file: `check-my-permissions.sh`

```bash
#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Config
API_URL="${API_URL:-http://localhost:5000/api}"

echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Employee Permission Checker          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""

# Get credentials
read -p "Email: " EMAIL
read -sp "Password: " PASSWORD
echo ""

# Step 1: Login
echo -e "${YELLOW}[1] Logging in...${NC}"
LOGIN=$(curl -s -X POST "$API_URL/employees/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo $LOGIN | jq -r '.token')
if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  echo $LOGIN | jq '.'
  exit 1
fi

EMPLOYEE_ID=$(echo $LOGIN | jq -r '.data._id')
EMPLOYEE_NAME=$(echo $LOGIN | jq -r '.data.name')

echo -e "${GREEN}✓ Logged in as: $EMPLOYEE_NAME${NC}"
echo ""

# Step 2: Get permissions
echo -e "${YELLOW}[2] Fetching permissions...${NC}"
PROFILE=$(curl -s -X GET "$API_URL/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN")

ROLE_NAME=$(echo $PROFILE | jq -r '.data.role.name')
echo -e "${GREEN}✓ Role: $ROLE_NAME${NC}"
echo ""

# Step 3: Display permissions
echo -e "${YELLOW}[3] Your Permissions:${NC}"
echo $PROFILE | jq -r '.data.role.permissions[] | "  • Module: \(.module)\n    Actions: \(.actions | join(", "))"'
```

Make it executable:
```bash
chmod +x check-my-permissions.sh
./check-my-permissions.sh
```

---

## ✅ Supported Permission Modules

Based on your system:

| Module | Description | Actions |
|--------|-------------|---------|
| `career-applications` | Career job applications | create, read, update, delete |
| `enquiries` | Property enquiries | create, read, update, delete |
| `employees` | Employee management | create, read, update, delete |
| `roles` | Role management | create, read, update, delete |
| More... | Check `/api/role/permissions` | ... |

---

## 🆘 Troubleshooting

**Q: "Invalid token" error**  
→ Login again and use the new token

**Q: "Access denied" when accessing other employee's data**  
→ You can only access your own data unless you have `employees:read` permission

**Q: How do I know token is valid?**  
→ If you can fetch your profile, token is valid

**Q: Token suddenly stopped working**  
→ Token may have expired; login again

---

Last Updated: 2026-02-10  
Version: 1.0
