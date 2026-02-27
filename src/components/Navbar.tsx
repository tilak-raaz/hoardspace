"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Search,
  Menu,
  ShoppingBag,
  User,
  X,
  MapPin,
  Home,
  UserCircle,
  Info,
  Mail,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import AuthModal from "./AuthModal";
import { checkAuth, logout } from "@/lib/fetchWithAuth";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for authentication via cookie (with auto-refresh)
    const loadUser = async () => {
      const { authenticated, user: userData } = await checkAuth();
      if (authenticated && userData) {
        setUser(userData);
      }
    };
    loadUser();
  }, [isAuthOpen]); // Re-check when auth modal closes

  const handleLogout = async () => {
    await logout();
    setUser(null);
    window.location.reload();
  };

  const topCities = [
    "Mumbai",
    "Delhi NCR",
    "Bengaluru",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 w-full z-50">
        <nav className="bg-gradient-to-r from-[#5b40e6] to-[#4834b8] text-white shadow-sm transition-all duration-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4 md:h-20">
              {/* Left: Mobile Menu & Logo */}
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden p-2 hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(true)}
                >
                  <Menu size={24} />
                </button>
                <button
                  className="hidden lg:block p-2 hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(true)}
                >
                  <Menu size={24} />
                </button>

                <Link href="/" className="flex items-center gap-2 group">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-white/10 group-hover:bg-white/20 transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] tracking-widest font-semibold text-white/80">
                      THE
                    </span>
                    <span className="text-lg font-bold tracking-wide">
                      HOARDSPACE
                    </span>
                  </div>
                </Link>
              </div>

              {/* Center: Search Bar */}
              <div className="hidden md:flex flex-1 items-center justify-center max-w-3xl px-8">
                <div className="relative w-full">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="h-5 w-5 text-indigo-500" />
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-full border-0 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-white/50 sm:text-sm sm:leading-6 shadow-lg"
                    placeholder='Search "Dainik Bhaskar" "Spotify"...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 sm:gap-6">
                <Link
                  href="/contact"
                  className="hidden lg:block text-sm font-medium hover:text-white/80 transition-colors"
                >
                  Contact Us
                </Link>

                {user ? (
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg py-2 px-3 hover:bg-white/10 transition-colors"
                  >
                    <User size={18} />
                    <span className="hidden sm:inline text-sm font-medium">
                      Profile
                    </span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="flex items-center gap-2 rounded-lg py-2 px-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                      <User size={18} />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">
                      Login
                    </span>
                  </button>
                )}

                <Link
                  href="/cart"
                  className="flex items-center gap-2 rounded-lg py-2 px-3 hover:bg-white/10 transition-colors"
                >
                  <ShoppingBag size={22} className="text-white" />
                  <div className="hidden sm:flex flex-col leading-none">
                    <span className="text-xs font-medium text-white/90">
                      Your
                    </span>
                    <span className="text-sm font-bold">Bag</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="pb-4 md:hidden">
              <div className="relative w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-4 w-4 text-indigo-500" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-white/50 text-sm shadow-md"
                  placeholder="Search hoardings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Secondary Strip - Top Cities */}
        <div className="bg-[#1a1a1a] text-white/90 shadow-md border-b border-white/10 hidden md:block">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-8 h-12 text-sm font-medium overflow-x-auto no-scrollbar">
              {topCities.map((city) => (
                <Link
                  key={city}
                  href={`/?city=${city}`}
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <MapPin
                    size={14}
                    className="text-[#5b40e6] group-hover:scale-110 transition-transform"
                  />
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Desktop Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-[#5b40e6] to-[#4834b8] shadow-2xl transition-transform">
            {/* Header with Welcome */}
            <div className="relative bg-white/10 backdrop-blur-md p-6 border-b border-white/20">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {user ? `Hello, ${user.name}` : "Hello & Welcome"}
                  </h3>
                  <p className="text-white/70 text-xs">
                    {user ? user.email : "Sign in to continue"}
                  </p>
                </div>
              </div>

              {!user && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full bg-white text-[#5b40e6] py-2 px-4 rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-lg"
                >
                  Login / Register
                </button>
              )}
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 text-white transition-all group"
              >
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <Home size={20} />
                </div>
                <span className="font-medium">Home</span>
              </Link>

              {user && (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 text-white transition-all group"
                  >
                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                      <UserCircle size={20} />
                    </div>
                    <span className="font-medium">My Profile</span>
                  </Link>

                  {user.role === "vendor" && (
                    <Link
                      href="/vendor/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 text-white transition-all group"
                    >
                      <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                        <LayoutDashboard size={20} />
                      </div>
                      <span className="font-medium">My Dashboard</span>
                    </Link>
                  )}
                </>
              )}

              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 text-white transition-all group"
              >
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <Info size={20} />
                </div>
                <span className="font-medium">About Us</span>
              </Link>

              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 text-white transition-all group"
              >
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <Mail size={20} />
                </div>
                <span className="font-medium">Contact Us</span>
              </Link>
            </nav>

            {/* Logout Button (if logged in) */}
            {user && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/10 backdrop-blur-md border-t border-white/20">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
