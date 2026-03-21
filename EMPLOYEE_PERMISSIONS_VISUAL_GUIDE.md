# Employee Permission Retrieval - Visual Guide

```
 ╔════════════════════════════════════════════════════════════════════════════╗
 ║                                                                            ║
 ║     EMPLOYEE GET OWN PERMISSIONS - COMPLETE SOLUTION                      ║
 ║                                                                            ║
 ║  How Employees Can Retrieve Their Permissions Based on Role               ║
 ║                                                                            ║
 ╚════════════════════════════════════════════════════════════════════════════╝
```

---

## 🎯 Quick Overview

**Your Need:** See what you're allowed to do in the system

**How It Works:**
1. You login with your credentials
2. System returns your role and permissions
3. You can check specific permissions or export results
4. Frontend/backend uses this to show/hide features

---

## 🚀 4 Ways to Get Your Permissions

### Option 1: Interactive Bash Script (🥇 EASIEST)

```bash
./get-my-permissions.sh
```

**What It Does:**
- ✓ Prompts for email & password
- ✓ Shows your role
- ✓ Lists all your permissions
- ✓ Lets you check specific permissions
- ✓ Exports permission report to JSON
- ✓ Shows available modules
- ✓ Color-coded output

**Example Output:**
```
╔══════════════════════════════════╗
║  Employee Get Own Permissions    ║
╚══════════════════════════════════╝

▶ STEP 1: Employee Login
─────────────────────────
Enter email: bhaveshkumar0503@gmail.com
Enter password: ••••••••••••
✓ Login successful
ℹ Employee: Bhavesh Gupta (ID: 698a0ecdc9667991a86aae26)

▶ STEP 2: Fetching Your Permissions
────────────────────────────────────
✓ Profile fetched successfully

▶ STEP 3: Your Role & Permissions
──────────────────────────────────
Role Name: Associate Team Leader – Sales & Business Development
Role ID: 698a1805c9667991a86ab61a

Permissions:
  • Module: career-applications
    Actions: create, read, update
```

---

### Option 2: Node.js Script (⚙️ AUTOMATED)

**Interactive Mode:**
```bash
node get-my-permissions.mjs
```

**Automated Mode (with credentials):**
```bash
node get-my-permissions.mjs \
  --email bhaveshkumar0503@gmail.com \
  --password your_password_here
```

**Export Only:**
```bash
node get-my-permissions.mjs \
  --email bhaveshkumar0503@gmail.com \
  --password your_password_here \
  --export
```

**Check Specific Permission:**
```bash
node get-my-permissions.mjs \
  --email bhaveshkumar0503@gmail.com \
  --password your_password_here \
  --check-permission "career-applications:read"
```

---

### Option 3: Curl Commands (💻 MANUAL)

**Complete Flow:**
```bash
# Step 1: Set configuration
export API_URL="http://localhost:5000/api"
export EMAIL="bhaveshkumar0503@gmail.com"
export PASSWORD="your_password_here"

# Step 2: Login
export LOGIN=$(curl -s -X POST "$API_URL/employees/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

export TOKEN=$(echo $LOGIN | jq -r '.token')
export EMPLOYEE_ID=$(echo $LOGIN | jq -r '.data._id')

# Step 3: Get permissions
curl -s -X GET "$API_URL/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions'
```

**One-Liner:**
```bash
# Get permissions in one command after login
curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.role.permissions'
```

---

### Option 4: Read Documentation (📖 LEARN)

**For comprehensive reference:**
```bash
cat EMPLOYEE_GET_PERMISSIONS_CURL.md
```

**For quick reference:**
```bash
cat QUICK_REFERENCE_CARD.md
```

---

## 🗂️ Documentation Files

```
Backend Directory:
├── get-my-permissions.sh                    ← Use this: ./get-my-permissions.sh
├── get-my-permissions.mjs                   ← Use this: node get-my-permissions.mjs
├── EMPLOYEE_GET_PERMISSIONS_CURL.md         ← Read this for details
├── QUICK_REFERENCE_CARD.md                  ← Read this for quick lookup
└── EMPLOYEE_GET_PERMISSIONS_INDEX.md        ← You are here
```

---

## 🎬 Step-by-Step For Beginner

### First Time? Follow This:

#### Step 1️⃣: Open Terminal
```bash
cd /www/wwwroot/BlackSquarebackend/backend
```

#### Step 2️⃣: Run Script
```bash
./get-my-permissions.sh
```

#### Step 3️⃣: Answer Prompts
```
Enter email: bhaveshkumar0503@gmail.com
Enter password: your_password (won't show as you type)
```

#### Step 4️⃣: View Results
```
✓ Login successful
✓ Profile fetched

Your Role: Associate Team Leader
Your Permissions:
  • career-applications: create, read, update

What to do next?
1) Check another permission
2) Export report  
3) View available modules
4) Exit
```

#### Step 5️⃣: Choose Action
```
[Your choice will be processed]
```

That's it! ✅

---

## 💡 Common Workflows

### Workflow 1: "Check My Permissions" ⚡ (2 minutes)

```
START
  ↓
Run: ./get-my-permissions.sh
  ↓
Enter credentials
  ↓
View permissions
  ↓
Choice: Check specific permission? (Yes/No)
  ↓ (Yes)
Enter module & action
  ↓
View result
  ↓
END
```

### Workflow 2: "Export Permissions" 📄 (3 minutes)

```
START
  ↓
Run: ./get-my-permissions.sh
  ↓
Enter credentials
  ↓
View permissions
  ↓
Choice: Export report? (Yes)
  ↓
File saved: employee_permissions_[timestamp].json
  ↓
END
```

### Workflow 3: "Integrate Into App" 🔧 (5 minutes)

```
START
  ↓
Read: EMPLOYEE_GET_PERMISSIONS_CURL.md
  ↓
Copy curl commands
  ↓
Modify for your env vars
  ↓
Test with curl
  ↓
Integrate into app code
  ↓
END
```

---

## 🔍 Real World Examples

### Example 1: Bhavesh Checking His Permissions

```bash
$ ./get-my-permissions.sh

Enter email: bhaveshkumar0503@gmail.com
Enter password: password123

✓ Logged in as Bhavesh Gupta
✓ Profile fetched successfully

Your Role: Associate Team Leader – Sales & Business Development
Your Permissions:
  • Module: career-applications
    Actions: create, read, update

Check another permission? [y/n]: y
Enter module name: career-applications
Enter action: read

✓ You HAVE 'read' permission for 'career-applications' module

What next?
1) Check more
2) Export report
3) View modules
4) Exit

Choice: 2

✓ Report exported to: employee_permissions_1707547200.json
```

### Example 2: Checking if Can Create

```bash
$ curl -s -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data.role.permissions[] | 
      select(.module == "career-applications") | 
      select(.actions[] == "create")'

# Output (if has permission):
{
  "module": "career-applications",
  "actions": ["create", "read", "update"],
  "_id": "698a1805c9667991a86ab61b"
}
```

### Example 3: Automated Check in App

```javascript
// React Component
useEffect(async () => {
  const response = await fetch('/api/employees/' + employeeId, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  const data = await response.json();
  const permissions = data.data.role.permissions;
  
  // Check if can create
  const canCreate = permissions.some(p =>
    p.module === 'career-applications' && 
    p.actions.includes('create')
  );
  
  if (canCreate) {
    showCreateButton();
  }
}, []);
```

---

## 🛠️ Troubleshooting Guide

### Problem: "Command not found"
```
$ ./get-my-permissions.sh
bash: ./get-my-permissions.sh: command not found

Solution:
$ chmod +x get-my-permissions.sh
$ ./get-my-permissions.sh
```

### Problem: "Login failed"
```
$ ./get-my-permissions.sh
✗ Login failed

Solution:
- Check email is correct
- Check password is correct
- Ensure API server is running
- Check API URL is correct (default: http://localhost:5000/api)
```

### Problem: "jq: command not found"
```
Solution:
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq

# Or use without jq (less pretty output)
```

### Problem: "Permission denied"
```json
{
  "success": false,
  "message": "Access denied. Can only access your own data."
}

Solution:
Use your own employee ID, not another employee's
```

---

## 📊 Request/Response Visual

```
┌─────────────────────────────┐
│  EMPLOYEE (USER)            │
│  Name: Bhavesh Gupta        │
│  Email: bhavesh...@...com   │
│  Password: ***              │
└──────────────┬──────────────┘
               │
               │ 1. POST /employees/login
               │    { email, password }
               │
               ▼
        ┌─────────────┐
        │   SERVER    │
        │  VALIDATES  │
        │ CREDENTIALS │
        └──────┬──────┘
               │
               │ Returns: { token, employee_id, ... }
               │
               ▼
        ┌─────────────────────┐
        │  SERVER (with auth) │
        │  Looks up role &    │
        │  permissions        │
        └──────┬──────────────┘
               │
               │ 2. GET /employees/:id
               │    (with Bearer token)
               │
               ▼
┌──────────────────────────────┐
│  EMPLOYEE SEES               │
│  Role: Team Lead             │
│  Permissions:                │
│  • career-apps: create,read  │
│  • enquiries: read           │
└──────────────────────────────┘
```

---

## 🔐 Security Checklist

- ✅ Passwords not stored in scripts
- ✅ Tokens only valid for one session
- ✅ Tokens expire after time
- ✅ Can only see own permissions
- ✅ HTTPS used in production
- ✅ Sensitive data not logged

---

## 📈 What You Can Do With Permissions

Once you have your permissions, you can:

### For Developers 👨‍💻
- Conditionally show/hide features in UI
- Control API endpoint access
- Implement role-based access control
- Audit user permissions

### For Testers 🧪
- Verify permission assignments
- Test access control rules
- Create test scenarios
- Generate test reports

### For Admins 👨‍💼
- Export permission reports
- Verify role assignments
- Audit access levels
- Plan permission changes

### For Users 👤
- Verify what they can do
- Understand their role
- Check access to features
- Get help with permissions

---

## 🎓 Learning Resources

### Start Here (5 mins)
→ Read this file you're reading now

### Then Try (2 mins)
→ Run: `./get-my-permissions.sh`

### Then Learn (10 mins)
→ Read: `QUICK_REFERENCE_CARD.md`

### Then Understand (20 mins)
→ Read: `EMPLOYEE_GET_PERMISSIONS_CURL.md`

### Then Integrate (varies)
→ Use curl examples in your code

---

## ✅ Success Criteria

You've got it working when you can:

- ✅ Run `./get-my-permissions.sh` without errors
- ✅ See your role displayed correctly
- ✅ See your permissions listed
- ✅ Check specific permissions
- ✅ Export to JSON file
- ✅ Use curl commands directly
- ✅ Understand error messages

---

## 🎉 You're Ready!

Choose your option above and start checking permissions! 

**Questions?**  
→ Check EMPLOYEE_GET_PERMISSIONS_CURL.md for detailed docs  
→ Check QUICK_REFERENCE_CARD.md for quick examples  
→ Check the Troubleshooting section above

**Happy permission checking!** 🚀

---

**Version:** 1.0  
**Created:** 2026-02-10  
**Status:** ✅ Ready to Use
