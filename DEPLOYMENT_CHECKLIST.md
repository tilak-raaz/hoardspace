# ✅ HttpOnly Cookie Implementation - Final Checklist

## Pre-Deployment Verification

### Code Changes ✓

- [x] Login route sets HttpOnly cookie
- [x] Register route sets HttpOnly cookie
- [x] Logout route clears cookie
- [x] /api/auth/me reads from cookie
- [x] /api/auth/kyc uses cookie auth
- [x] /api/auth/verify-phone uses cookie auth
- [x] /api/hoardings GET uses cookie auth
- [x] /api/hoardings POST uses cookie auth
- [x] /api/bookings/checkout uses cookie auth
- [x] All localStorage.getItem('token') calls removed
- [x] All Authorization Bearer headers removed
- [x] All fetch calls have credentials: 'include'

### Frontend Components ✓

- [x] Navbar - Updated
- [x] AuthModal - Updated
- [x] Profile page - Updated
- [x] Vendor dashboard - Updated
- [x] Add hoarding page - Updated
- [x] Booking page - Updated

### New Files Created ✓

- [x] /lib/auth.ts - Helper functions
- [x] /api/auth/logout/route.ts - Logout endpoint
- [x] SECURITY_UPGRADE.md - Technical docs
- [x] IMPLEMENTATION_COMPLETE.md - Quick start guide
- [x] MIGRATION_NOTICE.md - User migration guide

## Local Testing (Do Before Deploying!)

### Basic Authentication

- [ ] Start dev server: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Open DevTools → Application → Cookies
- [ ] Register new account
- [ ] Verify `token` cookie appears
- [ ] Check cookie has `HttpOnly` flag
- [ ] Check cookie has `SameSite=Lax`
- [ ] Refresh page - should stay logged in
- [ ] Logout - verify cookie is cleared

### Login Flow

- [ ] Login with existing account
- [ ] Verify cookie is set
- [ ] Check user data loads in navbar
- [ ] Navigate to /profile
- [ ] Verify user data displays

### Email Verification

- [ ] Register new account
- [ ] Enter OTP from console
- [ ] Verify still authenticated after verification

### KYC Flow (Vendor)

- [ ] Register as vendor
- [ ] Verify email
- [ ] Submit KYC details
- [ ] Enter phone OTP
- [ ] Verify authentication persists

### Protected Routes

- [ ] Access /vendor/dashboard as vendor
- [ ] Access /profile as any user
- [ ] Try accessing protected route without login
- [ ] Should redirect to home

### Hoarding Management (Vendor)

- [ ] Login as vendor
- [ ] Go to /vendor/add-hoarding
- [ ] Upload images (test upload works)
- [ ] Create new hoarding
- [ ] View in dashboard

### Booking Flow

- [ ] Login as buyer
- [ ] Browse hoardings
- [ ] Click "Book Now"
- [ ] Select dates
- [ ] Initiate payment (test flow)

### Security Verification

- [ ] Open browser console
- [ ] Try: `document.cookie` - token should NOT appear
- [ ] Try: `localStorage.getItem('token')` - should be null
- [ ] Verify token is in Network tab → Cookies

## Environment Variables

### Development (.env.local)

```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your-secret-key-minimum-32-characters
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_public_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Production (Set in Vercel/hosting)

```bash
MONGODB_URI=production_mongodb_uri
JWT_SECRET=strong-random-secret-DO-NOT-REUSE-DEV-KEY
NODE_ENV=production  # IMPORTANT: Enables secure flag
RAZORPAY_KEY_ID=production_key
RAZORPAY_KEY_SECRET=production_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=production_public_key
CLOUDINARY_CLOUD_NAME=production_cloudinary
CLOUDINARY_API_KEY=production_api_key
CLOUDINARY_API_SECRET=production_api_secret
```

## Deployment Steps

### 1. Generate Production JWT Secret

```bash
# Run in terminal to generate a secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Commit Changes

```bash
git add .
git commit -m "Security upgrade: Implement HttpOnly cookie authentication"
git push origin main
```

### 3. Deploy to Vercel

```bash
# Option A: Using Vercel CLI
vercel --prod

# Option B: Using Git Integration
# Just push to main branch, Vercel auto-deploys
```

### 4. Set Production Environment Variables

- Go to Vercel Dashboard
- Select your project
- Settings → Environment Variables
- Add all variables from "Production" section above
- Redeploy if needed

### 5. Test Production

- [ ] Visit production URL
- [ ] Complete registration flow
- [ ] Verify HTTPS is enforced
- [ ] Check cookies in DevTools
- [ ] Verify `Secure` flag is set on cookie
- [ ] Test all authentication flows
- [ ] Test logout

## Post-Deployment Monitoring

### First 24 Hours

- [ ] Monitor error logs
- [ ] Check authentication success rate
- [ ] Watch for 401 errors
- [ ] Monitor cookie-related issues

### What to Watch For

- Users getting logged out unexpectedly
- "Unauthorized" errors on protected routes
- Cookie not being set/cleared properly
- CORS issues (if using separate frontend domain)

## Rollback Plan (If Needed)

If critical issues arise:

1. **Keep this commit hash**: `git rev-parse HEAD`
2. **Quick rollback**:
   ```bash
   git revert HEAD
   git push origin main
   ```
3. **Or use Vercel**: Deployments → Previous deployment → Promote

## Common Issues & Solutions

### Issue: Cookie not visible in DevTools

**Solution**: HttpOnly cookies won't show in Application → Cookies in some browsers. Check Network tab → Cookies instead.

### Issue: 401 errors after deployment

**Solution**: Check that NODE_ENV=production is set and JWT_SECRET is correct.

### Issue: Users logged out after upgrade

**Expected**: Old localStorage tokens are invalid. Users need to re-login once.

### Issue: Cookie not being sent with requests

**Solution**: Verify `credentials: 'include'` is in all fetch calls (already done).

## Documentation Links

- [SECURITY_UPGRADE.md](SECURITY_UPGRADE.md) - Technical details
- [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) - Quick start
- [MIGRATION_NOTICE.md](MIGRATION_NOTICE.md) - User guide

## Final Sign-Off

Before going live:

- [ ] All tests passing locally ✓
- [ ] No console errors ✓
- [ ] Authentication flow complete ✓
- [ ] Protected routes working ✓
- [ ] Cookie security verified ✓
- [ ] Environment variables set ✓
- [ ] Documentation complete ✓
- [ ] Team notified of change ✓
- [ ] Monitoring in place ✓

---

## 🎉 Ready to Deploy!

Once all checkboxes are marked, your application is **production-ready** with enterprise-grade security.

**Estimated Testing Time**: 30-45 minutes
**Deployment Time**: 5-10 minutes

Good luck! 🚀
