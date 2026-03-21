# Feedback API - cURL Commands

## Base URL
```
https://backend.blacksquare.estate/api/feedback
```

## 1. Submit Feedback (User)

```bash
curl -X POST "https://backend.blacksquare.estate/api/feedback/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -d '{
    "issueType": "Problem with My Property Listing",
    "issueDetails": "My property is not appearing in search results even though it was approved 3 days ago. I have tried refreshing multiple times but still cannot see it.",
    "contactInfo": {
      "name": "Nikhil Kashyap",
      "email": "bhoomi.nikhilkashyap@gmail.com",
      "phone": "7737470723"
    }
  }'
```

### Issue Type Options:
- `"Problem with My Property Listing"`
- `"Issue with My Enquiries"`
- `"Concern with My Property Listing Package"`
- `"Issue with My Property Search"`
- `"Assistance Needed with Discount Coupons"`
- `"Problem with a Requested Service"`
- `"Concern Not Listed Here"`

### With Optional Fields:

```bash
curl -X POST "https://backend.blacksquare.estate/api/feedback/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -d '{
    "issueType": "Issue with My Enquiries",
    "issueDetails": "I have not received any response to my enquiry submitted 5 days ago.",
    "contactInfo": {
      "name": "Nikhil Kashyap",
      "email": "bhoomi.nikhilkashyap@gmail.com",
      "phone": "7737470723"
    },
    "relatedProperty": "65abc123def456789012",
    "relatedEnquiry": "65xyz987fed654321098",
    "attachments": [
      "https://example.com/screenshot1.png",
      "https://example.com/screenshot2.png"
    ]
  }'
```

## 2. Get My Feedbacks (User)

```bash
curl -X GET "https://backend.blacksquare.estate/api/feedback/my-feedbacks?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN"
```

## 3. Get All Feedbacks (Employee/Admin)

```bash
curl -X GET "https://backend.blacksquare.estate/api/feedback/all?status=pending&priority=high&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_JWT_TOKEN"
```

### Query Parameters:
- `status`: pending, assigned, in-progress, resolved, closed, rejected
- `priority`: low, medium, high, urgent
- `issueType`: Any of the issue types listed above
- `assignedTo`: Employee ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Field to sort by (default: createdAt)
- `order`: asc or desc (default: desc)

## 4. Get Feedback by ID (Employee/Admin)

```bash
curl -X GET "https://backend.blacksquare.estate/api/feedback/679a1b2c3d4e5f6789012345" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_JWT_TOKEN"
```

## 5. Get My Assigned Feedbacks (Employee)

```bash
curl -X GET "https://backend.blacksquare.estate/api/feedback/assigned?status=in-progress&priority=high" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_JWT_TOKEN"
```

## 6. Assign Feedback to Employee (Admin)

```bash
curl -X POST "https://backend.blacksquare.estate/api/feedback/679a1b2c3d4e5f6789012345/assign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_JWT_TOKEN" \
  -d '{
    "assignedTo": "65employee123abc456",
    "priority": "high"
  }'
```

## 7. Update Feedback Status (Employee)

```bash
curl -X PATCH "https://backend.blacksquare.estate/api/feedback/679a1b2c3d4e5f6789012345/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_JWT_TOKEN" \
  -d '{
    "status": "in-progress",
    "priority": "urgent"
  }'
```

### Valid Statuses:
- `pending`
- `assigned`
- `in-progress`
- `resolved`
- `closed`
- `rejected`

## 8. Add Internal Note (Employee)

```bash
curl -X POST "https://backend.blacksquare.estate/api/feedback/679a1b2c3d4e5f6789012345/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_JWT_TOKEN" \
  -d '{
    "note": "Contacted the user. The issue was due to indexing delay. Re-indexed the property manually. Waiting for confirmation from user."
  }'
```

## 9. Resolve Feedback (Employee)

```bash
curl -X POST "https://backend.blacksquare.estate/api/feedback/679a1b2c3d4e5f6789012345/resolve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_JWT_TOKEN" \
  -d '{
    "resolution": "The property has been re-indexed successfully and is now visible in search results. Verified with multiple search queries. User notified via email."
  }'
```

## 10. Get Feedback Statistics (Admin)

```bash
curl -X GET "https://backend.blacksquare.estate/api/feedback/stats/overview" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_JWT_TOKEN"
```

## 11. Delete Feedback (Admin)

```bash
curl -X DELETE "https://backend.blacksquare.estate/api/feedback/679a1b2c3d4e5f6789012345" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_JWT_TOKEN"
```

---

## Complete Example Workflow

### Step 1: User submits feedback
```bash
FEEDBACK_ID=$(curl -s -X POST "https://backend.blacksquare.estate/api/feedback/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "issueType": "Problem with My Property Listing",
    "issueDetails": "Property not visible in search",
    "contactInfo": {
      "name": "Nikhil Kashyap",
      "email": "bhoomi.nikhilkashyap@gmail.com",
      "phone": "7737470723"
    }
  }' | jq -r '.data._id')

echo "Feedback ID: $FEEDBACK_ID"
```

### Step 2: Admin assigns to employee
```bash
curl -X POST "https://backend.blacksquare.estate/api/feedback/$FEEDBACK_ID/assign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_TOKEN" \
  -d '{
    "assignedTo": "65employee123abc456",
    "priority": "high"
  }'
```

### Step 3: Employee updates status
```bash
curl -X PATCH "https://backend.blacksquare.estate/api/feedback/$FEEDBACK_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_TOKEN" \
  -d '{"status": "in-progress"}'
```

### Step 4: Employee adds note
```bash
curl -X POST "https://backend.blacksquare.estate/api/feedback/$FEEDBACK_ID/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_TOKEN" \
  -d '{"note": "Investigating the issue"}'
```

### Step 5: Employee resolves
```bash
curl -X POST "https://backend.blacksquare.estate/api/feedback/$FEEDBACK_ID/resolve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_TOKEN" \
  -d '{"resolution": "Issue resolved. Property is now visible."}'
```

---

## Response Examples

### Success Response:
```json
{
  "success": true,
  "message": "Feedback submitted successfully. Our team will review it soon.",
  "data": {
    "_id": "679a1b2c3d4e5f6789012345",
    "user": "65user123abc456",
    "issueType": "Problem with My Property Listing",
    "issueDetails": "My property is not appearing in search results",
    "status": "pending",
    "priority": "medium",
    "createdAt": "2026-01-28T10:30:00.000Z"
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Issue type and details are required."
}
```

---

## Notes:
- Replace `YOUR_USER_JWT_TOKEN` with actual user JWT token from login
- Replace `YOUR_EMPLOYEE_JWT_TOKEN` with actual employee JWT token from employee login
- Replace `679a1b2c3d4e5f6789012345` with actual feedback ID
- Replace `65employee123abc456` with actual employee ID
- All timestamps are in ISO 8601 format (UTC)
