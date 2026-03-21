# Quick Fix: Add Content Management Permission

## Problem
Your admin token doesn't have the `content-management` module permission needed for YouTube video API.

## Solution

### Step 1: Login as Admin (Get Fresh Token)
```bash
curl --location 'https://nk5.yaatrabuddy.com/admin/login' \
--header 'Content-Type: application/json' \
--data '{
  "email": "blacksquare@gmail.com",
  "password": "blacksquare@gmail.com"
}'
```

**Save the new token from response.**

---

### Step 2: Update Your Admin Role

Replace `YOUR_NEW_TOKEN` and `YOUR_ROLE_ID` in the command below:

```bash
curl --location --request PUT 'https://nk5.yaatrabuddy.com/admin/roles/YOUR_ROLE_ID' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_NEW_TOKEN' \
--data '{
  "permissions": [
    {
      "module": "dashboard",
      "actions": ["read", "delete"]
    },
    {
      "module": "properties",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "categories",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "bought-property",
      "actions": ["create", "read", "delete", "update"]
    },
    {
      "module": "settings",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "security",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "blog_management",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "blog",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "dashboard_banner",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "content-management",
      "actions": ["create", "read", "update", "delete"]
    }
  ]
}'
```

**Note:** I added the `content-management` module at the end with full CRUD permissions.

---

### Step 3: Login Again (Get Token with New Permissions)

```bash
curl --location 'https://nk5.yaatrabuddy.com/admin/login' \
--header 'Content-Type: application/json' \
--data '{
  "email": "blacksquare@gmail.com",
  "password": "blacksquare@gmail.com"
}'
```

**Use this NEW token for YouTube API.**

---

### Step 4: Test YouTube API

```bash
curl --location 'https://nk5.yaatrabuddy.com/api/youtube-videos/add' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_NEWEST_TOKEN' \
--data '{
  "title": "Luxury Living Rooms",
  "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}'
```

**Should return:**
```json
{
  "success": true,
  "message": "YouTube video added successfully",
  "data": { ... }
}
```

---

## Alternative: Use Postman/Frontend

If you're using Postman or a frontend app:

1. **Login** → Get fresh admin token
2. **Update Role** → Add `content-management` permission
3. **Login Again** → Get token with new permissions
4. **Test YouTube API** → Should work now

---

## Quick Reference: Your Role ID

Based on your token, your role ID is: `6958ad47001ce60f82385f8d8`

Use this in Step 2.
