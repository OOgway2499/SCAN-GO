import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/staff?storeId=xx
router.get("/", async (req: Request, res: Response) => {
  try {
    const { storeId } = req.query;
    const staff = await prisma.staff.findMany({
      where: storeId ? { storeId: storeId as string } : {},
      select: { id: true, name: true, role: true, email: true, isActive: true, storeId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// POST /api/admin/staff — Create staff
router.post("/", async (req: Request, res: Response) => {
  try {
    const { storeId, name, role, pin, email } = req.body;
    const pinHash = crypto.createHash("sha256").update(pin).digest("hex");

    const staff = await prisma.staff.create({
      data: { storeId, name, role, pinHash, email: email || "" },
    });

    res.status(201).json({ id: staff.id, name: staff.name, role: staff.role });
  } catch (err) {
    res.status(500).json({ error: "Failed to create staff" });
  }
});

// PATCH /api/admin/staff/:id — Update staff
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const data: any = { ...req.body };
    if (data.pin) {
      data.pinHash = crypto.createHash("sha256").update(data.pin).digest("hex");
      delete data.pin;
    }
    const staff = await prisma.staff.update({ where: { id: req.params.id }, data });
    res.json({ id: staff.id, name: staff.name, role: staff.role });
  } catch (err) {
    res.status(500).json({ error: "Failed to update staff" });
  }
});

// DELETE /api/admin/staff/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.staff.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to deactivate staff" });
  }
});

export default router;
