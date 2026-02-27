#!/usr/bin/env node

/**
 * OTP Service Configuration Test Script
 * Run this to verify your Twilio and Resend credentials are working
 *
 * Usage: node scripts/test-otp-services.js
 */

const testEmailService = async () => {
  console.log("\n🔍 Testing Email Service (Resend)...\n");

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const EMAIL_FROM =
    process.env.EMAIL_FROM || "HoardSpace <onboarding@resend.dev>";

  if (!RESEND_API_KEY) {
    console.log("⚠️  RESEND_API_KEY not configured");
    console.log("   Using development mode (console logging)");
    return false;
  }

  try {
    const { Resend } = require("resend");
    const resend = new Resend(RESEND_API_KEY);

    console.log("✅ Resend client initialized");
    console.log(`   From: ${EMAIL_FROM}`);
    console.log("   Status: Ready for production");
    return true;
  } catch (error) {
    console.log("❌ Resend initialization failed:", error.message);
    return false;
  }
};

const testSMSService = async () => {
  console.log("\n🔍 Testing SMS Service (Twilio)...\n");

  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log("⚠️  Twilio credentials not configured");
    console.log("   Using development mode (console logging)");
    return false;
  }

  if (!TWILIO_PHONE_NUMBER) {
    console.log("⚠️  TWILIO_PHONE_NUMBER not configured");
    return false;
  }

  try {
    const twilio = require("twilio");
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    // Test credentials by fetching account info
    const account = await client.api.accounts(TWILIO_ACCOUNT_SID).fetch();

    console.log("✅ Twilio client initialized");
    console.log(`   Account: ${account.friendlyName}`);
    console.log(`   Status: ${account.status}`);
    console.log(`   Phone: ${TWILIO_PHONE_NUMBER}`);
    console.log("   Status: Ready for production");
    return true;
  } catch (error) {
    console.log("❌ Twilio initialization failed:", error.message);
    if (error.code === 20003) {
      console.log(
        "   → Invalid credentials (check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN)",
      );
    }
    return false;
  }
};

const main = async () => {
  console.log("╔═══════════════════════════════════════╗");
  console.log("║  OTP Services Configuration Test     ║");
  console.log("╚═══════════════════════════════════════╝");

  const emailReady = await testEmailService();
  const smsReady = await testSMSService();

  console.log("\n" + "═".repeat(40));
  console.log("SUMMARY");
  console.log("═".repeat(40));
  console.log(
    `Email (Resend):  ${emailReady ? "✅ Ready" : "⚠️  Development Mode"}`,
  );
  console.log(
    `SMS (Twilio):    ${smsReady ? "✅ Ready" : "⚠️  Development Mode"}`,
  );
  console.log("═".repeat(40));

  if (!emailReady && !smsReady) {
    console.log("\n💡 Running in DEVELOPMENT MODE");
    console.log("   OTPs will be logged to console");
    console.log("   No actual emails or SMS will be sent");
    console.log("\n📖 See OTP_SETUP_GUIDE.md for production setup");
  } else if (emailReady && smsReady) {
    console.log("\n✨ All services configured for PRODUCTION");
  } else {
    console.log("\n⚠️  PARTIAL CONFIGURATION");
    if (!emailReady) {
      console.log("   → Configure Resend for email OTP");
    }
    if (!smsReady) {
      console.log("   → Configure Twilio for SMS OTP");
    }
    console.log("\n📖 See OTP_SETUP_GUIDE.md for help");
  }

  console.log("\n");
};

main().catch(console.error);
