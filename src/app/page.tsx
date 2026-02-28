import dbConnect from "@/lib/dbConnect";
import Hoarding from "@/models/Hoarding";
import HoardingsClient from "@/components/HoardingsClient";

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

      <HoardingsClient hoardings={hoardings} />
    </div>
  );
}
