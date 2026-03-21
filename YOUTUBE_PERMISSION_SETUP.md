# YouTube Video Management - Role Permission Setup Guide

## Quick Setup

### Step 1: Add Content Management Module to Available Permissions
The `content-management` module has been added to the system with these actions:
- **create** - Add new YouTube videos
- **read** - View videos (not required for public viewing)
- **update** - Edit video details, toggle active/inactive status
- **delete** - Remove videos

### Step 2: Create Role with Content Management Permission

**Admin API Call:**
```bash
curl --location 'https://nk5.yaatrabuddy.com/admin/roles/create' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer ADMIN_TOKEN' \
--data '{
  "name": "Content Manager",
  "description": "Manages YouTube videos and media content",
  "permissions": [
    {
      "module": "content-management",
      "actions": ["create", "read", "update", "delete"]
    }
  ],
  "isActive": true
}'
```

### Step 3: Assign Role to Employee

```bash
curl --location --request PUT 'https://nk5.yaatrabuddy.com/admin/employees/EMPLOYEE_ID' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer ADMIN_TOKEN' \
--data '{
  "role": "ROLE_ID"
}'
```

---

## Access Levels

### 1. Public Users (No Auth)
- ✅ View all active videos
- ✅ Get video details
- ❌ Cannot add, edit, or delete

### 2. Employees (With Permissions)
**Required:** Employee token + `content-management` module permissions

| Action | Permission Required | Endpoint |
|--------|-------------------|----------|
| Add video | `create` | `POST /api/youtube-videos/add` |
| Update video | `update` | `PUT /api/youtube-videos/update/:id` |
| Delete video | `delete` | `DELETE /api/youtube-videos/delete/:id` |
| Toggle status | `update` | `PATCH /api/youtube-videos/toggle-status/:id` |

### 3. Admin (Full Access)
**Required:** Admin token only

| Action | Endpoint |
|--------|----------|
| Add video | `POST /api/youtube-videos/admin/add` |
| Update video | `PUT /api/youtube-videos/admin/update/:id` |
| Delete video | `DELETE /api/youtube-videos/admin/delete/:id` |
| Toggle status | `PATCH /api/youtube-videos/admin/toggle-status/:id` |

---

## Example Role Configurations

### Content Manager (Full Access)
```json
{
  "name": "Content Manager",
  "permissions": [
    {
      "module": "content-management",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "blogs",
      "actions": ["create", "read", "update", "delete"]
    }
  ]
}
```

### Content Editor (No Delete)
```json
{
  "name": "Content Editor",
  "permissions": [
    {
      "module": "content-management",
      "actions": ["create", "read", "update"]
    }
  ]
}
```

### Content Viewer (Read Only)
```json
{
  "name": "Content Viewer",
  "permissions": [
    {
      "module": "content-management",
      "actions": ["read"]
    }
  ]
}
```

---

## Testing Employee Access

### 1. Employee Login
```bash
curl --location 'https://nk5.yaatrabuddy.com/api/employees/login' \
--header 'Content-Type: application/json' \
--data '{
  "email": "employee@example.com",
  "password": "password123"
}'
```

**Save the token from response**

### 2. Add Video (With Permission)
```bash
curl --location 'https://nk5.yaatrabuddy.com/api/youtube-videos/add' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer EMPLOYEE_TOKEN' \
--data '{
  "title": "Interior Design Tips",
  "videoLink": "https://www.youtube.com/watch?v=example123"
}'
```

**Expected:**
- ✅ If employee has `content-management` + `create`: Success
- ❌ If no permission: `403 Forbidden - No create permission for content-management module`

### 3. Update Video (With Permission)
```bash
curl --location --request PUT 'https://nk5.yaatrabuddy.com/api/youtube-videos/update/VIDEO_ID' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer EMPLOYEE_TOKEN' \
--data '{
  "title": "Updated Title"
}'
```

### 4. Delete Video (With Permission)
```bash
curl --location --request DELETE 'https://nk5.yaatrabuddy.com/api/youtube-videos/delete/VIDEO_ID' \
--header 'Authorization: Bearer EMPLOYEE_TOKEN'
```

---

## Permission Check Flow

```
Employee Request
    ↓
Verify Employee Token (roleMiddleware.verifyEmployeeToken)
    ↓
Check if employee is active
    ↓
Check if role is active
    ↓
Load role permissions
    ↓
Check Permission (roleMiddleware.checkPermission)
    ↓
Find 'content-management' module
    ↓
Check if required action exists (create/update/delete)
    ↓
✅ Allow → Execute controller
❌ Deny → Return 403 Forbidden
```

---

## Common Errors & Solutions

### Error: "Access denied. No permission for content-management module"
**Solution:** Assign `content-management` module to employee's role

```bash
# Update role to add content-management permission
curl --location --request PUT 'https://nk5.yaatrabuddy.com/admin/roles/ROLE_ID' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer ADMIN_TOKEN' \
--data '{
  "permissions": [
    {
      "module": "content-management",
      "actions": ["create", "read", "update"]
    }
  ]
}'
```

### Error: "Access denied. No create permission for content-management module"
**Solution:** Add `create` action to the module permissions

### Error: "Access denied. Role inactive or not assigned"
**Solution:** 
1. Activate the role
2. Or assign an active role to employee

---

## Database Changes

### YoutubeVideo Schema Updates
```javascript
{
  uploadedBy: ObjectId,        // References Admin or Employee
  uploaderType: String,        // 'admin' or 'employee'
  // ... other fields
}
```

### Available Modules (Updated)
New modules added to `getAvailablePermissions`:
- `content-management` - Manage YouTube videos and media content
- `blogs` - Manage blog posts and articles

---

## Summary

✅ YouTube video API now supports role-based access control
✅ Admins have full access via `/admin/*` routes
✅ Employees need `content-management` permissions
✅ Public can view all active videos
✅ Tracks who uploaded each video (admin or employee)
✅ Supports all CRUD operations with proper permission checks
