# EMPLOYEE PERMISSIONS SYSTEM - COMPLETE GUIDE

## Overview
Comprehensive documentation and tools for employees to check their permissions based on assigned roles.

---

## 📁 Created Files

### 1. **EMPLOYEE_PERMISSIONS_API.md**
Complete API documentation with detailed explanations, examples, and integration guides.

**Contents:**
- Employee login endpoint
- Get own employee profile with permissions
- Get available permission modules
- Get all roles (admin/managers)
- Get specific role details
- Bash script for complete workflow
- Error responses reference
- Permission module reference table
- Common use cases
- Frontend JavaScript integration example

**Best for:** Understanding the full API, detailed reference, integration planning

---

### 2. **EMPLOYEE_PERMISSIONS_CURL_COMMANDS.md**
Quick reference curl commands for easy copy-paste usage.

**Contents:**
- Quick setup instructions
- All API endpoints with curl examples
- Response parsing examples
- Permission existence checks
- Comparison tools
- Export utilities
- Bash aliases and functions
- Environment setup scripts

**Best for:** Quick lookups, testing APIs, automation scripts

---

### 3. **check-employee-permissions.sh**
Interactive bash script for checking permissions through CLI.

**Features:**
- Interactive menu-driven interface
- Employee login
- Display role and permissions
- Check specific permissions
- Show available modules
- Export permission reports
- Color-coded output

**Usage:**
```bash
chmod +x check-employee-permissions.sh
./check-employee-permissions.sh
```

**Best for:** Manual permission checking, system testing, quick verification

---

### 4. **check-employee-permissions.mjs**
Node.js/JavaScript CLI tool for checking permissions.

**Features:**
- Interactive menu
- Programmatic access
- Command-line arguments support
- Export reports to JSON
- Available modules display
- Permission verification

**Usage:**
```bash
# Interactive mode
node check-employee-permissions.mjs

# With credentials
node check-employee-permissions.mjs --email user@example.com --password pwd123

# Check specific permission
node check-employee-permissions.mjs --check-permission "enquiries:read"

# Export and exit
node check-employee-permissions.mjs --export-only
```

**Best for:** Node.js projects, automation, programmatic access

---

## 🔑 Key API Endpoints

### Step 1: Login
```bash
POST /api/employees/login
{
  "email": "employee@example.com",
  "password": "password123"
}
```

### Step 2: Get Your Permissions
```bash
GET /api/employees/{employee_id}
Headers: Authorization: Bearer {token}
```

### Step 3: Check Available Modules (No auth required)
```bash
GET /api/role/permissions
```

---

## 📊 Permission Structure

Each permission has:
- **Module**: Feature/area (e.g., 'enquiries', 'users', 'properties')
- **Actions**: What you can do (create, read, update, delete)

Example:
```json
{
  "module": "enquiries",
  "actions": ["read", "create", "update"]
}
```

---

## 🎯 Common Tasks

### Get Your Own Permissions
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.role.permissions'
```

### Check If You Can Create Enquiries
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | select(.module=="enquiries") | .actions'
```

### List All Your Modules in Readable Format
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | "\(.module): \(.actions | join(", "))"' -r
```

### Export Your Permissions to File
```bash
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data | {name, email, role: .role.name, permissions: .role.permissions}' \
  > my_permissions.json
```

---

## 📋 Available Permission Modules

| Module | Description |
|--------|-------------|
| `dashboard` | View dashboard and analytics |
| `properties` | Manage property listings |
| `users` | Manage user accounts |
| `enquiries` | Handle customer enquiries |
| `employees` | Manage employees |
| `roles` | Manage user roles |
| `blogs` | Manage blog posts |
| `content-management` | Manage YouTube/media |
| `categories` | Manage categories |
| `recent` | View recent activities |
| `security` | Security settings |
| `settings` | System settings |

---

## 🔐 Permission Examples

### Sales Employee
```
dashbaord: read
enquiries: read, create, update
users: read
```

### Sales Manager
```
dashboard: read
enquiries: read, create, update, delete
users: read, update
reports: read
```

### Admin
```
All modules: create, read, update, delete
```

---

## 🛠️ Integration Examples

### JavaScript/Frontend
```javascript
// Fetch permissions
const response = await fetch('/api/employees/{id}', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();
const permissions = data.role.permissions;

// Check permission
function can(module, action) {
  return permissions.some(p => 
    p.module === module && p.actions.includes(action)
  );
}

// Usage
if (can('enquiries', 'read')) {
  // Show enquiries
}
```

### Python
```python
import requests

headers = {'Authorization': f'Bearer {token}'}
response = requests.get(f'{BASE_URL}/employees/{employee_id}', headers=headers)
data = response.json()
permissions = data['data']['role']['permissions']

# Check permission
def can_do(module, action):
    return any(
        p['module'] == module and action in p['actions'] 
        for p in permissions
    )
```

---

## 🔧 Troubleshooting

### 401 Unauthorized
**Problem:** "Access denied. No token provided"
**Solution:** Include `Authorization: Bearer {token}` header

### 403 Forbidden
**Problem:** "No permission for {module} module"
**Solution:** Request admin to assign the required role/permissions

### 404 Not Found
**Problem:** "Employee not found"
**Solution:** Verify your employee ID is correct

### Invalid Token
**Problem:** "Invalid token"
**Solution:** Re-login to get a fresh token

---

## 📚 File Quick Reference

| File | Type | Purpose |
|------|------|---------|
| EMPLOYEE_PERMISSIONS_API.md | Markdown | Complete documentation |
| EMPLOYEE_PERMISSIONS_CURL_COMMANDS.md | Markdown | Quick curl reference |
| check-employee-permissions.sh | Bash Script | Interactive CLI (bash) |
| check-employee-permissions.mjs | Node.js | Interactive CLI (Node.js) |

---

## 🚀 Quick Start

### Option 1: Using Bash Script (Recommended for quick testing)
```bash
chmod +x /www/wwwroot/BlackSquarebackend/backend/check-employee-permissions.sh
cd /www/wwwroot/BlackSquarebackend/backend
./check-employee-permissions.sh
```

### Option 2: Using Node.js Script
```bash
cd /www/wwwroot/BlackSquarebackend/backend
node check-employee-permissions.mjs
```

### Option 3: Using Curl Commands
```bash
# Follow examples in EMPLOYEE_PERMISSIONS_CURL_COMMANDS.md
# Set up environment variables first:
export BASE_URL="http://localhost:5000/api"
export TOKEN="your_jwt_token"
export EMPLOYEE_ID="your_employee_id"
```

### Option 4: Read Full Documentation
```bash
cat EMPLOYEE_PERMISSIONS_API.md
```

---

## 💡 Tips & Best Practices

1. **Login First**: Always login to get a valid token
2. **Save Token**: Store token for multiple requests
3. **Check Expiry**: Tokens expire based on JWT_EXPIRY config
4. **JSON Parsing**: Use `jq` for easy JSON parsing in scripts
5. **Audit**: Regularly check permission changes
6. **Export Reports**: Export permission reports for audit trails

---

## 🔗 Related Endpoints

### Employee Routes
- `POST /api/employees/login` - Employee login
- `GET /api/employees/:id` - Get employee profile (requires token)
- `PUT /api/employees/:id` - Update employee (limited fields for own)
- `PUT /api/employees/:id/password` - Update password

### Role Routes
- `GET /api/role/permissions` - Get available modules
- `GET /api/role` - Get all roles (admin only)
- `GET /api/role/:id` - Get specific role (admin only)

---

## 📞 Support

For issues or questions:
1. Check EMPLOYEE_PERMISSIONS_API.md for detailed examples
2. Review error codes in EMPLOYEE_PERMISSIONS_CURL_COMMANDS.md
3. Run interactive script for guided assistance
4. Check your authentication token validity

---

## 🎓 Learning Path

1. **Start here**: Read EMPLOYEE_PERMISSIONS_API.md overview
2. **Try it out**: Run check-employee-permissions.sh
3. **Deep dive**: Review curl commands for specific tasks
4. **Automate**: Create scripts using the examples
5. **Integrate**: Use JavaScript/Python examples in your app

---

**Last Updated**: February 2026
**Version**: 1.0
**Status**: Production Ready
