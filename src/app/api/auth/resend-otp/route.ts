import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { sendOTPEmail } from '@/lib/email';
import { sendOTPSMS } from '@/lib/sms';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { email, phone, type = 'verification' } = body;

        if (!email && !phone) {
            return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
        }

        // Check if user exists
        let user;
        if (email) {
            user = await User.findOne({ email });
            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            if (user.emailVerified) {
                return NextResponse.json({ error: "Email already verified" }, { status: 400 });
            }
        } else if (phone) {
            user = await User.findOne({ phone });
            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            if (user.isPhoneVerified) {
                return NextResponse.json({ error: "Phone already verified" }, { status: 400 });
            }
        }

        // Check rate limiting - prevent too frequent resends (1 minute cooldown)
        const recentOTP = await OTP.findOne({
            ...(email ? { email } : { phone }),
            type,
            createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // Within last minute
        });

        if (recentOTP) {
            return NextResponse.json({
                error: "Please wait before requesting another OTP. Try again in 1 minute."
            }, { status: 429 });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Delete old OTPs for this email/phone
        await OTP.deleteMany({
            ...(email ? { email } : { phone }),
            type
        });

        // Create new OTP
        await OTP.create({
            ...(email ? { email } : { phone }),
            otp,
            type,
            expiresAt
        });

        // Send OTP
        if (email) {
            const result = await sendOTPEmail(email, otp);
            if (!result.success) {
                console.error('Failed to send OTP email:', result.error);
                return NextResponse.json({
                    error: "Failed to send OTP email. Please try again."
                }, { status: 500 });
            }
        } else if (phone) {
            const result = await sendOTPSMS(phone, otp);
            if (!result.success) {
                console.error('Failed to send OTP SMS:', result.error);
                return NextResponse.json({
                    error: "Failed to send OTP SMS. Please try again."
                }, { status: 500 });
            }
        }

        return NextResponse.json({
            message: `OTP sent successfully to ${email || phone}`
        });

    } catch (error: any) {
        console.error("Resend OTP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
