# OTP Production Setup - Quick Start

## What Was Implemented

✅ **Email OTP Service** using Resend

- Professional email templates with branding
- Automatic welcome emails after verification
- Fallback to console logging in development

✅ **SMS OTP Service** using Twilio

- International phone number support
- Automatic formatting to E.164 standard
- Fallback to console logging in development

✅ **API Routes Updated**

- `/api/auth/register` - Sends email OTP on signup
- `/api/auth/kyc` - Sends SMS OTP for phone verification
- `/api/auth/verify-email` - Sends welcome email after verification
- `/api/auth/resend-otp` - New endpoint for resending OTPs

✅ **Rate Limiting**

- 1-minute cooldown between OTP resend requests
- Prevents spam and abuse

✅ **Security Features**

- 6-digit cryptographically random OTPs
- 15-minute expiry for email OTPs
- 10-minute expiry for SMS OTPs
- One-time use (deleted after verification)
- Automatic cleanup of expired OTPs

---

## Quick Setup (2 Minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create or update `.env.local`:

```bash
# Email OTP (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="HoardSpace <noreply@yourdomain.com>"

# SMS OTP (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+911234567890
```

### 3. Test Configuration

```bash
npm run test:otp
```

Expected output:

```
╔═══════════════════════════════════════╗
║  OTP Services Configuration Test     ║
╚═══════════════════════════════════════╝

🔍 Testing Email Service (Resend)...

✅ Resend client initialized
   From: HoardSpace <noreply@yourdomain.com>
   Status: Ready for production

🔍 Testing SMS Service (Twilio)...

✅ Twilio client initialized
   Account: Your Account Name
   Status: active
   Phone: +911234567890
   Status: Ready for production

════════════════════════════════════════
SUMMARY
════════════════════════════════════════
Email (Resend):  ✅ Ready
SMS (Twilio):    ✅ Ready
════════════════════════════════════════

✨ All services configured for PRODUCTION
```

---

## Getting API Keys

### Resend (Email)

1. Sign up: [resend.com](https://resend.com)
2. Get API key: [resend.com/api-keys](https://resend.com/api-keys)
3. Verify domain: [resend.com/domains](https://resend.com/domains)

**Free Tier**: 3,000 emails/month

### Twilio (SMS)

1. Sign up: [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Get credentials: [console.twilio.com](https://console.twilio.com)
3. Buy phone number: [Buy Number](https://console.twilio.com/us1/develop/phone-numbers/manage/search)

**Free Trial**: $15 credits (≈2000 SMS)

---

## Development vs Production

### Development Mode (No Credentials)

- OTPs logged to console
- No actual emails/SMS sent
- Perfect for local testing

```bash
[MOCK EMAIL] OTP for user@example.com: 123456
[MOCK SMS] OTP for +919876543210: 654321
```

### Production Mode (With Credentials)

- Real emails via Resend
- Real SMS via Twilio
- Set `NODE_ENV=production`

---

## Testing the Implementation

### Test Email OTP

1. Register new account: `POST /api/auth/register`

```json
{
  "name": "Test User",
  "email": "your-real-email@example.com",
  "password": "SecurePass123!",
  "role": "customer"
}
```

2. Check email inbox for OTP
3. Verify: `POST /api/auth/verify-email`

```json
{
  "email": "your-real-email@example.com",
  "otp": "123456"
}
```

4. Should receive welcome email

### Test SMS OTP

1. Complete KYC: `POST /api/auth/kyc`

```json
{
  "phone": "9876543210",
  "address": "Test Address",
  "companyName": "Test Company",
  "gstin": "22AAAAA0000A1Z5",
  "pan": "ABCDE1234F"
}
```

2. Check phone for SMS
3. Verify: `POST /api/auth/verify-phone`

```json
{
  "phone": "9876543210",
  "otp": "654321"
}
```

### Test Resend OTP

```bash
POST /api/auth/resend-otp
```

```json
{
  "email": "user@example.com"
}
```

or

```json
{
  "phone": "9876543210"
}
```

---

## File Structure

```
src/
├── lib/
│   ├── email.ts          # Email service (Resend)
│   ├── sms.ts            # SMS service (Twilio)
│   └── ...
├── app/
│   └── api/
│       └── auth/
│           ├── register/route.ts      # Sends email OTP
│           ├── kyc/route.ts          # Sends SMS OTP
│           ├── verify-email/route.ts # Sends welcome email
│           ├── verify-phone/route.ts # Verifies phone OTP
│           └── resend-otp/route.ts   # Resends OTP
scripts/
└── test-otp-services.js  # Configuration test script
```

---

## Monitoring

### Email Delivery

- Dashboard: [resend.com/logs](https://resend.com/logs)
- Check delivery status, bounces, complaints

### SMS Delivery

- Console: [console.twilio.com/monitor/logs/sms](https://console.twilio.com/us1/monitor/logs/sms)
- Check status, error codes, delivery time

---

## Cost Estimate (1000 active users/month)

| Service        | Usage         | Cost                |
| -------------- | ------------- | ------------------- |
| Resend (Email) | ~2,000 emails | **Free** (under 3K) |
| Twilio (SMS)   | ~1,000 SMS    | **~$7.50** (~₹600)  |
| **Total**      |               | **~$7.50/month**    |

### Cost Optimization Tips

1. Use email OTP as primary verification
2. SMS OTP only for critical actions (KYC)
3. Implement proper rate limiting
4. Consider WhatsApp Business API (cheaper than SMS)

---

## Troubleshooting

### "Email Not Received"

1. Check spam folder
2. Verify Resend domain configured
3. Check Resend logs
4. Verify API key permissions

### "SMS Not Received"

1. Check Twilio logs for errors
2. Verify phone format (+91xxxxxxxxxx)
3. Check Twilio balance
4. For trial: verify phone number in console

### "Service Not Configured"

1. Check `.env.local` file exists
2. Verify environment variable names
3. Restart development server
4. Run `npm run test:otp`

---

## Production Checklist

Before deploying to production:

- [ ] Resend account created and API key obtained
- [ ] Domain verified in Resend (for custom sender)
- [ ] Twilio account created and upgraded to paid
- [ ] Twilio phone number purchased
- [ ] All environment variables configured
- [ ] `npm run test:otp` passes successfully
- [ ] Tested email OTP with real email
- [ ] Tested SMS OTP with real phone
- [ ] Set `NODE_ENV=production`
- [ ] Monitoring set up (optional but recommended)

---

## Support

- **Detailed Guide**: See `OTP_SETUP_GUIDE.md`
- **Resend Docs**: [resend.com/docs](https://resend.com/docs)
- **Twilio Docs**: [twilio.com/docs/sms](https://www.twilio.com/docs/sms)

---

**Ready to go live!** 🚀
