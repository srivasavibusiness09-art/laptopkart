import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required verification fields." },
        { status: 400 }
      );
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!key_secret) {
      return NextResponse.json(
        { error: "Razorpay Key Secret is not configured on the server." },
        { status: 500 }
      );
    }

    // Construct the expected signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.error("[Razorpay Verification] Signature mismatch!");
      return NextResponse.json(
        { error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully." });
  } catch (error: any) {
    console.error("Error during payment verification: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
