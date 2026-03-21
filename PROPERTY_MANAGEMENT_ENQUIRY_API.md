# Property Management Enquiry API

API endpoint for submitting property management enquiries.

## Endpoint

```
POST /api/enquiries/property-management
```

## Description

This API allows users to submit property management enquiries by providing their contact details and the property ID they're interested in managing.

## Request Format

**Content-Type:** `application/json`

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `fullName` | String | Full name of the person submitting the enquiry |
| `mobileNumber` | String | Contact mobile number |
| `propertyId` | String (ObjectId) | MongoDB ObjectId of the property |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `email` | String | Email address (optional) |

## Request Body Example

```json
{
  "fullName": "John Doe",
  "mobileNumber": "9876543210",
  "email": "john.doe@example.com",
  "propertyId": "65f1a2b3c4d5e6f7g8h9i0j1"
}
```

## Response Format

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Property management enquiry submitted successfully",
  "enquiry": {
    "_id": "65f2b3c4d5e6f7g8h9i0j1k2",
    "fullName": "John Doe",
    "mobileNumber": "9876543210",
    "email": "john.doe@example.com",
    "enquiryType": "property_management",
    "propertyDetails": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "customPropertyId": "S123-1",
      "propertyLocation": "Sector 63 Noida",
      "propertyType": "Residential",
      "price": 5000000
    },
    "status": "pending",
    "createdAt": "2026-02-16T08:30:00.000Z"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "message": "Missing required fields: fullName, mobileNumber, and propertyId are required"
}
```

### Error Response (500 Server Error)

```json
{
  "success": false,
  "message": "Failed to create property management enquiry",
  "error": "Error message details"
}
```

## cURL Examples

### Basic Request

```bash
curl -X POST "https://backend.blacksquare.estate/api/enquiries/property-management" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "mobileNumber": "9876543210",
    "propertyId": "65f1a2b3c4d5e6f7g8h9i0j1"
  }'
```

### Request with Email

```bash
curl -X POST "https://backend.blacksquare.estate/api/enquiries/property-management" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "mobileNumber": "9876543210",
    "email": "jane.smith@example.com",
    "propertyId": "65f1a2b3c4d5e6f7g8h9i0j1"
  }'
```

### Local Development Request

```bash
curl -X POST "http://localhost:4000/api/enquiries/property-management" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "mobileNumber": "1234567890",
    "email": "test@example.com",
    "propertyId": "65f1a2b3c4d5e6f7g8h9i0j1"
  }'
```

## Features

- ✅ No authentication required (public endpoint)
- ✅ Automatically sets enquiry type to "property_management"
- ✅ Creates enquiry with "pending" status
- ✅ Sets priority to "medium" by default
- ✅ Marks as guest enquiry
- ✅ Returns populated property details in response
- ✅ Validates required fields

## Database Schema

The enquiry is stored with the following structure:

```javascript
{
  fullName: "John Doe",
  mobileNumber: "9876543210",
  email: "john.doe@example.com",
  enquiryType: "property_management",
  propertyManagement: {
    propertyId: ObjectId("65f1a2b3c4d5e6f7g8h9i0j1")
  },
  isGuestEnquiry: true,
  status: "pending",
  priority: "medium",
  createdAt: "2026-02-16T08:30:00.000Z",
  updatedAt: "2026-02-16T08:30:00.000Z"
}
```

## Admin Access

Admins can:
- View all property management enquiries via `GET /api/enquiries?enquiryType=property_management`
- Assign enquiries to employees via `PUT /api/enquiries/:id/assign`
- Update enquiry status via `PUT /api/enquiries/:id/status`
- Add communication logs via `POST /api/enquiries/:id/communication`
- Resolve enquiries via `PUT /api/enquiries/:id/resolve`

## Integration Example (Frontend)

### JavaScript/Fetch

```javascript
async function submitPropertyManagementEnquiry(data) {
  try {
    const response = await fetch('https://backend.blacksquare.estate/api/enquiries/property-management', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: data.fullName,
        mobileNumber: data.mobileNumber,
        email: data.email,
        propertyId: data.propertyId
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Enquiry submitted successfully:', result.enquiry);
      return result;
    } else {
      console.error('Error:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to submit enquiry:', error);
    throw error;
  }
}

// Usage
submitPropertyManagementEnquiry({
  fullName: 'John Doe',
  mobileNumber: '9876543210',
  email: 'john@example.com',
  propertyId: '65f1a2b3c4d5e6f7g8h9i0j1'
});
```

### React Example

```jsx
import { useState } from 'react';

function PropertyManagementForm({ propertyId }) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    propertyId: propertyId
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://backend.blacksquare.estate/api/enquiries/property-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert('Enquiry submitted successfully!');
        // Reset form or redirect
      }
    } catch (error) {
      alert('Failed to submit enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        required
      />
      <input
        type="tel"
        placeholder="Mobile Number"
        value={formData.mobileNumber}
        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email (optional)"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Enquiry'}
      </button>
    </form>
  );
}
```

## Notes

- Property ID must be a valid MongoDB ObjectId
- Mobile number should be a valid 10-digit Indian mobile number
- The system automatically creates a communication trail
- Admins receive notifications for new enquiries (if notification system is enabled)
- Enquiries can be tracked in the CRM system
