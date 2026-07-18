import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("id");

  if (!productId) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  try {
    const docRef = doc(db, "price_cache", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return NextResponse.json({
        amazon_price: data.amazon_price ?? null,
        amazon_original: data.amazon_original ?? null,
        amazon_discount: data.amazon_discount ?? null,
        amazon_url: data.amazon_url ?? null,

        flipkart_price: data.flipkart_price ?? null,
        flipkart_original: data.flipkart_original ?? null,
        flipkart_discount: data.flipkart_discount ?? null,
        flipkart_url: data.flipkart_url ?? null,

        croma_price: data.croma_price ?? null,
        croma_original: data.croma_original ?? null,
        croma_discount: data.croma_discount ?? null,
        croma_url: data.croma_url ?? null,

        last_updated: data.last_updated ?? null,
        cached: true
      });
    }
    
    return NextResponse.json({
      amazon_price: null,
      amazon_original: null,
      amazon_discount: null,
      amazon_url: null,

      flipkart_price: null,
      flipkart_original: null,
      flipkart_discount: null,
      flipkart_url: null,

      croma_price: null,
      croma_original: null,
      croma_discount: null,
      croma_url: null,

      last_updated: null,
      cached: false
    });
  } catch (err: any) {
    console.error("[live-price GET] Error reading from Firestore:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
