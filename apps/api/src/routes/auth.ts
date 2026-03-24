import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { signToken } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/session/start — Customer session
router.post("/session/start", async (req: Request, res: Response) => {
  try {
    const { phone, storeId } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number. Must be 10 digits starting with 6-9." });
    }

    if (!storeId) {
      return res.status(400).json({ error: "Store ID is required" });
    }

    // Check store exists and is active
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || !store.isActive) {
      return res.status(404).json({ error: "Store not found or closed" });
    }

    // Expire old sessions for this phone at this store
    await prisma.session.updateMany({
      where: { phone, storeId, status: "active" },
      data: { status: "expired" },
    });

    // Create new session (4-hour expiry)
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const session = await prisma.session.create({
      data: { storeId, phone, expiresAt },
    });

    // Upsert customer record
    await prisma.customer.upsert({
      where: { phone },
      create: { phone },
      update: {},
    });

    res.json({
      sessionId: session.id,
      phone,
      store: { id: store.id, name: store.name, branch: store.branch },
      expiresAt: session.expiresAt,
    });
  } catch (err: any) {
    console.error("Session start error:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// POST /api/auth/staff/login — Staff login with PIN
router.post("/staff/login", async (req: Request, res: Response) => {
  try {
    const { pin, storeId } = req.body;

    if (!pin || !storeId) {
      return res.status(400).json({ error: "PIN and store ID are required" });
    }

    const pinHash = crypto.createHash("sha256").update(pin).digest("hex");
    const staff = await prisma.staff.findFirst({
      where: { storeId, pinHash, isActive: true },
    });

    if (!staff) {
      return res.status(401).json({ error: "Invalid PIN" });
    }

    const token = signToken({
      staffId: staff.id,
      storeId: staff.storeId,
      role: staff.role,
    });

    res.json({
      token,
      staff: { id: staff.id, name: staff.name, role: staff.role },
    });
  } catch (err: any) {
    console.error("Staff login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
