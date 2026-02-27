"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookNowButtonProps {
  hoardingId: string;
  onAuthRequired: () => void;
}

export default function BookNowButton({
  hoardingId,
  onAuthRequired,
}: BookNowButtonProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const handleBookNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    setChecking(true);
    setError("");

    try {
      // Check if user is authenticated
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const user = data.user;

        // Check if email is verified
        if (!user.emailVerified) {
          setError("Please verify your email first");
          setTimeout(() => setError(""), 4000);
          return;
        }

        // Check if KYC is submitted
        if (user.kycStatus === "not_submitted") {
          setError("Please complete KYC verification from your profile");
          setTimeout(() => router.push("/profile"), 2000);
          return;
        }

        // Check if KYC is pending approval
        if (user.kycStatus === "pending") {
          setError("Your KYC is under review. Please wait for admin approval");
          setTimeout(() => setError(""), 2000);
          return;
        }

        // Check if KYC is rejected
        if (user.kycStatus === "rejected") {
          setError("Your KYC was rejected. Please update from your profile");
          setTimeout(() => router.push("/profile"), 2000);
          return;
        }

        // Only approved users can proceed
        if (user.kycStatus === "approved" || "verified") {
          router.push(`/bookings/${hoardingId}`);
        } else {
          setError("KYC verification required to book");
          setTimeout(() => setError(""), 4000);
        }
      } else {
        // User not authenticated, open auth modal
        onAuthRequired();
      }
    } catch (error) {
      console.error("Auth check failed", error);
      onAuthRequired();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-600 text-xs rounded-lg text-center">
          {error}
        </div>
      )}
      <button
        onClick={handleBookNow}
        disabled={checking}
        className="block w-full text-center bg-gray-50 hover:bg-[#5b40e6] hover:text-white text-gray-900 font-semibold py-3 rounded-xl transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {checking ? "Checking..." : "Book Now"}
      </button>
    </div>
  );
}
