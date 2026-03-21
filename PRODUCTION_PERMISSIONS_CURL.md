# Production Employee Permissions - Curl Commands
**Production URL:** https://backend.blacksquare.estate

---

## ✅ Verified Working - Bhavesh Gupta Example

### 1. Login (Get Token)

```bash
curl --location 'https://backend.blacksquare.estate/api/employees/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "bhaveshkumar0503@gmail.com",
    "password": "99881122"
}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "employee": {
      "_id": "698a0ecdc9667991a86aae26",
      "name": "Bhavesh Gupta",
      "email": "bhaveshkumar0503@gmail.com",
      "role": {
        "_id": "698a1805c9667991a86ab61a",
        "name": "Associate Team Leader – Sales & Business Development",
        "permissions": [
          {
            "module": "career-applications",
            "actions": ["create", "read", "update"]
          }
        ]
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Get Own Permissions (Use Token from Login)

```bash
# Set variables from login response
export TOKEN="your_token_here"
export EMPLOYEE_ID="698a0ecdc9667991a86aae26"

# Get permissions
curl --location "https://backend.blacksquare.estate/api/employees/$EMPLOYEE_ID" \
--header "Authorization: Bearer $TOKEN"
```

**Extract Just Permissions:**
```bash
curl -s --location "https://backend.blacksquare.estate/api/employees/$EMPLOYEE_ID" \
--header "Authorization: Bearer $TOKEN" | \
jq '{name: .data.name, role: .data.role.name, permissions: .data.role.permissions}'
```

**Response:**
```json
{
  "name": "Bhavesh Gupta",
  "role": "Associate Team Leader – Sales & Business Development",
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

## 🚀 Complete Workflow - One Script

```bash
#!/bin/bash

# Production API
API_URL="https://backend.blacksquare.estate/api"
EMAIL="bhaveshkumar0503@gmail.com"
PASSWORD="99881122"

# Step 1: Login
echo "=== Logging in ==="
LOGIN=$(curl -s --location "$API_URL/employees/login" \
  --header 'Content-Type: application/json' \
  --data-raw "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo $LOGIN | jq -r '.data.token')
EMPLOYEE_ID=$(echo $LOGIN | jq -r '.data.employee._id')
EMPLOYEE_NAME=$(echo $LOGIN | jq -r '.data.employee.name')

echo "✓ Logged in as: $EMPLOYEE_NAME"
echo "✓ Employee ID: $EMPLOYEE_ID"
echo ""

# Step 2: Get Permissions
echo "=== Fetching Permissions ==="
curl -s --location "$API_URL/employees/$EMPLOYEE_ID" \
  --header "Authorization: Bearer $TOKEN" | \
  jq '{
    name: .data.name,
    role: .data.role.name,
    permissions: .data.role.permissions
  }'
```

---

## 🎮 Interactive Script (Recommended)

```bash
cd /www/wwwroot/BlackSquarebackend/backend
./check-production-permissions.sh
```

**Features:**
- ✅ Interactive prompts
- ✅ Email/password input
- ✅ View all permissions
- ✅ Check specific permissions
- ✅ Export to JSON
- ✅ Color-coded output
- ✅ Production-ready

---

## 🔍 Check Specific Permission

### Check if has "read" permission for "career-applications"

```bash
curl -s --location "https://backend.blacksquare.estate/api/employees/$EMPLOYEE_ID" \
  --header "Authorization: Bearer $TOKEN" | \
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

**No output = No permission**

---

## 📊 Export Permission Report

```bash
curl -s --location "https://backend.blacksquare.estate/api/employees/$EMPLOYEE_ID" \
  --header "Authorization: Bearer $TOKEN" | \
  jq '{
    name: .data.name,
    email: .data.email,
    department: .data.department,
    role: .data.role.name,
    permissions: .data.role.permissions,
    exported_at: now | todate
  }' > employee_permissions_$(date +%s).json

echo "✓ Exported to: employee_permissions_$(date +%s).json"
```

---

## 🔐 Get Available Permission Modules

```bash
curl --location 'https://backend.blacksquare.estate/api/role/permissions'
```

---

## 💾 Save as Environment Variables

```bash
# Add to ~/.bashrc or ~/.zshrc
export BLACKSQUARE_API="https://backend.blacksquare.estate/api"
export BLACKSQUARE_EMAIL="your_email@example.com"
export BLACKSQUARE_PASSWORD="your_password"

# Usage
LOGIN=$(curl -s --location "$BLACKSQUARE_API/employees/login" \
  --header 'Content-Type: application/json' \
  --data-raw "{\"email\": \"$BLACKSQUARE_EMAIL\", \"password\": \"$BLACKSQUARE_PASSWORD\"}")

export BLACKSQUARE_TOKEN=$(echo $LOGIN | jq -r '.data.token')
export BLACKSQUARE_EMP_ID=$(echo $LOGIN | jq -r '.data.employee._id')

# Now use these variables
curl -s --location "$BLACKSQUARE_API/employees/$BLACKSQUARE_EMP_ID" \
  --header "Authorization: Bearer $BLACKSQUARE_TOKEN"
```

---

## 📋 Common Use Cases

### Use Case 1: Check My Permissions
```bash
./check-production-permissions.sh
→ Enter email/password
→ View permissions
→ Done
```

### Use Case 2: Automate Permission Check
```bash
# Save this as check-my-perms.sh
TOKEN=$(curl -s --location "https://backend.blacksquare.estate/api/employees/login" \
  --header 'Content-Type: application/json' \
  --data "{\"email\":\"$1\",\"password\":\"$2\"}" | jq -r '.data.token')

EMP_ID=$(curl -s --location "https://backend.blacksquare.estate/api/employees/login" \
  --header 'Content-Type: application/json' \
  --data "{\"email\":\"$1\",\"password\":\"$2\"}" | jq -r '.data.employee._id')

curl -s --location "https://backend.blacksquare.estate/api/employees/$EMP_ID" \
  --header "Authorization: Bearer $TOKEN" | jq '.data.role.permissions'

# Usage: ./check-my-perms.sh email@example.com password123
```

### Use Case 3: Frontend Integration
```javascript
// React/Next.js example
const checkPermission = async (email, password) => {
  // 1. Login
  const loginRes = await fetch('https://backend.blacksquare.estate/api/employees/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const loginData = await loginRes.json();
  const { token, employee } = loginData.data;
  
  // 2. Get permissions
  const permRes = await fetch(`https://backend.blacksquare.estate/api/employees/${employee._id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const permData = await permRes.json();
  const permissions = permData.data.role.permissions;
  
  // 3. Check specific permission
  const canCreate = permissions.some(p => 
    p.module === 'career-applications' && 
    p.actions.includes('create')
  );
  
  return { permissions, canCreate };
};
```

---

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token."
}
```
**Solution:** Login again to get new token

### 404 Not Found
```json
{
  "success": false,
  "message": "Employee not found"
}
```
**Solution:** Check employee ID is correct

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Can only access your own data."
}
```
**Solution:** Use your own employee ID

---

## ✅ Tested & Verified

- ✅ Login endpoint works
- ✅ Get permissions endpoint works
- ✅ Token authentication works
- ✅ Permission retrieval works
- ✅ Production URL accessible
- ✅ Interactive script ready

**Tested on:** February 10, 2026  
**Employee:** Bhavesh Gupta  
**Status:** All Working ✅

---

## 🔗 Quick Links

| Purpose | Script/File |
|---------|-------------|
| Interactive checking | `./check-production-permissions.sh` |
| Full documentation | `EMPLOYEE_GET_PERMISSIONS_CURL.md` |
| Quick reference | `QUICK_REFERENCE_CARD.md` |
| Visual guide | `EMPLOYEE_PERMISSIONS_VISUAL_GUIDE.md` |

---

**Production URL:** https://backend.blacksquare.estate  
**API Base:** https://backend.blacksquare.estate/api  
**Status:** ✅ Live and Working
