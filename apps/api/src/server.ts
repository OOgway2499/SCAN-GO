import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import storeRoutes from "./routes/store";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import guardRoutes from "./routes/guard";
import adminProductRoutes from "./routes/admin/products";
import adminStaffRoutes from "./routes/admin/staff";
import adminDashboardRoutes from "./routes/admin/dashboard";
import { errorHandler } from "./middleware/errorHandler";

// ── Load env ──
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"];

// ── Prisma ──
export const prisma = new PrismaClient();

// ── Socket.io ──
export const io = new SocketServer(httpServer, {
  cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("join-guard-room", (storeId: string) => {
    socket.join(`guard:${storeId}`);
    console.log(`🔐 Guard joined room: guard:${storeId}`);
  });

  socket.on("join-admin-room", (storeId: string) => {
    socket.join(`admin:${storeId}`);
    console.log(`📊 Admin joined room: admin:${storeId}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── Middleware ──
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request logging ──
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/guard", guardRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/staff", adminStaffRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

// ── Health check ──
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Error handler ──
app.use(errorHandler);

// ── Start ──
httpServer.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     🛒 ScanGo API Server             ║
  ║     Running on port ${PORT}              ║
  ║     ${new Date().toLocaleTimeString("en-IN")}                      ║
  ╚═══════════════════════════════════════╝
  `);
});

export default app;
