import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { hashPassword } from '@/lib/password';
import { signupSchema } from '@/lib/validators/user';
import { sendOTPEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password, role } = result.data;

    const existingUser = await User.findOne({ email });

    // If user exists and is verified, reject registration
    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json({ error: "Email already registered and verified. Please login instead." }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    let user;

    // If user exists but NOT verified, update their details and resend OTP
    if (existingUser && !existingUser.emailVerified) {
      // Update existing unverified user with new details
      user = await User.findByIdAndUpdate(
        existingUser._id,
        {
          name,
          password: hashedPassword,
          role,
          // Keep emailVerified: false
        },
        { new: true }
      );

      // Delete old OTPs for this email
      await OTP.deleteMany({ email, type: 'verification' });
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        emailVerified: false,
        isPhoneVerified: false,
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any old OTPs for this email (cleanup orphaned OTPs)
    await OTP.deleteMany({ email, type: 'verification' });

    await OTP.create({
      email,
      otp,
      type: 'verification',
      expiresAt
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      // Continue anyway - user can request resend
    }

    // Don't assign tokens yet - user must verify email first
    return NextResponse.json({
      message: existingUser
        ? "A new verification code has been sent to your email."
        : "Registration successful! Please check your email to verify your account.",
      email: email,
      verificationRequired: true
    });

  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
