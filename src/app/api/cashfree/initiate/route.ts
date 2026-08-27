import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { amount, orderId, email, phone, userId, address, cart, couponCode, discountAmount } = await req.json();

    // Server-side stock verification (Parallelized)
    const stockChecks = await Promise.all(cart.map(async (item: any) => {
      const productRef = doc(db, "products", String(item.id));
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const pData = productSnap.data();
        if (pData.stock !== undefined && pData.stock < (item.qty || 1)) {
          return `Sorry, "${item.name}" is now out of stock.`;
        }
      }
      return null;
    }));
    
    const stockError = stockChecks.find(err => err !== null);
    if (stockError) {
      return NextResponse.json({ error: stockError }, { status: 400 });
    }

    // Initialize Cashfree PG SDK
    const appId = process.env.CASHFREE_APP_ID?.trim() || "";
    const secretKey = process.env.CASHFREE_SECRET_KEY?.trim() || "";
    const isProd = process.env.CASHFREE_ENV?.toLowerCase() === "production";
    const env = isProd ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

    // SDK configuration
    const cashfree = new Cashfree(env, appId, secretKey);

    // Setup return callback domain dynamically based on incoming request headers
    const requestHost = req.headers.get("host") || "localhost:3000";
    // Cashfree Production PG strictly requires https schema URLs for callback returns
    const protocol = isProd ? "https" : (req.headers.get("x-forwarded-proto") || "http");
    const baseUrl = `${protocol}://${requestHost}`;

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
      paymentMethod: "cashfree",
      email,
      uid: userId,
      couponCode: couponCode || null,
      discountAmount: discountAmount || 0
    };

    const requestPayload = {
      order_amount: Number(amount),
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: userId || `cust_${Date.now()}`,
        customer_phone: phone.replace(/\s+/g, ""), // Remove spaces for API format
        customer_email: email,
        customer_name: address.name || "Customer"
      },
      order_meta: {
        return_url: `${baseUrl}/api/cashfree/callback?order_id={order_id}`
      }
    };

    // Parallelize Firestore pending order creation and Cashfree session creation
    const [_, response] = await Promise.all([
      setDoc(doc(db, "orders", orderId), newOrder),
      cashfree.PGCreateOrder(requestPayload)
    ]);

    return NextResponse.json({
      paymentSessionId: response.data.payment_session_id,
      cfOrderId: response.data.cf_order_id,
      isSimulated: !isProd
    });
  } catch (error: any) {
    console.error("[Cashfree Initiate] Payment initialization failed:", error?.response?.data || error);
    const errorMsg = error?.response?.data?.message || error.message || "Failed to initiate Cashfree payment.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
