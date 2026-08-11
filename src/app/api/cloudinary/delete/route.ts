import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function setCorsHeaders(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, x-admin-secret");
  return res;
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(req: NextRequest) {
  // 🔒 Security check — validate the shared secret
  const incoming = req.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_API_SECRET;
  if (!expected || incoming !== expected) {
    return setCorsHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const { publicIds, resourceType = "image" } = await req.json();

  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    return setCorsHeaders(NextResponse.json({ error: "publicIds array is required" }, { status: 400 }));
  }

  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
    return setCorsHeaders(NextResponse.json({ success: true, result }));
  } catch (err: any) {
    console.error("[Cloudinary Delete API]", err.message);
    return setCorsHeaders(NextResponse.json({ error: err.message }, { status: 500 }));
  }
}
