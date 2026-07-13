# Production Firestore Security Rules Guide

Currently, your database is likely in **Test Mode** (allowing open access to anyone). In production, this must be locked down to prevent data leakage, unauthorized catalog modifications, or order tampering.

This guide provides a production-grade `firestore.rules` configuration and details how to deploy it.

---

## 🔒 Production Security Architecture

Our security model divides Firestore data into three access tiers:

```text
┌────────────────────────────────────────────────────────┐
│ PUBLIC READS                                           │
│ (Products, Accessories, Banners, Reviews)              │
│ - Available to anyone (guests and users)               │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ AUTHENTICATED USER WRITES                              │
│ (User Profiles, Place Orders, Write Reviews)           │
│ - Match user UIDs or emails dynamically                │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ ADMIN WRITES                                           │
│ (Add/Edit Products & Accessories, Update Order AWB)     │
│ - Restricted to custom admin tokens/claims             │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ The Production `firestore.rules` Config

Save the following content as `firestore.rules` in your project folder, or copy it directly into the **Firebase Console > Firestore Database > Rules** tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Check if the request is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper: Check if the authenticated user is an Admin
    // (Requires setting custom user claim `admin: true` in Firebase Auth)
    function isAdmin() {
      return isAuthenticated() && request.auth.token.admin == true;
    }

    // Helper: Check if the document belongs to the authenticated user by UID
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // 1. PRODUCTS COLLECTION
    match /products/{productId} {
      // Anyone (guests and buyers) can read products
      allow read: if true;
      // Only authenticated admins can write (create, update, delete) products
      allow write: if isAdmin();
    }

    // 2. ACCESSORIES COLLECTION
    match /accessories/{accessoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 3. BANNERS COLLECTION
    match /banners/{bannerId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 4. CUSTOMER REVIEWS COLLECTION
    match /reviews/{reviewId} {
      // Anyone can see customer reviews
      allow read: if true;
      // Any authenticated customer can submit a review
      allow create: if isAuthenticated();
      // Only admins can delete or edit reviews
      allow update, delete: if isAdmin();
    }

    // 5. USER PROFILES COLLECTION
    match /users/{userId} {
      // Users can read/write only their own user document
      allow read, write: if isOwner(userId) || isAdmin();
    }

    // 6. INCOMING ORDERS COLLECTION
    match /orders/{orderId} {
      // Admins can manage all orders
      allow read, write: if isAdmin();
      
      // Customers can create orders if authenticated
      allow create: if isAuthenticated() && request.resource.data.uid == request.auth.uid;
      
      // Customers can read only their own orders
      allow read: if isAuthenticated() && resource.data.uid == request.auth.uid;
      
      // Prevent customers from modifying or deleting orders once placed
      allow update, delete: if false;
    }
  }
}
```

---

## 🔑 Defining Admin Users (Custom User Claims)

To make `request.auth.token.admin == true` work, you must assign an **admin claim** to your administrator's account. This cannot be done from the client-side code for security reasons. It must be set using the **Firebase Admin SDK** in a backend script (or Cloud Function).

Here is a quick Node.js script you can run once to make a user an Admin:

```javascript
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const makeUserAdmin = async (email) => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Successfully made ${email} an admin!`);
  } catch (error) {
    console.error("Error setting custom claims:", error);
  }
};

// Run with target admin email
makeUserAdmin("admin@laptopkart.com");
```

---

## 🚀 How to Deploy the Rules

### Option A: Firebase Console (Easiest)
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your **Laptopkart** project.
3. Click **Firestore Database** in the left sidebar.
4. Click on the **Rules** tab at the top.
5. Paste the security rule code block above and click **Publish**.

### Option B: Firebase CLI (Recommended for Teams)
1. If you haven't already, install the Firebase tools: `npm install -g firebase-tools`
2. Login to your account: `firebase login`
3. Initialize Firestore configs: `firebase init firestore`
4. Copy the rules above into the newly generated `firestore.rules` file in your repository.
5. Deploy the rules directly: `firebase deploy --only firestore:rules`
