# Career Application API Documentation

## Overview
API endpoints for managing job applications for the Client Relationship Consultant position at Blacksquare Estate.

---

## Endpoints

### 1. Submit Career Application (Public)
**POST** `/api/careers/apply`

Submit a new career application.

**Request Body:**
```json
{
  "name": "John Doe",
  "mobileNo": "9876543210",
  "location": "Mumbai",
  "experienceLevel": "1-3 Years",
  "comfortableWithTargets": "Yes",
  "joiningAvailability": "Within 15 Days"
}
```

**Field Validations:**
- `name`: Required, string
- `mobileNo`: Required, 10-digit number
- `location`: Required, string
- `experienceLevel`: Required, enum["Fresher", "1-3 Years", "5 Years"]
- `comfortableWithTargets`: Required, enum["Yes", "No"]
- `joiningAvailability`: Required, enum["Immediately", "Within 15 Days", "Within 30 Days"]

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully! We will contact you soon.",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "John Doe",
    "position": "Client Relationship Consultant",
    "status": "Pending",
    "createdAt": "2026-02-07T10:30:00.000Z"
  }
}
```

---

### 2. Get All Applications (Admin)
**GET** `/api/careers/`

Retrieve all career applications with filters and pagination.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (optional): Filter by status ["Pending", "Reviewed", "Shortlisted", "Rejected", "Hired"]
- `position` (optional): Filter by position
- `experienceLevel` (optional): Filter by experience level
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: "-createdAt")

**Example:**
```
GET /api/careers/?status=Pending&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "name": "John Doe",
      "mobileNo": "9876543210",
      "location": "Mumbai",
      "experienceLevel": "1-3 Years",
      "comfortableWithTargets": "Yes",
      "joiningAvailability": "Within 15 Days",
      "position": "Client Relationship Consultant",
      "status": "Pending",
      "createdAt": "2026-02-07T10:30:00.000Z",
      "updatedAt": "2026-02-07T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3,
    "limit": 10
  }
}
```

---

### 3. Get Single Application (Admin)
**GET** `/api/careers/:id`

Retrieve a specific career application by ID.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "John Doe",
    "mobileNo": "9876543210",
    "location": "Mumbai",
    "experienceLevel": "1-3 Years",
    "comfortableWithTargets": "Yes",
    "joiningAvailability": "Within 15 Days",
    "position": "Client Relationship Consultant",
    "status": "Pending",
    "notes": "",
    "createdAt": "2026-02-07T10:30:00.000Z",
    "updatedAt": "2026-02-07T10:30:00.000Z"
  }
}
```

---

### 4. Update Application Status (Admin)
**PUT** `/api/careers/:id/status`

Update the status of a career application.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "Shortlisted",
  "notes": "Strong candidate, good communication skills"
}
```

**Valid Status Values:**
- "Pending"
- "Reviewed"
- "Shortlisted"
- "Rejected"
- "Hired"

**Response:**
```json
{
  "success": true,
  "message": "Application updated successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "John Doe",
    "status": "Shortlisted",
    "notes": "Strong candidate, good communication skills",
    "updatedAt": "2026-02-07T11:30:00.000Z"
  }
}
```

---

### 5. Delete Application (Admin)
**DELETE** `/api/careers/:id`

Delete a career application.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

---

### 6. Get Application Statistics (Admin)
**GET** `/api/careers/statistics`

Get comprehensive statistics of all career applications.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byStatus": {
      "pending": 45,
      "reviewed": 60,
      "shortlisted": 25,
      "rejected": 15,
      "hired": 5
    },
    "byExperienceLevel": [
      { "_id": "Fresher", "count": 70 },
      { "_id": "1-3 Years", "count": 50 },
      { "_id": "5 Years", "count": 30 }
    ],
    "byTargetComfort": [
      { "_id": "Yes", "count": 120 },
      { "_id": "No", "count": 30 }
    ],
    "recentApplications": 12
  }
}
```

---

### 7. Bulk Update Application Status (Admin)
**PUT** `/api/careers/bulk/status`

Update status for multiple applications at once.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "applicationIds": [
    "65f1234567890abcdef12345",
    "65f1234567890abcdef12346",
    "65f1234567890abcdef12347"
  ],
  "status": "Reviewed",
  "notes": "Bulk reviewed on 2026-02-07"
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 application(s) updated successfully",
  "data": {
    "matched": 3,
    "modified": 3
  }
}
```

---

## Role Permissions

To manage career applications, ensure the admin role has the `career-applications` module permission with appropriate actions:

```javascript
{
  "module": "career-applications",
  "actions": ["create", "read", "update", "delete"]
}
```

---

## Lead Assignment Support

The Lead Assignment schema now includes a `role` field to track the role/position associated with the assignment:

```javascript
{
  "enquiryId": "...",
  "employeeId": "...",
  "role": "Client Relationship Consultant", // New field
  "status": "active",
  "priority": "high"
}
```

---

## Testing

### Test Public Application Submission:
```bash
curl -X POST http://localhost:5000/api/careers/apply \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Candidate",
    "mobileNo": "9876543210",
    "location": "Delhi",
    "experienceLevel": "Fresher",
    "comfortableWithTargets": "Yes",
    "joiningAvailability": "Immediately"
  }'
```

### Test Get All Applications (Admin):
```bash
curl -X GET http://localhost:5000/api/careers/ \
  -H "Authorization: Bearer <admin_token>"
```

### Test Update Status (Admin):
```bash
curl -X PUT http://localhost:5000/api/careers/<application_id>/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Shortlisted",
    "notes": "Good candidate"
  }'
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```
