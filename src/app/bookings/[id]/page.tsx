"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params; // hoardingId

  const [hoarding, setHoarding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHoarding = async () => {
      try {
        // Reuse public api or create a specific one. Public feed is ok if we filter client side, 
        // but better to have /api/hoardings/[id]
        // For MVP, since we don't have single ID endpoint yet, we fetch all and find (not ideal for handling large data but works for prototype)
        // OR better: create api/hoardings/[id] now.
        // I will assume fetching from a details endpoint I will create next.
        const res = await fetch(`/api/hoardings/${id}`);
        if (!res.ok) throw new Error("Failed to load details");
        const data = await res.json();
        setHoarding(data.hoarding);
      } catch (err) {
        console.error(err);
        setError("Could not load hoarding details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHoarding();
  }, [id]);

  const handlePayment = async () => {
    if (!startDate || !endDate) {
      setError("Please select dates");
      return;
    }
    setProcessing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/?login=true");
        return;
      }

      // Calculate Amount (Simple: Pro-rated or just Monthly * Months)
      // For simplicity MVP: fixed calculation logic here or backend?
      // Let's assume pricePerMonth is strictly for 30 days.
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      // Basic pro-rata formula
      const amount = Math.ceil((hoarding.pricePerMonth / 30) * diffDays);
      
      const minAmount = hoarding.minimumBookingAmount || 0;
      if (amount < minAmount) {
         setError(`Minimum booking amount is ₹${minAmount}`);
         setProcessing(false);
         return;
      }

      // 1. Create Order
      const res = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hoardingId: id,
          startDate,
          endDate,
          amount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: data.amount,
        currency: data.currency,
        name: "HoardSpace",
        description: `Booking for ${hoarding.name}`,
        order_id: data.orderId,
        handler: async function (response: any) {
             // 3. Verify Payment
             const verifyRes = await fetch("/api/bookings/verify", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                 razorpay_order_id: response.razorpay_order_id,
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_signature: response.razorpay_signature,
               }),
             });
             
             const verifyData = await verifyRes.json();
             if (verifyData.success) {
               router.push("/bookings/success");
             } else {
               setError("Payment verification failed");
             }
        },
        prefill: {
          name: "User Name", // TODO: Get from user context
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#5b40e6"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      setError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#5b40e6]" /></div>;
  if (!hoarding) return <div className="p-10 text-center">Hoarding not found</div>;

  return (
    <>
    <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Hoarding Details */}
        <div className="md:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{hoarding.name}</h1>
              <div className="flex items-center text-gray-500 mb-4">
                 <MapPin size={16} className="mr-1" />
                 {hoarding.location.address}, {hoarding.location.city}
              </div>
              
              <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-6">
                 {hoarding.images[0] && <img src={hoarding.images[0]} className="w-full h-full object-cover" />}
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                 <div>
                    <span className="text-xs text-gray-400 uppercase font-bold">Type</span>
                    <p className="font-semibold text-gray-800">{hoarding.type}</p>
                 </div>
                 <div>
                    <span className="text-xs text-gray-400 uppercase font-bold">Dimensions</span>
                    <p className="font-semibold text-gray-800">{hoarding.dimensions.width}' x {hoarding.dimensions.height}'</p>
                 </div>
                 <div>
                    <span className="text-xs text-gray-400 uppercase font-bold">Monthly Price</span>
                    <p className="font-semibold text-gray-800">₹{hoarding.pricePerMonth.toLocaleString()}</p>
                 </div>
                 <div>
                    <span className="text-xs text-gray-400 uppercase font-bold">Min Booking</span>
                    <p className="font-semibold text-gray-800">₹{hoarding.minimumBookingAmount?.toLocaleString() || 0}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Booking Form */}
        <div className="md:col-span-1">
           <div className="bg-white rounded-2xl p-6 shadow-lg shadow-indigo-100 border border-indigo-50 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Book Dates</h3>
              
              <div className="space-y-4 mb-6">
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      className="w-full border rounded-lg p-2 text-sm"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                    <input 
                      type="date" 
                      className="w-full border rounded-lg p-2 text-sm"
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                 </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="bg-indigo-50 p-3 rounded-lg flex items-center gap-2 mb-6">
                 <ShieldCheck size={16} className="text-[#5b40e6]" />
                 <span className="text-xs text-indigo-800 font-medium">Secure Payment by Razorpay</span>
              </div>

              <button 
                 onClick={handlePayment}
                 disabled={processing}
                 className="w-full bg-[#5b40e6] text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
              >
                 {processing ? <Loader2 className="animate-spin mx-auto" /> : "Proceed to Pay"}
              </button>
           </div>
        </div>

      </div>
    </div>
    </>
  );
}
