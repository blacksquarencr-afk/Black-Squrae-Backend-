# OTP-Based Registration Flow

## Complete User Registration Flow with OTP Verification

This flow allows users to register using only their phone number initially, verify it via OTP, and then complete registration with additional details.

---

## Step 1: Send OTP to Phone Number

**Endpoint:** `POST /auth/send-phone-otp`

**Request:**
```bash
curl -X POST "https://nk5.yaatrabuddy.com/auth/send-phone-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to 9876543210",
  "smsSuccess": true,
  "isRegistered": false
}
```

**Response Fields:**
- `smsSuccess`: Whether SMS was sent successfully
- `isRegistered`: `true` if user already exists, `false` for new users
- In development mode, `otp` field will be included

---

## Step 2: Verify OTP

**Endpoint:** `POST /auth/verify-phone-otp`

**Request:**
```bash
curl -X POST "https://nk5.yaatrabuddy.com/auth/verify-phone-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "1234"
  }'
```

**Response (Success - New User):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isRegistered": false,
  "user": {
    "_id": "6967513cb5aa3af34ee9721c",
    "fullName": null,
    "email": null,
    "phone": "9876543210",
    "needsRegistration": true
  }
}
```

**Response (Success - Existing User):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isRegistered": true,
  "user": {
    "_id": "6967513cb5aa3af34ee9721c",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "needsRegistration": false
  }
}
```

**Response Fields:**
- `token`: JWT token to be used for authenticated requests
- `isRegistered`: Indicates if user has completed full registration
- `needsRegistration`: `true` if user needs to complete registration form

---

## Step 3: Complete Registration (Required Fields Only)

**Endpoint:** `POST /auth/complete-registration`

**Headers Required:**
- `Authorization: Bearer <JWT_TOKEN>` (from Step 2)

**Request:**
```bash
curl -X POST "https://nk5.yaatrabuddy.com/auth/complete-registration" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "city": "Faridabad"
  }'
```

**Required Fields:**
- `fullName` (string, required)
- `email` (string, required)
- `city` (string, required)

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration completed successfully",
  "user": {
    "_id": "6967513cb5aa3af34ee9721c",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "city": "Faridabad"
  }
}
```

**Error Responses:**

Missing Required Fields:
```json
{
  "success": false,
  "message": "Full Name, Email, and City are required"
}
```

Email Already in Use:
```json
{
  "success": false,
  "message": "Email already in use"
}
```

Unauthorized (Missing/Invalid Token):
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Frontend Implementation Guide

### React/JavaScript Example

```javascript
// Step 1: Send OTP
const sendOTP = async (phoneNumber) => {
  const response = await fetch('https://nk5.yaatrabuddy.com/auth/send-phone-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phoneNumber })
  });
  
  const data = await response.json();
  console.log(data);
  // Show OTP input form
};

// Step 2: Verify OTP
const verifyOTP = async (phoneNumber, otp) => {
  const response = await fetch('https://nk5.yaatrabuddy.com/auth/verify-phone-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phoneNumber, otp: otp })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Save token
    localStorage.setItem('authToken', data.token);
    
    // Check if needs registration
    if (data.user.needsRegistration) {
      // Show registration form
      showRegistrationForm();
    } else {
      // User already registered, go to dashboard
      redirectToDashboard();
    }
  }
};

// Step 3: Complete Registration
const completeRegistration = async (fullName, email, city) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('https://nk5.yaatrabuddy.com/auth/complete-registration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      fullName: fullName,
      email: email,
      city: city
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Registration complete, go to dashboard
    redirectToDashboard();
  }
};
```

---

## User Flow Diagram

```
1. User enters phone number
   ↓
2. System sends OTP via SMS
   ↓
3. User enters OTP
   ↓
4. System verifies OTP
   ↓
5. Is user registered?
   ├─ YES → Login successful, go to dashboard
   └─ NO  → Show registration form (fullName, email, city)
          ↓
        6. User fills form and submits
          ↓
        7. Registration complete, go to dashboard
```

---

## Database Schema

After OTP verification, a minimal user record is created:
```json
{
  "_id": "auto-generated",
  "phone": "9876543210",
  "isPhoneVerified": true,
  "isOtpVerified": true,
  "fullName": "",
  "email": "",
  "city": "",
  "isEmailVerified": false
}
```

After completing registration:
```json
{
  "_id": "auto-generated",
  "phone": "9876543210",
  "fullName": "John Doe",
  "email": "john@example.com",
  "city": "Faridabad",
  "isPhoneVerified": true,
  "isOtpVerified": true,
  "isEmailVerified": true
}
```

---

## Testing the Flow

```bash
# 1. Send OTP
curl -X POST "https://nk5.yaatrabuddy.com/auth/send-phone-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# 2. Verify OTP (use the OTP received via SMS)
curl -X POST "https://nk5.yaatrabuddy.com/auth/verify-phone-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "1234"}'

# 3. Complete Registration (use token from step 2)
curl -X POST "https://nk5.yaatrabuddy.com/auth/complete-registration" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "city": "Faridabad"
  }'
```

---

## Notes

1. **OTP Expiry**: OTPs are valid for 5 minutes
2. **Token Expiry**: JWT tokens are valid for 7 days
3. **Phone Uniqueness**: Phone numbers must be unique
4. **Email Uniqueness**: Email addresses must be unique
5. **Required Fields**: Only `fullName`, `email`, and `city` are required after OTP verification
6. **SMS Provider**: Using Renflair SMS API for OTP delivery
7. **Security**: All registration endpoints use JWT authentication after OTP verification
