import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import Hoarding from '@/models/Hoarding';
import { razorpay } from '@/lib/razorpay';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { hoardingId, startDate, endDate, amount } = body;

    await dbConnect();

    // Create Razorpay Order
    const options = {
      amount: Math.round(amount * 100), // amount in paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Create minimal booking record
    const booking = await Booking.create({
      hoarding: hoardingId,
      user: payload.userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalAmount: amount,
      status: 'pending',
      orderId: order.id
    });

    return NextResponse.json({
      orderId: order.id,
      bookingId: booking._id,
      amount: options.amount,
      currency: options.currency
    });

  } catch (error: any) {
    console.error("Payment Init Error:", error);
    return NextResponse.json({ error: error.message || "Payment initiation failed" }, { status: 500 });
  }
}
