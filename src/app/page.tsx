import Link from "next/link";
import { MapPin, Ruler, IndianRupee } from "lucide-react";
import dbConnect from "@/lib/dbConnect";
import Hoarding from "@/models/Hoarding";

// Force dynamic rendering to ensure we get latest data
export const dynamic = "force-dynamic";

async function getHoardings() {
  await dbConnect();
  // In a real scenario, we might want to filter by status='approved'
  const hoardings = await Hoarding.find({ status: "approved" }).sort({
    createdAt: -1,
  });
  return JSON.parse(JSON.stringify(hoardings));
}

export default async function Home() {
  const hoardings = await getHoardings();

  // Group by City
  const groupedHoardings = hoardings.reduce((acc: any, hoarding: any) => {
    const city = hoarding.location.city.trim() || "Others";
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(hoarding);
    return acc;
  }, {});

  const sortedCities = Object.keys(groupedHoardings).sort();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-[#5b40e6] text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Find the Perfect Hoarding Space
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Discover and book premium outdoor advertising locations across top
            cities in India.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {hoardings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="text-gray-400 mb-4 flex justify-center">
              <MapPin size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              No Hoardings Available Yet
            </h3>
            <p className="text-gray-500 mt-2">
              Check back later or contact us to list your space.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedCities.map((city) => (
              <section key={city} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1 rounded-full bg-[#5b40e6]"></div>
                  <h2 className="text-2xl font-bold text-gray-900">{city}</h2>
                  <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                    {groupedHoardings[city].length} location
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedHoardings[city].map((hoarding: any) => (
                    <div
                      key={hoarding._id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full"
                    >
                      {/* Image Placeholder */}
                      <div className="h-48 bg-gray-200 relative overflow-hidden flex-shrink-0">
                        {hoarding.images && hoarding.images.length > 0 ? (
                          <img
                            src={hoarding.images[0]}
                            alt={hoarding.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                            <span className="text-sm font-medium">
                              No Image
                            </span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#5b40e6] uppercase shadow-sm">
                          {hoarding.type}
                        </div>
                      </div>

                      <div className="p-5 space-y-4 flex flex-col flex-grow">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                            {hoarding.name}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin size={14} className="flex-shrink-0" />
                            <span className="line-clamp-1">
                              {hoarding.location.address}
                            </span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-50 mt-auto">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                              Dimensions
                            </p>
                            <div className="flex items-center gap-1.5 text-gray-700 font-medium text-sm">
                              <Ruler size={14} className="text-[#5b40e6]" />
                              {hoarding.dimensions.width}' x{" "}
                              {hoarding.dimensions.height}'
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                              Pricing
                            </p>
                            <div className="space-y-0.5">
                              <div className="flex items-center font-bold text-gray-900 text-sm">
                                <IndianRupee size={12} className="mt-0.5" />
                                {hoarding.pricePerMonth.toLocaleString(
                                  "en-IN",
                                )}{" "}
                                <span className="text-xs font-normal text-gray-400 ml-1">
                                  /mo
                                </span>
                              </div>
                              {(hoarding.minimumBookingAmount || 0) > 0 && (
                                <div className="text-xs text-indigo-600 font-medium">
                                  Min Booking: ₹
                                  {hoarding.minimumBookingAmount.toLocaleString(
                                    "en-IN",
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/bookings/${hoarding._id}`}
                          className="block w-full text-center bg-gray-50 hover:bg-[#5b40e6] hover:text-white text-gray-900 font-semibold py-3 rounded-xl transition-all duration-200 text-sm"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
