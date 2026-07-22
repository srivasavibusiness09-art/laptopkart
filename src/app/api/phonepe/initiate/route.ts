import { NextResponse } from "next/server";
import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from "@phonepe-pg/pg-sdk-node";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { amount, orderId, email, phone, userId, address, cart } = await req.json();

    // Server-side stock verification
    for (const item of cart) {
      const productRef = doc(db, "products", String(item.id));
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const pData = productSnap.data();
        if (pData.stock !== undefined && pData.stock < (item.qty || 1)) {
          return NextResponse.json({ error: `Sorry, "${item.name}" is now out of stock.` }, { status: 400 });
        }
      }
    }

    const clientId = process.env.PHONEPE_CLIENT_ID?.trim() || "PGTESTPAYUAT";
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET?.trim() || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
    const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION?.trim() || "1");
    const isProd = process.env.PHONEPE_ENV === "production";
    const env = isProd ? Env.PRODUCTION : Env.SANDBOX;

    // Initialize PhonePe SDK Standard Checkout Client
    const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

    // Pre-create the pending order in Firestore
    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      items: cart.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty || 1,
        img: item.img
      })),
      total: amount,
      address,
      status: "Pending Payment",
      paymentMethod: "upi",
      email,
      uid: userId
    };
    await setDoc(doc(db, "orders", orderId), newOrder);

    // Setup return callback domain
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Compile pay payload using official SDK builders
    const payRequest = StandardCheckoutPayRequest.builder()
      .merchantOrderId(orderId)
      .amount(Math.round(amount * 100)) // convert amount to paise (1 INR = 100 paise)
      .redirectUrl(`${baseUrl}/api/phonepe/callback?orderId=${orderId}`)
      .build();

    const response = await client.pay(payRequest);

    return NextResponse.json({
      redirectUrl: response.redirectUrl,
      isSimulated: !isProd
    });
  } catch (error: any) {
    console.error("[PhonePe Initiate] Payment initialization failed:", error);
    return NextResponse.json({ error: error.message || "Failed to initiate payment." }, { status: 500 });
  }
}
