# Employee Get Own Permissions - Complete Documentation Index

**Last Updated:** 2026-02-10  
**Status:** ✅ Ready to Use  
**Version:** 1.0

---

## 📚 Documentation Overview

This package provides comprehensive curl commands and tools for employees to retrieve their own permissions based on their assigned role.

### Example Use Case
Employee "Bhavesh Gupta" (Sales Team Lead) needs to:
1. Login to the system
2. Check what permissions they have
3. Verify if they can perform specific actions
4. Export their permission report

---

## 📁 Files Created

### 1. **EMPLOYEE_GET_PERMISSIONS_CURL.md** 📖
**Comprehensive Curl Commands Reference**

- Complete overview of the permission system
- Step-by-step login guide
- Get own profile with permissions
- Check specific permissions
- Extract permissions with jq
- Get available modules
- Complete workflow scripts
- Error responses
- Integration examples

**When to Use:**  
👉 Need detailed documentation and examples

---

### 2. **QUICK_REFERENCE_CARD.md** ⚡
**Quick Copy-Paste Commands**

- Quick commands for common tasks
- One-command setup
- Common scenarios
- Environment variables
- Error codes
- Filtering examples
- Handy one-liners
- Postman/Insomnia setup

**When to Use:**  
👉 Need fast reference for common commands

---

### 3. **get-my-permissions.sh** 🎮
**Bash Interactive CLI Script**

- Interactive menu
- Email and password prompts
- Color-coded output
- Permission checking
- Export to JSON
- View available modules

**Usage:**
```bash
chmod +x get-my-permissions.sh
./get-my-permissions.sh
```

**When to Use:**  
👉 Want interactive bash interface with prompts

---

### 4. **get-my-permissions.mjs** 🚀
**Node.js CLI Script**

- Interactive or automated mode
- Supports command-line arguments
- Color-coded output
- Export to JSON
- Check specific permissions

**Usage:**
```bash
# Interactive
node get-my-permissions.mjs

# Automated
node get-my-permissions.mjs --email user@example.com --password pwd123

# Export only
node get-my-permissions.mjs --email user@example.com --password pwd123 --export

# Check specific permission
node get-my-permissions.mjs --email user@example.com --password pwd123 --check-permission "career-applications:read"
```

**When to Use:**  
👉 Want Node.js integration or automation

---

## 🚀 Quick Start

### Option 1: Use Bash Script (Easiest)
```bash
cd /www/wwwroot/BlackSquarebackend/backend
./get-my-permissions.sh
```

Follow the interactive prompts:
- Enter email
- Enter password
- View your permissions
- Check specific permission
- Export report
- View available modules

### Option 2: Use Node.js Script
```bash
node get-my-permissions.mjs
```

### Option 3: Use Curl Directly
```bash
# 1. Login
curl -X POST "http://localhost:5000/api/employees/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@example.com","password":"your_password"}'

# 2. Get permissions (use TOKEN and EMPLOYEE_ID from login response)
curl -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Option 4: Read Documentation
```bash
cat EMPLOYEE_GET_PERMISSIONS_CURL.md
cat QUICK_REFERENCE_CARD.md
```

---

## 📋 Common Tasks

### Get My Permissions
```bash
# Quick bash
./get-my-permissions.sh

# Or curl
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.role.permissions'
```

### Check if I Have Specific Permission
```bash
# Check if can read career-applications
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | 
      select(.module == "career-applications") | 
      select(.actions[] == "read")'
```

### Export My Permissions
```bash
# Using script
./get-my-permissions.sh  # Choose option 3

# Using curl
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data | {name, role: .role.name, permissions: .role.permissions}' > my_permissions.json
```

### View Available Modules in System
```bash
curl -X GET "http://localhost:5000/api/role/permissions"
```

---

## 🔄 Request/Response Flow

### Flow Diagram
```
┌─────────────┐
│   Employee  │
│  Logs In    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ POST /login     │  → Returns: { token, employee_id, name }
│ with credentials│
└──────┬──────────┘
       │
       ▼
┌──────────────────────────┐
│ GET /employees/:id       │
│ with Bearer Token        │  → Returns: { profile, role, permissions }
└──────┬───────────────────┘
       │
       ▼
┌──────────────────┐
│ Employee Views   │
│ Own Permissions  │
└──────────────────┘
```

---

## 📊 Permission Structure

```json
{
  "name": "Bhavesh Gupta",
  "role": "Associate Team Leader – Sales & Business Development",
  "permissions": [
    {
      "module": "career-applications",
      "actions": ["create", "read", "update"]
    },
    {
      "module": "enquiries",
      "actions": ["read"]
    }
  ]
}
```

**Components:**
- **Module:** Feature/area (career-applications, enquiries, employees, etc.)
- **Actions:** What you can do (create, read, update, delete)

---

## 🛠️ API Endpoints Used

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/employees/login` | POST | No | Login and get token |
| `/employees/:id` | GET | Yes | Get own profile with role and permissions |
| `/role/permissions` | GET | No | Get available permission modules |
| `/role/:id` | GET | Yes* | Get specific role details (admin only) |

*Admin or managers with proper permissions

---

## 🎯 Use Cases

### Developer Testing
```bash
# Test if user has permissions for new feature
node get-my-permissions.mjs --email dev@example.com --password pwd123 \
  --check-permission "new-module:read"
```

### Admin Auditing
```bash
# Export all employee permissions for audit
for email in $(cat employee_list.txt); do
  node get-my-permissions.mjs --email "$email" --password pwd --export
done
```

### Access Control Implementation
```javascript
// In frontend app
const perms = await getEmployeePermissions();
if (perms.some(p => p.module === 'enquiries' && p.actions.includes('create'))) {
  showCreateEnquiryButton();
}
```

---

## 🔐 Security Notes

1. **Never Share Tokens:** Keep JWT tokens private
2. **Use HTTPS:** Always use HTTPS in production
3. **Token Expiry:** Tokens expire; handle expiration gracefully
4. **Password Security:** Don't save passwords in scripts
5. **Own Data Only:** Standard employees can only access their own permissions
6. **Admin Access:** Admin/managers can see all employee permissions

---

## 🚨 Troubleshooting

### "Invalid token" Error
```
✗ Solution: Login again and use new token
curl -X POST "http://localhost:5000/api/employees/login" ...
```

### "Access denied" Error
```
✗ Solution: You can only access your own data
Use your own employee ID, not another employee's
```

### "Employee not found" Error
```
✗ Solution: Employee ID doesn't exist
Verify the correct employee ID from login response
```

### Permission Not Showing
```
✗ Solution: Role doesn't have that permission
Contact admin to assign the permission
```

---

## 📈 Integration Examples

### Frontend (React)
```javascript
useEffect(() => {
  const fetchPermissions = async () => {
    const response = await fetch(`/api/employees/${employeeId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setPermissions(data.data.role.permissions);
  };
  fetchPermissions();
}, []);
```

### Backend (Node.js)
```javascript
// Check permission
function hasPermission(permissions, module, action) {
  return permissions.some(p => 
    p.module === module && p.actions.includes(action)
  );
}
```

### Shell Script
```bash
PERM=$(curl -s -X GET "$API/employees/$ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.role.permissions')

if echo "$PERM" | jq -e '.[] | select(.module=="enquiries")' > /dev/null; then
  echo "User has enquiries permission"
fi
```

---

## ✅ Testing Checklist

- [ ] API server is running on port 5000
- [ ] Have a valid employee email and password
- [ ] `jq` is installed (for JSON parsing)
- [ ] Network connectivity to API server
- [ ] Run `./get-my-permissions.sh` successfully
- [ ] Verify permissions shown correctly
- [ ] Export report works
- [ ] Check specific permission works
- [ ] Available modules display correctly

---

## 📞 Support

### Getting Help
1. Check **EMPLOYEE_GET_PERMISSIONS_CURL.md** for detailed docs
2. Check **QUICK_REFERENCE_CARD.md** for quick examples
3. Run `./get-my-permissions.sh` for interactive help
4. Review error messages and troubleshooting section

### File Structure
```
/backend
├── get-my-permissions.sh                    ← Bash script
├── get-my-permissions.mjs                   ← Node.js script
├── EMPLOYEE_GET_PERMISSIONS_CURL.md         ← Full documentation
├── QUICK_REFERENCE_CARD.md                  ← Quick reference
└── EMPLOYEE_GET_PERMISSIONS_INDEX.md        ← This file
```

---

## 🎓 Learning Path

1. **Start Here:**  
   Read QUICK_REFERENCE_CARD.md (5 mins)

2. **Try It:**  
   Run `./get-my-permissions.sh` (2 mins)

3. **Understand It:**  
   Read EMPLOYEE_GET_PERMISSIONS_CURL.md (15 mins)

4. **Integrate It:**  
   Use curl commands in your app (varies)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-10 | Initial release |

---

## 🔗 Related Documentation

- EMPLOYEE_PERMISSIONS_API.md
- EMPLOYEE_PERMISSIONS_CURL_COMMANDS.md
- EMPLOYEE_PERMISSIONS_GUIDE.md
- check-employee-permissions.sh
- check-employee-permissions.mjs

---

**Created for:** Employee Permission Management  
**API Version:** 1.0  
**Tested On:** February 10, 2026
