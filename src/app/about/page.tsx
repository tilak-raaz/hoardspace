import { Building2, Target, Users, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-[#5b40e6]">HoardSpace</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            India's leading platform for outdoor advertising spaces
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Target className="w-8 h-8 text-[#5b40e6]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            HoardSpace is revolutionizing outdoor advertising by connecting
            advertisers with premium hoarding locations across India. We make it
            simple, transparent, and efficient to book advertising spaces,
            helping businesses reach their target audience effectively.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="p-3 bg-green-50 rounded-xl w-fit mb-4">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Premium Locations
            </h3>
            <p className="text-gray-600">
              Access to thousands of prime hoarding locations in major cities
              across India.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="p-3 bg-blue-50 rounded-xl w-fit mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Verified Vendors
            </h3>
            <p className="text-gray-600">
              All vendors are verified through our KYC process for your security
              and trust.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="p-3 bg-purple-50 rounded-xl w-fit mb-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Transparent Pricing
            </h3>
            <p className="text-gray-600">
              Clear pricing with no hidden costs. Book with confidence and
              manage everything online.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="p-3 bg-orange-50 rounded-xl w-fit mb-4">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Easy Booking
            </h3>
            <p className="text-gray-600">
              Simple booking process with instant confirmation and secure
              payment options.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-[#5b40e6] to-[#4834b8] rounded-2xl shadow-lg p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-white/80 text-sm">Hoarding Locations</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">50+</div>
              <div className="text-white/80 text-sm">Cities Covered</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">200+</div>
              <div className="text-white/80 text-sm">Verified Vendors</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">1000+</div>
              <div className="text-white/80 text-sm">Happy Clients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
