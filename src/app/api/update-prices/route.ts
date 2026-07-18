import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const renderUrl = process.env.RENDER_BACKEND_URL;
  const cronSecret = process.env.CRON_SECRET;

  if (!renderUrl || !cronSecret) {
    console.error("[Next.js update-prices] Missing RENDER_BACKEND_URL or CRON_SECRET");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    const res = await fetch(`${renderUrl.replace(/\/$/, "")}/api/update-prices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": cronSecret
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Backend returned error: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[Next.js update-prices] Proxy failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
