import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Hoarding from '@/models/Hoarding';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
   try {
      const { id } = await params; // Awaiting params for Next.js 16/future proofing
      await dbConnect();

      const hoarding = await Hoarding.findById(id).populate('owner', 'name email');

      if (!hoarding) {
         return NextResponse.json({ error: "Hoarding not found" }, { status: 404 });
      }

      return NextResponse.json({ hoarding });
   } catch (error) {
      return NextResponse.json({ error: "Failed to fetch details" }, { status: 500 });
   }
}
