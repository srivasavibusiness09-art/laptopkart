import { NextResponse } from "next/server";
import { StandardCheckoutClient, Env } from "@phonepe-pg/pg-sdk-node";
import { doc, updateDoc, getDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

async function handleVerification(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      console.error("[PhonePe Callback] Missing orderId query parameter.");
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return NextResponse.redirect(`${baseUrl}/#checkout?payment_status=error`, 302);
    }

    const clientId = process.env.PHONEPE_CLIENT_ID?.trim() || "PGTESTPAYUAT";
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET?.trim() || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
    const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION?.trim() || "1");
    const isProd = process.env.PHONEPE_ENV === "production";
    const env = isProd ? Env.PRODUCTION : Env.SANDBOX;

    // Initialize PhonePe SDK Client
    const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

    // Query status directly from PhonePe API to avoid request tampering
    const response = await client.getOrderStatus(orderId);
    console.log(`[PhonePe Callback] Status check response for #${orderId}:`, response);

    const orderRef = doc(db, "orders", orderId);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Standard states returned are COMPLETED / SUCCESS / FAILED
    if (response.state === "COMPLETED" || response.state === "SUCCESS") {
      await updateDoc(orderRef, {
        status: "Paid",
        phonepeTransactionId: response.orderId || "",
        paymentMethod: "PhonePe"
      });

      // Decrease stock for items in the order
      try {
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          const items = orderData.items || [];
          for (const item of items) {
            const productRef = doc(db, "products", String(item.id));
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              const pData = productSnap.data();
              if (pData.stock !== undefined) {
                await updateDoc(productRef, {
                  stock: increment(-item.qty)
                });
              }
            }
          }
        }
      } catch (stockErr) {
        console.error("[PhonePe Callback] Failed to decrease stock:", stockErr);
      }

      // Trigger Push Notification to Admin (No emojis, per user request)
      try {
        await fetch(`${baseUrl}/api/send-admin-push`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "New Laptop Booked",
            body: `Order ${orderId} has been successfully paid and booked.`,
          }),
        });
      } catch (pushErr) {
        console.error("[PhonePe Callback] Failed to trigger admin push notification:", pushErr);
      }

      return NextResponse.redirect(`${baseUrl}/#checkout?payment_status=success&orderId=${orderId}`, 302);
    } else {
      await updateDoc(orderRef, {
        status: "Failed"
      });

      return NextResponse.redirect(`${baseUrl}/#checkout?payment_status=failed&orderId=${orderId}`, 302);
    }
  } catch (error: any) {
    console.error("[PhonePe Callback] Verification failed:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/#checkout?payment_status=error`, 302);
  }
}

export async function GET(req: Request) {
  return handleVerification(req);
}

export async function POST(req: Request) {
  return handleVerification(req);
}
