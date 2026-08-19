import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, setDoc } from "firebase/firestore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ collegeId: string }> }
) {
  try {
    const { collegeId } = await params;
    const docRef = doc(db, "colleges", collegeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, { qrScans: increment(1) });
    } else {
      // Initialize if it doesn't exist
      await setDoc(docRef, { 
        id: collegeId, 
        name: collegeId, 
        qrScans: 1, 
        createdAt: new Date().toISOString() 
      });
    }

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // Redirect to the frontend with the college tracking parameter
    const redirectUrl = new URL(`/?page=student-hub&college=${collegeId}`, baseUrl);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error processing QR scan:", error);
    // Redirect gracefully on error
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const fallbackUrl = new URL(`/?page=student-hub`, `${protocol}://${host}`);
    return NextResponse.redirect(fallbackUrl);
  }
}
