import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET!;
    
    // Verify Signature
    const shasum = crypto.createHmac("sha256", key_secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await dbConnect();
    
    // Update Booking Status
    const booking = await Booking.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { 
        status: 'confirmed', 
        paymentId: razorpay_payment_id 
      },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, bookingId: booking._id });

  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
