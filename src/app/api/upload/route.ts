import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using promise
    const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "hoardspace" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        ).end(buffer);
    });

    return NextResponse.json({ 
        url: result.secure_url,
        public_id: result.public_id 
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
