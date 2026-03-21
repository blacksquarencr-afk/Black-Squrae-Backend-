# Employee Enquiries Access - Solution Documentation

## Problem
Employees were unable to view enquiries assigned to them. The frontend was trying to access admin-only endpoints like:
- `/api/inquiry/get-enquiries`
- `/api/inquiry/`
- `/api/enquiry/all`

These endpoints require `verifyAdminToken` middleware, which employees don't have.

## Solution Implemented

### 1. Backend Changes

#### New Controller Function
Added `getEmployeeEnquiries` in `/controllers/enquiryController.js`:
- Fetches all enquiries assigned to the logged-in employee
- Uses `LeadAssignment` model to find assignments
- Supports both `Enquiry` and `ManualInquiry` types
- Includes pagination support
- Allows filtering by:
  - `status` - enquiry status (pending, in-progress, completed, etc.)
  - `priority` - priority level (low, medium, high, urgent)
  - `assignmentStatus` - assignment status (active, completed, cancelled)

#### New Route
Added route in `/routes/enquiryRoute.js`:
```javascript
router.get("/employee/assigned-enquiries", verifyEmployeeToken, getEmployeeEnquiries);
```

### 2. API Endpoint Details

**Endpoint:** `GET /api/inquiry/employee/assigned-enquiries`

**Authentication:** Requires employee token (Bearer Token)

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page
- `status` (optional) - Filter by enquiry status
- `priority` (optional) - Filter by priority level
- `assignmentStatus` (optional, default: 'active') - Filter by assignment status

**Response Structure:**
```json
{
  "success": true,
  "message": "Employee enquiries fetched successfully",
  "data": [
    {
      "assignmentId": "assignment_id",
      "enquiryId": "enquiry_id",
      "enquiryType": "Enquiry|ManualInquiry",
      "enquiry": { /* full enquiry details */ },
      "assignmentStatus": "active|completed|cancelled",
      "priority": "low|medium|high|urgent",
      "assignedDate": "2026-02-10T...",
      "dueDate": "2026-02-15T..." or null,
      "notes": "assignment notes",
      "assignedBy": { /* admin details */ }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3. Frontend Integration

Update the `fetchAllEnquiries` function in the frontend to check user role and use appropriate endpoint:

```javascript
const fetchAllEnquiries = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('adminToken') || localStorage.getItem('employeeToken') || localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole'); // 'admin' or 'employee'
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    // For employees, use the employee-specific endpoint
    if (userRole === 'employee') {
      const response = await axios.get(
        `${API_BASE_URL}/api/inquiry/employee/assigned-enquiries?page=1&limit=50`,
        { headers }
      );
      
      if (response.data.success) {
        // Transform the data to match the expected format
        const transformedEnquiries = response.data.data.map(assignment => ({
          ...assignment.enquiry,
          _id: assignment.enquiryId,
          sourceType: assignment.enquiryType === 'ManualInquiry' ? 'manual' : 'user',
          assignment: {
            _id: assignment.assignmentId,
            status: assignment.assignmentStatus,
            priority: assignment.priority,
            assignedDate: assignment.assignedDate,
            employeeName: 'You',
            employeeId: localStorage.getItem('employeeId')
          }
        }));
        
        setEnquiries(transformedEnquiries);
        return;
      }
    }
    
    // For admins, use existing admin endpoints
    // ... rest of admin code
    
  } catch (err) {
    setError("Failed to fetch enquiries. Please try again later.");
    setEnquiries([]);
  } finally {
    setLoading(false);
  }
};
```

### 4. Testing the Endpoint

Use the provided test script:
```bash
cd /www/wwwroot/BlackSquarebackend/backend
./test-employee-enquiries.sh
```

Or test manually with curl:
```bash
# 1. Login as employee
curl -X POST "https://backend.blacksquare.estate/api/employees/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@example.com",
    "password": "password"
  }'

# 2. Get assigned enquiries (use token from step 1)
curl -X GET "https://backend.blacksquare.estate/api/inquiry/employee/assigned-enquiries?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Additional Features

#### Filter by Status
```bash
curl GET "/api/inquiry/employee/assigned-enquiries?status=pending"
```

#### Filter by Priority
```bash
curl GET "/api/inquiry/employee/assigned-enquiries?priority=high"
```

#### Filter by Assignment Status
```bash
curl GET "/api/inquiry/employee/assigned-enquiries?assignmentStatus=active"
```

#### Pagination
```bash
curl GET "/api/inquiry/employee/assigned-enquiries?page=2&limit=50"
```

## Security

- Route is protected with `verifyEmployeeToken` middleware
- Only returns enquiries assigned to the authenticated employee
- No access to other employees' enquiries
- Admin privileges not required

## Key Benefits

1. **Proper Access Control** - Employees only see enquiries assigned to them
2. **Efficient Queries** - Uses LeadAssignment index for fast lookups
3. **Flexible Filtering** - Support for status, priority, and assignment status filters
4. **Pagination Support** - Handles large numbers of enquiries efficiently
5. **Type Safety** - Handles both Enquiry and ManualInquiry types correctly

## Migration Notes

- Existing enquiries with assignments will automatically be accessible
- No database migration required
- Backward compatible with existing admin endpoints
- Frontend needs update to use the new endpoint for employee role

## Troubleshooting

### Issue: 401 Unauthorized
**Solution:** Ensure employee token is being sent in Authorization header

### Issue: Empty data array
**Solution:** Check if enquiries are actually assigned to the employee in LeadAssignment collection

### Issue: Wrong enquiry type
**Solution:** Verify that LeadAssignment.enquiryType matches the actual model ('Enquiry' or 'ManualInquiry')

## Related Files Modified

1. `/controllers/enquiryController.js` - Added `getEmployeeEnquiries` function
2. `/routes/enquiryRoute.js` - Added new route
3. Test script: `/test-employee-enquiries.sh`
