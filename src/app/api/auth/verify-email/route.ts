import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { otpSchema } from '@/lib/validators/user';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, otp } = body;

    // Validate Input
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const result = otpSchema.safeParse({ otp });
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const validOTP = await OTP.findOne({
      email,
      otp,
      type: 'verification',
      expiresAt: { $gt: new Date() }
    });

    if (!validOTP) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Verify User
    const user = await User.findOneAndUpdate(
      { email },
      { emailVerified: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete used OTP
    await OTP.deleteMany({ email, type: 'verification' });

    // Send welcome email (fire and forget - don't block the response)
    sendWelcomeEmail(user.email, user.name).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    // Now assign tokens after successful verification
    const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
    const { token: refreshToken, expiresAt: refreshExpiry } = signRefreshToken(user._id.toString());

    // Store refresh token in database
    await User.findByIdAndUpdate(user._id, {
      refreshToken,
      refreshTokenExpiry: refreshExpiry
    });

    const response = NextResponse.json({
      message: "Email verified successfully! You are now logged in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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
    console.error("Verify Email Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
