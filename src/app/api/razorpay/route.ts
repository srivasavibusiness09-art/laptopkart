import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount, currency } = await req.json();

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // Local testing fallback if keys are not configured yet
    if (!key_id || !key_secret || key_id.includes("YOUR_") || key_secret.includes("YOUR_")) {
      console.warn("Razorpay credentials not set. Simulating order payload for local testing.");
      return NextResponse.json({
        id: "order_test_" + Math.random().toString(36).substring(2, 11),
        amount: Math.round(amount * 100),
        currency: currency || "INR",
        isSimulated: true
      });
    }

    const instance = new Razorpay({
      key_id,
      key_secret,
    });

    // Razorpay accepts amounts in paise (1 INR = 100 paise)
    const order = await instance.orders.create({
      amount: Math.round(amount * 100),
      currency: currency || "INR",
      receipt: "rcpt_" + Math.random().toString(36).substring(2, 11),
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error creating Razorpay order: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
