# EMPLOYEE PERMISSIONS - CURL QUICK REFERENCE

## Quick Setup
```bash
# Set your base URL
BASE_URL="http://localhost:5000/api"

# Login and get token
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/employees/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
EMPLOYEE_ID="YOUR_EMPLOYEE_ID"
```

---

## 1. Employee Login
```bash
curl -X POST http://localhost:5000/api/employees/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@example.com",
    "password": "password123"
  }'
```

---

## 2. Get Own Profile with Role & Permissions
```bash
TOKEN="your_jwt_token_here"
EMPLOYEE_ID="65e8d3a1b2c0d1e2f3a4b5c6"

curl -X GET http://localhost:5000/api/employees/$EMPLOYEE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Quick Response Parsing:**
```bash
# Get just the permissions
curl -s -X GET http://localhost:5000/api/employees/$EMPLOYEE_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.data.role.permissions'

# Get role name and permissions
curl -s -X GET http://localhost:5000/api/employees/$EMPLOYEE_ID \
  -H "Authorization: Bearer $TOKEN" | jq '{role: .data.role.name, permissions: .data.role.permissions}'

# Format as readable list
curl -s -X GET http://localhost:5000/api/employees/$EMPLOYEE_ID \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | "\(.module): \(.actions | join(", "))"' -r
```

---

## 3. Get Available Permission Modules (No Auth Required)
```bash
curl -X GET http://localhost:5000/api/role/permissions \
  -H "Content-Type: application/json"
```

**Just the modules:**
```bash
curl -s -X GET http://localhost:5000/api/role/permissions | \
  jq '.data.modules[] | {value, label, description}'
```

**Just the actions:**
```bash
curl -s -X GET http://localhost:5000/api/role/permissions | \
  jq '.data.actions'
```

---

## 4. Get All Roles (Requires 'roles' Module 'read' Permission)
```bash
curl -X GET "http://localhost:5000/api/role?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**With search filter:**
```bash
curl -X GET "http://localhost:5000/api/role?page=1&limit=10&search=manager" \
  -H "Authorization: Bearer $TOKEN"
```

**Filter by active status:**
```bash
curl -X GET "http://localhost:5000/api/role?isActive=true" \
  -H "Authorization: Bearer $TOKEN"
```

**Just role names and permissions:**
```bash
curl -s -X GET "http://localhost:5000/api/role" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data[] | {name, permissions}'
```

---

## 5. Get Specific Role Details
```bash
ROLE_ID="65e8d3a1b2c0d1e2f3a4b5c7"

curl -X GET http://localhost:5000/api/role/$ROLE_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 6. Check Specific Permission for Employee

### Check if employee has 'enquiries' read permission:
```bash
curl -s -X GET http://localhost:5000/api/employees/$EMPLOYEE_ID \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | select(.module == "enquiries") | select(.actions[] == "read")'
```

### Check multiple permissions:
```bash
curl -s -X GET http://localhost:5000/api/employees/$EMPLOYEE_ID \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | 
      if .module == "enquiries" and (.actions[] == "create" or .actions[] == "update") 
      then "HAS enquiries create/update"
      elif .module == "users" and .actions[] == "read"
      then "HAS users read"
      else empty end'
```

---

## 7. Compare Permissions Between Two Roles
```bash
ROLE_ID1="65e8d3a1b2c0d1e2f3a4b5c7"
ROLE_ID2="65e8d3a1b2c0d1e2f3a4b5c8"

# Get both roles
ROLE1=$(curl -s -X GET http://localhost:5000/api/role/$ROLE_ID1 \
  -H "Authorization: Bearer $TOKEN")

ROLE2=$(curl -s -X GET http://localhost:5000/api/role/$ROLE_ID2 \
  -H "Authorization: Bearer $TOKEN")

# Display comparison
echo "Role 1:"
echo $ROLE1 | jq '.data | {name, permissions}'
echo ""
echo "Role 2:"
echo $ROLE2 | jq '.data | {name, permissions}'
```

---

## 8. Export Full Permission Report for Employee
```bash
curl -s -X GET http://localhost:5000/api/employees/$EMPLOYEE_ID \
  -H "Authorization: Bearer $TOKEN" | \
  jq '{
    employee: {
      name: .data.name,
      email: .data.email,
      department: .data.department,
      role: .data.role.name
    },
    permissions: .data.role.permissions
  }' > employee_permissions_report.json
```

---

## 9. Get All Employees with Their Roles (Requires 'employees' Module 'read' Permission)
```bash
curl -X GET "http://localhost:5000/api/employees?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**With filters:**
```bash
# Filter by role
curl -X GET "http://localhost:5000/api/employees?roleFilter=ROLE_ID" \
  -H "Authorization: Bearer $TOKEN"

# Filter by active status
curl -X GET "http://localhost:5000/api/employees?isActive=true" \
  -H "Authorization: Bearer $TOKEN"

# Filter by department
curl -X GET "http://localhost:5000/api/employees?department=Sales" \
  -H "Authorization: Bearer $TOKEN"
```

**Show employee names with roles and permissions:**
```bash
curl -s -X GET "http://localhost:5000/api/employees?limit=50" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data[] | {name, email, role: .role.name, permissions: .role.permissions}'
```

---

## 10. Get Available Modules & Actions Summary
```bash
curl -s -X GET http://localhost:5000/api/role/permissions | \
  jq '
    {
      modules: (.data.modules | map({value, label})),
      actions: (.data.actions | map({value, label}))
    }
  '
```

---

## 11. Permission Existence Check (Useful for Automation)
```bash
#!/bin/bash

check_permission() {
  local employee_id=$1
  local module=$2
  local action=$3
  local token=$4
  
  result=$(curl -s -X GET "http://localhost:5000/api/employees/$employee_id" \
    -H "Authorization: Bearer $token" | \
    jq ".data.role.permissions[] | select(.module == \"$module\") | select(.actions[] == \"$action\")")
    
  if [ -z "$result" ]; then
    echo "NO"
    return 1
  else
    echo "YES"
    return 0
  fi
}

# Usage
if check_permission "$EMPLOYEE_ID" "enquiries" "create" "$TOKEN"; then
  echo "Employee can create enquiries"
else
  echo "Employee cannot create enquiries"
fi
```

---

## 12. Get Permission Matrix (All Employees & Their Modules)
```bash
curl -s -X GET "http://localhost:5000/api/employees?limit=100" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data | map({
    name,
    role: .role.name,
    modules: (.role.permissions | map(.module) | unique)
  })'
```

---

## 13. Dashboard Stats for Employee
```bash
curl -X GET http://localhost:5000/api/employees/dashboard-stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Responses

### Unauthorized (No token / Invalid token)
```
Status: 401
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Forbidden (Insufficient permissions)
```
Status: 403
{
  "success": false,
  "message": "Access denied. No permission for roles module."
}
```

### Not Found
```
Status: 404
{
  "success": false,
  "message": "Employee not found"
}
```

---

## Environment Setup (Bash)

```bash
#!/bin/bash

# Set API endpoint
export BASE_URL="http://localhost:5000/api"
export EMPLOYEE_EMAIL="employee@example.com"
export EMPLOYEE_PASSWORD="password123"

# Login and save token
echo "Logging in..."
TOKEN=$(curl -s -X POST "$BASE_URL/employees/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMPLOYEE_EMAIL\",\"password\":\"$EMPLOYEE_PASSWORD\"}" | \
  jq -r '.token')

export TOKEN
echo "Token saved: $TOKEN"

# Test permission access
echo ""
echo "Fetching employee profile..."
curl -s -X GET "$BASE_URL/employees/YOUR_EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Useful Aliases (Add to .bashrc)

```bash
# Get current employee permissions
alias get-my-perms='curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq ".data.role.permissions"'

# List readable modules
alias list-modules='curl -s -X GET "http://localhost:5000/api/role/permissions" | \
  jq ".data.modules | map({value, label})"'

# Check specific permission
check-perm() {
  curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
    -H "Authorization: Bearer $TOKEN" | \
    jq ".data.role.permissions[] | select(.module == \"$1\") | .actions"
}
```

---

## Notes
- Replace `YOUR_EMPLOYEE_ID` with actual employee ID
- Replace `ROLE_ID` with actual role ID
- All authenticated endpoints require valid JWT token
- Employees can only view their own data by default
- Managers/Admins can view all employees' data if they have 'employees' module 'read' permission

