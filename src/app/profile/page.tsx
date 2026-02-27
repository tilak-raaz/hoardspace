"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  ShieldCheck,
  AlertCircle,
  LogOut,
  CheckCircle,
  Clock,
} from "lucide-react";
import { kycSchema, type KYCInput } from "@/lib/validators/user";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // OTP Verification State
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [phoneToVerify, setPhoneToVerify] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const kycForm = useForm<KYCInput>({
    resolver: zodResolver(kycSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetchWithAuth("/api/auth/me");

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          // Pre-fill KYC form if data exists (e.g. from rejected attempt)
          if (data.user.kycDetails) {
            kycForm.reset({
              phone: data.user.phone, // Phone is top level
              address: data.user.kycDetails.address,
              companyName: data.user.kycDetails.companyName,
              gstin: data.user.kycDetails.gstin,
              pan: data.user.kycDetails.pan || "",
              aadhaar: data.user.kycDetails.aadhaar || "",
            });
          } else if (data.user.phone) {
            kycForm.setValue("phone", data.user.phone);
          }
        } else {
          router.push("/");
        }
      } catch (e) {
        console.error("Failed to fetch user", e);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router, kycForm]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout failed", e);
    }
    window.location.href = "/";
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingOtp(true);
    setError("");
    try {
      const res = await fetchWithAuth("/api/auth/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phoneToVerify, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setSuccess("Phone Verified & KYC Submitted!");
      setShowOtp(false);
      // Refresh user
      const meRes = await fetchWithAuth("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleKYCSubmit = async (data: KYCInput) => {
    setError("");
    setSuccess("");
    setKycSubmitting(true);
    try {
      const res = await fetchWithAuth("/api/auth/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "KYC submission failed");

      if (result.message.includes("verify phone")) {
        setSuccess(
          "Details recorded. Please enter the OTP sent to your phone.",
        );
        setPhoneToVerify(data.phone);
        setShowOtp(true);
        setOtp(""); // reset otp
      } else {
        setSuccess("KYC Details Submitted Successfully.");
        // Refresh user data
        const meRes = await fetchWithAuth("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setKycSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b40e6]"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header / Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-[#5b40e6] to-[#4834b8] h-32 relative">
            <button
              onClick={handleLogout}
              className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm text-sm font-medium"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="flex items-end gap-6">
                <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-lg">
                  <div className="h-full w-full rounded-xl bg-indigo-50 flex items-center justify-center text-[#5b40e6]">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-full w-full object-cover rounded-xl"
                      />
                    ) : (
                      <User size={40} />
                    )}
                  </div>
                </div>
                <div className="pb-1">
                  <p className="text-sm text-gray-500 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
                    user.kycStatus === "approved" ||
                    user.kycStatus === "verified"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : user.kycStatus === "pending"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : user.kycStatus === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {(user.kycStatus === "approved" ||
                    user.kycStatus === "verified") && <CheckCircle size={14} />}
                  {user.kycStatus === "pending" && <Clock size={14} />}
                  {user.kycStatus === "rejected" && <AlertCircle size={14} />}
                  {user.kycStatus === "not_submitted" && (
                    <AlertCircle size={14} />
                  )}
                  {user.kycStatus === "not_submitted"
                    ? "KYC Pending"
                    : user.kycStatus.charAt(0).toUpperCase() +
                      user.kycStatus.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Contact Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-sm">{user.email}</span>
                    {user.emailVerified && (
                      <CheckCircle
                        size={14}
                        className="text-green-500 ml-auto"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Phone size={18} className="text-gray-400" />
                    <span className="text-sm">
                      {user.phone || "Not provided"}
                    </span>
                    {user.isPhoneVerified && (
                      <CheckCircle
                        size={14}
                        className="text-green-500 ml-auto"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Vendor Dashboard Option */}
              {user.role === "vendor" &&
                (user.kycStatus === "approved" ||
                  user.kycStatus === "verified") && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Vendor Controls
                    </h3>
                    <div className="bg-gradient-to-br from-[#5b40e6] to-[#4834b8] rounded-xl p-5 text-white shadow-lg shadow-indigo-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold">Manage Hoardings</h4>
                      </div>
                      <p className="text-indigo-100 text-sm mb-4">
                        Add, edit, and track your property listings.
                      </p>
                      <button
                        onClick={() => router.push("/vendor/dashboard")}
                        className="w-full bg-white text-[#5b40e6] font-bold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                )}

              {/* Vendor Account Pending Message */}
              {user.role === "vendor" && user.kycStatus === "pending" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Vendor Status
                  </h3>
                  <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200 shadow-sm">
                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                      <Clock size={20} />
                      <h4 className="text-lg font-bold">
                        Verification In Progress
                      </h4>
                    </div>
                    <p className="text-yellow-700 text-sm">
                      Your vendor account functions (Dashboard, Add Hoarding)
                      will be enabled once your KYC is approved by the admin.
                    </p>
                  </div>
                </div>
              )}

              {(user.kycStatus === "approved" ||
                user.kycStatus === "verified" ||
                user.kycStatus === "pending") &&
                user.kycDetails && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Company Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-gray-400 mt-1" />
                        <span className="text-sm text-gray-600">
                          {user.kycDetails.address || "No address provided"}
                        </span>
                      </div>
                      {user.kycDetails.companyName && (
                        <div className="flex items-center gap-3">
                          <Building2 size={18} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {user.kycDetails.companyName}
                          </span>
                        </div>
                      )}
                      {user.kycDetails.gstin && (
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            GSTIN: {user.kycDetails.gstin}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* KYC Section */}
        {(user.kycStatus === "not_submitted" ||
          user.kycStatus === "rejected") && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg text-[#5b40e6]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Complete Your KYC
                </h2>
                <p className="text-sm text-gray-500">
                  Verify your identity to unlock all features
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl flex gap-2 items-center">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-600 text-sm rounded-xl flex gap-2 items-center">
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            {showOtp ? (
              <div className="space-y-6 transition-all duration-300 ease-in-out">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
                  <p className="text-sm text-indigo-700 mb-4">
                    We have sent a verification code to{" "}
                    <span className="font-semibold">{phoneToVerify}</span>
                  </p>
                  <form
                    onSubmit={handleVerifyOtp}
                    className="max-w-xs mx-auto space-y-4"
                  >
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-full text-center text-2xl tracking-[0.5em] font-bold py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#5b40e6] outline-none transition-all uppercase"
                      placeholder="------"
                      required
                    />
                    <button
                      type="submit"
                      disabled={verifyingOtp}
                      className="w-full bg-[#5b40e6] text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200"
                    >
                      {verifyingOtp ? "Verifying..." : "Verify & Submit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOtp(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                    >
                      Cancel & Edit Details
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <form
                onSubmit={kycForm.handleSubmit(handleKYCSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        {...kycForm.register("phone")}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5b40e6] focus:border-transparent outline-none transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    {kycForm.formState.errors.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {kycForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name (Optional)
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        {...kycForm.register("companyName")}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5b40e6] focus:border-transparent outline-none transition-all"
                        placeholder="Business Name"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registered Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <textarea
                        rows={3}
                        {...kycForm.register("address")}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5b40e6] focus:border-transparent outline-none transition-all"
                        placeholder="Full Address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GSTIN{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      {...kycForm.register("gstin")}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5b40e6] outline-none transition-all"
                      placeholder="GSTIN Number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...kycForm.register("pan")}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5b40e6] outline-none transition-all"
                      placeholder="PAN Number"
                    />
                    {kycForm.formState.errors.pan && (
                      <p className="text-xs text-red-500 mt-1">
                        {kycForm.formState.errors.pan.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhaar Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...kycForm.register("aadhaar")}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5b40e6] outline-none transition-all"
                      placeholder="Aadhaar Number"
                    />
                    {kycForm.formState.errors.aadhaar && (
                      <p className="text-xs text-red-500 mt-1">
                        {kycForm.formState.errors.aadhaar.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={kycSubmitting}
                    className="bg-[#5b40e6] text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200"
                  >
                    {kycSubmitting ? "Submitting..." : "Submit KYC Details"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {user.kycStatus === "pending" && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-4">
              <Clock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Verification in Progress
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your KYC documents have been submitted and are currently under
              review by our admin team. This process usually takes 24-48 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
