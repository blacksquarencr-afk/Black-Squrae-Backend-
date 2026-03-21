# User Profile Update API Documentation

## Overview
This document describes the updated User Profile API that now includes support for `dob` (Date of Birth) and `languagePreferences` fields.

---

## New Fields Added to User Model

### 1. **Date of Birth (dob)**
- **Type:** `Date`
- **Default:** `null`
- **Description:** User's date of birth
- **Format:** ISO 8601 date string (e.g., "1990-05-15")

### 2. **Language Preferences**
- **Type:** `Array of Strings`
- **Default:** `[]` (empty array)
- **Description:** User's preferred languages for communication
- **Example:** `["English", "Hindi", "Spanish"]`

---

## API Endpoint

### **Update User Profile**

**Endpoint:** `PUT /api/users/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

**URL Parameters:**
- `id` - User ID (MongoDB ObjectId)

**Request Body** (all fields are optional):
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "city": "Mumbai",
  "state": "Maharashtra",
  "street": "123 Main Street",
  "pinCode": "400001",
  "dob": "1990-05-15",
  "languagePreferences": ["English", "Hindi", "Marathi"],
  "role": "user"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "User updated",
  "user": {
    "_id": "65abc123def456",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "city": "Mumbai",
    "state": "Maharashtra",
    "dob": "1990-05-15T00:00:00.000Z",
    "languagePreferences": ["English", "Hindi", "Marathi"],
    "avatar": "https://abc.ridealmobility.com/uploads/default-avatar.jpg",
    "role": "user",
    "isEmailVerified": true,
    "isPhoneVerified": true,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-02-02T14:20:00.000Z"
  }
}
```

**Error Responses:**

1. **Invalid DOB Format:**
```json
{
  "success": false,
  "message": "Invalid date of birth format"
}
```

2. **Invalid Language Preferences Format:**
```json
{
  "success": false,
  "message": "Language preferences must be an array"
}
```

3. **User Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Usage Examples

### Example 1: Update DOB Only
```bash
curl -X PUT "http://localhost:5000/api/users/65abc123def456" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "dob": "1990-05-15"
  }'
```

### Example 2: Update Language Preferences Only
```bash
curl -X PUT "http://localhost:5000/api/users/65abc123def456" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "languagePreferences": ["English", "Hindi", "Spanish"]
  }'
```

### Example 3: Update Multiple Fields Including New Ones
```bash
curl -X PUT "http://localhost:5000/api/users/65abc123def456" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fullName": "John Doe",
    "city": "Delhi",
    "dob": "1992-08-10",
    "languagePreferences": ["English", "Hindi"]
  }'
```

### Example 4: JavaScript/Fetch
```javascript
const updateUserProfile = async (userId, updates) => {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updates)
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Profile updated:', data.user);
    } else {
      console.error('Update failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
updateUserProfile('65abc123def456', {
  dob: '1990-05-15',
  languagePreferences: ['English', 'Hindi', 'Marathi']
});
```

### Example 5: React/Axios
```javascript
import axios from 'axios';

const updateProfile = async (userId, profileData) => {
  try {
    const response = await axios.put(
      `http://localhost:5000/api/users/${userId}`,
      profileData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error.response?.data);
    throw error;
  }
};

// Usage
const handleUpdateProfile = async () => {
  const updates = {
    fullName: 'Jane Smith',
    dob: '1995-03-20',
    languagePreferences: ['English', 'French', 'German']
  };
  
  const result = await updateProfile(userId, updates);
  console.log(result);
};
```

---

## Validation Rules

### Date of Birth (dob)
- Must be a valid date string in ISO 8601 format
- Can be null or omitted
- Invalid formats will return a 400 error

### Language Preferences
- Must be an array of strings
- Can be an empty array
- Non-array values will return a 400 error
- Examples of valid values:
  - `[]` (empty)
  - `["English"]`
  - `["English", "Hindi", "Spanish"]`

---

## Complete User Schema

```javascript
{
  fullName: String,
  email: String,
  phone: String (required, unique),
  state: String,
  city: String,
  street: String,
  pinCode: String,
  password: String,
  avatar: String,
  photosAndVideo: [String],
  lastLogin: Date,
  dob: Date,                          // NEW FIELD
  languagePreferences: [String],      // NEW FIELD
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean,
  resetOtp: Number,
  otpExpiry: Date,
  isOtpVerified: Boolean,
  fcmToken: String,
  googleId: String,
  loginProvider: String (enum: ["manual", "google"]),
  role: String (enum: ["user", "agent"]),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing

Run the provided test script:
```bash
chmod +x test-update-user-profile.sh
./test-update-user-profile.sh
```

Make sure to update the `USER_ID` and `TOKEN` variables in the script before running.

---

## Notes

1. **Authentication Required:** All update requests require a valid JWT token
2. **Partial Updates:** You can update any subset of fields; all fields are optional
3. **Password Hashing:** If updating password, it will be automatically hashed using bcrypt
4. **Response Exclusion:** Password field is excluded from all responses
5. **Timestamps:** `updatedAt` field is automatically updated on every modification

---

## Related APIs

- **Get User Profile:** `GET /api/users/profile` (requires authentication)
- **Get User by Token:** `GET /api/users/user` (requires authentication)
- **Complete Registration:** `POST /api/auth/complete-registration` (for OTP users)

---

## Support

For issues or questions, please contact the backend development team.
