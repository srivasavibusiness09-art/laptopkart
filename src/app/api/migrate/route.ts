import { NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    let updatedCount = 0;

    for (const document of snapshot.docs) {
      const data = document.data();
      // If rating or reviews are missing or falsy, update them
      if (!data.rating || !data.reviews) {
        const defaultRating = 4.8;
        const defaultReviews = 125;

        await updateDoc(doc(db, 'products', document.id), {
          rating: data.rating || defaultRating,
          reviews: data.reviews || defaultReviews,
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
