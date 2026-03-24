# ScanGo Backend API Documentation

This document outlines the REST API endpoints available in the ScanGo Node.js backend (`apps/api`). The API powers the Customer PWA, Guard Console, and Admin Dashboard.

## Base URL
Local Development: `http://localhost:3001`
Production: `https://api.scango.in` (Example)

## Authentication

The API uses two types of authentication:
1. **Customer Sessions:** Managed via `sessionId` passed in URL parameters or headers (depending on route).
2. **Staff/Admin JWT:** Passed in the `Authorization` header as a Bearer token.

---

## 1. Auth & Session Routes (`/api/auth`)

### Start Shopping Session
Creates a temporary 4-hour session for a customer entering the store.

- **URL:** `/api/auth/session/start`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "phone": "9876543210",
    "storeId": "store_freshmart_hyd"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "sessionId": "sess_123xyz...",
    "phone": "9876543210",
    "store": { "id": "store_...", "name": "FreshMart", "branch": "Kondapur" },
    "expiresAt": "2024-03-24T10:00:00.000Z"
  }
  ```

### Staff Login
Authenticates Guards and Administrators using a 4-digit PIN.

- **URL:** `/api/auth/staff/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "pin": "1234",
    "storeId": "store_freshmart_hyd"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "staff": { "id": "staff_1", "name": "Ravi Kumar", "role": "admin" }
  }
  ```

---

## 2. Store & Products (`/api/store`, `/api/products`)

### Get Store Info
- **URL:** `/api/store/:id`
- **Method:** `GET`
- **Response:** `200 OK` (Store metadata)

### Lookup Product by Barcode
- **URL:** `/api/products/barcode/:barcode`
- **Method:** `GET`
- **Query Params:** `?storeId=<id>`
- **Response:** `200 OK`
  ```json
  {
    "id": "prod_123",
    "barcode": "8901063010109",
    "name": "Aashirvaad Atta 5kg",
    "price": 280,
    "mrp": 310,
    "gstRate": 0.05,
    "icon": "🌾"
  }
  ```

---

## 3. Cart Operations (`/api/cart`)

Manages the active shopping cart linked to a specific session ID.

### Add/Update Cart Item
- **URL:** `/api/cart/:sessionId/item`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "productId": "prod_123",
    "qty": 1,
    "price": 280
  }
  ```
- **Response:** `200 OK` (Returns updated cart calculations)

### Remove Cart Item
- **URL:** `/api/cart/:sessionId/item/:itemId`
- **Method:** `DELETE`

### Get Cart State
- **URL:** `/api/cart/:sessionId`
- **Method:** `GET`
- **Response:** `200 OK`
  ```json
  {
    "items": [...],
    "calculations": { "subtotal": 280, "gst": 14, "total": 294, "savings": 30, "count": 1 }
  }
  ```

---

## 4. Orders & Payment (`/api/orders`)

### Create Order from Cart
Converts an active cart into a pending order. Required before payment.

- **URL:** `/api/orders/create`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "sessionId": "sess_123xyz...",
    "paymentMethod": "upi"
  }
  ```
- **Response:** `200 OK` (Returns Razorpay order details)

### Verify Payment & Generate Receipt
Mocks Razorpay verification. In production, this validates HMAC signatures.

- **URL:** `/api/orders/verify`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "orderId": "ord_123",
    "razorpayPaymentId": "pay_mock123",
    "razorpaySignature": "mock_sig"
  }
  ```
- **Response:** `200 OK` (Returns final `receiptId`)

### Get Receipt
- **URL:** `/api/orders/receipt/:receiptId`
- **Method:** `GET`

---

## 5. Guard Console (`/api/guard`)

*Requires Guard or Admin JWT.*

### Lookup Receipt for Verification
- **URL:** `/api/guard/receipt/:receiptId`
- **Method:** `GET`
- **Response:** `200 OK` (Includes items, timestamps, and risk flag assessment)

### Submit Physical Count Verification
- **URL:** `/api/guard/verify/:orderId`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "physicalCount": 5,
    "guardId": "staff_2"
  }
  ```
- **Response:** `200 OK` (Calculates `mismatchCount`. Emits `order:verified` event via Socket.io)

---

## 6. Admin Endpoints (`/api/admin`)

*Requires Admin JWT.*

Available routes include:
- `GET | POST | PATCH | DELETE /api/admin/products`
- `GET | POST | DELETE /api/admin/staff`
- `GET /api/admin/dashboard/live` (Real-time KPI metrics)
