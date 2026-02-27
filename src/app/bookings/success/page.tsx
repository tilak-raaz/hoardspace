"use client";

import Link from "next/link";
import { CheckCircle, Home } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle size={48} className="text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-500 mb-8">
          Your payment was successful and your hoarding slot has been booked. You will receive a confirmation email shortly.
        </p>

        <div className="space-y-3">
          <Link 
            href="/profile" 
            className="block w-full bg-[#5b40e6] text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Go to My Bookings
          </Link>
          <Link 
            href="/" 
            className="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            <div className="flex items-center justify-center gap-2">
              <Home size={18} /> Back to Home
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
