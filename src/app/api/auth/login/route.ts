import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { comparePassword } from '@/lib/password';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { loginSchema } from '@/lib/validators/user';
import { sendOTPEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = result.data;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password || "");
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Send new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Delete old OTPs for this email to prevent reuse
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
      }

      return NextResponse.json({
        error: "Email not verified. A verification code has been sent to your email.",
        requiresEmailVerification: true,
        email: user.email
      }, { status: 403 });
    }

    const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
    const { token: refreshToken, expiresAt } = signRefreshToken(user._id.toString());

    // Store refresh token in database
    await User.findByIdAndUpdate(user._id, {
      refreshToken,
      refreshTokenExpiry: expiresAt
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        kycStatus: user.kycStatus
      }
    });

    // Set access token cookie (15 minutes)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    });

    // Set refresh token cookie (7 days)
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
