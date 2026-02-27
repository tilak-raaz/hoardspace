# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for HoardSpace.

## Overview

Google OAuth is integrated alongside the existing JWT authentication system. Users can:

- Sign in with Google OR email/password
- Both methods issue the same JWT tokens
- KYC is optional for both authentication methods

## Prerequisites

- Google Cloud Platform account
- Production domain (for production setup)

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name (e.g., "HoardSpace")
4. Click **Create**

### 2. Enable Google+ API

1. In your project dashboard, click **Enable APIs and Services**
2. Search for "Google+ API"
3. Click **Enable**

### 3. Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for public access)
3. Click **Create**
4. Fill in required fields:
   - **App name**: HoardSpace
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On Scopes page, click **Add or Remove Scopes**
7. Select these scopes:
   - `openid`
   - `email`
   - `profile`
8. Click **Update** → **Save and Continue**
9. Add test users (optional for development)
10. Click **Save and Continue** → **Back to Dashboard**

### 4. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Application type**: Web application
4. Enter **Name**: HoardSpace Web Client
5. Add **Authorized JavaScript origins**:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
6. Add **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
7. Click **Create**
8. Copy your **Client ID** and **Client Secret**

### 5. Add Environment Variables

Add these variables to your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=http://localhost:3000

# For production, update NEXTAUTH_URL to your domain:
# NEXTAUTH_URL=https://yourdomain.com
```

### 6. Test the Integration

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Click **Login/Signup** → **Continue with Google**

4. You should be redirected to Google's consent screen

5. After authorization, you'll be redirected back and logged in

## How It Works

### Authentication Flow

1. **User clicks "Continue with Google"**
   - Redirects to `/api/auth/google`
   - Route builds Google OAuth URL with scopes (openid, email, profile)
   - Redirects to Google consent screen

2. **User approves on Google**
   - Google redirects to `/api/auth/google/callback?code=...`
   - Callback route exchanges code for access token
   - Fetches user info from Google (email, name, picture, id)

3. **Account Creation/Login**
   - If user exists by email or googleId → Login
   - If new user → Create account with:
     - `name` from Google
     - `email` from Google
     - `googleId` from Google
     - `image` from Google profile picture
     - `authProvider: 'google'`
     - `emailVerified: true` (Google verified)
     - `kycStatus: 'not_submitted'`

4. **JWT Token Issuance**
   - Generate accessToken (15 min) and refreshToken (7 days)
   - Store tokens in HttpOnly cookies
   - Same tokens as email/password auth
   - Redirect to homepage with `?auth=success`

### User Model Fields

OAuth users have these additional fields:

- `authProvider`: 'google' (vs 'local' for email/password)
- `googleId`: Google user ID (unique identifier)
- `emailVerified`: Auto-set to `true`
- `password`: `undefined` (no password for OAuth users)
- `image`: Google profile picture URL

### KYC Integration

- OAuth users can fill KYC later from profile page
- KYC is **optional** for both buyers and vendors
- Same KYC form works for both auth methods
- Phone verification happens during KYC (if user chooses to fill it)

## Troubleshooting

### "Error 400: redirect_uri_mismatch"

- Ensure redirect URI in Google Console **exactly matches** your callback URL
- Check for trailing slashes, http vs https
- For development, use `http://localhost:3000/api/auth/google/callback`
- For production, use `https://yourdomain.com/api/auth/google/callback`

### "Access blocked: This app's request is invalid"

- Make sure OAuth consent screen is configured
- Add required scopes (openid, email, profile)
- Verify app is not in "Testing" mode with restricted users

### "redirect_uri parameter is missing"

- Check `GOOGLE_CLIENT_ID` is set in `.env.local`
- Verify `NEXTAUTH_URL` is correct for your environment
- Restart development server after adding env variables

### User can't sign in after first OAuth

- Check if `googleId` was saved to user document
- Verify MongoDB connection is working
- Check browser console for errors

## Production Deployment

### Update Environment Variables

1. In Vercel/your host, add:

   ```env
   GOOGLE_CLIENT_ID=your_production_client_id
   GOOGLE_CLIENT_SECRET=your_production_client_secret
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. Ensure no trailing slash in `NEXTAUTH_URL`

### Update Google Console

1. Add production domain to **Authorized JavaScript origins**:
   - `https://yourdomain.com`

2. Add production callback to **Authorized redirect URIs**:
   - `https://yourdomain.com/api/auth/google/callback`

3. Publish OAuth consent screen (move from Testing to Production)

### Domain Verification (Optional)

For trusted domain status:

1. Navigate to **APIs & Services** → **Domain verification**
2. Add your domain and follow verification steps
3. This removes "unverified app" warnings

## Security Considerations

✅ **Implemented Security Features**:

- OAuth state parameter for CSRF protection (Google handles this)
- Email verification bypassed (Google already verified)
- Tokens in HttpOnly cookies (not accessible by JavaScript)
- Secure cookies in production (HTTPS only)
- SameSite='lax' for CSRF protection
- No password storage for OAuth users

✅ **Best Practices**:

- Never expose Client Secret in frontend code
- Store all credentials in environment variables
- Use HTTPS in production
- Validate user email from Google response
- Link accounts by email if user signs up with both methods

## API Routes Reference

### `/api/auth/google` (GET)

Initiates OAuth flow, redirects to Google consent screen.

**Query Params**: None  
**Response**: Redirect to Google OAuth URL  
**Cookies**: None

### `/api/auth/google/callback` (GET)

Handles OAuth callback, creates/logs in user.

**Query Params**:

- `code`: Authorization code from Google
- `error`: Error message if user denied

**Response**: Redirect to `/?auth=success` or `/?auth=error`  
**Cookies**: Sets `accessToken` and `refreshToken`

## Next Steps

After setup:

1. ✅ Test OAuth flow in development
2. ✅ Verify user creation in MongoDB
3. ✅ Test account linking (same email, different auth methods)
4. ✅ Configure production credentials
5. ✅ Test KYC flow with OAuth users
6. ✅ Deploy to production

## Support

For issues or questions:

- Check Google OAuth documentation
- Verify environment variables
- Check server logs for detailed error messages
- Ensure MongoDB connection is working
