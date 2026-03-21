# Feedback System - Complete API Reference & Flow

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [API Endpoints](#api-endpoints)
3. [User Flow](#user-flow)
4. [Employee Flow](#employee-flow)
5. [Admin Flow](#admin-flow)
6. [Integration Guide](#integration-guide)
7. [Data Models](#data-models)

---

## 🎯 System Overview

The Feedback System allows users to submit issues/concerns, and enables employees to manage, assign, and resolve these feedbacks through role-based permissions.

**Base URL:** `https://backend.blacksquare.estate/api/feedback`

---

## 📡 API Endpoints

### 👤 User Endpoints (Requires User Token)

#### 1. Submit Feedback
```
POST /api/feedback/submit
Authorization: Bearer {user_token}
```

**Request Body:**
```json
{
  "issueType": "Problem with My Property Listing",
  "issueDetails": "Detailed description of the issue (10-2000 characters)",
  "contactInfo": {
    "name": "User Name",
    "email": "user@email.com",
    "phone": "1234567890"
  },
  "relatedProperty": "property_id (optional)",
  "relatedEnquiry": "enquiry_id (optional)",
  "attachments": ["url1", "url2"] // optional
}
```

**Issue Types:**
- `"Problem with My Property Listing"`
- `"Issue with My Enquiries"`
- `"Concern with My Property Listing Package"`
- `"Issue with My Property Search"`
- `"Assistance Needed with Discount Coupons"`
- `"Problem with a Requested Service"`
- `"Concern Not Listed Here"`

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully. Our team will review it soon.",
  "data": {
    "_id": "feedback_id",
    "user": "user_id",
    "issueType": "Problem with My Property Listing",
    "issueDetails": "Description",
    "status": "pending",
    "priority": "medium",
    "contactInfo": {
      "name": "User Name",
      "email": "user@email.com",
      "phone": "1234567890"
    },
    "createdAt": "2026-01-28T10:00:00.000Z"
  }
}
```

---

#### 2. Get My Feedbacks
```
GET /api/feedback/my-feedbacks?status=pending&page=1&limit=20
Authorization: Bearer {user_token}
```

**Query Parameters:**
- `status` (optional): pending, assigned, in-progress, resolved, closed, rejected
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "feedback_id",
      "issueType": "Problem with My Property Listing",
      "issueDetails": "Description",
      "status": "pending",
      "priority": "medium",
      "assignedTo": {
        "_id": "employee_id",
        "name": "Employee Name",
        "email": "employee@email.com"
      },
      "createdAt": "2026-01-28T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

### 👨‍💼 Employee Endpoints (Requires Employee Token + Permissions)

#### 3. Get My Assigned Feedbacks
```
GET /api/feedback/assigned?status=in-progress&priority=high
Authorization: Bearer {employee_token}
Permission: feedback-management (read)
```

**Query Parameters:**
- `status` (optional): Filter by status
- `priority` (optional): low, medium, high, urgent
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "feedback_id",
      "user": {
        "_id": "user_id",
        "fullName": "User Name",
        "email": "user@email.com",
        "phone": "1234567890",
        "avatar": "avatar_url"
      },
      "issueType": "Problem with My Property Listing",
      "issueDetails": "Description",
      "status": "in-progress",
      "priority": "high",
      "assignedBy": {
        "_id": "admin_id",
        "name": "Admin Name"
      },
      "createdAt": "2026-01-28T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "pages": 1
  },
  "statusCounts": {
    "pending": 5,
    "in-progress": 8,
    "resolved": 12
  }
}
```

---

#### 4. Update Feedback Status
```
PATCH /api/feedback/:id/status
Authorization: Bearer {employee_token}
Permission: feedback-management (update)
```

**Request Body:**
```json
{
  "status": "in-progress",
  "priority": "urgent"  // optional
}
```

**Valid Statuses:** pending, assigned, in-progress, resolved, closed, rejected

**Response:**
```json
{
  "success": true,
  "message": "Feedback status updated successfully.",
  "data": {
    "_id": "feedback_id",
    "status": "in-progress",
    "priority": "urgent"
  }
}
```

---

#### 5. Add Internal Note
```
POST /api/feedback/:id/notes
Authorization: Bearer {employee_token}
Permission: feedback-management (update)
```

**Request Body:**
```json
{
  "note": "Contacted user. Investigating the issue."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Internal note added successfully.",
  "data": {
    "_id": "feedback_id",
    "internalNotes": [
      {
        "_id": "note_id",
        "note": "Contacted user. Investigating the issue.",
        "addedBy": {
          "_id": "employee_id",
          "name": "Employee Name",
          "email": "employee@email.com"
        },
        "addedAt": "2026-01-28T10:30:00.000Z"
      }
    ]
  }
}
```

---

#### 6. Resolve Feedback
```
POST /api/feedback/:id/resolve
Authorization: Bearer {employee_token}
Permission: feedback-management (update)
```

**Request Body:**
```json
{
  "resolution": "The property has been re-indexed and is now visible in search results."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback resolved successfully.",
  "data": {
    "_id": "feedback_id",
    "status": "resolved",
    "resolution": "The property has been re-indexed...",
    "resolvedBy": {
      "_id": "employee_id",
      "name": "Employee Name"
    },
    "resolvedAt": "2026-01-28T11:00:00.000Z"
  }
}
```

---

### 🔐 Admin Endpoints (Requires Employee Token + Admin Permissions)

#### 7. Get All Feedbacks
```
GET /api/feedback/all?status=pending&priority=high&page=1&limit=20
Authorization: Bearer {employee_token}
Permission: feedback-management (read)
```

**Query Parameters:**
- `status`: Filter by status
- `priority`: Filter by priority
- `issueType`: Filter by issue type
- `assignedTo`: Filter by employee ID
- `page`: Page number
- `limit`: Items per page
- `sortBy`: Field to sort by (default: createdAt)
- `order`: asc or desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "feedback_id",
      "user": {
        "_id": "user_id",
        "fullName": "User Name",
        "email": "user@email.com",
        "phone": "1234567890"
      },
      "issueType": "Problem with My Property Listing",
      "status": "pending",
      "priority": "high",
      "assignedTo": null,
      "createdAt": "2026-01-28T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

---

#### 8. Get Feedback by ID
```
GET /api/feedback/:id
Authorization: Bearer {employee_token}
Permission: feedback-management (read)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "feedback_id",
    "user": {
      "_id": "user_id",
      "fullName": "User Name",
      "email": "user@email.com",
      "phone": "1234567890",
      "avatar": "avatar_url"
    },
    "contactInfo": {
      "name": "User Name",
      "email": "user@email.com",
      "phone": "1234567890"
    },
    "issueType": "Problem with My Property Listing",
    "issueDetails": "Detailed description",
    "status": "in-progress",
    "priority": "high",
    "assignedTo": {
      "_id": "employee_id",
      "name": "Employee Name",
      "email": "employee@email.com",
      "phone": "9876543210",
      "profilePicture": "profile_url"
    },
    "assignedBy": {
      "_id": "admin_id",
      "name": "Admin Name"
    },
    "assignedAt": "2026-01-28T10:15:00.000Z",
    "internalNotes": [
      {
        "_id": "note_id",
        "note": "Investigating",
        "addedBy": {
          "_id": "employee_id",
          "name": "Employee Name"
        },
        "addedAt": "2026-01-28T10:30:00.000Z"
      }
    ],
    "attachments": ["url1", "url2"],
    "relatedProperty": "property_id",
    "relatedEnquiry": "enquiry_id",
    "resolution": null,
    "resolvedBy": null,
    "resolvedAt": null,
    "createdAt": "2026-01-28T10:00:00.000Z",
    "updatedAt": "2026-01-28T10:30:00.000Z"
  }
}
```

---

#### 9. Assign Feedback to Employee
```
POST /api/feedback/:id/assign
Authorization: Bearer {employee_token}
Permission: feedback-management (update)
```

**Request Body:**
```json
{
  "assignedTo": "employee_id",
  "priority": "high"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback assigned successfully.",
  "data": {
    "_id": "feedback_id",
    "assignedTo": {
      "_id": "employee_id",
      "name": "Employee Name",
      "email": "employee@email.com"
    },
    "assignedBy": {
      "_id": "admin_id",
      "name": "Admin Name"
    },
    "assignedAt": "2026-01-28T10:15:00.000Z",
    "status": "assigned",
    "priority": "high"
  }
}
```

---

#### 10. Get Feedback Statistics
```
GET /api/feedback/stats/overview
Authorization: Bearer {employee_token}
Permission: feedback-management (read)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "byStatus": [
      { "_id": "pending", "count": 25 },
      { "_id": "assigned", "count": 15 },
      { "_id": "in-progress", "count": 20 },
      { "_id": "resolved", "count": 80 },
      { "_id": "closed", "count": 50 }
    ],
    "byPriority": [
      { "_id": "low", "count": 30 },
      { "_id": "medium", "count": 90 },
      { "_id": "high", "count": 50 },
      { "_id": "urgent", "count": 20 }
    ],
    "byIssueType": [
      { "_id": "Problem with My Property Listing", "count": 45 },
      { "_id": "Issue with My Enquiries", "count": 30 },
      { "_id": "Issue with My Property Search", "count": 25 }
    ],
    "totalFeedbacks": [{ "total": 190 }],
    "pendingFeedbacks": [{ "total": 25 }],
    "resolvedFeedbacks": [{ "total": 130 }]
  }
}
```

---

#### 11. Delete Feedback
```
DELETE /api/feedback/:id
Authorization: Bearer {employee_token}
Permission: feedback-management (delete)
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback deleted successfully."
}
```

---

## 🔄 User Flow

### Step 1: User Submits Feedback
```mermaid
User selects issue type from dropdown
  ↓
User enters issue details (10-2000 chars)
  ↓
System auto-fills contact info from user profile
  ↓
User can optionally add attachments
  ↓
User submits form
  ↓
POST /api/feedback/submit
  ↓
Feedback created with status: "pending", priority: "medium"
  ↓
User receives confirmation message
```

**Frontend Implementation:**
```javascript
// 1. User submits feedback
const submitFeedback = async (formData) => {
  const response = await fetch('https://backend.blacksquare.estate/api/feedback/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      issueType: formData.issueType,
      issueDetails: formData.issueDetails,
      contactInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      }
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Show success message
    showToast('Feedback submitted successfully!');
    // Navigate to my feedbacks
    navigate('/my-feedbacks');
  }
};
```

---

### Step 2: User Views Their Feedbacks
```mermaid
User navigates to "My Feedbacks" screen
  ↓
GET /api/feedback/my-feedbacks
  ↓
Display list of feedbacks with:
  - Issue type
  - Status badge (pending/assigned/in-progress/resolved)
  - Priority indicator
  - Assigned employee (if any)
  - Created date
  ↓
User can filter by status
User can tap to view details
```

**Frontend Implementation:**
```javascript
// 2. Fetch user's feedbacks
const fetchMyFeedbacks = async (status = null, page = 1) => {
  let url = `https://backend.blacksquare.estate/api/feedback/my-feedbacks?page=${page}&limit=20`;
  if (status) url += `&status=${status}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });
  
  const result = await response.json();
  
  if (result.success) {
    setFeedbacks(result.data);
    setPagination(result.pagination);
  }
};
```

---

## 👨‍💼 Employee Flow

### Step 1: View Assigned Feedbacks
```mermaid
Employee logs in
  ↓
Dashboard shows feedback counts by status
  ↓
GET /api/feedback/assigned
  ↓
Display assigned feedbacks with:
  - User info (name, phone, email)
  - Issue type & details
  - Priority badge
  - Status
  - Created date
  ↓
Employee can filter by status/priority
Employee taps feedback to view details
```

**Frontend Implementation:**
```javascript
// 3. Employee views assigned feedbacks
const fetchAssignedFeedbacks = async (filters = {}) => {
  let url = 'https://backend.blacksquare.estate/api/feedback/assigned?';
  if (filters.status) url += `status=${filters.status}&`;
  if (filters.priority) url += `priority=${filters.priority}&`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${employeeToken}`
    }
  });
  
  const result = await response.json();
  
  if (result.success) {
    setFeedbacks(result.data);
    setStatusCounts(result.statusCounts); // For dashboard widgets
  }
};
```

---

### Step 2: Update Feedback Status
```mermaid
Employee views feedback details
  ↓
Employee clicks "Start Working"
  ↓
PATCH /api/feedback/:id/status
Body: { "status": "in-progress" }
  ↓
Status updated to "in-progress"
  ↓
UI updates to show new status
```

**Frontend Implementation:**
```javascript
// 4. Update feedback status
const updateStatus = async (feedbackId, newStatus) => {
  const response = await fetch(`https://backend.blacksquare.estate/api/feedback/${feedbackId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${employeeToken}`
    },
    body: JSON.stringify({ status: newStatus })
  });
  
  const result = await response.json();
  
  if (result.success) {
    showToast('Status updated successfully');
    refreshFeedbackDetails();
  }
};
```

---

### Step 3: Add Internal Notes
```mermaid
Employee adds note about investigation
  ↓
POST /api/feedback/:id/notes
Body: { "note": "User contacted, issue identified" }
  ↓
Note added with employee info & timestamp
  ↓
Note visible to all employees (not user)
```

**Frontend Implementation:**
```javascript
// 5. Add internal note
const addNote = async (feedbackId, noteText) => {
  const response = await fetch(`https://backend.blacksquare.estate/api/feedback/${feedbackId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${employeeToken}`
    },
    body: JSON.stringify({ note: noteText })
  });
  
  const result = await response.json();
  
  if (result.success) {
    showToast('Note added');
    setInternalNotes(result.data.internalNotes);
  }
};
```

---

### Step 4: Resolve Feedback
```mermaid
Employee fixes the issue
  ↓
Employee clicks "Resolve Feedback"
  ↓
Employee enters resolution details
  ↓
POST /api/feedback/:id/resolve
Body: { "resolution": "Issue fixed. Property re-indexed." }
  ↓
Status set to "resolved"
Resolution stored
Resolved by & timestamp recorded
  ↓
User can see resolution in their feedback list
```

**Frontend Implementation:**
```javascript
// 6. Resolve feedback
const resolveFeedback = async (feedbackId, resolutionText) => {
  const response = await fetch(`https://backend.blacksquare.estate/api/feedback/${feedbackId}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${employeeToken}`
    },
    body: JSON.stringify({ resolution: resolutionText })
  });
  
  const result = await response.json();
  
  if (result.success) {
    showToast('Feedback resolved successfully!');
    navigate('/assigned-feedbacks');
  }
};
```

---

## 🔐 Admin Flow

### Step 1: View All Feedbacks
```mermaid
Admin logs in
  ↓
Dashboard shows statistics
GET /api/feedback/stats/overview
  ↓
Admin navigates to feedbacks list
GET /api/feedback/all?status=pending
  ↓
Display all unassigned/pending feedbacks
Filter by status, priority, issue type
Sort by created date, priority
```

**Frontend Implementation:**
```javascript
// 7. Admin views all feedbacks
const fetchAllFeedbacks = async (filters = {}) => {
  const params = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 20,
    ...(filters.status && { status: filters.status }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.issueType && { issueType: filters.issueType })
  });
  
  const response = await fetch(`https://backend.blacksquare.estate/api/feedback/all?${params}`, {
    headers: {
      'Authorization': `Bearer ${employeeToken}`
    }
  });
  
  const result = await response.json();
  
  if (result.success) {
    setAllFeedbacks(result.data);
    setPagination(result.pagination);
  }
};
```

---

### Step 2: Assign to Employee
```mermaid
Admin selects feedback
  ↓
Admin clicks "Assign"
  ↓
Modal shows employee dropdown
Admin selects employee
Admin sets priority (optional)
  ↓
POST /api/feedback/:id/assign
Body: { "assignedTo": "employee_id", "priority": "high" }
  ↓
Feedback assigned
Status set to "assigned"
Employee receives notification (if implemented)
```

**Frontend Implementation:**
```javascript
// 8. Assign feedback to employee
const assignFeedback = async (feedbackId, employeeId, priority) => {
  const response = await fetch(`https://backend.blacksquare.estate/api/feedback/${feedbackId}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${employeeToken}`
    },
    body: JSON.stringify({
      assignedTo: employeeId,
      priority: priority || 'medium'
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    showToast(`Assigned to ${result.data.assignedTo.name}`);
    closeAssignmentModal();
    refreshFeedbackList();
  }
};
```

---

### Step 3: Monitor Statistics
```mermaid
Admin dashboard
  ↓
GET /api/feedback/stats/overview
  ↓
Display widgets:
  - Total feedbacks
  - Pending feedbacks
  - Resolved feedbacks
  - Breakdown by status (pie chart)
  - Breakdown by priority (bar chart)
  - Breakdown by issue type (list)
  ↓
Click on widget to filter feedbacks
```

**Frontend Implementation:**
```javascript
// 9. Fetch and display statistics
const fetchStats = async () => {
  const response = await fetch('https://backend.blacksquare.estate/api/feedback/stats/overview', {
    headers: {
      'Authorization': `Bearer ${employeeToken}`
    }
  });
  
  const result = await response.json();
  
  if (result.success) {
    const stats = result.data;
    
    // Display in dashboard widgets
    setTotalFeedbacks(stats.totalFeedbacks[0]?.total || 0);
    setPendingCount(stats.pendingFeedbacks[0]?.total || 0);
    setResolvedCount(stats.resolvedFeedbacks[0]?.total || 0);
    
    // For charts
    setStatusData(stats.byStatus);
    setPriorityData(stats.byPriority);
    setIssueTypeData(stats.byIssueType);
  }
};
```

---

## 🎨 Integration Guide

### Complete User Feedback Screen Example

```javascript
import React, { useState } from 'react';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    issueType: '',
    issueDetails: '',
    name: '',
    email: '',
    phone: ''
  });
  
  const issueTypes = [
    'Problem with My Property Listing',
    'Issue with My Enquiries',
    'Concern with My Property Listing Package',
    'Issue with My Property Search',
    'Assistance Needed with Discount Coupons',
    'Problem with a Requested Service',
    'Concern Not Listed Here'
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://backend.blacksquare.estate/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          issueType: formData.issueType,
          issueDetails: formData.issueDetails,
          contactInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Feedback submitted successfully!');
        // Navigate to my feedbacks
        window.location.href = '/my-feedbacks';
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Error submitting feedback');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Write to Us</h2>
      
      {/* Name */}
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      
      {/* Phone */}
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        required
      />
      
      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      
      {/* Issue Type Dropdown */}
      <select
        value={formData.issueType}
        onChange={(e) => setFormData({...formData, issueType: e.target.value})}
        required
      >
        <option value="">Select An Issue</option>
        {issueTypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      
      {/* Issue Details */}
      <textarea
        placeholder="Details about the issue"
        value={formData.issueDetails}
        onChange={(e) => setFormData({...formData, issueDetails: e.target.value})}
        minLength={10}
        maxLength={2000}
        rows={5}
        required
      />
      
      <button type="submit">Submit</button>
    </form>
  );
};

export default FeedbackForm;
```

---

### My Feedbacks List Screen

```javascript
import React, { useState, useEffect } from 'react';

const MyFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetchFeedbacks();
  }, [filter]);
  
  const fetchFeedbacks = async () => {
    try {
      let url = 'https://backend.blacksquare.estate/api/feedback/my-feedbacks';
      if (filter !== 'all') url += `?status=${filter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFeedbacks(result.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    const colors = {
      'pending': '#FFA500',
      'assigned': '#2196F3',
      'in-progress': '#9C27B0',
      'resolved': '#4CAF50',
      'closed': '#757575',
      'rejected': '#F44336'
    };
    return colors[status] || '#000';
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>My Feedbacks</h2>
      
      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('pending')}>Pending</button>
        <button onClick={() => setFilter('in-progress')}>In Progress</button>
        <button onClick={() => setFilter('resolved')}>Resolved</button>
      </div>
      
      {/* Feedback List */}
      <div className="feedback-list">
        {feedbacks.map(feedback => (
          <div key={feedback._id} className="feedback-card">
            <div className="feedback-header">
              <span className="issue-type">{feedback.issueType}</span>
              <span 
                className="status-badge" 
                style={{backgroundColor: getStatusColor(feedback.status)}}
              >
                {feedback.status}
              </span>
            </div>
            
            <p className="issue-details">{feedback.issueDetails}</p>
            
            {feedback.assignedTo && (
              <p className="assigned-to">
                Assigned to: {feedback.assignedTo.name}
              </p>
            )}
            
            {feedback.resolution && (
              <div className="resolution">
                <strong>Resolution:</strong>
                <p>{feedback.resolution}</p>
              </div>
            )}
            
            <p className="created-date">
              Submitted: {new Date(feedback.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyFeedbacks;
```

---

## 📊 Data Models

### Feedback Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  contactInfo: {
    name: String,
    email: String,
    phone: String
  },
  issueType: String (enum),
  issueDetails: String (10-2000 chars),
  status: String (enum: pending, assigned, in-progress, resolved, closed, rejected),
  priority: String (enum: low, medium, high, urgent),
  assignedTo: ObjectId (ref: Employee),
  assignedBy: ObjectId (ref: Employee),
  assignedAt: Date,
  resolution: String,
  resolvedBy: ObjectId (ref: Employee),
  resolvedAt: Date,
  internalNotes: [{
    note: String,
    addedBy: ObjectId (ref: Employee),
    addedAt: Date
  }],
  attachments: [String],
  relatedProperty: ObjectId,
  relatedEnquiry: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Role Permissions Setup

To enable feedback management for employees, add this permission to their role:

```json
{
  "module": "feedback-management",
  "actions": ["read", "update", "delete"]
}
```

**Permission Levels:**
- **read**: View feedbacks and statistics
- **update**: Assign, update status, add notes, resolve
- **delete**: Delete feedbacks (admin only)

---

## 🚀 Quick Start Integration Checklist

### Frontend Setup
- [ ] Create feedback submission form with issue type dropdown
- [ ] Implement "My Feedbacks" list screen
- [ ] Add status badges with color coding
- [ ] Implement employee dashboard for assigned feedbacks
- [ ] Create admin panel for feedback management
- [ ] Add statistics dashboard widgets
- [ ] Implement real-time status updates
- [ ] Add filter and search functionality

### Backend Integration
- [ ] Store user token securely (localStorage/AsyncStorage)
- [ ] Handle authentication errors (401/403)
- [ ] Implement error handling for all API calls
- [ ] Add loading states for async operations
- [ ] Implement pagination for lists
- [ ] Add success/error toast notifications
- [ ] Test all API endpoints

### User Experience
- [ ] Auto-fill contact info from user profile
- [ ] Show clear status indicators
- [ ] Display assigned employee info
- [ ] Show resolution details when resolved
- [ ] Add empty states for no feedbacks
- [ ] Implement pull-to-refresh
- [ ] Add confirmation dialogs for important actions

---

## 📞 Support

For any integration issues or questions, contact the backend team or refer to the complete API documentation.

**API Base URL:** `https://backend.blacksquare.estate`
**Feedback Endpoints:** `/api/feedback/*`
