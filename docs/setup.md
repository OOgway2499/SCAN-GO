# ScanGo Project Setup Guide

This guide explains how to set up the ScanGo Monorepo on your local machine for development and testing.

## Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- No external database required (uses local SQLite via Prisma)

## 1. Initial Setup

Clone the repository and install all dependencies from the root directory. The project uses npm workspaces to manage dependencies across all apps and packages.

```bash
cd scango
npm install
```

## 2. Database Initialization

We use Prisma ORM with SQLite for instant local development. You need to push the schema to create the local `.db` file, and then seed it with demo data.

```bash
# Push schema
cd packages/db
npx prisma db push

# Seed demo data (Store, Staff, Products, Demo Orders)
npm run seed
```

*Note: If you are on Windows and experience path issues with npm scripts in workspaces (e.g., spaces or ampersands in folder names), use direct paths to the binaries as executed in the `package.json` configurations.*

## 3. Running the Stack

You can run the full stack (API, Customer PWA, Admin Dashboard) simultaneously. 

From the root `scango` directory:

```bash
# Terminal 1: Start the Backend API (Port 3001)
npm run dev:api

# Terminal 2: Start the Customer & Guard PWA (Port 5173)
npm run dev:customer

# Terminal 3: Start the Admin Dashboard (Port 5174)
npm run dev:admin
```

## 4. Accessing the Applications

Once the servers are running, access the portals using the following URLs and demo credentials:

### Customer Application
- **URL:** `http://localhost:5173`
- **Login:** Enter any 10-digit Indian mobile number (e.g., `9876543210`)

### Guard Console
- **URL:** `http://localhost:5173/guard`
- **PIN:** `0000` (Suresh Babu)

### Admin Dashboard
- **URL:** `http://localhost:5174`
- **PIN:** `1234` (Ravi Kumar)

## 5. Deployment Overview

To deploy this application to production:

1. **Database:** Change the Prisma `provider` in `packages/db/prisma/schema.prisma` from `"sqlite"` to `"postgresql"`. Provide the `DATABASE_URL` in your production environment.
2. **API (Backend):** Deploy the `/apps/api` Node.js application (e.g., Render, Railway, AWS). Note that it relies on `@scango/db` and `@scango/ui`, so ensure your deployment container builds the workspaces.
3. **Frontend PWAs:** Run `npm run build` in `/apps/customer-pwa` and `/apps/admin-dashboard`. Deploy the resulting `/dist` folders to static hosting providers (e.g., Vercel, Netlify, Cloudflare Pages).
4. **Environment Variables:** Update Vite APIs configs to point to your live API URL instead of `/api` proxies. 
