import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/jwt';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        // If user is logged in, remove refresh token from database
        if (accessToken) {
            const payload = verifyAccessToken(accessToken);
            if (payload) {
                await dbConnect();
                await User.findByIdAndUpdate(payload.userId, {
                    $unset: { refreshToken: 1, refreshTokenExpiry: 1 }
                });
            }
        }

        const response = NextResponse.json({
            message: "Logout successful"
        });

        // Clear both cookies
        response.cookies.set('accessToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Expire immediately
            path: '/'
        });

        response.cookies.set('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Expire immediately
            path: '/'
        });

        return response;

    } catch (error: any) {
        console.error("Logout Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
