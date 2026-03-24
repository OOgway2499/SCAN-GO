# ScanGo 🛒 
**The Modern "Scan & Go" Retail Checkout Platform**

ScanGo is a full-stack, real-time web application designed to eliminate supermarket checkout lines. Customers can walk into a store, scan product barcodes using their smartphone camera, pay digitally, and show a dynamic QR receipt to the security guard on their way out.

---

## 🏗️ Architecture Overview

The project is built as a **Turborepo Monorepo** containing three distinct applications powered by a shared UI and Database package:

1. **📱 Customer PWA (`apps/customer-pwa`)**
   - A mobile-first Progressive Web App.
   - Live barcode scanning using the device camera (`@zxing/browser`).
   - Digital shopping cart and checkout flow.
   - Dynamic, animated UI using Framer Motion and Tailwind CSS.

2. **🛡️ Guard Console (`apps/customer-pwa/src/screens/guard`)**
   - Included in the customer app at the `/guard` route.
   - Used by store security at the exit gates.
   - **Real-time WebSockets:** Instantly flashes green when a customer pays for an order anywhere in the store.
   - QR code scanner to verify receipts and log physical item counts.

3. **💻 Admin Dashboard (`apps/admin-dashboard`)**
   - A comprehensive desktop-first management portal.
   - Real-time gross revenue and active cart metrics.
   - Inventory management, staff access control, and order history.

4. **⚙️ Backend API (`apps/api`)**
   - High-performance Node.js / Express server.
   - Real-time `Socket.io` event broadcasting.
   - JWT-based authentication for staff and guards.

5. **🗄️ Database Package (`packages/db`)**
   - Prisma ORM integrated with a cloud **PostgreSQL** database (Neon).
   - Shared schema across all applications.

---

## 🚀 Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Zustand, Framer Motion
- **Backend:** Node.js, Express, Socket.io
- **Database:** PostgreSQL (Neon / Supabase), Prisma ORM
- **Authentication:** Custom JWT-based Auth
- **Deployment:** Vercel (Frontends) & Render (Backend API)

---

## 🌟 Key Features

### For Customers:
* **No Signup Required:** Frictionless entry using just a mobile number.
* **In-App Barcode Scanner:** Accurately scans physical product barcodes.
* **Offline Cart:** Cart state persists across sessions.
* **Digital Receipts:** Beautiful, shareable QR receipts generated post-payment.

### For Store Admins:
* **Live Dashboards:** View active supermarket carts and daily revenue in real-time.
* **Product Management:** Add new items and bind them to physical barcodes.
* **Order Tracking:** Review itemized histories of all store transactions.

### For Security Guards:
* **Real-time Alerts:** WebSockets instantly notify the guard's tablet when an order is completed.
* **1-Click Verification:** Scan a customer's exit QR to verify the physical item count against the billed items.
* **Risk Flags:** Flags suspicious transactions (e.g., mismatching item counts).

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database URL (Local or Cloud)

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/OOgway2499/SCAN-GO.git
   cd "SCAN & GO"
   \`\`\`

2. **Install dependencies (from the root folder):**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables:**
   - Add your `DATABASE_URL` to `packages/db/.env`
   - Add your `DATABASE_URL` and `JWT_SECRET` to `apps/api/.env`

4. **Initialize the Database:**
   \`\`\`bash
   npm run push -w packages/db
   npm run seed -w packages/db
   \`\`\`

5. **Start the Development Servers:**
   \`\`\`bash
   # Terminal 1: Start Backend API (Port 3001)
   npm run dev:api

   # Terminal 2: Start Customer PWA Local Server
   npm run dev:customer

   # Terminal 3: Start Admin Dashboard Local Server
   npm run dev:admin
   \`\`\`

---

## 📈 Future Roadmap
- [ ] Integration with real Razorpay/Stripe payment gateways.
- [ ] AI-based receipt mismatch analysis.
- [ ] Loyalty points and customer tiering.
- [ ] Multi-lingual support expansion (Hindi, Telugu).

> Built as a modern retail solution to modernize the brick-and-mortar shopping experience.
