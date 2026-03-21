# 📋 EMPLOYEE GET OWN PERMISSIONS - COMPLETE PACKAGE
**Last Updated:** February 10, 2026  
**Status:** ✅ Production Ready  
**Version:** 1.0

---

## 🎯 What Is This?

This package provides **complete curl commands and tools** for employees to retrieve their own permissions based on their assigned role in the Black Square system.

**Example:** Employee "Bhavesh Gupta" (Role: Associate Team Leader) can check:
- What role they have
- What modules they can access
- What actions they can perform (create, read, update, delete)
- Export permission reports

---

## 📦 What's Included

### 📖 Documentation Files

| File | Purpose | Size | Read Time |
|------|---------|------|-----------|
| **EMPLOYEE_PERMISSIONS_VISUAL_GUIDE.md** | 🎬 Start here! Visual guide with examples | 13KB | 5 min |
| **QUICK_REFERENCE_CARD.md** | ⚡ Quick copy-paste commands | 8KB | 3 min |
| **EMPLOYEE_GET_PERMISSIONS_CURL.md** | 📚 Complete reference with all details | 13KB | 15 min |
| **EMPLOYEE_GET_PERMISSIONS_INDEX.md** | 📑 Full index and integration guide | 11KB | 10 min |

### 🎮 Executable Scripts

| Script | Language | Usage | Best For |
|--------|----------|-------|----------|
| **get-my-permissions.sh** | Bash | `./get-my-permissions.sh` | Interactive terminal use |
| **get-my-permissions.mjs** | Node.js | `node get-my-permissions.mjs` | Automation & integration |

### 🔗 Related (Already Exists)

| File | Purpose |
|------|---------|
| EMPLOYEE_PERMISSIONS_API.md | API documentation |
| EMPLOYEE_PERMISSIONS_GUIDE.md | System guide |
| check-employee-permissions.sh | Extended bash checker |
| check-employee-permissions.mjs | Extended node.js checker |

---

## 🚀 Quick Start (Choose One)

### 🥇 Option 1: Easy - Bash Script (Recommended)
```bash
cd /www/wwwroot/BlackSquarebackend/backend
./get-my-permissions.sh
```
- Interactive prompts
- Color-coded output
- Menu-driven
- **Best for:** First-time users

### 🥈 Option 2: Automated - Node.js Script
```bash
node get-my-permissions.mjs --email user@example.com --password pwd123 --export
```
- Command-line arguments
- Programmatic access
- Output to file
- **Best for:** Automation & integration

### 🥉 Option 3: Manual - Curl Commands
```bash
# Set credentials
export TOKEN="from_login_response"
export EMPLOYEE_ID="your_employee_id"

# Get permissions
curl -X GET "http://localhost:5000/api/employees/$EMPLOYEE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.role.permissions'
```
- Complete control
- No dependencies
- **Best for:** API testing

### 📖 Option 4: Learn - Read Documentation
```bash
# Start with visual guide
cat EMPLOYEE_PERMISSIONS_VISUAL_GUIDE.md

# Then reference
cat QUICK_REFERENCE_CARD.md
cat EMPLOYEE_GET_PERMISSIONS_CURL.md
```
- Comprehensive reference
- Examples & integration guides
- **Best for:** Understanding the system

---

## 🎯 Common Tasks

### Task 1: "I Want to See My Permissions"
```bash
./get-my-permissions.sh
→ Select: View your permissions
→ Shows role & all permissions
```

### Task 2: "I Want to Check a Specific Permission"
```bash
./get-my-permissions.sh
→ Select: Check another permission
→ Enter module: career-applications
→ Enter action: read
→ Shows: ✓ YES or ✗ NO
```

### Task 3: "I Want to Export My Permissions"
```bash
./get-my-permissions.sh
→ Select: Export report
→ Saves to: employee_permissions_[timestamp].json
```

### Task 4: "I Want to Integrate Into My App"
```bash
# Read the documentation
cat EMPLOYEE_GET_PERMISSIONS_CURL.md

# Look for "Integration Examples" section
# Copy the JavaScript/Node.js/Python code
# Modify for your needs
# Test with curl first, then integrate
```

---

## 📚 Documentation Map

```
START HERE
     ↓
EMPLOYEE_PERMISSIONS_VISUAL_GUIDE.md ← Overview & examples
     ↓
Want quick reference?          Want complete guide?
     ↓                                    ↓
QUICK_REFERENCE_CARD.md    EMPLOYEE_GET_PERMISSIONS_CURL.md
- Fast lookup                - Full API details
- Copy-paste                 - Integration examples
- Common scenarios           - All features
     ↓                                    ↓
Try bash script:            Still need more?
./get-my-permissions.sh            ↓
                       EMPLOYEE_GET_PERMISSIONS_INDEX.md
                       - Full index
                       - Architecture
                       - Troubleshooting
```

---

## 📊 API Role & Permissions System Overview

### How It Works
```
┌──────────────────┐
│   Employee       │
│   (Bhavesh)      │
└────────┬─────────┘
         │
         ├─ Has Email/Password
         │
         ├─ Assigned to a Role
         │  └─ "Associate Team Lead"
         │
         └─ Role has Permissions
            ├─ career-applications: [create, read, update]
            ├─ enquiries: [read]
            └─ ...more modules...
```

### Permission Structure
```json
{
  "module": "career-applications",
  "actions": ["create", "read", "update"]
}
```
- **Module:** Feature area (career-applications, enquiries, etc.)
- **Actions:** Allowed operations (create, read, update, delete)

---

## 🔧 API Endpoints Used

### Login (Get Token)
```
POST /api/employees/login
Body: { email, password }
Returns: { token, employee_id, ... }
```

### Get Own Permissions
```
GET /api/employees/:id
Headers: Authorization: Bearer {token}
Returns: { profile with role and permissions }
```

### Get Available Modules
```
GET /api/role/permissions
No authentication required
Returns: List of all available permission modules
```

---

## 📋 File Descriptions

### EMPLOYEE_PERMISSIONS_VISUAL_GUIDE.md
**What:** Visual flowcharts and beginner guide  
**Content:**
- Overall overview
- 4 ways to get permissions
- Step-by-step workflows
- Real-world examples
- Troubleshooting guide

**When to Read:** First time learning the system

---

### QUICK_REFERENCE_CARD.md
**What:** Quick copy-paste commands  
**Content:**
- One-command setup
- Common scenarios
- Environment variables
- Error codes
- Filtering examples

**When to Read:** Need a fast lookup

---

### EMPLOYEE_GET_PERMISSIONS_CURL.md
**What:** Comprehensive curl documentation  
**Content:**
- Complete setup instructions
- Detailed endpoints
- Step-by-step examples
- jq filtering techniques
- Integration examples
- Common use cases

**When to Read:** Want complete understanding

---

### EMPLOYEE_GET_PERMISSIONS_INDEX.md
**What:** Full index and integration guide  
**Content:**
- Navigation guide
- Use cases
- Troubleshooting
- Integration patterns
- Security notes

**When to Read:** Planning integrations

---

### get-my-permissions.sh
**What:** Interactive bash CLI  
**Features:**
- ✅ Email/password prompts
- ✅ Color-coded output
- ✅ Export to JSON
- ✅ Permission checking
- ✅ Module viewing
- ✅ Interactive menu

**Usage:**
```bash
./get-my-permissions.sh
```

---

### get-my-permissions.mjs
**What:** Node.js CLI with multiple modes  
**Modes:**
1. Interactive: `node get-my-permissions.mjs`
2. Automated: `node get-my-permissions.mjs --email user@ex.com --password pwd123`
3. Export: `node get-my-permissions.mjs ... --export`
4. Check: `node get-my-permissions.mjs ... --check-permission "module:action"`

---

## 🎓 Learning Path (Order of Reading)

### Level 1: Get Started (10 minutes)
1. Read: **EMPLOYEE_PERMISSIONS_VISUAL_GUIDE.md**
2. Run: `./get-my-permissions.sh`
3. Follow interactive prompts

### Level 2: Quick Reference (5 minutes)
1. Read: **QUICK_REFERENCE_CARD.md**
2. Try: Copy-paste commands
3. Modify for your credentials

### Level 3: Full Understanding (20 minutes)
1. Read: **EMPLOYEE_GET_PERMISSIONS_CURL.md**
2. Try: Advanced filtering
3. Try: Integration examples

### Level 4: Integration Planning (15 minutes)
1. Read: **EMPLOYEE_GET_PERMISSIONS_INDEX.md**
2. Review: Integration patterns
3. Plan: Your implementation

---

## ✅ Testing Checklist

- [ ] API server running on port 5000
- [ ] Have valid employee credentials
- [ ] jq installed (for JSON parsing)
- [ ] Bash available (for scripts)
- [ ] Network connection to API
- [ ] Read EMPLOYEE_PERMISSIONS_VISUAL_GUIDE.md
- [ ] Run ./get-my-permissions.sh successfully
- [ ] View permissions displayed correctly
- [ ] Export to JSON works
- [ ] Check specific permission works

---

## 🛠️ Tools & Requirements

### Required
- **Bash** (for .sh scripts)
- **Node.js** (for .mjs scripts) - optional if using bash
- **curl** (for manual commands)

### Optional but Recommended
- **jq** (for JSON parsing)
  - Ubuntu: `sudo apt-get install jq`
  - macOS: `brew install jq`
  - Windows: Download from https://jqlang.github.io/jq/download/

### Helpful
- **VS Code** (for viewing/editing)
- **Postman** (for API testing)
- **Terminal** (bash, zsh, or equivalent)

---

## 🔐 Security Best Practices

1. ✅ Never hardcode passwords in scripts
2. ✅ Use environment variables for credentials
3. ✅ Keep tokens private
4. ✅ Only access your own permissions
5. ✅ Use HTTPS in production
6. ✅ Regenerate token if compromised
7. ✅ Handle token expiration

---

## 🐛 Troubleshooting

### "Command Not Found"
```
Solution: Make scripts executable
chmod +x get-my-permissions.sh
chmod +x get-my-permissions.mjs
```

### "Login Failed"
```
Check:
- Email is correct
- Password is correct
- API server is running
- API URL is correct
```

### "Permission Not Showing"
```
Check:
- Contact admin to assign permission
- Verify role assignment
- Refresh token
```

### "jq Not Found"
```
Install:
sudo apt-get install jq (Ubuntu)
brew install jq (macOS)
```

---

## 📞 Support & Help

### Get Help
1. Check **EMPLOYEE_PERMISSIONS_VISUAL_GUIDE.md** - Visual examples
2. Check **QUICK_REFERENCE_CARD.md** - Quick lookup
3. Check **EMPLOYEE_GET_PERMISSIONS_CURL.md** - Details
4. Check **Troubleshooting section** - Common issues

### Still Stuck?
- Verify credentials are correct
- Check API is running
- Review error messages
- Try different approach (bash vs curl vs node)

---

## 📈 What You Get

### Knowledge
✓ How role-based permissions work  
✓ How to retrieve your permissions  
✓ How to check specific permissions  
✓ How to integrate into apps  

### Tools
✓ Bash script for easy use  
✓ Node.js script for automation  
✓ Curl commands for testing  
✓ Export functionality  

### Documentation
✓ Visual guides  
✓ Quick reference cards  
✓ Complete API docs  
✓ Integration examples  
✓ Troubleshooting guides  

---

## 🎉 Ready to Go!

You now have everything needed to:
- ✅ Check your own permissions
- ✅ Understand the permission system
- ✅ Integrate into applications
- ✅ Troubleshoot issues
- ✅ Automate permission checks

**Pick your method above and get started!**

---

## 📝 Document Versions

| File | Lines | Size | Date |
|------|-------|------|------|
| EMPLOYEE_PERMISSIONS_VISUAL_GUIDE.md | 529 | 13KB | 2026-02-10 |
| QUICK_REFERENCE_CARD.md | 324 | 8KB | 2026-02-10 |
| EMPLOYEE_GET_PERMISSIONS_CURL.md | 503 | 13KB | 2026-02-10 |
| EMPLOYEE_GET_PERMISSIONS_INDEX.md | 433 | 11KB | 2026-02-10 |
| get-my-permissions.sh | ~200 | 7.1KB | 2026-02-10 |
| get-my-permissions.mjs | ~350 | 10KB | 2026-02-10 |

**Total Documentation:** ~1,789 lines  
**Total Package Size:** ~62KB

---

## 🔗 Related Resources

Already in system (check these too):
- EMPLOYEE_PERMISSIONS_API.md
- EMPLOYEE_PERMISSIONS_GUIDE.md
- EMPLOYEE_PERMISSIONS_ARCHITECTURE.md
- check-employee-permissions.sh
- check-employee-permissions.mjs

---

## 📊 Implementation Timeline

| Phase | Time | Task |
|-------|------|------|
| Learn | 10 min | Read EMPLOYEE_PERMISSIONS_VISUAL_GUIDE.md |
| Try | 5 min | Run ./get-my-permissions.sh |
| Understand | 20 min | Read detailed docs |
| Integrate | 30 min | Add to your app |
| Deploy | 15 min | Test & launch |

**Total:** ~80 minutes to full implementation

---

## 🏆 Success Indicators

You've got this working when:
- ✅ Can run `./get-my-permissions.sh` without errors
- ✅ See your role & permissions displayed
- ✅ Can check specific permissions
- ✅ Can export to JSON
- ✅ Can use curl commands directly
- ✅ Understand the permission structure
- ✅ Can integrate into your app

---

## 📦 Package Contents Summary

```
📦 EMPLOYEE GET OWN PERMISSIONS PACKAGE
│
├── 📚 DOCUMENTATION (4 files, ~1.8KB)
│   ├── EMPLOYEE_PERMISSIONS_VISUAL_GUIDE.md (Visual + Examples)
│   ├── QUICK_REFERENCE_CARD.md (Quick Lookup)
│   ├── EMPLOYEE_GET_PERMISSIONS_CURL.md (Complete Reference)
│   └── EMPLOYEE_GET_PERMISSIONS_INDEX.md (Full Index)
│
├── 🎮 SCRIPTS (2 files, executable)
│   ├── get-my-permissions.sh (Bash Interactive)
│   └── get-my-permissions.mjs (Node.js CLI)
│
└── ✅ READY TO USE!
```

---

**Version:** 1.0  
**Created:** February 10, 2026  
**Status:** ✅ Production Ready  

**Start with:** EMPLOYEE_PERMISSIONS_VISUAL_GUIDE.md  
**Then run:** ./get-my-permissions.sh  
**Questions?** Read: QUICK_REFERENCE_CARD.md
