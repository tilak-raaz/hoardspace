# OTP Verification Setup Guide

This guide will help you set up real OTP verification for email and phone numbers in production.

## Overview

The application uses:

- **Resend** for email OTP delivery
- **Twilio** for SMS OTP delivery

Both services have generous free tiers:

- **Resend**: 3,000 emails/month free, then $0.10/1000 emails
- **Twilio**: Free trial credits, then pay-as-you-go (~$0.0075/SMS in India)

---

## 1. Setting Up Resend (Email OTP)

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email address

### Step 2: Get API Key

1. Go to [API Keys](https://resend.com/api-keys)
2. Click **Create API Key**
3. Name it (e.g., "HoardSpace Production")
4. Set permissions to **Sending access**
5. Click **Add**
6. **Copy the API key** (you won't see it again!)

### Step 3: Verify Your Domain (Required for Production)

1. Go to [Domains](https://resend.com/domains)
2. Click **Add Domain**
3. Enter your domain (e.g., `hoardspace.com`)
4. Follow the instructions to add DNS records:
   - **SPF Record**: TXT record for SPF authentication
   - **DKIM Record**: CNAME records for DKIM signing
   - **DMARC Record**: TXT record for DMARC policy
5. Wait for verification (usually takes 5-30 minutes)
6. Once verified, you can send from `noreply@yourdomain.com`

### Step 4: Configure Environment Variables

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="HoardSpace <noreply@yourdomain.com>"
```

**Note**: For development/testing, you can use the default `onboarding@resend.dev` sender.

---

## 2. Setting Up Twilio (SMS OTP)

### Step 1: Create Twilio Account

1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up and verify your email
3. Complete the verification process
4. You'll get **$15 in free trial credits**

### Step 2: Get Credentials

1. Go to [Console Dashboard](https://console.twilio.com/)
2. Find your **Account SID** and **Auth Token** in the dashboard
3. Copy both values

### Step 3: Get a Phone Number

#### Option A: Trial Phone Number (Development)

1. During signup, Twilio assigns a trial number
2. Trial numbers can only send to **verified phone numbers**
3. To verify phone numbers:
   - Go to [Verified Caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
   - Add your test phone numbers

#### Option B: Buy a Phone Number (Production)

1. Go to [Phone Numbers → Buy a number](https://console.twilio.com/us1/develop/phone-numbers/manage/search)
2. Select your country (India: +91)
3. Filter by capabilities: ✓ SMS
4. Choose a number (costs ~$1-2/month for Indian numbers)
5. Click **Buy**

### Step 4: Configure Environment Variables

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+911234567890  # Your Twilio phone number
```

### Step 5: Upgrade to Paid Account (For Production)

1. Go to [Upgrade Account](https://console.twilio.com/us1/billing/upgrade-to-paid)
2. Add payment method
3. This removes trial restrictions (verified numbers only)
4. Enables sending to any phone number

---

## 3. Development vs Production

### Development Mode

If credentials are not configured, the application will:

- Log OTPs to console
- Show mock messages in terminal
- Continue working without actual sending

Example console output:

```
[MOCK EMAIL] To: user@example.com
[MOCK EMAIL] Message: Your verification code is: 123456

[MOCK SMS] To: +919876543210
[MOCK SMS] Message: Your HoardSpace verification code is: 123456
```

### Production Mode

Set `NODE_ENV=production` and configure all credentials properly.

---

## 4. Testing the Setup

### Test Email OTP

1. Register a new account with your real email
2. Check your inbox for the OTP email
3. If not received:
   - Check spam folder
   - Verify Resend domain is configured
   - Check Resend logs at [resend.com/logs](https://resend.com/logs)

### Test SMS OTP

1. Complete KYC with your real phone number
2. You should receive SMS with OTP
3. If not received:
   - Verify phone number format (+91xxxxxxxxxx)
   - Check Twilio logs at [console.twilio.com/monitor/logs](https://console.twilio.com/us1/monitor/logs/sms)
   - Ensure trial account has this number verified (if trial)

---

## 5. Cost Estimation

### Resend (Email)

- **Free Tier**: 3,000 emails/month
- **Paid**: $0.10 per 1,000 emails
- **Example**: 10,000 users/month = $1/month

### Twilio (SMS)

- **Indian SMS**: ~₹0.60 per SMS (~$0.0075)
- **Example**: 1,000 OTPs/month = ₹600/month (~$7.50/month)
- **Optimization**: Reduce costs by:
  - Using email OTP as primary verification
  - SMS OTP only for critical actions (KYC)
  - Implementing rate limiting

---

## 6. Security Best Practices

### OTP Generation

- ✅ 6-digit numeric OTPs
- ✅ Cryptographically random
- ✅ 15-minute expiry for email
- ✅ 10-minute expiry for SMS

### Rate Limiting

- ✅ 1-minute cooldown between resend requests
- ✅ Maximum 5 attempts per hour (implement in future)

### Validation

- ✅ OTP deleted after successful verification
- ✅ One-time use only
- ✅ Case-sensitive matching
- ✅ Automatic cleanup of expired OTPs

---

## 7. Monitoring and Debugging

### Check Email Delivery

```bash
# Resend Dashboard
https://resend.com/logs

# Look for:
# - Delivery status
# - Bounce/complaint rates
# - Click/open rates
```

### Check SMS Delivery

```bash
# Twilio Console
https://console.twilio.com/monitor/logs/sms

# Look for:
# - Message status (queued, sent, delivered, failed)
# - Error codes
# - Delivery time
```

### Application Logs

```bash
# Check server logs for:
Failed to send OTP email: [error]
Failed to send OTP SMS: [error]

# These indicate service issues
```

---

## 8. Troubleshooting

### Email Not Received

1. **Check Resend logs** for delivery status
2. **Verify domain** is properly configured
3. **Check spam folder**
4. **Verify API key** is correct and has permissions
5. **Check rate limits** (3,000/month on free tier)

### SMS Not Received

1. **Check Twilio logs** for message status
2. **Verify phone format** (+countrycode + number)
3. **Check trial restrictions** (verified numbers only)
4. **Verify phone number** can receive SMS
5. **Check Twilio balance** (not depleted)

### "Service Not Configured" Error

- Environment variables not set properly
- Restart application after setting env vars
- Check for typos in variable names

---

## 9. Going to Production Checklist

- [ ] Resend account created and verified
- [ ] Domain added and DNS configured in Resend
- [ ] Resend API key generated and added to env
- [ ] Twilio account created and upgraded to paid
- [ ] Twilio phone number purchased
- [ ] Twilio credentials added to env
- [ ] Test email OTP with real email
- [ ] Test SMS OTP with real phone number
- [ ] Set NODE_ENV=production
- [ ] Configure monitoring/alerts
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Document OTP delivery issues for support

---

## 10. Next Steps - Enhancements

Consider implementing:

1. **Resend OTP button** in UI (already implemented in API)
2. **Alternative verification methods** (authenticator apps)
3. **SMS fallback to email** if user doesn't have phone
4. **International phone support** (multiple country codes)
5. **OTP attempt tracking** to prevent brute force
6. **WhatsApp OTP** (cheaper alternative to SMS)

---

## Support

- **Resend Support**: [resend.com/support](https://resend.com/support)
- **Twilio Support**: [support.twilio.com](https://support.twilio.com)
- **HoardSpace Issues**: Check application logs first

---

**Last Updated**: February 2026
