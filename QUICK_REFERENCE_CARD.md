# Employee Permissions - Quick Reference Card

## 🚀 Quick Commands

### 1. Login
```bash
curl -X POST "http://localhost:5000/api/employees/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bhaveshkumar0503@gmail.com",
    "password": "password123"
  }'
```

### 2. Get Your Permissions (requires TOKEN and EMPLOYEE_ID)
```bash
curl -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Extract Permissions Only
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.role.permissions'
```

### 4. Check for Specific Permission
```bash
# Check if you have 'read' permission for 'career-applications'
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | 
      select(.module == "career-applications") | 
      select(.actions[] == "read")'
```

### 5. Export Permissions to File
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data | {name, role: .role.name, permissions: .role.permissions}' \
  > my_permissions.json
```

### 6. Get Available Modules (No Auth Required)
```bash
curl -X GET "http://localhost:5000/api/role/permissions"
```

---

## 📝 One-Command Setup

```bash
# Set your credentials
export API_URL="http://localhost:5000/api"
export EMAIL="bhaveshkumar0503@gmail.com"
export PASSWORD="your_password"

# Login and get token
LOGIN=$(curl -s -X POST "$API_URL/employees/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

export TOKEN=$(echo $LOGIN | jq -r '.token')
export EMPLOYEE_ID=$(echo $LOGIN | jq -r '.data._id')

# Now use TOKEN and EMPLOYEE_ID for other requests
echo "Token: $TOKEN"
echo "Employee ID: $EMPLOYEE_ID"
```

---

## 🎯 Common Scenarios

### Scenario 1: "Get My Permissions"
```bash
# 1. Login
TOKEN=$(curl -s -X POST "$API_URL/employees/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pwd"}' | jq -r '.token')

EMPLOYEE_ID=$(curl -s -X POST "$API_URL/employees/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pwd"}' | jq -r '.data._id')

# 2. Get permissions
curl -s -X GET "$API_URL/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.role.permissions'
```

### Scenario 2: "Check if I Have Permission"
```bash
curl -s -X GET "$API_URL/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq 'if .data.role.permissions[] | select(.module=="career-applications" and (.actions[]=="read")) 
      then "YES, you have read permission"
      else "NO, you do not have read permission" end'
```

### Scenario 3: "See All My Modules"
```bash
curl -s -X GET "$API_URL/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '.data.role.permissions[] | .module'
```

### Scenario 4: "List Actions for Module"
```bash
curl -s -X GET "$API_URL/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | 
      select(.module == "career-applications") | 
      .actions'
```

---

## 📊 Response Structure

```json
{
  "success": true,
  "data": {
    "name": "Bhavesh Gupta",
    "email": "bhaveshkumar0503@gmail.com",
    "role": {
      "name": "Associate Team Leader",
      "_id": "698a1805c9667991a86ab61a",
      "permissions": [
        {
          "module": "career-applications",
          "actions": ["create", "read", "update"],
          "_id": "698a1805c9667991a86ab61b"
        }
      ]
    }
  }
}
```

---

## 🛠️ Using Environment Variables

### Setup (Copy & Paste)
```bash
# Configure API
export API_URL="http://localhost:5000/api"
export EMAIL="bhaveshkumar0503@gmail.com"
export PASSWORD="your_password_here"

# Login
export LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/employees/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

export TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
export EMPLOYEE_ID=$(echo $LOGIN_RESPONSE | jq -r '.data._id')

# Verify
echo "✓ Logged in successfully"
echo "Token: $TOKEN"
echo "Employee ID: $EMPLOYEE_ID"
```

### Usage
```bash
# Now use $TOKEN and $EMPLOYEE_ID in your commands
curl -X GET "$API_URL/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚨 Error Codes

| Code | Error | Solution |
|------|-------|----------|
| 401 | Unauthorized | Your token is invalid or expired. Login again. |
| 404 | Not Found | Employee ID doesn't exist. Check your ID. |
| 403 | Forbidden | You don't have permission. Contact admin. |
| 500 | Server Error | Try again or contact support. |

---

## 🎬 Interactive Script Usage

### Bash Version
```bash
chmod +x get-my-permissions.sh
./get-my-permissions.sh
```

### Node.js Version
```bash
node get-my-permissions.mjs
# OR with credentials
node get-my-permissions.mjs --email user@example.com --password pwd123
# OR export only
node get-my-permissions.mjs --email user@example.com --password pwd123 --export
```

---

## 💾 Save as Bash Functions

Add to your `.bashrc` or `.zshrc`:

```bash
# Get employee permissions
get-perms() {
  local email=$1
  local password=$2
  local api_url="http://localhost:5000/api"
  
  LOGIN=$(curl -s -X POST "$api_url/employees/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$email\", \"password\": \"$password\"}")
  
  TOKEN=$(echo $LOGIN | jq -r '.token')
  EMPLOYEE_ID=$(echo $LOGIN | jq -r '.data._id')
  
  curl -s -X GET "$api_url/employees/$EMPLOYEE_ID" \
    -H "Authorization: Bearer $TOKEN" | jq '.data.role.permissions'
}

# Usage: get-perms user@example.com password123
```

---

## 🔍 Filtering Examples

### Get Only Module Names
```bash
curl -s -X GET "$API_URL/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '.data.role.permissions[].module'
```

**Output:**
```
career-applications
enquiries
```

### Get Modules with Create Permission
```bash
curl -s -X GET "$API_URL/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | 
      select(.actions[] == "create")'
```

### Count Total Permissions
```bash
curl -s -X GET "$API_URL/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions | length'
```

---

## 📋 Handy One-Liners

```bash
# Pretty print permissions
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.role.permissions | .[] | "\(.module): \(.actions | join(", "))"' -r

# Check permission exists
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq 'has("data") and (.data.role.permissions | length > 0)'

# Export to JSON file
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data | {name, role: .role.name, permissions: .role.permissions}' > perms.json

# Display in table format
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '.data.role.permissions[] | "| \(.module) | \(.actions | join(", ")) |"'
```

---

## 🌐 Browser Testing (Postman/Insomnia)

### Import Collection
```json
{
  "1_login": "POST http://localhost:5000/api/employees/login",
  "2_get_permissions": "GET http://localhost:5000/api/employees/:id",
  "3_get_modules": "GET http://localhost:5000/api/role/permissions"
}
```

### Headers Required
```
Content-Type: application/json
Authorization: Bearer {TOKEN}  // For authenticated endpoints
```

---

## ✅ Checklist for First Time

- [ ] API running on port 5000
- [ ] Know your email and password
- [ ] Have `jq` installed (for JSON parsing)
- [ ] Set environment variables (`API_URL`, `EMAIL`, `PASSWORD`)
- [ ] Test login command first
- [ ] Save TOKEN and EMPLOYEE_ID
- [ ] Test get permissions command
- [ ] Run scripts for automated checks

---

**Version:** 1.0  
**Last Updated:** 2026-02-10
