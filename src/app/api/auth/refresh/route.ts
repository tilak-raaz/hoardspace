import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyRefreshToken, signAccessToken } from '@/lib/jwt';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: "No refresh token" }, { status: 401 });
        }

        // Verify refresh token
        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
        }

        await dbConnect();

        // Find user and check if refresh token matches
        const user = await User.findById(payload.userId).select('+refreshToken +refreshTokenExpiry');

        if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
            return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
        }

        // Check if refresh token has expired
        if (user.refreshTokenExpiry && user.refreshTokenExpiry < new Date()) {
            // Clear expired tokens
            await User.findByIdAndUpdate(user._id, {
                $unset: { refreshToken: 1, refreshTokenExpiry: 1 }
            });

            const response = NextResponse.json({ error: "Refresh token expired" }, { status: 401 });

            // Clear cookies
            response.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
            response.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });

            return response;
        }

        // Generate new access token
        const newAccessToken = signAccessToken({
            userId: user._id.toString(),
            role: user.role
        });

        const response = NextResponse.json({
            message: "Token refreshed successfully"
        });

        // Set new access token cookie (15 minutes)
        response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
            path: '/'
        });

        return response;

    } catch (error: any) {
        console.error("Refresh Token Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
