# Feedback API Documentation

## Overview
The Feedback API allows users to submit issues/concerns and enables employees to manage, assign, and resolve these feedbacks through role-based permissions.

## Base URL
```
/api/feedback
```

## Authentication
- **User routes**: Require user JWT token (from user login)
- **Employee routes**: Require employee JWT token with appropriate role permissions

## Issue Types
1. Problem with My Property Listing
2. Issue with My Enquiries
3. Concern with My Property Listing Package
4. Issue with My Property Search
5. Assistance Needed with Discount Coupons
6. Problem with a Requested Service
7. Concern Not Listed Here

## API Endpoints

### 1. Submit Feedback (User)
**POST** `/submit`

Submit a new feedback/issue.

**Headers:**
```
Authorization: Bearer <user-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "issueType": "Problem with My Property Listing",
  "issueDetails": "My property is not appearing in search results.",
  "contactInfo": {
    "name": "Nikhil Kashyap",
    "email": "bhoomi.nikhilkashyap@gmail.com",
    "phone": "7737470723"
  },
  "relatedProperty": "property_id_if_applicable",
  "relatedEnquiry": "enquiry_id_if_applicable",
  "attachments": ["url1", "url2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully. Our team will review it soon.",
  "data": {
    "_id": "feedback_id",
    "issueType": "Problem with My Property Listing",
    "status": "pending",
    "priority": "medium",
    "createdAt": "2026-01-28T10:00:00.000Z"
  }
}
```

---

### 2. Get My Feedbacks (User)
**GET** `/my-feedbacks?status=pending&page=1&limit=20`

Get all feedbacks submitted by the logged-in user.

**Headers:**
```
Authorization: Bearer <user-token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

---

### 3. Rate Feedback (User)
**POST** `/:id/rate`

Rate a resolved feedback.

**Headers:**
```
Authorization: Bearer <user-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "rating": 5,
  "userFeedback": "Great support! Issue resolved quickly."
}
```

---

### 4. Get All Feedbacks (Employee - Read Permission)
**GET** `/all?status=pending&priority=high&page=1&limit=20`

Get all feedbacks with filters (requires feedback-management read permission).

**Headers:**
```
Authorization: Bearer <employee-token>
```

**Query Parameters:**
- `status`: pending, assigned, in-progress, resolved, closed, rejected
- `priority`: low, medium, high, urgent
- `issueType`: Issue type from the enum
- `assignedTo`: Employee ID
- `page`: Page number
- `limit`: Items per page
- `sortBy`: Field to sort by (default: createdAt)
- `order`: asc or desc (default: desc)

---

### 5. Get Feedback by ID (Employee - Read Permission)
**GET** `/:id`

Get detailed information about a specific feedback.

**Headers:**
```
Authorization: Bearer <employee-token>
```

---

### 6. Get My Assigned Feedbacks (Employee - Read Permission)
**GET** `/assigned?status=in-progress&page=1&limit=20`

Get feedbacks assigned to the logged-in employee.

**Headers:**
```
Authorization: Bearer <employee-token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `page` (optional): Page number
- `limit` (optional): Items per page

---

### 7. Assign Feedback (Employee - Update Permission)
**POST** `/:id/assign`

Assign a feedback to an employee.

**Headers:**
```
Authorization: Bearer <employee-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "assignedTo": "employee_id",
  "priority": "high"
}
```

---

### 8. Update Feedback Status (Employee - Update Permission)
**PATCH** `/:id/status`

Update the status of a feedback (only assigned employee or admin).

**Headers:**
```
Authorization: Bearer <employee-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "in-progress",
  "priority": "urgent"
}
```

**Valid Statuses:**
- pending
- assigned
- in-progress
- resolved
- closed
- rejected

---

### 9. Add Internal Note (Employee - Update Permission)
**POST** `/:id/notes`

Add an internal note to a feedback (only assigned employee or admin).

**Headers:**
```
Authorization: Bearer <employee-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "note": "Contacted user. Issue under investigation."
}
```

---

### 10. Resolve Feedback (Employee - Update Permission)
**POST** `/:id/resolve`

Mark a feedback as resolved with resolution details.

**Headers:**
```
Authorization: Bearer <employee-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "resolution": "The property has been re-indexed and is now visible in search results."
}
```

---

### 11. Get Feedback Statistics (Employee - Read Permission)
**GET** `/stats/overview`

Get comprehensive feedback statistics.

**Headers:**
```
Authorization: Bearer <employee-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "byStatus": [
      { "_id": "pending", "count": 15 },
      { "_id": "in-progress", "count": 8 },
      { "_id": "resolved", "count": 42 }
    ],
    "byPriority": [
      { "_id": "high", "count": 10 },
      { "_id": "medium", "count": 30 }
    ],
    "byIssueType": [
      { "_id": "Problem with My Property Listing", "count": 20 }
    ],
    "averageRating": [
      { "_id": null, "avgRating": 4.5 }
    ],
    "totalFeedbacks": [{ "total": 65 }],
    "pendingFeedbacks": [{ "total": 15 }],
    "resolvedFeedbacks": [{ "total": 42 }]
  }
}
```

---

### 12. Delete Feedback (Employee - Delete Permission)
**DELETE** `/:id`

Delete a feedback (admin only).

**Headers:**
```
Authorization: Bearer <employee-token>
```

---

## Role Permissions Setup

To give employees access to feedback management, add these permissions to their role:

```javascript
{
  "module": "feedback-management",
  "actions": ["create", "read", "update", "delete"]
}
```

**Permission Levels:**
- `read`: View feedbacks and statistics
- `update`: Assign, update status, add notes, resolve
- `delete`: Delete feedbacks (typically admin only)

---

## Workflow

### User Journey:
1. User submits feedback via mobile/web form
2. User receives confirmation
3. User can view their feedback status
4. When resolved, user rates the resolution

### Employee Journey:
1. Admin assigns feedback to employee
2. Employee views assigned feedbacks
3. Employee updates status to "in-progress"
4. Employee adds internal notes for tracking
5. Employee resolves with resolution details
6. User receives notification and can rate

### Admin Journey:
1. View all feedbacks and statistics
2. Assign feedbacks to employees
3. Monitor resolution times
4. View user satisfaction ratings
5. Manage feedback lifecycle

---

## Status Flow

```
pending → assigned → in-progress → resolved → closed
                                 ↘ rejected
```

---

## Example: Complete Feedback Lifecycle

```bash
# 1. User submits feedback
POST /api/feedback/submit

# 2. Admin assigns to employee
POST /api/feedback/{id}/assign

# 3. Employee starts working
PATCH /api/feedback/{id}/status
{ "status": "in-progress" }

# 4. Employee adds progress note
POST /api/feedback/{id}/notes
{ "note": "Identified root cause" }

# 5. Employee resolves
POST /api/feedback/{id}/resolve
{ "resolution": "Issue fixed" }

# 6. User rates the resolution
POST /api/feedback/{id}/rate
{ "rating": 5, "userFeedback": "Excellent!" }
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Issue type and details are required."
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You don't have permission to update this feedback."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Feedback not found."
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Error submitting feedback.",
  "error": "Error details"
}
```
