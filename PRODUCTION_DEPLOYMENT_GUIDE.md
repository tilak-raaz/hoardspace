# Production Deployment Guide - HoardSpace

Complete guide to deploy **hoardspace.in** to production.

---

## 📋 Pre-Deployment Checklist

- [x] MongoDB Atlas setup and accessible
- [x] Cloudinary configured
- [x] Razorpay test keys (switch to live later)
- [x] Google OAuth credentials
- [x] Google Maps API keys (2 keys configured)
- [x] Resend email service configured
- [x] Domain name: hoardspace.in

---

## 🚀 Part 1: GitHub Setup

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com/new)
2. Create new repository: `project-hoardspace`
3. Keep it **Private** (recommended)
4. Don't initialize with README (we have one)

### Step 2: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Production ready"

# Add GitHub remote (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/project-hoardspace.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Verify:** Check your GitHub repository - all files should be uploaded.

---

## 🌐 Part 2: Deploy to Vercel

### Step 1: Sign Up & Connect GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click **"Add New..." → "Project"**
2. Find `project-hoardspace` repository
3. Click **"Import"**

### Step 3: Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (leave default)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)
 
**Important:** Copy-paste each variable name and value carefully!

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a Vercel URL like: `https://project-hoardspace.vercel.app`

**Test the Vercel URL first before proceeding!**

---

## 🔗 Part 3: Connect Custom Domain

### Step 1: Add Domain in Vercel

1. Go to your project in Vercel
2. Click **"Settings" → "Domains"**
3. Add domain: `hoardspace.in`
4. Add domain: `www.hoardspace.in`
5. Vercel will show DNS records to configure

### Step 2: Configure DNS (at your domain registrar)

**Where you bought hoardspace.in (GoDaddy/Namecheap/etc):**

Add these DNS records:

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Wait 10-60 minutes for DNS propagation.**

### Step 3: Verify SSL Certificate

1. Vercel auto-generates SSL certificate
2. Check: Your domain shows 🔒 (HTTPS)
3. Both `hoardspace.in` and `www.hoardspace.in` should work

---

## 🔧 Part 4: Update Google Services

### Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to: **APIs & Services → Credentials**
3. Click your OAuth 2.0 Client ID
4. **Add these to "Authorized JavaScript origins":**
   ```
   https://hoardspace.in
   https://www.hoardspace.in
   ```
5. **Add these to "Authorized redirect URIs":**
   ```
   https://hoardspace.in/api/auth/google/callback
   https://www.hoardspace.in/api/auth/google/callback
   ```
6. Click **"Save"**

### Google Maps API - Browser Key

1. In Google Cloud Console: **APIs & Services → Credentials**
2. Find your `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Click "Edit API key"
4. Under **"Application restrictions"** → Select "HTTP referrers"
5. Add these referrers:
   ```
   https://hoardspace.in/*
   https://www.hoardspace.in/*
   ```
6. Keep `localhost` for development:
   ```
   http://localhost:3000/*
   ```
7. Click **"Save"**

### Google Maps API - Server Key

**Keep unrestricted** (or add IP restrictions if you know Vercel IPs)

Your `GOOGLE_MAPS_SERVER_API_KEY` should remain unrestricted for server-side calls.

---

## ✅ Part 5: Post-Deployment Testing

### Test Checklist

1. **Homepage**
   - [ ] Visit https://hoardspace.in
   - [ ] Page loads correctly
   - [ ] Images load from Cloudinary

2. **Authentication**
   - [ ] Register new user
   - [ ] Email verification works (check email)
   - [ ] Login with email
   - [ ] Google OAuth login works
   - [ ] Logout works

3. **Hoardings**
   - [ ] Browse hoardings page
   - [ ] View hoarding details
   - [ ] Vendor: Add new hoarding
   - [ ] Map location picker works
   - [ ] Pincode auto-fill works

4. **KYC & Profile**
   - [ ] Fill KYC form
   - [ ] View profile page
   - [ ] Upload documents

5. **Booking & Payment**
   - [ ] Book a hoarding
   - [ ] Razorpay checkout opens
   - [ ] Test payment (use test card)
   - [ ] Booking success page
   - [ ] View booking in profile

**Test Card for Razorpay:**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

---

## 🔄 Part 6: Update to Production Keys (Later)

### When Ready for Real Payments

1. **Razorpay Production Keys:**
   - Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
   - Switch to **"Live Mode"**
   - Go to: Settings → API Keys → Generate
   - **Update in Vercel:**
     - Go to: Project Settings → Environment Variables
     - Update these 3 variables:
       ```
       RAZORPAY_KEY_ID=rzp_live_xxxxxxxxx
       RAZORPAY_KEY_SECRET=live_secret_xxxxxxxxx
       NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxx
       ```
   - Click **"Save"**
   - Redeploy: Deployments → Latest → ⋯ → Redeploy

2. **Twilio (Optional - for SMS):**
   - Sign up: [twilio.com](https://www.twilio.com/try-twilio)
   - Get Account SID, Auth Token, Phone Number
   - **Add in Vercel:** Environment Variables
     ```
     TWILIO_ACCOUNT_SID=ACxxxxxxxx
     TWILIO_AUTH_TOKEN=your_token
     TWILIO_PHONE_NUMBER=+911234567890
     ```
   - Redeploy

---

## 📊 Part 7: Monitor Your Application

### Vercel Dashboard

- **Analytics:** Track page views, visitors
- **Logs:** View runtime logs for errors
- **Speed Insights:** Monitor performance

### Google Cloud Console

- **OAuth Usage:** APIs & Services → Dashboard
- **Maps API Usage:** Check quotas and billing

### MongoDB Atlas

- **Database Monitoring:** View connections, queries
- **Alerts:** Set up alerts for high usage

### Razorpay Dashboard

- **Transactions:** Monitor payments
- **Settlements:** Track payouts

---

## 🐛 Troubleshooting

### Issue: OAuth Redirect Error

**Solution:** Make sure production URLs are added in Google Console

### Issue: Maps Not Loading

**Solution:** Check API key restrictions include your domain

### Issue: Environment Variables Not Working

**Solution:** 
- Verify variables in Vercel Settings
- Redeploy after adding variables
- Check spelling and no extra spaces

### Issue: Database Connection Failed

**Solution:**
- MongoDB Atlas: Network Access → Add 0.0.0.0/0 (allow all)
- Check MONGODB_URI is correct

### Issue: Payment Not Working

**Solution:**
- Verify Razorpay keys are correct
- Check browser console for errors
- Test mode: Use test card numbers

### Issue: Images Not Uploading

**Solution:**
- Check Cloudinary credentials
- Verify upload preset settings
- Check file size limits

---

## 📱 Part 8: Mobile Testing

Test on actual devices:

1. **iOS Safari**
   - Authentication flow
   - Map interactions
   - Image uploads

2. **Android Chrome**
   - All features
   - Payment flow
   - Responsive design

---

## 🔒 Security Best Practices

✅ **Completed:**
- HTTPS enabled (Vercel auto-SSL)
- HttpOnly cookies for JWT
- Environment variables secured
- API keys restricted
- MongoDB authentication enabled

⚠️ **Before Launch:**
- [ ] Review all error messages (don't expose sensitive info)
- [ ] Set up rate limiting for API routes
- [ ] Add CORS configuration if needed
- [ ] Enable Vercel password protection during beta testing
- [ ] Create backup of MongoDB database

---

## 📈 Going Live Checklist

Before announcing to users:

- [ ] All features tested on production
- [ ] Switch to Razorpay live keys
- [ ] Set up monitoring alerts
- [ ] Create admin account
- [ ] Add privacy policy page
- [ ] Add terms of service page
- [ ] Set up customer support email
- [ ] Create user documentation
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Prepare announcement/marketing

---

## 🎉 You're Live!

Your application is now running at: **https://hoardspace.in**

### Next Steps:

1. Monitor logs for first few days
2. Gather user feedback
3. Fix bugs and iterate
4. Add new features based on usage

### Need Help?

- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Razorpay Support: [razorpay.com/support](https://razorpay.com/support)
- MongoDB Support: [mongodb.com/support](https://www.mongodb.com/support)

---

## 📚 Quick Reference

### Important URLs

- **Production:** https://hoardspace.in
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Google Console:** https://console.cloud.google.com
- **Razorpay Dashboard:** https://dashboard.razorpay.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Cloudinary Console:** https://cloudinary.com/console

### Support Commands

```bash
# View logs locally
npm run dev

# Build locally to test
npm run build

# Start production build locally
npm run start

# Check for errors
npm run lint
```

---

**Good luck with your launch! 🚀**
