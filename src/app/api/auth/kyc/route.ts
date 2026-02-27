import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { verifyToken } from '@/lib/jwt';
import { kycSchema } from '@/lib/validators/user';
import { sendOTPSMS } from '@/lib/sms';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const result = kycSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { phone, address, companyName, gstin, pan, aadhaar, documents } = result.data;

    // Check if phone already exists for another user
    const existingPhone = await User.findOne({ phone, _id: { $ne: payload.userId } });
    if (existingPhone) {
      return NextResponse.json({ error: "Phone number already in use" }, { status: 400 });
    }

    // Update User with KYC details
    await User.findByIdAndUpdate(payload.userId, {
      phone,
      kycDetails: {
        phone,
        address,
        companyName,
        gstin,
        pan,
        aadhaar,
        documents: documents || []
      },
      // Set status to pending only if phone is already verified (e.g. user updating kyc)
      // If phone is not verified, it will be set to pending in verify-phone route
      // Or we can set it to pending here if we trust the phone input or if phone didn't change?
      // Safe bet: if user.isPhoneVerified is true, set to pending.
    });

    // Check if phone needs verification
    const currentUser = await User.findById(payload.userId);
    const needPhoneVerification = !currentUser?.isPhoneVerified || currentUser?.phone !== phone;

    if (!needPhoneVerification) {
      // If phone is already verified and same, just update status to pending
      await User.findByIdAndUpdate(payload.userId, { kycStatus: 'pending' });
      return NextResponse.json({ message: "KYC submitted successfully." });
    }

    // Generate Phone OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs for this phone to prevent reuse
    await OTP.deleteMany({ phone, type: 'verification' });

    await OTP.create({
      phone,
      otp,
      type: 'verification',
      expiresAt
    });

    // Send OTP SMS
    const smsResult = await sendOTPSMS(phone, otp);
    if (!smsResult.success) {
      console.error('Failed to send OTP SMS:', smsResult.error);
      // Continue anyway - user can request resend
    }

    return NextResponse.json({
      message: "KYC submitted. Please verify phone."
    });

  } catch (error: any) {
    console.error("KYC Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
