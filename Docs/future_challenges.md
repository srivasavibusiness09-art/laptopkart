# Laptopkart Roadmap: Future Scaling & Technical Challenges

This document outlines key technical challenges that may arise as the Laptopkart e-commerce platform grows in traffic and transaction volume, along with recommended architectural designs to solve them.

---

## 1. Live Market Scraper Blockages (Amazon & Flipkart)

### 🔴 The Problem
Currently, the storefront fetches live prices directly from Amazon and Flipkart search pages. While using standard browser headers and Cheerio HTML DOM parsing works locally, cloud-hosting environments (like Vercel, AWS, or Render) route requests through known datacenter IP addresses.
* Both Amazon and Flipkart employ aggressive bot detection tools and will rapidly block datacenter requests with **CAPTCHA walls**, causing the live price comparison tool to fail back to the static database MRP values.

### 🟢 The Future Solution
1. **Rotate Request Proxies**: Integrate a paid proxy-rotation scraping API (like **SerpAPI**, **ScrapingBee**, or **Rainforest API**). These platforms use massive residential proxy pools to guarantee CAPTCHA-free results in clean JSON format.
2. **Official API Integration**: Transition to the official **Amazon Product Advertising API** once you register a qualifying seller or affiliate account.

---

## 2. Payment Verification & Order Drop-offs (Razorpay)

### 🔴 The Problem
Currently, the storefront launches the Razorpay Checkout flow client-side, waits for the modal callback in the user's browser, and then registers the completed transaction in Firestore.
* If a customer pays successfully, but closes their browser tab, loses mobile signal, or experiences a device crash **before** the page redirects back to Laptopkart, their bank account is charged, but **no order is recorded in your database**.

### 🟢 The Future Solution
Implement **Razorpay Webhooks**:
1. Create a server-side route (e.g. `/api/webhooks/razorpay`) that listens directly to background notifications sent from Razorpay's servers.
2. Configure your Razorpay Dashboard to notify this endpoint on `payment.captured` and `order.paid` events.
3. Upon receiving the notification, update your Firestore database orders log automatically, independent of client-side browser sessions.

---

## 3. Inventory Race Conditions (Over-selling)

### 🔴 The Problem
If a refurbished laptop is listed with a stock count of `1`, and two customers click the "Place Order" button at the exact same millisecond:
* Both checking processes will read the stock status as `1`.
* Both orders will go through successfully.
* The stock will decrease to `-1`, resulting in you selling an item you do not have in stock.

### 🟢 The Future Solution
Use **Firestore Transactions** (`runTransaction`) in your orders API route:
* Transactions enforce atomic operations. They lock the product document, verify the stock level, decrement the count, and write the transaction log in one single step. If a second request attempts to write simultaneously, Firestore aborts and retries the process safely.

---

## 4. Admin Portal Access Security

### 🔴 The Problem
Right now, the admin panel operates as a client-side routing environment on a separate server. To ensure the store catalog is protected, access must be secured.

### 🟢 The Future Solution
Enforce **Firebase Authentication Rules**:
1. Use Firebase Custom Claims (e.g., set `admin: true` in user metadata) or record admin UIDs in a secured Firestore `admins` collection.
2. Configure Firestore Security Rules to block all write requests to `products`, `accessories`, and `banners` unless the request comes from an authenticated admin account.

---

## 5. Growing Database Search Latency

### 🔴 The Problem
Currently, orders and products are loaded into lists at once. When your order catalog grows to thousands of client records, loading the list all at once will slow down browser rendering speed and drastically inflate your Firestore billing costs.

### 🟢 The Future Solution
Implement **Paginated Queries** and **Indexes**:
* Add pagination arguments to your Firestore query calls to fetch data in small blocks (e.g., 20 or 50 records at a time) with "Previous" and "Next" pagination buttons.
* Configure Firestore composite indexes on queries sorting by multiple fields (like `date` and `status`) to keep search speed constant as your database grows.
