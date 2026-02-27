import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
        isPhoneVerified: user.isPhoneVerified,
        kycStatus: user.kycStatus,
        image: user.image
      }
    });

  } catch (error: any) {
    console.error("Me Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
