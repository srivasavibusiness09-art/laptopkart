import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { doc, updateDoc, getDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

async function handleVerification(req: Request) {
  const isProd = process.env.CASHFREE_ENV?.toLowerCase() === "production";
  const requestHost = req.headers.get("host") || "localhost:3000";
  const protocol = isProd ? "https" : (req.headers.get("x-forwarded-proto") || "http");
  const baseUrl = `${protocol}://${requestHost}`;

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      console.error("[Cashfree Callback] Missing orderId query parameter.");
      return NextResponse.redirect(`${baseUrl}/#checkout?payment_status=error`, 302);
    }

    const appId = process.env.CASHFREE_APP_ID?.trim() || "";
    const secretKey = process.env.CASHFREE_SECRET_KEY?.trim() || "";
    const isProd = process.env.CASHFREE_ENV?.toLowerCase() === "production";
    const env = isProd ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

    // Initialize Cashfree PG SDK Client
    const cashfree = new Cashfree(env, appId, secretKey);

    // Fetch order directly from Cashfree API to verify payment status securely
    const response = await cashfree.PGFetchOrder(orderId);
    const cashfreeOrder = response.data;
    console.log(`[Cashfree Callback] Status check response for #${orderId}:`, cashfreeOrder);

    const orderRef = doc(db, "orders", orderId);

    // Cashfree order_status can be: PAID, ACTIVE, EXPIRED, TERMINATED
    if (cashfreeOrder.order_status === "PAID") {
      await updateDoc(orderRef, {
        status: "Paid",
        cashfreeTransactionId: cashfreeOrder.cf_order_id || "",
        paymentMethod: "Cashfree"
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
        console.error("[Cashfree Callback] Failed to decrease stock:", stockErr);
      }

      // Trigger Push Notification to Admin
      try {
        await fetch(`${baseUrl}/api/send-admin-push`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "New Laptop Booked",
            body: `Order ${orderId} has been successfully paid and booked via Cashfree.`,
          }),
        });
      } catch (pushErr) {
        console.error("[Cashfree Callback] Failed to trigger admin push notification:", pushErr);
      }

      return NextResponse.redirect(`${baseUrl}/#checkout?payment_status=success&orderId=${orderId}`, 302);
    } else {
      await updateDoc(orderRef, {
        status: "Failed"
      });

      return NextResponse.redirect(`${baseUrl}/#checkout?payment_status=failed&orderId=${orderId}`, 302);
    }
  } catch (error: any) {
    console.error("[Cashfree Callback] Verification failed:", error?.response?.data || error);
    return NextResponse.redirect(`${baseUrl}/#checkout?payment_status=error`, 302);
  }
}

export async function GET(req: Request) {
  return handleVerification(req);
}

export async function POST(req: Request) {
  return handleVerification(req);
}
