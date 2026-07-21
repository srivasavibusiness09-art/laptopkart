import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";

// Initialize Firebase Admin SDK
const getAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:", err);
    }
  }

  // Fallback if service account key is not present (will work for some local tasks or trigger warnings)
  return admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
};

export async function POST(request: Request) {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: 'Firebase Admin SDK initialization failed' }, { status: 500 });
    }
    const { title, body, data } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // Access Firestore via Client SDK to get all registered admin device tokens
    const adminTokensSnapshot = await getDocs(collection(db, 'admin_fcm_tokens'));
    
    const tokens: string[] = [];
    adminTokensSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.token) {
        tokens.push(data.token);
      }
    });

    if (tokens.length === 0) {
      console.warn("No admin device tokens registered in 'admin_fcm_tokens' collection.");
      return NextResponse.json({ success: true, message: 'No registered admin tokens' });
    }

    // Prepare FCM Multicast payload (no emojis in native OS pushes as per request)
    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`Successfully sent ${response.successCount} push notifications. Failures: ${response.failureCount}`);

    // Clean up failed tokens if needed
    if (response.failureCount > 0) {
      const tokensToRemove: Promise<any>[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          // Token is invalid/expired
          if (error?.code === 'messaging/invalid-registration-token' || error?.code === 'messaging/registration-token-not-registered') {
            const badToken = tokens[idx];
            const q = query(collection(db, 'admin_fcm_tokens'), where('token', '==', badToken));
            tokensToRemove.push(getDocs(q).then(snap => {
              const deletes = snap.docs.map(d => deleteDoc(doc(db, 'admin_fcm_tokens', d.id)));
              return Promise.all(deletes);
            }));
          }
        }
      });
      await Promise.all(tokensToRemove);
    }

    return NextResponse.json({ success: true, sentCount: response.successCount });
  } catch (error: any) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
