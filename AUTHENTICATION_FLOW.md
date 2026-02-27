# Authentication & Verification Flow

## 🔐 Complete Authentication Flow

### 1. Registration Flow (Email Verification Required)

```
┌─────────────────────────────────────────────────────────────┐
│                   REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

Step 1: User Registers
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "customer"  // or "vendor"
}
        │
        ├─► Create user in database (emailVerified: false)
        ├─► Generate 6-digit OTP
        ├─► Save OTP (expires in 15 minutes)
        ├─► Send OTP email via Resend
        └─► Return response (NO TOKENS YET)
            {
              "message": "Registration successful! Check email",
              "email": "john@example.com",
              "verificationRequired": true
            }

⚠️  User is NOT logged in yet
⚠️  User cannot access protected routes


Step 2: User Checks Email
        │
        └─► Receives professional email with OTP: 123456


Step 3: User Verifies Email
POST /api/auth/verify-email
{
  "email": "john@example.com",
  "otp": "123456"
}
        │
        ├─► Validate OTP (check expiry, match)
        ├─► Mark user as emailVerified: true
        ├─► Delete used OTP
        ├─► Send welcome email
        ├─► Generate accessToken (15 min)
        ├─► Generate refreshToken (7 days)
        ├─► Store refreshToken in database
        ├─► Set accessToken cookie (HttpOnly)
        ├─► Set refreshToken cookie (HttpOnly)
        └─► Return success with user data
            {
              "message": "Email verified! You are now logged in",
              "user": {
                "id": "...",
                "name": "John Doe",
                "email": "john@example.com",
                "role": "customer"
              }
            }

✅ User is NOW logged in
✅ Has access tokens in cookies
✅ Can access protected routes
```

---

### 2. Login Flow (For Already Verified Users)

```
┌─────────────────────────────────────────────────────────────┐
│                     LOGIN FLOW                              │
└─────────────────────────────────────────────────────────────┘

POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
        │
        ├─► Find user by email
        ├─► Verify password (bcrypt)
        ├─► Check if email is verified
        │   │
        │   ├─► If NOT verified:
        │   │   ├─► Generate new OTP
        │   │   ├─► Send OTP email
        │   │   └─► Return { verificationRequired: true }
        │   │       (User must verify first)
        │   │
        │   └─► If verified:
        │       ├─► Generate accessToken (15 min)
        │       ├─► Generate refreshToken (7 days)
        │       ├─► Store refreshToken in database
        │       ├─► Set tokens in cookies
        │       └─► Return success with user data

✅ User logged in with tokens
✅ Can access protected routes
```

---

### 3. KYC & Phone Verification Flow (For Vendors)

```
┌─────────────────────────────────────────────────────────────┐
│              KYC & PHONE VERIFICATION                       │
└─────────────────────────────────────────────────────────────┘

Prerequisite: User must be logged in (has accessToken)

Step 1: Submit KYC Details
POST /api/auth/kyc
Headers: Cookie: accessToken=xxx; refreshToken=xxx
{
  "phone": "9876543210",
  "address": "123 Main St, Mumbai",
  "companyName": "ABC Advertising",
  "gstin": "22AAAAA0000A1Z5",
  "pan": "ABCDE1234F"
}
        │
        ├─► Verify accessToken (user must be logged in)
        ├─► Validate KYC data
        ├─► Check if phone needs verification
        │   │
        │   ├─► If phone already verified:
        │   │   └─► Update KYC status to 'pending'
        │   │
        │   └─► If phone NOT verified:
        │       ├─► Generate 6-digit OTP
        │       ├─► Save OTP (expires in 10 minutes)
        │       ├─► Send OTP SMS via Twilio
        │       └─► Return { message: "Check phone for OTP" }


Step 2: User Receives SMS
        │
        └─► SMS: "Your HoardSpace verification code is: 654321"


Step 3: Verify Phone OTP
POST /api/auth/verify-phone
Headers: Cookie: accessToken=xxx; refreshToken=xxx
{
  "phone": "9876543210",
  "otp": "654321"
}
        │
        ├─► Verify accessToken
        ├─► Validate OTP
        ├─► Mark phone as verified
        ├─► Update KYC status to 'pending'
        └─► Return success

✅ Phone verified
✅ KYC submitted for admin review
```

---

### 4. Token Refresh Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   TOKEN REFRESH FLOW                        │
└─────────────────────────────────────────────────────────────┘

Scenario: accessToken expires (after 15 minutes)

User makes request to protected route:
GET /api/auth/me
Headers: Cookie: accessToken=EXPIRED; refreshToken=xxx
        │
        ├─► accessToken validation fails (expired)
        └─► fetchWithAuth helper catches 401
            │
            └─► Automatically calls POST /api/auth/refresh
                Headers: Cookie: refreshToken=xxx
                    │
                    ├─► Verify refreshToken (7-day validity)
                    ├─► Check token matches database
                    ├─► Generate NEW accessToken (15 min)
                    ├─► Set new accessToken cookie
                    └─► Return success
                        │
                        └─► Retry original request with new token
                            │
                            └─► Request succeeds!

✅ Seamless token refresh
✅ User stays logged in for 7 days
✅ No manual re-login needed
```

---

### 5. OTP Resend Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   OTP RESEND FLOW                           │
└─────────────────────────────────────────────────────────────┘

User didn't receive OTP or it expired

POST /api/auth/resend-otp
{
  "email": "john@example.com"  // or "phone": "9876543210"
}
        │
        ├─► Check if user exists
        ├─► Check if already verified (reject if verified)
        ├─► Rate limiting: Check last OTP time
        │   └─► If < 1 minute ago: Return 429 (Too Many Requests)
        │
        ├─► Delete old OTPs
        ├─► Generate new OTP
        ├─► Save new OTP
        ├─► Send email/SMS
        └─► Return success

✅ New OTP sent
⏱️ Rate limited to prevent spam
```

---

## 🔑 Token Details

### Access Token

- **Lifetime**: 15 minutes
- **Purpose**: Short-lived authentication
- **Storage**: HttpOnly cookie
- **Contents**: { userId, role }
- **Refresh**: Automatic via refresh token

### Refresh Token

- **Lifetime**: 7 days
- **Purpose**: Long-lived session management
- **Storage**: HttpOnly cookie + Database
- **Security**: Validated against database copy
- **Refresh**: Manual re-login required after expiry

---

## 🛡️ Security Features

### Email Verification

✅ User must verify email before login
✅ OTP expires in 15 minutes
✅ One-time use (deleted after verification)
✅ Rate limited resends (1 minute cooldown)

### Phone Verification

✅ Only for critical actions (KYC)
✅ OTP expires in 10 minutes
✅ One-time use
✅ Rate limited resends

### Tokens

✅ HttpOnly cookies (XSS protection)
✅ Secure flag in production (HTTPS only)
✅ SameSite: lax (CSRF protection)
✅ Refresh tokens validated against database
✅ Automatic token refresh

### Password

✅ Bcrypt hashing (salt rounds: 10)
✅ Minimum 8 characters
✅ Must include: uppercase, lowercase, number, special char

---

## 📱 Frontend Integration

### Registration

```javascript
// 1. Register
const response = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, password, role }),
});

const data = await response.json();
if (data.verificationRequired) {
  // Show OTP input form
  showOTPForm(data.email);
}

// 2. Verify Email
const verifyResponse = await fetch("/api/auth/verify-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // Important for cookies
  body: JSON.stringify({ email, otp }),
});

if (verifyResponse.ok) {
  // User is now logged in with tokens
  router.push("/dashboard");
}
```

### Protected Routes (Use fetchWithAuth)

```javascript
import { fetchWithAuth } from "@/lib/fetchWithAuth";

// Automatic token refresh!
const response = await fetchWithAuth("/api/auth/me");
const { user } = await response.json();
```

---

## 🎯 Key Improvements Made

### Before (Insecure)

❌ Tokens assigned at registration
❌ Unverified users could access app
❌ Email verification was optional

### After (Secure)

✅ Tokens assigned ONLY after email verification
✅ Unverified users cannot access protected routes
✅ Email verification is mandatory
✅ Automatic token refresh
✅ Better user experience with proper flow

---

**Last Updated**: February 2026
