# Contact Assignment API Documentation

## Overview
This API allows you to assign contact enquiries to employees, manage assignments, and track their status. The system uses the `LeadAssignment` model which now supports **Contact** enquiries alongside Inquiry, ManualInquiry, and Enquiry types.

---

## 1. Assign Single Contact to Employee

### Endpoint
```
POST /api/contacts/assign/single
```

### Authentication
Required: `verifyToken` (Admin or Manager)

### Request Body
```json
{
  "contactId": "670abc123def456ghi789jkl",
  "employeeId": "670xyz987uvu654fed321cba",
  "priority": "high",
  "dueDate": "2026-02-15",
  "notes": "Customer interested in property near downtown"
}
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| contactId | String | ✓ | MongoDB ID of the contact |
| employeeId | String | ✓ | MongoDB ID of the employee |
| priority | String | ✗ | Priority level: `low`, `medium`, `high`, `urgent` (default: `medium`) |
| dueDate | Date | ✗ | Due date for follow-up (ISO 8601 format) |
| notes | String | ✗ | Additional assignment notes |

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Contact assigned successfully",
  "data": {
    "assignment": {
      "_id": "670abc123def456ghi789xyz",
      "enquiryId": "670abc123def456ghi789jkl",
      "enquiryType": "Contact",
      "employeeId": {
        "_id": "670xyz987uvu654fed321cba",
        "name": "John Smith",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "assignedBy": "670admin123def456ghi789",
      "assignedDate": "2026-01-26T10:30:00Z",
      "status": "active",
      "priority": "high",
      "dueDate": "2026-02-15T00:00:00Z",
      "notes": "Customer interested in property near downtown"
    },
    "contact": {
      "_id": "670abc123def456ghi789jkl",
      "full_name": "Jane Doe",
      "email_address": "jane@example.com",
      "phone_number": "+9876543210",
      "subject": "Property Inquiry",
      "property_type": "Apartment",
      "budget_range": "500000-700000",
      "message": "Looking for 2BHK apartment",
      "assignedTo": "670xyz987uvu654fed321cba",
      "assignmentStatus": "assigned"
    }
  }
}
```

### Response (Error)
```json
{
  "success": false,
  "message": "Contact not found"
}
```

---

## 2. Assign Multiple Contacts to Employee

### Endpoint
```
POST /api/contacts/assign/multiple
```

### Authentication
Required: `verifyToken` (Admin or Manager)

### Request Body
```json
{
  "employeeId": "670xyz987uvu654fed321cba",
  "contactIds": [
    "670abc123def456ghi789jkl",
    "670abc123def456ghi789jkm",
    "670abc123def456ghi789jkn"
  ],
  "priority": "medium",
  "dueDate": "2026-02-20",
  "notes": "Batch assignment from today's leads"
}
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| employeeId | String | ✓ | MongoDB ID of the employee |
| contactIds | Array | ✓ | Array of contact MongoDB IDs |
| priority | String | ✗ | Priority level (default: `medium`) |
| dueDate | Date | ✗ | Due date for follow-up |
| notes | String | ✗ | Additional notes |

### Response (Success - 200)
```json
{
  "success": true,
  "message": "3 contacts assigned successfully",
  "data": {
    "assignments": [
      {
        "_id": "670abc123def456ghi789xyz",
        "enquiryId": "670abc123def456ghi789jkl",
        "enquiryType": "Contact",
        "employeeId": "670xyz987uvu654fed321cba",
        "status": "active",
        "priority": "medium"
      }
    ],
    "errors": [],
    "employee": {
      "id": "670xyz987uvu654fed321cba",
      "name": "John Smith",
      "email": "john@example.com"
    }
  }
}
```

---

## 3. Get Contacts Assigned to Employee

### Endpoint
```
GET /api/contacts/assignments/employee/:employeeId
```

### Authentication
Required: `verifyToken`

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | String | active | Filter by status: `active`, `in-progress`, `completed`, `cancelled` |
| page | Number | 1 | Page number for pagination |
| limit | Number | 10 | Records per page |

### Example Request
```
GET /api/contacts/assignments/employee/670xyz987uvu654fed321cba?status=active&page=1&limit=10
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "_id": "670abc123def456ghi789xyz",
        "enquiryId": "670abc123def456ghi789jkl",
        "enquiryType": "Contact",
        "employeeId": {
          "_id": "670xyz987uvu654fed321cba",
          "name": "John Smith",
          "email": "john@example.com"
        },
        "status": "active",
        "priority": "high",
        "dueDate": "2026-02-15T00:00:00Z",
        "notes": "Customer interested in property",
        "assignedDate": "2026-01-26T10:30:00Z",
        "enquiry": {
          "_id": "670abc123def456ghi789jkl",
          "full_name": "Jane Doe",
          "email_address": "jane@example.com",
          "phone_number": "+9876543210",
          "message": "Looking for 2BHK apartment"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

## 4. Get All Contact Assignments (Admin View)

### Endpoint
```
GET /api/contacts/assignments/all
```

### Authentication
Required: `verifyToken` (Admin)

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| employeeId | String | - | Filter by specific employee |
| status | String | - | Filter by status |
| page | Number | 1 | Page number |
| limit | Number | 10 | Records per page |

### Example Request
```
GET /api/contacts/assignments/all?employeeId=670xyz987uvu654fed321cba&status=active
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "_id": "670abc123def456ghi789xyz",
        "enquiryType": "Contact",
        "employeeId": {
          "_id": "670xyz987uvu654fed321cba",
          "name": "John Smith",
          "email": "john@example.com"
        },
        "assignedBy": {
          "_id": "670admin123def456ghi789",
          "fullName": "Admin User",
          "email": "admin@example.com"
        },
        "status": "active",
        "priority": "high",
        "enquiry": {
          "full_name": "Jane Doe",
          "email_address": "jane@example.com",
          "phone_number": "+9876543210",
          "subject": "Property Inquiry"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 5. Update Contact Assignment Status

### Endpoint
```
PUT /api/contacts/assignments/:assignmentId/status
```

### Authentication
Required: `verifyToken`

### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| assignmentId | String | MongoDB ID of the assignment |

### Request Body
```json
{
  "status": "in-progress",
  "notes": "Contacted customer, awaiting response"
}
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | String | ✓ | New status: `active`, `in-progress`, `completed`, `cancelled` |
| notes | String | ✗ | Additional notes |

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Assignment status updated successfully",
  "data": {
    "_id": "670abc123def456ghi789xyz",
    "enquiryType": "Contact",
    "status": "in-progress",
    "notes": "Contacted customer, awaiting response",
    "employeeId": {
      "_id": "670xyz987uvu654fed321cba",
      "name": "John Smith"
    }
  }
}
```

---

## 6. Unassign Contact from Employee

### Endpoint
```
DELETE /api/contacts/assignments/:assignmentId
```

### Authentication
Required: `verifyToken` (Admin)

### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| assignmentId | String | MongoDB ID of the assignment |

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Contact unassigned successfully"
}
```

---

## Assignment Status Flow

```
Unassigned
    ↓
    ├→ Assign to Employee
         ↓
    ┌─→ active (default)
    │    ↓
    │  in-progress (employee is working)
    │    ↓
    ├→ completed (successfully resolved)
    │
    └→ cancelled (cancelled assignment)
```

---

## Contact Assignment Status Mapping

When you assign a contact, the contact record is also updated:

| Assignment Status | Contact assignmentStatus |
|------------------|--------------------------|
| active | assigned |
| in-progress | in-progress |
| completed | completed |
| cancelled | closed |

---

## Database Schema Updates

### LeadAssignmentSchema
Now supports `enquiryType: 'Contact'` in addition to:
- `Inquiry`
- `ManualInquiry`
- `Enquiry`

### ContactSchema
Added new fields:
```javascript
{
  assignedTo: ObjectId (ref: Employee),
  assignmentStatus: String (enum: ['unassigned', 'assigned', 'in-progress', 'completed', 'closed'])
}
```

---

## Usage Examples

### 1. Assign a Single Contact
```bash
curl -X POST http://localhost:5000/api/contacts/assign/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "670abc123def456ghi789jkl",
    "employeeId": "670xyz987uvu654fed321cba",
    "priority": "high",
    "notes": "VIP customer"
  }'
```

### 2. Assign Multiple Contacts
```bash
curl -X POST http://localhost:5000/api/contacts/assign/multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "670xyz987uvu654fed321cba",
    "contactIds": [
      "670abc123def456ghi789jkl",
      "670abc123def456ghi789jkm"
    ],
    "priority": "medium"
  }'
```

### 3. Get Employee Contacts
```bash
curl -X GET "http://localhost:5000/api/contacts/assignments/employee/670xyz987uvu654fed321cba?status=active&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Update Assignment Status
```bash
curl -X PUT http://localhost:5000/api/contacts/assignments/670abc123def456ghi789xyz/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "notes": "Customer purchased property"
  }'
```

### 5. Unassign Contact
```bash
curl -X DELETE http://localhost:5000/api/contacts/assignments/670abc123def456ghi789xyz \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Contact ID and Employee ID are required | Missing required fields |
| 400 | Contact already assigned to an employee | Contact has active assignment |
| 400 | Invalid status | Invalid status value provided |
| 404 | Contact not found | Contact ID doesn't exist |
| 404 | Employee not found | Employee ID doesn't exist |
| 404 | Assignment not found | Assignment ID doesn't exist |
| 500 | Failed to assign contact | Server error |

---

## Best Practices

1. **Always verify contact exists before assigning**
2. **Set appropriate priority levels** based on customer urgency
3. **Use dueDate to track follow-ups**
4. **Keep notes updated** with customer interaction details
5. **Update status regularly** to track progress
6. **Check for existing assignments** before reassigning
7. **Use batch assignment** for better performance with multiple contacts

---

## Integration with Frontend

### Example React Hook
```javascript
// Assign contact to employee
const assignContact = async (contactId, employeeId, priority = 'medium') => {
  const response = await fetch('/api/contacts/assign/single', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contactId,
      employeeId,
      priority
    })
  });
  return response.json();
};

// Get employee's assigned contacts
const getEmployeeContacts = async (employeeId, status = 'active') => {
  const response = await fetch(
    `/api/contacts/assignments/employee/${employeeId}?status=${status}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.json();
};
```

---

## Related Resources

- [LeadAssignmentSchema](./models/leadAssignmentSchema.js)
- [ContactSchema](./models/contactSchema.js)
- [Lead Assignment Controller](./controllers/leadAssignmentController.js)
- [Contact Controller](./controllers/contactController.js)
- [Contact Routes](./routes/contactRoute.js)

