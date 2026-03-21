# OTP Authentication & Registration Flow

## Overview
Users can now verify their phone number via OTP and get authenticated without completing full registration. Full registration is only required when they try to upload a property.

---

## API Endpoints

### 1. Send OTP (No Registration Required)
**Endpoint:** `POST /auth/send-phone-otp`

**Request:**
```json
{
  "phone": "7737470723"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to 7737470723",
  "smsSuccess": true,
  "isRegistered": false
}
```

**Notes:**
- Works for both registered and unregistered users
- OTP valid for 5 minutes
- `isRegistered` tells if user already has full account

---

### 2. Verify OTP
**Endpoint:** `POST /auth/verify-phone-otp`

**Request:**
```json
{
  "phone": "7737470723",
  "otp": "1234"
}
```

**Response (New User):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isRegistered": false,
  "user": {
    "_id": "65abc123...",
    "fullName": null,
    "email": null,
    "phone": "7737470723",
    "needsRegistration": true
  }
}
```

**Response (Existing User):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isRegistered": true,
  "user": {
    "_id": "65abc123...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "7737470723",
    "needsRegistration": false
  }
}
```

**Notes:**
- Creates minimal user record (phone only) for new users
- Returns JWT token for authentication
- `needsRegistration` indicates if full registration needed

---

### 3. Complete Registration (Protected - Requires Token)
**Endpoint:** `POST /auth/complete-registration`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "state": "Uttar Pradesh",
  "city": "Noida",
  "street": "Sector 63",
  "pinCode": "201301"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration completed successfully",
  "user": {
    "_id": "65abc123...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "7737470723",
    "state": "Uttar Pradesh",
    "city": "Noida"
  }
}
```

**Notes:**
- All fields are optional (can update partially)
- Email must be unique
- Password is hashed before saving

---

## Frontend Integration Flow

### Flow 1: New User Journey

```
1. User enters phone number → Call /send-phone-otp
   ↓
2. User enters OTP → Call /verify-phone-otp
   ↓
3. Save token, check needsRegistration
   ↓
4. User tries to upload property → Show registration form
   ↓
5. User fills form → Call /complete-registration with token
   ↓
6. Registration complete → Allow property upload
```

### Flow 2: Existing User Journey

```
1. User enters phone number → Call /send-phone-otp
   ↓
2. User enters OTP → Call /verify-phone-otp
   ↓
3. Save token, check needsRegistration (false)
   ↓
4. User can directly upload property (full access)
```

---

## Middleware Usage

### Check Registration Before Property Upload

```javascript
import { checkRegistration } from "../middlewares/checkRegistrationMiddleware.js";

// In your property route
router.post("/upload-property", authMiddleware, checkRegistration, uploadProperty);
```

**What it does:**
- Verifies user has completed registration
- Returns 403 error if incomplete
- Returns user info with `needsRegistration: true`
- Frontend can show registration prompt

**Response if incomplete:**
```json
{
  "success": false,
  "needsRegistration": true,
  "message": "Please complete your registration to upload property",
  "user": {
    "_id": "65abc123...",
    "phone": "7737470723",
    "fullName": null,
    "email": null
  }
}
```

---

## Example CURL Commands

### Send OTP
```bash
curl --location 'https://nk5.yaatrabuddy.com/auth/send-phone-otp' \
--header 'Content-Type: application/json' \
--data '{
  "phone": "7737470723"
}'
```

### Verify OTP
```bash
curl --location 'https://nk5.yaatrabuddy.com/auth/verify-phone-otp' \
--header 'Content-Type: application/json' \
--data '{
  "phone": "7737470723",
  "otp": "1234"
}'
```

### Complete Registration
```bash
curl --location 'https://nk5.yaatrabuddy.com/auth/complete-registration' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--data '{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "state": "Uttar Pradesh",
  "city": "Noida",
  "street": "Sector 63",
  "pinCode": "201301"
}'
```

---

## Database Changes

### User Model Updates
- `fullName`: Now optional (default: empty string)
- `email`: Now optional (default: empty string, sparse index)
- `password`: Now optional (only required for email/password login)
- `phone`: Still required and unique

---

## Security Notes

1. **Token Security**: JWT tokens are valid for 7 days
2. **OTP Expiry**: OTPs expire after 5 minutes
3. **Email Uniqueness**: System prevents duplicate emails
4. **Password Hashing**: All passwords are bcrypt hashed
5. **Phone Verification**: Phone numbers are verified via SMS OTP

---

## Testing Checklist

- [ ] New user can send OTP
- [ ] New user can verify OTP and get token
- [ ] Token works for authenticated endpoints
- [ ] Property upload blocks if registration incomplete
- [ ] Complete registration endpoint updates user
- [ ] Existing user login still works
- [ ] Email uniqueness validation works
- [ ] OTP expiry validation works
