# EMPLOYEE PERMISSIONS - ARCHITECTURE & FLOW

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EMPLOYEE APPLICATION                     │
│  (Web/Mobile/CLI asking "What can I do?")                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   EMPLOYEE LOGIN API                        │
│   POST /api/employees/login                                 │
│   Input: email, password                                    │
│   Output: JWT Token                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              GET EMPLOYEE PROFILE API                       │
│   GET /api/employees/{id}                                   │
│   Input: Token (Authorization Header)                       │
│   Output: Employee data + Role + Permissions                │
└────────────────────────┬────────────────────────────────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
      ┌─────────┐  ┌──────────┐  ┌────────────┐
      │Employee │  │  Role    │  │Permissions│
      │Details  │  │Details   │  │Array      │
      └─────────┘  └──────────┘  └────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │Module-Action Map │
                              │{module, actions}│
                              └──────────────────┘
```

---

## 📊 Data Structure

### Employee Object
```
Employee
├── _id: ObjectId
├── name: String
├── email: String
├── phone: String
├── department: String
├── role: Reference(Role)
├── isActive: Boolean
└── createdAt: Date

↓ with populate('role')

Employee
├── ... (same fields)
└── role: {
    ├── _id: ObjectId
    ├── name: String
    ├── permissions: Array[Permission]
    └── isActive: Boolean

    ↓ Permission structure

    permissions: [
      {
        module: "enquiries",
        actions: ["read", "create", "update"]
      },
      {
        module: "users",
        actions: ["read"]
      }
    ]
  }
```

---

## 🔄 Request Flow Sequence

```
┌──────────────────────────────────────────────────────────┐
│ 1. EMPLOYEE INITIATES LOGIN                              │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ CLIENT: POST /api/employees/login                        │
│ Body: {                                                  │
│   "email": "john@company.com",                           │
│   "password": "secret123"                                │
│ }                                                        │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ SERVER: Verify Credentials                               │
│ ✓ Find employee by email                                 │
│ ✓ Compare password hash                                  │
│ ✗ If failed, return 401 Unauthorized                    │
└──────┬───────────────────────────────────────────────────┘
       │ ✓ Success
       ▼
┌──────────────────────────────────────────────────────────┐
│ SERVER: Generate JWT Token                               │
│ ✓ Sign with JWT_SECRET                                   │
│ ✓ Include employee ID in payload                         │
│ ✓ Set expiration time                                    │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ CLIENT RECEIVES: {                                       │
│   "success": true,                                       │
│   "token": "eyJhbGc...",                                │
│   "data": {                                              │
│     "_id": "65e8d3a1...",                               │
│     "name": "John Doe",                                  │
│     "role": {...}                                        │
│   }                                                      │
│ }                                                        │
│ ✓ STORE TOKEN (localStorage/sessionStorage)              │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ 2. EMPLOYEE REQUESTS THEIR PERMISSIONS                   │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ CLIENT: GET /api/employees/65e8d3a1...                   │
│ Headers: {                                               │
│   "Authorization": "Bearer eyJhbGc..."                   │
│ }                                                        │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ SERVER: verifyEmployeeToken Middleware                   │
│ ✓ Extract token from Authorization header                │
│ ✓ Verify JWT signature                                   │
│ ✗ If invalid, return 401 Unauthorized                   │
└──────┬───────────────────────────────────────────────────┘
       │ ✓ Valid
       ▼
┌──────────────────────────────────────────────────────────┐
│ SERVER: Query Employee & Populate Role Permissions       │
│ SELECT * FROM employees WHERE _id = '65e8d3a1...'       │
│ POPULATE role -> GET * FROM roles WHERE _id = role_id   │
│ INCLUDE permissions in role data                         │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ CLIENT RECEIVES: {                                       │
│   "success": true,                                       │
│   "data": {                                              │
│     "name": "John Doe",                                  │
│     "email": "john@company.com",                         │
│     "role": {                                            │
│       "name": "Sales Manager",                           │
│       "permissions": [                                   │
│         { "module": "enquiries", "actions": [...] },     │
│         { "module": "users", "actions": [...] }          │
│       ]                                                  │
│     }                                                    │
│   }                                                      │
│ }                                                        │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ 3. CLIENT-SIDE PERMISSION CHECK                          │
│ JavaScript: permissions.some(p =>                        │
│   p.module === 'enquiries' &&                            │
│   p.actions.includes('read')                             │
│ )                                                        │
│ ✓ Show/enable enquiries interface                        │
└──────────────────────────────────────────────────────────┘
```

---

## 🛡️ Middleware Stack

```
Request
  │
  ▼
┌─────────────────────────────────────┐
│ 1. verifyEmployeeToken              │
│    - Extract token from header      │
│    - Verify JWT signature           │
│    - Query employee + role data     │
│    - Attach to req.employee         │
│    - Attach to req.permissions      │
└────────┬────────────────────────────┘
         │ ✓ Token valid
         ▼
┌─────────────────────────────────────┐
│ 2. checkPermission(module, action)  │
│    - Get req.permissions array      │
│    - Find module in permissions     │
│    - Check if action exists         │
│    - Return 403 if denied           │
└────────┬────────────────────────────┘
         │ ✓ Permission granted
         ▼
┌─────────────────────────────────────┐
│ 3. Route Handler                    │
│    - getUserEqnuiries()             │
│    - createEnquiry()                │
│    - etc.                           │
└────────┬────────────────────────────┘
         │
         ▼
      Response
```

---

## 📋 Permission Decision Tree

```
Request to access Resource X
         │
         ▼
Is token provided?
  ├─ YES ──▶ Is token valid?
  │           ├─ YES ──▶ Fetch employee profile
  │           │          │
  │           │          ▼
  │           │       Does employee have role?
  │           │          ├─ YES ──▶ Is role active?
  │           │          │          ├─ YES ──▶ Get permissions
  │           │          │          │          │
  │           │          │          │          ▼
  │           │          │          │       Check permissions
  │           │          │          │          ├─ Has required module?
  │           │          │          │          │  ├─ YES ──▶ Has required action?
  │           │          │          │          │  │          ├─ YES ──▶ ✓ ALLOW
  │           │          │          │          │  │          └─ NO  ──▶ ✗ DENY (403)
  │           │          │          │          │  └─ NO  ──▶ ✗ DENY (403)
  │           │          │          │          │
  │           │          │          └─ NO  ──▶ ✗ DENY (401)
  │           │          │
  │           │          └─ NO  ──▶ ✗ DENY (401)
  │           │
  │           └─ NO ──▶ ✗ DENY (401)
  │
  └─ NO ──▶ ✗ DENY (401)
```

---

## 🔑 Permission Modules Map

```
┌─────────────────────────────────────────────────────────┐
│             PERMISSION MODULES HIERARCHY                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Dashboard                                              │
│  ├─ read: View analytics, stats                         │
│                                                         │
│  Properties                                             │
│  ├─ create: Add new properties                          │
│  ├─ read: View properties                               │
│  ├─ update: Edit properties                             │
│  └─ delete: Remove properties                           │
│                                                         │
│  Users                                                  │
│  ├─ create: Register new users                          │
│  ├─ read: View user profiles                            │
│  ├─ update: Edit user info                              │
│  └─ delete: Deactivate users                            │
│                                                         │
│  Enquiries                                              │
│  ├─ create: Submit new enquiries                        │
│  ├─ read: View enquiry list                             │
│  ├─ update: Change enquiry status                       │
│  └─ delete: Remove enquiries                            │
│                                                         │
│  Employees                                              │
│  ├─ create: Hire new employees                          │
│  ├─ read: View employee list                            │
│  ├─ update: Edit employee info                          │
│  └─ delete: Remove employees                            │
│                                                         │
│  Roles                                                  │
│  ├─ create: Define new roles                            │
│  ├─ read: View role definitions                         │
│  ├─ update: Modify role permissions                     │
│  └─ delete: Remove roles                                │
│                                                         │
│  And more...                                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 Role Assignment Example

```
┌────────────┐
│  Employee  │
│ John Doe   │
└─────┬──────┘
      │
      │ assigned_role
      ▼
┌──────────────────────────┐
│ Role: Sales Manager      │
├──────────────────────────┤
│ Permissions:             │
│                          │
│ • dashboard              │
│   └─ read               │
│                          │
│ • enquiries              │
│   ├─ read               │
│   ├─ create             │
│   └─ update             │
│                          │
│ • users                  │
│   ├─ read               │
│   └─ update             │
│                          │
│ • reports                │
│   └─ read               │
└──────────────────────────┘
```

---

## 🔐 Example Scenarios

### Scenario 1: Employee Views Enquiries
```
Employee clicks "View Enquiries"
         │
         ▼
Frontend checks: can(enquiries, read)?
         │
         ▼
Permissions = [{module: 'enquiries', actions: ['read', 'update']}, ...]
         │
         ▼
Found module 'enquiries' with 'read' in actions
         │
         ▼
✓ YES - Show enquiries list
```

### Scenario 2: Employee Tries to Delete Role
```
Employee clicks "Delete Role"
         │
         ▼
Frontend checks: can(roles, delete)?
         │
         ▼
Permissions = [{module: 'dashboard', actions: ['read']}, ...]
         │
         ▼
Module 'roles' not found in permissions
         │
         ▼
✗ NO - Show "Access Denied" message
```

### Scenario 3: API-Level Permission Check
```
POST /api/enquiries
Header: Authorization: Bearer {token}
         │
         ▼
Middleware: checkPermission('enquiries', 'create')
         │
         ▼
Verify token and extract employee permissions
         │
         ▼
Check if permissions include enquiries:create
         │
         ├─ YES ──▶ Pass to controller
         └─ NO  ──▶ Return 403 Forbidden
```

---

## 📱 Mobile/Frontend Implementation

```
┌─────────────────────────────────────┐
│       Frontend Application          │
├─────────────────────────────────────┤
│                                     │
│  1. LOGIN SCREEN                    │
│     └─ Collect email/password       │
│     └─ Call login API               │
│     └─ Store token in secure store  │
│                                     │
│  2. REQUEST PERMISSIONS             │
│     └─ Call GET /api/employees/{id} │
│     └─ Cache permissions locally    │
│                                     │
│  3. SHOW/HIDE UI ELEMENTS           │
│     └─ If can(dashboard, read)      │
│        └─ Show dashboard            │
│     └─ If can(enquiries, read)      │
│        └─ Show enquiries tab        │
│     └─ If can(roles, update)        │
│        └─ Show edit role buttons    │
│                                     │
│  4. API REQUESTS                    │
│     └─ Include token in header      │
│     └─ Server validates permissions │
│                                     │
└─────────────────────────────────────┘
```

---

## 🧪 Testing Permission Flow

```bash
# 1. Login
TOKEN=$(curl -s -X POST ... | jq -r .token)

# 2. Get permissions
PERMS=$(curl -s -X GET .../employees/ID \
  -H "Authorization: Bearer $TOKEN" | \
  jq .data.role.permissions)

# 3. Check specific permission
echo $PERMS | jq '.[] | select(.module=="enquiries")'

# 4. Try API with permission
curl -X GET .../enquiries \
  -H "Authorization: Bearer $TOKEN"

# 5. Try API without permission (should get 403)
curl -X DELETE .../role/ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📈 Performance Considerations

```
Request → Token Verification (Cache: 5-10s)
        → Employee Query (Cache: 1-5 min)
        → Role Query (Cache: 5-10 min)
        → Permission Check (In-memory array)
        → Route Handler
        → Response
```

---

## ⚠️ Security Checklist

- [ ] Tokens stored securely (not in localStorage for highly sensitive)
- [ ] Tokens transmitted over HTTPS only
- [ ] Token expiration configured appropriately
- [ ] Permissions validated on both client and server
- [ ] Role assignments verified regularly
- [ ] Permission changes logged for audit
- [ ] Sensitive actions require additional verification
- [ ] Cross-Origin requests properly validated

---

**Version**: 1.0 | **Updated**: February 2026 | **Status**: Production

