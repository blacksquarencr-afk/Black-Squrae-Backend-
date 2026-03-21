# User Profile API - cURL Commands

## Base URL
```
https://backend.blacksquare.estate/api/users
```

## Get User Profile

**Endpoint:** `GET /profile`

**Description:** Get the authenticated user's complete profile with statistics and assigned employee information.

### cURL Command

```bash
curl -X GET "https://backend.blacksquare.estate/api/users/profile" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN"
```

### Response Example

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789012",
    "fullName": "Nikhil Kashyap",
    "email": "bhoomi.nikhilkashyap@gmail.com",
    "phone": "7737470723",
    "state": "Rajasthan",
    "city": "Jaipur",
    "street": "Main Street",
    "pinCode": "302001",
    "avatar": "https://abc.ridealmobility.com/uploads/default-avatar.jpg",
    "photosAndVideo": [],
    "lastLogin": "2026-01-28T10:30:00.000Z",
    "isEmailVerified": true,
    "isPhoneVerified": true,
    "fcmToken": "firebase-token-here",
    "googleId": null,
    "loginProvider": "manual",
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-01-28T10:30:00.000Z",
    "statistics": {
      "shortlistedProperties": 12,
      "myListings": 3,
      "enquiries": 8
    },
    "assignedEmployee": {
      "_id": "65employee123abc456",
      "employee": {
        "_id": "65employee123abc456",
        "name": "Rajesh Kumar",
        "email": "rajesh@blacksquare.estate",
        "phone": "9876543210",
        "profilePicture": "https://example.com/profile.jpg"
      },
      "priority": "high",
      "assignedDate": "2026-01-20T09:00:00.000Z",
      "notes": "VIP customer, interested in luxury properties"
    }
  }
}
```

### Response Fields

#### User Information
- `_id`: User's unique ID
- `fullName`: User's full name
- `email`: User's email address
- `phone`: User's phone number
- `state`, `city`, `street`, `pinCode`: User's address
- `avatar`: Profile picture URL
- `photosAndVideo`: Array of user's photos/videos
- `lastLogin`: Last login timestamp
- `isEmailVerified`: Email verification status
- `isPhoneVerified`: Phone verification status
- `fcmToken`: Firebase Cloud Messaging token
- `loginProvider`: Login method (manual/google)
- `createdAt`: Account creation date
- `updatedAt`: Last update date

#### Statistics Object
- `shortlistedProperties`: Number of properties saved/shortlisted by user
- `myListings`: Number of properties posted by user
- `enquiries`: Number of property enquiries made by user

#### Assigned Employee Object (null if not assigned)
- `_id`: Assignment ID
- `employee`: Employee details object
  - `_id`: Employee ID
  - `name`: Employee name
  - `email`: Employee email
  - `phone`: Employee phone
  - `profilePicture`: Employee profile picture
- `priority`: Assignment priority (low/medium/high/urgent)
- `assignedDate`: Date when employee was assigned
- `notes`: Internal notes about the assignment

### Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

#### 500 Server Error
```json
{
  "success": false,
  "message": "Error fetching profile",
  "error": "Error details"
}
```

---

## Alternative Endpoint (Legacy)

**Endpoint:** `GET /user`

This is the older endpoint that returns similar data but with different structure:

```bash
curl -X GET "https://backend.blacksquare.estate/api/users/user" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "65abc123def456789012",
    "fullName": "Nikhil Kashyap",
    "email": "bhoomi.nikhilkashyap@gmail.com",
    "phone": "7737470723",
    "shortlistedCount": 12,
    "myListingsCount": 3,
    "enquiriesCount": 8
  }
}
```

---

## Usage Examples

### With jq for parsing
```bash
# Get just the user's name
curl -s -X GET "https://backend.blacksquare.estate/api/users/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq -r '.data.fullName'

# Get statistics
curl -s -X GET "https://backend.blacksquare.estate/api/users/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.data.statistics'

# Get assigned employee name
curl -s -X GET "https://backend.blacksquare.estate/api/users/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq -r '.data.assignedEmployee.employee.name'
```

### Save response to file
```bash
curl -X GET "https://backend.blacksquare.estate/api/users/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o user-profile.json
```

### Check if user is verified
```bash
curl -s -X GET "https://backend.blacksquare.estate/api/users/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '{
    emailVerified: .data.isEmailVerified,
    phoneVerified: .data.isPhoneVerified
  }'
```

---

## Notes

- **Authentication Required:** This endpoint requires a valid user JWT token
- **Token Location:** Token should be passed in the `Authorization` header with `Bearer` prefix
- **Statistics:** Counts are calculated in real-time from the database
- **Assigned Employee:** Will be `null` if no employee is currently assigned to the user
- **Password:** Password field is always excluded from the response for security
