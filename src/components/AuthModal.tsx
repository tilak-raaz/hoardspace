"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Mail,
  Phone,
  User as UserIcon,
  Building2,
  Lock,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import {
  signupSchema,
  loginSchema,
  otpSchema,
  kycSchema,
  type SignupInput,
  type LoginInput,
  type OTPInput,
  type KYCInput,
} from "@/lib/validators/user";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "role" | "auth" | "verify-email" | "kyc" | "verify-phone";
type Role = "buyer" | "vendor";
type AuthMode = "login" | "signup";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role>("buyer");
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "buyer" },
  });

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const otpForm = useForm<OTPInput>({
    resolver: zodResolver(otpSchema),
  });

  const kycForm = useForm<KYCInput>({
    resolver: zodResolver(kycSchema),
  });

  if (!isOpen) return null;

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    signupForm.setValue("role", selectedRole);
    setStep("auth");
    setAuthMode("signup"); // Default to signup after role selection as per flow description
  };

  const handleAuthSubmit = async (data: any) => {
    setError("");
    setLoading(true);
    try {
      if (authMode === "signup") {
        const signupData = { ...data, role };
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Enable cookies
          body: JSON.stringify(signupData),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Signup failed");

        setEmail(result.email || data.email);
        // Token is now in HttpOnly cookie, no localStorage needed
        setStep("verify-email");
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Enable cookies
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) {
          if (result.requiresEmailVerification) {
            setEmail(data.email);
            setStep("verify-email");
            throw new Error("Email not verified. Please verify.");
          }
          throw new Error(result.error || "Login failed");
        }

        // Token is now in HttpOnly cookie, no localStorage needed
        // Check if KYC is needed
        if (!result.user.isPhoneVerified) {
          setStep("kyc");
        } else {
          onClose();
          window.location.reload();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (data: OTPInput) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Enable cookies
        body: JSON.stringify({ email, otp: data.otp }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Verification failed");

      // Token is now in HttpOnly cookie, no localStorage needed
      setStep("kyc");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKYCSubmit = async (data: KYCInput) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send cookies, no Authorization header needed
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "KYC submission failed");

      setPhone(data.phone);
      setStep("verify-phone");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async (data: OTPInput) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send cookies, no Authorization header needed
        body: JSON.stringify({ phone, otp: data.otp }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Phone verification failed");

      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col md:flex-row min-h-[500px]">
        {/* Left Side - Brand / Info (Hidden on mobile) */}
        <div className="hidden md:flex md:w-5/12 bg-[#5b40e6] p-8 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">
              Empowering All To Advertise
            </h2>
            <p className="text-indigo-200">
              Find and buy the best media spots online.
            </p>
          </div>

          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/30 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-400/30 blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              {/* Small Logo */}
              <div className="bg-white/20 p-1.5 rounded">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="font-bold tracking-wide">HOARDSPACE</span>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="w-full md:w-7/12 p-8 relative bg-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="h-full flex flex-col justify-center">
            {/* Steps Visual Indicator (Optional) */}
            <div className="mb-6 flex gap-2">
              {["role", "auth", "verify-email", "kyc", "verify-phone"].map(
                (s, i) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full ${
                      [
                        "role",
                        "auth",
                        "verify-email",
                        "kyc",
                        "verify-phone",
                      ].indexOf(step) >= i
                        ? "bg-[#5b40e6]"
                        : "bg-gray-200"
                    }`}
                  />
                ),
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {step === "role" && "Welcome to HoardSpace"}
              {step === "auth" &&
                (authMode === "signup" ? "Create Account" : "Welcome Back")}
              {step === "verify-email" && "Verify Your Email"}
              {step === "kyc" && "Complete KYC"}
              {step === "verify-phone" && "Verify Phone"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {step === "role" && "Choose how you would like to proceed"}
              {step === "auth" &&
                (authMode === "signup"
                  ? "Enter your details to register"
                  : "Login to access your dashboard")}
              {step === "verify-email" && `We sent a code to ${email}`}
              {step === "kyc" && "Fill in your details for verification"}
              {step === "verify-phone" && `We sent a code to ${phone}`}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Step 1: Role Selection */}
            {step === "role" && (
              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect("buyer")}
                  className="w-full p-4 border rounded-xl hover:border-[#5b40e6] hover:bg-indigo-50 transition-all group flex items-center gap-4 text-left"
                >
                  <div className="bg-indigo-100 p-3 rounded-full text-[#5b40e6] group-hover:bg-[#5b40e6] group-hover:text-white transition-colors">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      I want to Buy Media
                    </h3>
                    <p className="text-xs text-gray-500">
                      Find and book advertising spaces
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect("vendor")}
                  className="w-full p-4 border rounded-xl hover:border-[#5b40e6] hover:bg-indigo-50 transition-all group flex items-center gap-4 text-left"
                >
                  <div className="bg-purple-100 p-3 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      I want to Sell Media
                    </h3>
                    <p className="text-xs text-gray-500">
                      List and manage your properties
                    </p>
                  </div>
                </button>

                <div className="text-center mt-4">
                  <span className="text-sm text-gray-500">
                    Already have an account?{" "}
                  </span>
                  <button
                    onClick={() => {
                      setStep("auth");
                      setAuthMode("login");
                    }}
                    className="text-[#5b40e6] font-medium hover:underline"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Auth (Signup/Login) */}
            {step === "auth" && (
              <form
                onSubmit={
                  authMode === "signup"
                    ? signupForm.handleSubmit(handleAuthSubmit)
                    : loginForm.handleSubmit(handleAuthSubmit)
                }
                className="space-y-4"
              >
                {authMode === "signup" && (
                  <div>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        {...signupForm.register("name")}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#5b40e6] focus:border-transparent outline-none transition-shadow"
                        placeholder="Full Name"
                      />
                    </div>
                    {signupForm.formState.errors.name && (
                      <p className="text-xs text-red-500 mt-1">
                        {signupForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      {...(authMode === "signup"
                        ? signupForm.register("email")
                        : loginForm.register("email"))}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#5b40e6] focus:border-transparent outline-none transition-shadow"
                      placeholder="Email Address"
                    />
                  </div>
                  {(authMode === "signup"
                    ? signupForm.formState.errors.email
                    : loginForm.formState.errors.email) && (
                    <p className="text-xs text-red-500 mt-1">
                      {authMode === "signup"
                        ? signupForm.formState.errors.email?.message
                        : loginForm.formState.errors.email?.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      {...(authMode === "signup"
                        ? signupForm.register("password")
                        : loginForm.register("password"))}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#5b40e6] focus:border-transparent outline-none transition-shadow"
                      placeholder="Password"
                    />
                  </div>
                  {(authMode === "signup"
                    ? signupForm.formState.errors.password
                    : loginForm.formState.errors.password) && (
                    <p className="text-xs text-red-500 mt-1">
                      {authMode === "signup"
                        ? signupForm.formState.errors.password?.message
                        : loginForm.formState.errors.password?.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5b40e6] text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "Processing..."
                    : authMode === "signup"
                      ? "Continue"
                      : "Login"}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => (window.location.href = "/api/auth/google")}
                  className="w-full flex items-center justify-center gap-2 border py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAuthMode(authMode === "signup" ? "login" : "signup")
                    }
                    className="text-[#5b40e6] text-sm hover:underline"
                  >
                    {authMode === "signup"
                      ? "Already have an account? Login"
                      : "New here? Create Account"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Verify Email */}
            {step === "verify-email" && (
              <form
                onSubmit={otpForm.handleSubmit(handleVerifyEmail)}
                className="space-y-6"
              >
                <div className="text-center">
                  <input
                    {...otpForm.register("otp")}
                    maxLength={6}
                    className="w-full text-center text-3xl tracking-[1em] font-bold py-4 border-b-2 focus:border-[#5b40e6] outline-none"
                    placeholder="000000"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5b40e6] text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
                <button
                  type="button"
                  className="w-full text-sm text-gray-500 hover:text-[#5b40e6]"
                >
                  Resend Code
                </button>
              </form>
            )}

            {/* Step 4: KYC Form */}
            {step === "kyc" && (
              <form
                onSubmit={kycForm.handleSubmit(handleKYCSubmit)}
                className="space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      {...kycForm.register("phone")}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#5b40e6] focus:border-transparent outline-none"
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
                    Company Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      rows={2}
                      {...kycForm.register("address")}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#5b40e6] focus:border-transparent outline-none"
                      placeholder="Registered Address"
                    />
                  </div>
                </div>

                {/* Optional fields based on Schema */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GSTIN{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      {...kycForm.register("gstin")}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#5b40e6] outline-none"
                      placeholder="GST Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...kycForm.register("pan")}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#5b40e6] outline-none"
                      placeholder="PAN Number"
                    />
                    {kycForm.formState.errors.pan && (
                      <p className="text-xs text-red-500 mt-1">
                        {kycForm.formState.errors.pan.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...kycForm.register("aadhaar")}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#5b40e6] outline-none"
                    placeholder="Aadhaar Number"
                  />
                  {kycForm.formState.errors.aadhaar && (
                    <p className="text-xs text-red-500 mt-1">
                      {kycForm.formState.errors.aadhaar.message}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
                  <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Your profile will be verified manually by admin after this
                    step. You can start browsing immediately.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5b40e6] text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit & Verify Phone"}
                </button>
              </form>
            )}

            {/* Step 5: Verify Phone */}
            {step === "verify-phone" && (
              <form
                onSubmit={otpForm.handleSubmit(handleVerifyPhone)}
                className="space-y-6"
              >
                <div className="text-center">
                  <input
                    {...otpForm.register("otp")}
                    maxLength={6}
                    className="w-full text-center text-3xl tracking-[1em] font-bold py-4 border-b-2 focus:border-[#5b40e6] outline-none"
                    placeholder="000000"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Enter the code sent to {phone}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5b40e6] text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Complete Registration" : "Verify & Login"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
